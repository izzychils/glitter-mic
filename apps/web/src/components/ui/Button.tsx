import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: LucideIcon;
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[var(--pink-500)] text-[var(--ink)] hover:bg-[var(--pink-300)]",
  secondary: "bg-[var(--blue-500)] text-[var(--white)] hover:bg-[var(--blue-300)] hover:text-[var(--ink)]",
  danger: "bg-[var(--red-500)] text-[var(--white)] hover:bg-[var(--red-600)]",
  ghost: "border border-white/25 bg-transparent text-[var(--white)] hover:bg-white/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-sm",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", leftIcon: LeftIcon, loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold transition-colors duration-200",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : LeftIcon ? (
        <LeftIcon size={16} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
});
