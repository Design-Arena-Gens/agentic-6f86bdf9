'use client';
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { useAppStore } from "@/lib/store";
import { delay, readFileAsArrayBuffer } from "@/lib/utils";
import { checkRateLimit } from "@/lib/limits";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";

export default function PdfSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const { workspaceId, addProcessed, plan } = useAppStore();
  const maxSizeMB = plan === "free" ? 20 : plan === "pro" ? 100 : 250;

  async function onSplit() {
    if (!file) return;
    const rl = checkRateLimit(workspaceId, plan);
    if (!rl.ok) {
      alert(`Rate limit reached. Try again in ${Math.ceil(rl.retryInMs / 1000)}s or upgrade your plan.`);
      return;
    }
    setBusy(true);
    setProgress(5);
    await delay(200);
    const bytes = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(bytes);
    const zip = new JSZip();
    for (let i = 0; i < pdf.getPageCount(); i++) {
      const doc = await PDFDocument.create();
      const [p] = await doc.copyPages(pdf, [i]);
      doc.addPage(p);
      const out = await doc.save();
      zip.file(`page-${i + 1}.pdf`, out);
      setProgress(Math.round(((i + 1) / pdf.getPageCount()) * 90));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const name = `split-${Date.now()}.zip`;
    addProcessed({ name, size: blob.size, url, workspaceId });
    setProgress(100);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">PDF Split</h1>
      <Dropzone
        accept={["application/pdf"]}
        multiple={false}
        maxSizeMB={maxSizeMB}
        onFiles={(f) => setFile(f[0])}
      />
      {!!file && (
        <div className="card p-4">
          <div className="text-sm text-white/80 mb-3">File ready: {file.name}</div>
          <button disabled={busy} onClick={onSplit} className="btn">
            {busy ? "Splitting..." : "Split PDF"}
          </button>
          <div className="mt-4">
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}
    </div>
  );
}

