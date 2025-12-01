"use client";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { useAppStore } from "@/lib/store";
import { delay } from "@/lib/utils";
import { checkRateLimit } from "@/lib/limits";
import * as XLSX from "xlsx";
import { useState } from "react";

export default function ExcelCsvConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const { workspaceId, addProcessed, plan } = useAppStore();
  const maxSizeMB = plan === "free" ? 20 : plan === "pro" ? 100 : 250;

  async function convertToCsv() {
    if (!file) return;
    const rl = checkRateLimit(workspaceId, plan);
    if (!rl.ok) {
      alert(`Rate limit reached. Try again in ${Math.ceil(rl.retryInMs / 1000)}s or upgrade your plan.`);
      return;
    }
    setBusy(true);
    setProgress(10);
    await delay(150);
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const firstSheet = wb.SheetNames[0];
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[firstSheet]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const name = `${stripExt(file.name)}.csv`;
    const url = URL.createObjectURL(blob);
    addProcessed({ name, size: blob.size, url, workspaceId });
    setProgress(100);
    setBusy(false);
  }

  async function convertToXlsx() {
    if (!file) return;
    const rl = checkRateLimit(workspaceId, plan);
    if (!rl.ok) {
      alert(`Rate limit reached. Try again in ${Math.ceil(rl.retryInMs / 1000)}s or upgrade your plan.`);
      return;
    }
    setBusy(true);
    setProgress(10);
    await delay(150);
    const text = await file.text();
    const rows = XLSX.read(text, { type: "string" });
    const wbout = XLSX.write(rows, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const name = `${stripExt(file.name)}.xlsx`;
    const url = URL.createObjectURL(blob);
    addProcessed({ name, size: blob.size, url, workspaceId });
    setProgress(100);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Excel ? CSV</h1>
      <Dropzone
        accept={[
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv"
        ]}
        multiple={false}
        maxSizeMB={maxSizeMB}
        onFiles={(f) => setFile(f[0])}
      />
      {!!file && (
        <div className="card p-4 space-y-4">
          <div className="text-sm text-white/80">Loaded: {file.name}</div>
          <div className="flex gap-2">
            <button onClick={convertToCsv} disabled={busy || !isXlsx(file)} className="btn">
              {busy ? "Converting..." : "XLSX ? CSV"}
            </button>
            <button onClick={convertToXlsx} disabled={busy || !isCsv(file)} className="btn">
              {busy ? "Converting..." : "CSV ? XLSX"}
            </button>
          </div>
          <ProgressBar progress={progress} />
        </div>
      )}
    </div>
  );
}

function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}
function isCsv(file: File) {
  return /csv$/i.test(file.name);
}
function isXlsx(file: File) {
  return /(xlsx)$/i.test(file.name);
}

