import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

/** Glass surface: backdrop blur, translucent white border, inset top highlight. */
export const GlassCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function GlassCard(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("glass", className)} {...props} />;
});
