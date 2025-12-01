'use client';
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { useAppStore } from "@/lib/store";
import { delay, readFileAsArrayBuffer } from "@/lib/utils";
import { checkRateLimit } from "@/lib/limits";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";

export default function PdfMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const { workspaceId, addProcessed, plan } = useAppStore();

  const maxFiles = plan === "free" ? 5 : plan === "pro" ? 25 : 100;
  const maxSizeMB = plan === "free" ? 20 : plan === "pro" ? 100 : 250;

  async function onMerge() {
    if (!files.length) return;
    const rl = checkRateLimit(workspaceId, plan);
    if (!rl.ok) {
      alert(`Rate limit reached. Try again in ${Math.ceil(rl.retryInMs / 1000)}s or upgrade your plan.`);
      return;
    }
    setBusy(true);
    setProgress(5);
    await delay(200);
    const merged = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(bytes);
      const copied = await merged.copyPages(pdf, pdf.getPageIndices());
      copied.forEach((p) => merged.addPage(p));
      setProgress(Math.round(((i + 1) / files.length) * 90));
    }
    const out = await merged.save();
    const bytes = new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const blob = new Blob([ab], { type: "application/pdf" });
    const name = `merged-${Date.now()}.pdf`;
    const url = URL.createObjectURL(blob);
    addProcessed({ name, size: blob.size, url, workspaceId });
    setProgress(100);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">PDF Merge</h1>
      <Dropzone
        accept={["application/pdf"]}
        multiple
        maxSizeMB={maxSizeMB}
        onFiles={(f) => setFiles(f.slice(0, maxFiles))}
      />
      {!!files.length && (
        <div className="card p-4">
          <div className="text-sm text-white/80 mb-3">
            {files.length} files ready
          </div>
          <button disabled={busy} onClick={onMerge} className="btn">
            {busy ? "Merging..." : "Merge PDFs"}
          </button>
          <div className="mt-4">
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}
      <p className="text-xs text-white/60">
        Limits: Free={maxFiles} files / {maxSizeMB}MB each. Upgrade for more.
      </p>
    </div>
  );
}

