"use client";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { useAppStore } from "@/lib/store";
import { delay, readFileAsArrayBuffer } from "@/lib/utils";
import { useState } from "react";
import JSZip from "jszip";
// @ts-ignore - pdfjs-dist provides types but dynamic import simplifies
import * as pdfjsLib from "pdfjs-dist";
// Configure pdf.js worker as module worker for Next bundler
if (typeof window !== "undefined") {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(
    new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
    { type: "module" }
  );
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const { workspaceId, addProcessed, plan } = useAppStore();
  const maxSizeMB = plan === "free" ? 20 : plan === "pro" ? 100 : 250;

  async function onConvert() {
    if (!file) return;
    setBusy(true);
    setProgress(5);
    await delay(200);
    const data = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const zip = new JSZip();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
      );
      const arrBuf = await blob.arrayBuffer();
      zip.file(`page-${i}.jpg`, arrBuf);
      setProgress(Math.round((i / pdf.numPages) * 90));
    }
    const out = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(out);
    const name = `pdf-images-${Date.now()}.zip`;
    addProcessed({ name, size: out.size, url, workspaceId });
    setProgress(100);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">PDF ? JPG</h1>
      <Dropzone
        accept={["application/pdf"]}
        multiple={false}
        maxSizeMB={maxSizeMB}
        onFiles={(f) => setFile(f[0])}
      />
      {!!file && (
        <div className="card p-4">
          <div className="text-sm text-white/80 mb-3">Loaded: {file.name}</div>
          <button onClick={onConvert} disabled={busy} className="btn">
            {busy ? "Converting..." : "Convert"}
          </button>
          <div className="mt-4">
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}
    </div>
  );
}

