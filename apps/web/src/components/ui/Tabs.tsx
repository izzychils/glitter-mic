import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn("glass inline-flex flex-wrap gap-1 p-1", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = value === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[18px] px-4 py-2 text-sm font-semibold transition-colors",
              selected ? "bg-[var(--pink-500)] text-[var(--ink)]" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {Icon ? <Icon size={15} aria-hidden="true" /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
