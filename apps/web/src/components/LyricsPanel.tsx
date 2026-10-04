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

  // Show 8 lines total: 4 before, current, 3 after for gradient fade effect
  const visibleLines = lines.slice(
    Math.max(0, currentLineIndex - 4),
    Math.min(lines.length, currentLineIndex + 4)
  );

  // Calculate opacity gradient: center (current) is 1.0, fades outward
  const getOpacity = (lineIndex: number): number => {
    const actualIndex = lines.findIndex(l => l.index === lineIndex);
    const distance = Math.abs(actualIndex - currentLineIndex);
    
    // Distance 0 (current): 1.0
    // Distance 1: 0.8
    // Distance 2: 0.6
    // Distance 3: 0.4
    // Distance 4+: 0.2
    const opacityMap: Record<number, number> = {
      0: 1.0,
      1: 0.8,
      2: 0.6,
      3: 0.4,
    };
    return opacityMap[distance] ?? 0.2;
  };

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

      {/* Lyrics lines - 8 lines with gradient fade from center */}
      <div className="relative flex w-full flex-col items-center justify-center gap-6">
        <AnimatePresence mode="wait">
          {visibleLines.map((line) => {
            const actualIndex = lines.findIndex(l => l.index === line.index);
            const isCurrent = actualIndex === currentLineIndex;
            const distance = Math.abs(actualIndex - currentLineIndex);
            const opacity = getOpacity(line.index);

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
                  opacity: opacity,
                  y: 0,
                  scale: isCurrent ? 1 : 0.9 - (distance * 0.02),
                  filter: isCurrent ? "blur(0px)" : `blur(${distance * 0.5}px)`,
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
                    : "text-xl text-white md:text-2xl"
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

      {/* Gradient overlays for fade effect at edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-lighter/90 via-navy-lighter/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-lighter/90 via-navy-lighter/50 to-transparent" />
    </div>
  );
}
