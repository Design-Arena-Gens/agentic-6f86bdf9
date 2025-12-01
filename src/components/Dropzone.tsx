'use client';
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export function Dropzone({
  accept,
  multiple = true,
  maxSizeMB = 50,
  onFiles
}: {
  accept: string[];
  multiple?: boolean;
  maxSizeMB?: number;
  onFiles: (files: File[]) => void;
}) {
  const [rejected, setRejected] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections?.length) {
        const r = fileRejections[0];
        if (r?.errors?.[0]?.message) {
          setRejected(r.errors[0].message);
        } else {
          setRejected("File rejected");
        }
        return;
      }
      setRejected(null);
      onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(accept.map((a) => [a, []])),
    multiple,
    maxSize: maxSizeMB * 1024 * 1024
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "card p-6 cursor-pointer border-dashed border-2 border-white/10 hover:border-brand-500/60 hover:bg-white/[0.04] transition-colors",
        isDragActive && "border-brand-500/80 bg-white/[0.06]"
      )}
    >
      <input {...getInputProps()} />
      <div className="text-center text-white/80">
        <div className="font-semibold">Drag & drop files here</div>
        <div className="text-sm">or click to browse</div>
        <div className="text-xs mt-2 text-white/60">
          Allowed: {accept.join(", ")} ? Max {maxSizeMB}MB each
        </div>
        {rejected && (
          <div className="text-xs text-red-300 mt-2">{rejected}</div>
        )}
      </div>
    </div>
  );
}

