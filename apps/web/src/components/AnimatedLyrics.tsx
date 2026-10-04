import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LyricWord {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

interface LyricLine {
  text: string;
  words: LyricWord[];
  startTime: number;
  endTime: number;
}

interface AnimatedLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
  userSung?: Set<number>; // Word indices that user has sung correctly
  missed?: Set<number>; // Word indices that user missed
}

/**
 * Animated lyrics component with Spotify-style word-by-word reveal
 * Features:
 * - Words fade in and glow when active
 * - Correctly sung words stay bright
 * - Missed words shake and turn red
 * - Smooth line transitions
 */
export function AnimatedLyrics({ lyrics, currentTime, userSung = new Set(), missed = new Set() }: AnimatedLyricsProps) {
  const [activeLine, setActiveLine] = useState<number>(-1);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);

  useEffect(() => {
    // Find the current line based on time
    const lineIndex = lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );

    if (lineIndex !== -1) {
      setActiveLine(lineIndex);

      // Find active word within the line
      const line = lyrics[lineIndex];
      const wordIndex = line.words.findIndex(
        (word) => currentTime >= word.start && currentTime <= word.end
      );
      setActiveWordIndex(wordIndex);
    } else {
      // Check if we should show the next line
      const nextLineIndex = lyrics.findIndex((line) => currentTime < line.startTime);
      if (nextLineIndex !== -1) {
        setActiveLine(nextLineIndex);
        setActiveWordIndex(-1);
      }
    }
  }, [currentTime, lyrics]);

  // Show current line and next 2 lines
  const visibleLines = lyrics.slice(
    Math.max(0, activeLine),
    Math.min(lyrics.length, activeLine + 3)
  );

  return (
    <div className="relative min-h-[300px] flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6 px-4">
        <AnimatePresence mode="popLayout">
          {visibleLines.map((line, lineIdx) => {
            const globalLineIdx = activeLine + lineIdx;
            const isActive = globalLineIdx === activeLine;

            return (
              <motion.div
                key={`${line.startTime}-${line.text}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                  y: 0,
                  scale: isActive ? 1 : 0.95,
                }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`text-center ${isActive ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'} font-bold leading-relaxed`}
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {line.words.map((wordObj, wordIdx) => {
                    const globalWordIdx = globalLineIdx * 100 + wordIdx; // Simple global index
                    const isActiveWord = isActive && wordIdx === activeWordIndex;
                    const isSung = userSung.has(globalWordIdx);
                    const isMissed = missed.has(globalWordIdx);
                    const isPast = isActive && wordIdx < activeWordIndex;

                    return (
                      <motion.span
                        key={`${wordObj.start}-${wordObj.word}`}
                        className="inline-block relative"
                        animate={{
                          color: isMissed
                            ? "#B71C1C" // blood-red
                            : isSung || isPast
                            ? "#FFFFFF" // white
                            : isActiveWord
                            ? "#FF1744" // blood-pink
                            : "#FFFFFF80", // white-50
                          scale: isMissed ? [1, 1.1, 1, 1.1, 1] : isActiveWord ? 1.1 : 1,
                          x: isMissed ? [0, -5, 5, -5, 5, 0] : 0,
                        }}
                        transition={{
                          duration: isMissed ? 0.5 : 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {wordObj.word}
                        
                        {/* Glow effect for active word */}
                        {isActiveWord && (
                          <motion.span
                            className="absolute inset-0 -z-10 blur-xl"
                            style={{ color: "#FF1744" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {wordObj.word}
                          </motion.span>
                        )}
                        
                        {/* Success sparkle effect */}
                        {isSung && !isMissed && (
                          <motion.span
                            className="absolute -top-2 -right-2 text-blood-pink"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: [0, 1.2, 0], rotate: [0, 180, 360] }}
                            transition={{ duration: 0.6 }}
                          >
                            ✨
                          </motion.span>
                        )}
                      </motion.span>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Simple progress bar showing song progress
 */
export function LyricsProgressBar({ currentTime, duration }: { currentTime: number; duration: number }) {
  const progress = Math.min((currentTime / duration) * 100, 100);

  return (
    <div className="w-full bg-navy-light rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blood-pink to-blood-red"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      />
    </div>
  );
}
