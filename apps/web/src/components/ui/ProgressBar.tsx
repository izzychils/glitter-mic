import { cn } from "../../lib/utils";

const FILLS = {
  pink: "bg-[var(--pink-500)]",
  blue: "bg-[var(--blue-500)]",
  red: "bg-[var(--red-500)]",
  white: "bg-white",
} as const;

export type ProgressTone = keyof typeof FILLS;

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  label?: string;
  tone?: ProgressTone;
  className?: string;
}

export function ProgressBar({ value, label, tone = "pink", className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/70">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      ) : null}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label ?? "Progress"}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", FILLS[tone])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
