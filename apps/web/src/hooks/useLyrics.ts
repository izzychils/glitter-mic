import { useMemo } from "react";

export interface LyricLine {
  time: number; // seconds
  text: string;
  index: number;
}

/**
 * Parse LRC format lyrics into structured lines with timestamps
 * Format: [MM:SS.xx]Lyric text
 */
function parseLrc(lrcText: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const lrcLines = lrcText.split(/\r?\n/);

  lrcLines.forEach((line) => {
    const match = line.match(/^\[(\d{1,3}):(\d{2})\.(\d{2,3})\](.*)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3].padEnd(2, '0'), 10);
      const text = match[4].trim();

      const time = minutes * 60 + seconds + centiseconds / 100;
      
      if (text) {
        lines.push({ time, text, index: lines.length });
      }
    }
  });

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * Find the current active lyric line based on playback time
 */
function getCurrentLineIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1;

  // Find the last line whose time has passed
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      return i;
    }
  }

  return -1;
}

export interface UseLyricsResult {
  lines: LyricLine[];
  currentLineIndex: number;
  currentLine: LyricLine | null;
  nextLine: LyricLine | null;
  progress: number; // 0-1 progress through current line
}

/**
 * Hook to parse and track LRC lyrics synchronized with audio playback
 */
export function useLyrics(lrcText: string | null, currentTime: number): UseLyricsResult {
  const lines = useMemo(() => {
    if (!lrcText) return [];
    return parseLrc(lrcText);
  }, [lrcText]);

  const currentLineIndex = getCurrentLineIndex(lines, currentTime);
  const currentLine = currentLineIndex >= 0 ? lines[currentLineIndex] : null;
  const nextLine = currentLineIndex >= 0 && currentLineIndex < lines.length - 1 
    ? lines[currentLineIndex + 1] 
    : null;

  // Calculate progress through current line (0-1)
  let progress = 0;
  if (currentLine && nextLine) {
    const duration = nextLine.time - currentLine.time;
    const elapsed = currentTime - currentLine.time;
    progress = Math.min(Math.max(elapsed / duration, 0), 1);
  } else if (currentLine && !nextLine) {
    // Last line - assume 5 second duration
    const elapsed = currentTime - currentLine.time;
    progress = Math.min(elapsed / 5, 1);
  }

  return {
    lines,
    currentLineIndex,
    currentLine,
    nextLine,
    progress,
  };
}
