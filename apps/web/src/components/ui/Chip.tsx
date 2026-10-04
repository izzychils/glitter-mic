import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChipProps {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, icon: Icon, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        selected
          ? "border-transparent bg-[var(--pink-500)] text-[var(--ink)]"
          : "border-white/25 bg-white/5 text-white/85 hover:bg-white/15",
        className
      )}
    >
      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
      {label}
    </button>
  );
}
