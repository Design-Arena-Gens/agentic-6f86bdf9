'use client';
import { ToolCard } from "@/components/ToolCard";
import { FileSpreadsheet, FileText, Scissors, Combine, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agentic Doc Suite</h1>
          <p className="text-white/70">Modern multi-tenant document processing tools</p>
        </div>
        <NavActions />
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToolCard
          href="/tools/pdf/merge"
          icon={Combine}
          title="PDF Merge"
          subtitle="Combine multiple PDFs into one"
        />
        <ToolCard
          href="/tools/pdf/split"
          icon={Scissors}
          title="PDF Split"
          subtitle="Split a PDF into pages"
        />
        <ToolCard
          href="/tools/excel/csv-convert"
          icon={FileSpreadsheet}
          title="Excel ? CSV"
          subtitle="Convert between XLSX and CSV"
        />
        <ToolCard
          href="/tools/convert/pdf-to-jpg"
          icon={ArrowLeftRight}
          title="PDF ? JPG"
          subtitle="Render PDF pages to images"
        />
        <ToolCard
          href="/tools/word/find-replace"
          icon={FileText}
          title="Word Find & Replace"
          subtitle="Batch find and replace in DOCX"
        />
      </section>

      <footer className="text-xs text-white/50">
        By using this app you agree to client-side processing. No files are uploaded to servers.
      </footer>
    </div>
  );
}

function NavActions() {
  const { workspaceId, setWorkspace, plan, setPlan } = useAppStore();
  return (
    <div className="flex items-center gap-2">
      <input
        defaultValue={workspaceId}
        onBlur={(e) => setWorkspace(e.target.value || "default")}
        placeholder="Workspace ID"
        className="card px-3 py-2 text-sm bg-white/5 border-white/10"
      />
      <select
        defaultValue={plan}
        onChange={(e) => setPlan(e.target.value as any)}
        className="card px-3 py-2 text-sm bg-white/5 border-white/10"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <Link href="/workspace" className="btn-secondary">Workspace</Link>
    </div>
  );
}

