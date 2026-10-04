import { motion, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";
import { cn } from "../lib/utils";

const SPARKS = [
  { x: -34, y: -30, s: 14, d: 0 },
  { x: 36, y: -22, s: 10, d: 0.4 },
  { x: -28, y: 34, s: 9, d: 0.8 },
  { x: 32, y: 30, s: 13, d: 1.2 },
  { x: 0, y: -44, s: 8, d: 0.6 },
];

/** Four-point star, solid white - the only "glitter" shape in the system. */
function Sparkle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

interface GlitterMicProps {
  /** Pulses while the mic is live / listening. */
  active?: boolean;
  className?: string;
}

export function GlitterMic({ active = false, className }: GlitterMicProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("glass relative grid h-28 w-28 place-items-center rounded-full", className)}>
      <motion.div
        animate={active && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
        transition={active && !reduceMotion ? { repeat: Infinity, duration: 1.4 } : undefined}
        className="text-[var(--pink-500)]"
      >
        <Mic size={56} strokeWidth={1.8} aria-hidden="true" />
      </motion.div>

      {SPARKS.map((spark, index) => (
        <motion.span
          key={index}
          className="absolute"
          style={{ left: `calc(50% + ${spark.x}px)`, top: `calc(50% + ${spark.y}px)` }}
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0, 1, 0], scale: [0.4, 1.1, 0.4], rotate: [0, 90, 180] }
          }
          transition={{ repeat: Infinity, duration: 2.2, delay: spark.d, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Sparkle size={spark.s} />
        </motion.span>
      ))}
    </div>
  );
}
