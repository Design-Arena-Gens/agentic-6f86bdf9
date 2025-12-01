import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolCard({
  href,
  icon: Icon,
  title,
  subtitle,
  className
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <Link
      href={href as any}
      className={cn(
        "card p-5 hover:bg-white/[0.08] transition-colors flex items-start gap-4",
        className
      )}
    >
      <div className="rounded-lg bg-brand-600/20 p-3 text-brand-300">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-white/70">{subtitle}</div>
      </div>
    </Link>
  );
}

