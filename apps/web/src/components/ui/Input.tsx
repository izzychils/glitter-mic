import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string;
  leftIcon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon: LeftIcon, id, className, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/70">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <LeftIcon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-xl border bg-navy-dark px-4 text-sm text-white placeholder:text-white/40 transition-all focus:bg-navy-lighter focus:outline-none focus:ring-2",
            error ? "border-blood-red focus:ring-blood-red" : "border-white/20 focus:border-blood-pink focus:ring-blood-pink",
            LeftIcon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-blood-red">
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-white/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
