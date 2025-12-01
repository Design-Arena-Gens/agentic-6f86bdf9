"use client";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { useAppStore } from "@/lib/store";
import { delay } from "@/lib/utils";
import { useState } from "react";
import JSZip from "jszip";

export default function WordFindReplacePage() {
  const [file, setFile] = useState<File | null>(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const { workspaceId, addProcessed, plan } = useAppStore();
  const maxSizeMB = plan === "free" ? 20 : plan === "pro" ? 100 : 250;

  async function onProcess() {
    if (!file || !findText) return;
    setBusy(true);
    setProgress(10);
    await delay(150);
    // DOCX is a zip; replace occurrences in document.xml
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const docXml = await zip.file("word/document.xml")!.async("string");
    const re = new RegExp(escapeRegExp(findText), "g");
    const replaced = docXml.replace(re, replaceText);
    zip.file("word/document.xml", replaced);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const name = file.name.replace(/\\.docx$/i, "") + "-replaced.docx";
    addProcessed({ name, size: blob.size, url, workspaceId });
    setProgress(100);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Word Find & Replace (DOCX)</h1>
      <Dropzone
        accept={["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}
        multiple={false}
        maxSizeMB={maxSizeMB}
        onFiles={(f) => setFile(f[0])}
      />
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <input
            placeholder="Find"
            className="card px-3 py-2 text-sm bg-white/5 border-white/10 w-full"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            placeholder="Replace"
            className="card px-3 py-2 text-sm bg-white/5 border-white/10 w-full"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
        </div>
        <button onClick={onProcess} disabled={busy || !file || !findText} className="btn">
          {busy ? "Processing..." : "Run"}
        </button>
        <ProgressBar progress={progress} />
      </div>
    </div>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

