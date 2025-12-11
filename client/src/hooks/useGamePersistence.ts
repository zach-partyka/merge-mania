import { useCallback, useRef, useEffect } from "react";
import type { GameState, GameSettings, DifficultyLevel } from "@shared/schema";

const SCHEMA_VERSION = 1;
const STORAGE_KEY = "numberMatch_gameState";
const SETTINGS_KEY = "numberMatch_settings";
const DIFFICULTY_KEY = "numberMatch_difficulty";
const BEST_PROGRESS_KEY = "numberMatch_bestProgress";
const DEBOUNCE_MS = 500;

// Safe localStorage wrapper to handle quota exceeded errors
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && (
      e.code === 22 || // QuotaExceededError
      e.code === 1014 || // Firefox
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      console.error("LocalStorage quota exceeded");
      // Clear old game states to make room
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    console.error("Failed to save to localStorage:", e);
    return false;
  }
}

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
  return { soundEnabled: true };
}

export function loadGameState(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check schema version
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      console.log("Schema version mismatch, clearing old save");
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.state;
  } catch (e) {
    console.error("Failed to load game state:", e);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return null;
  }
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
  safeSetItem(BEST_PROGRESS_KEY, progress.toString());
}

export function useGamePersistence() {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (pendingStateRef.current) {
          const wrapped = {
            schemaVersion: SCHEMA_VERSION,
            state: pendingStateRef.current
          };
          safeSetItem(STORAGE_KEY, JSON.stringify(wrapped));
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
      const wrapped = {
        schemaVersion: SCHEMA_VERSION,
        state
      };
      safeSetItem(STORAGE_KEY, JSON.stringify(wrapped));
      pendingStateRef.current = null;
      saveTimeoutRef.current = null;
    }, DEBOUNCE_MS);
  }, []);

  const saveGameStateImmediate = useCallback((state: GameState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingStateRef.current = null;

    const wrapped = {
      schemaVersion: SCHEMA_VERSION,
      state
    };
    safeSetItem(STORAGE_KEY, JSON.stringify(wrapped));
  }, []);

  const saveSettings = useCallback((settings: GameSettings) => {
    safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
  }, []);

  const saveDifficulty = useCallback((difficulty: DifficultyLevel) => {
    safeSetItem(DIFFICULTY_KEY, difficulty);
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
