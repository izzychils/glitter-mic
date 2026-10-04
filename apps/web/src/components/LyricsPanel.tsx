import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
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

  // Auto-scroll to keep current line centered
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
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <Music size={48} className="text-white/30" />
        <div>
          <p className="text-lg font-medium text-white/60">No lyrics available</p>
          <p className="mt-2 text-sm text-white/40">Instrumental track or lyrics not loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto overflow-x-hidden px-6 py-12 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20"
    >
      {/* Gradient overlays for better readability */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-24 bg-gradient-to-b from-navy to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent" />

      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-blood-red/20 px-4 py-2 text-sm text-blood-red"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-blood-red"
          />
          Recording...
        </motion.div>
      )}

      {/* Lyrics lines */}
      <div className="space-y-6">
        {lines.map((line, index) => {
          const isCurrent = index === currentLineIndex;
          const isPast = index < currentLineIndex;
          // const isFuture = index > currentLineIndex;

          return (
            <motion.div
              key={line.index}
              ref={isCurrent ? currentLineRef : null}
              initial={{ opacity: 0.4, y: 20 }}
              animate={{
                opacity: isCurrent ? 1 : isPast ? 0.3 : 0.5,
                y: 0,
                scale: isCurrent ? 1.05 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className={`
                text-center transition-all duration-300
                ${isCurrent ? "text-2xl font-bold text-white md:text-3xl" : "text-lg text-white/60 md:text-xl"}
                ${isPast ? "line-through" : ""}
              `}
            >
              {line.text}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom spacer for scrolling */}
      <div className="h-96" />
    </div>
  );
}
