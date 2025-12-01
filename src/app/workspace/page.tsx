'use client';
import { useAppStore } from "@/lib/store";

export default function WorkspacePage() {
  const { processed, workspaceId } = useAppStore();
  const items = processed.filter((p) => p.workspaceId === workspaceId);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Workspace</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <a key={item.id} href={item.url} download={item.name} className="card p-4 block">
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-white/60">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </a>
        ))}
        {!items.length && (
          <div className="text-white/70">No processed files yet for this workspace.</div>
        )}
      </div>
    </div>
  );
}

