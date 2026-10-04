import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Difficulty = "easy" | "normal" | "pro";

interface SettingsState {
  difficulty: Difficulty;
  /** Key-invariant pitch mode is on by default (build guide Section 8.5). */
  keyInvariant: boolean;
  /** Blur strength in px for the current lyric line. */
  blurStrength: number;
  reducedMotion: boolean;
  setDifficulty: (difficulty: Difficulty) => void;
  setKeyInvariant: (keyInvariant: boolean) => void;
  setBlurStrength: (blurStrength: number) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
}

/** Gameplay + accessibility settings, persisted so calibration choices stick. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      difficulty: "normal",
      keyInvariant: true,
      blurStrength: 3,
      reducedMotion: false,
      setDifficulty: (difficulty) => set({ difficulty }),
      setKeyInvariant: (keyInvariant) => set({ keyInvariant }),
      setBlurStrength: (blurStrength) => set({ blurStrength }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    { name: "glitter-mic-settings" }
  )
);
