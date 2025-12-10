import { useCallback, useRef, useEffect } from "react";
import type { GameState, GameSettings, DifficultyLevel } from "@shared/schema";

const STORAGE_KEY = "numberMatch_gameState";
const SETTINGS_KEY = "numberMatch_settings";
const DIFFICULTY_KEY = "numberMatch_difficulty";
const BEST_PROGRESS_KEY = "numberMatch_bestProgress";
const DEBOUNCE_MS = 500;

export function loadDifficulty(): DifficultyLevel {
  try {
    const stored = localStorage.getItem(DIFFICULTY_KEY);
    if (stored && (stored === "kids" || stored === "normal" || stored === "hard")) {
      return stored;
    }
  } catch (e) {
    console.error("Failed to load difficulty:", e);
  }
  return "normal";
}

export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return { hapticEnabled: true, soundEnabled: true };
}

export function loadGameState(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return null;
}

export function loadBestProgress(): number {
  try {
    const stored = localStorage.getItem(BEST_PROGRESS_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (e) {
    console.error("Failed to load best progress:", e);
  }
  return 0;
}

export function saveBestProgress(progress: number): void {
  try {
    localStorage.setItem(BEST_PROGRESS_KEY, progress.toString());
  } catch (e) {
    console.error("Failed to save best progress:", e);
  }
}

export function useGamePersistence() {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (pendingStateRef.current) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingStateRef.current));
          } catch (e) {
            console.error("Failed to save game state on unmount:", e);
          }
        }
      }
    };
  }, []);

  const saveGameState = useCallback((state: GameState) => {
    pendingStateRef.current = state;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        pendingStateRef.current = null;
      } catch (e) {
        console.error("Failed to save game state:", e);
      }
      saveTimeoutRef.current = null;
    }, DEBOUNCE_MS);
  }, []);

  const saveGameStateImmediate = useCallback((state: GameState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingStateRef.current = null;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save game state:", e);
    }
  }, []);

  const saveSettings = useCallback((settings: GameSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, []);

  const saveDifficulty = useCallback((difficulty: DifficultyLevel) => {
    try {
      localStorage.setItem(DIFFICULTY_KEY, difficulty);
    } catch (e) {
      console.error("Failed to save difficulty:", e);
    }
  }, []);

  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear game state:", e);
    }
  }, []);

  const clearAllProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BEST_PROGRESS_KEY);
    } catch (e) {
      console.error("Failed to clear all progress:", e);
    }
  }, []);

  return {
    saveGameState,
    saveGameStateImmediate,
    saveSettings,
    saveDifficulty,
    clearGameState,
    clearAllProgress
  };
}
