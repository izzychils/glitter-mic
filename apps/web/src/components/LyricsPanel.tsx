import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music } from "lucide-react";
import type { LyricLine } from "../hooks/useLyrics";

interface LyricsPanelProps {
  lines: LyricLine[];
  currentLineIndex: number;
  isRecording?: boolean;
}

export function LyricsPanel({ lines, currentLineIndex, isRecording = false }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep current line centered with smooth animation
  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const lineElement = currentLineRef.current;
      
      const containerHeight = container.clientHeight;
      const lineTop = lineElement.offsetTop;
      const lineHeight = lineElement.clientHeight;
      
      // Scroll to center the current line
      const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
      
      container.scrollTo({
        top: scrollTo,
        behavior: "smooth",
      });
    }
  }, [currentLineIndex]);

  if (lines.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-navy-lighter/90 p-8 text-center shadow-xl">
        <Music size={48} className="text-white/30" />
        <div>
          <p className="text-lg font-medium text-white/60">No lyrics available</p>
          <p className="mt-2 text-sm text-white/40">Instrumental track or lyrics not loaded</p>
        </div>
      </div>
    );
  }

  // Show only 3 lines: previous, current, next for cleaner look
  const visibleLines = lines.slice(
    Math.max(0, currentLineIndex - 1),
    Math.min(lines.length, currentLineIndex + 2)
  );

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-navy-lighter/90 px-8 py-12 shadow-xl"
      style={{ maxHeight: "600px" }} // Match left side height
    >
      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 flex items-center gap-2 rounded-full bg-blood-red/20 px-4 py-2 text-sm font-semibold text-blood-red"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-2 w-2 rounded-full bg-blood-red"
            />
            Recording
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics lines - centered, no scrollbar, smooth transitions */}
      <div className="relative flex w-full flex-col items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          {visibleLines.map((line) => {
            const actualIndex = lines.findIndex(l => l.index === line.index);
            const isCurrent = actualIndex === currentLineIndex;
            const isPast = actualIndex < currentLineIndex;

            return (
              <motion.div
                key={line.index}
                ref={isCurrent ? currentLineRef : null}
                initial={{ 
                  opacity: 0, 
                  y: 30,
                  scale: 0.9,
                }}
                animate={{
                  opacity: isCurrent ? 1 : isPast ? 0.2 : 0.4,
                  y: 0,
                  scale: isCurrent ? 1 : 0.85,
                  filter: isCurrent ? "blur(0px)" : "blur(1px)",
                }}
                exit={{ 
                  opacity: 0, 
                  y: -30,
                  scale: 0.9,
                  transition: { duration: 0.4, ease: "easeInOut" }
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.43, 0.13, 0.23, 0.96], // Smooth easing
                }}
                className={`
                  w-full text-center transition-all
                  ${isCurrent 
                    ? "text-3xl font-bold leading-relaxed text-white md:text-4xl" 
                    : isPast
                    ? "text-xl text-white/30 md:text-2xl"
                    : "text-xl text-white/40 md:text-2xl"
                  }
                `}
                style={{
                  textShadow: isCurrent ? "0 2px 20px rgba(255, 23, 68, 0.3)" : "none",
                }}
              >
                {line.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-lighter/90 via-navy-lighter/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-lighter/90 via-navy-lighter/50 to-transparent" />
    </div>
  );
}
