import { z } from "zod";

// Number values in the game (powers of 2)
export const NUMBER_VALUES = [
  2, 4, 8, 16, 32, 64, 128, 256, 512, 1024,
  2048, 4096, 8192, 16384, 32768, 65536,
  131072, 262144, 524288, 1048576
] as const;

export type NumberValue = typeof NUMBER_VALUES[number];

// Display labels for large numbers
export const NUMBER_LABELS: Record<number, string> = {
  2: "2", 4: "4", 8: "8", 16: "16", 32: "32", 64: "64",
  128: "128", 256: "256", 512: "512", 1024: "1024",
  2048: "2K", 4096: "4K", 8192: "8K", 16384: "16K",
  32768: "32K", 65536: "64K", 131072: "131K", 262144: "262K",
  524288: "524K", 1048576: "1M"
};

// Color mapping for each number value (Apollo palette inspired)
export const NUMBER_COLORS: Record<number, string> = {
  2: "#4a90a4",
  4: "#5da3b5",
  8: "#70b6c6",
  16: "#83c9d7",
  32: "#2d8659",
  64: "#3fa96f",
  128: "#52bc82",
  256: "#65cf95",
  512: "#d4a655",
  1024: "#e6b865",
  2048: "#f8ca75",
  4096: "#c75e76",
  8192: "#d97189",
  16384: "#eb849c",
  32768: "#7a4b94",
  65536: "#8d5ea7",
  131072: "#a071ba",
  262144: "#b384cd",
  524288: "#c79740",
  1048576: "#daa550"
};

// Milestones that trigger number elimination
export const ELIMINATION_MILESTONES: Record<number, number> = {
  1048576: 16,    // At 1M, eliminate all 16s
  524288: 8,      // At 524K, eliminate all 8s
  262144: 4,      // At 262K, eliminate all 4s
  131072: 2,      // At 131K, eliminate all 2s
};

// Milestones that grant power-ups
export const POWERUP_MILESTONES = [128, 512, 2048, 8192, 32768, 131072, 524288, 1048576];

// Score threshold for earning power-ups
export const SCORE_POWERUP_THRESHOLD = 2500;

// Progress bar base thresholds per difficulty (scales up each level)
// Tuned for simplified scoring: newValue × comboMultiplier only
export const PROGRESS_BASE_THRESHOLD: Record<DifficultyLevel, number> = {
  kids: 500,
  normal: 1000,
  hard: 2000,
};

// Progress threshold scaling per level (percentage increase)
export const PROGRESS_THRESHOLD_SCALING = 0.35; // 35% increase per level

// Calculate dynamic progress threshold based on level and difficulty
export function getProgressThreshold(difficulty: DifficultyLevel, progressLevel: number): number {
  const baseThreshold = PROGRESS_BASE_THRESHOLD[difficulty] || PROGRESS_BASE_THRESHOLD.normal;
  const multiplier = Math.pow(1 + PROGRESS_THRESHOLD_SCALING, progressLevel);
  return Math.round(baseThreshold * multiplier);
}

// Difficulty levels
export type DifficultyLevel = "kids" | "normal" | "hard";

// Difficulty configuration
export interface DifficultyConfig {
  label: string;
  description: string;
  gridCols: number;
  gridRows: number;
  scoreMultiplier: number;
  powerUpMultiplier: number;
}

// Difficulty presets
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  kids: {
    label: "Play",
    description: "Smaller grid, easier gameplay",
    gridCols: 4,
    gridRows: 5,
    scoreMultiplier: 1.0,
    powerUpMultiplier: 1.2,
  },
  normal: {
    label: "Normal",
    description: "Standard challenge",
    gridCols: 5,
    gridRows: 7,
    scoreMultiplier: 1.0,
    powerUpMultiplier: 1.0,
  },
  hard: {
    label: "Hard",
    description: "For puzzle masters",
    gridCols: 5,
    gridRows: 7,
    scoreMultiplier: 1.0,
    powerUpMultiplier: 0.7,
  },
};

// Default grid dimensions (for backwards compatibility)
export const GRID_COLS = 5;
export const GRID_ROWS = 7;

// Power-up types
export type PowerUpType = "remove" | "swap" | "mergeAll";

// Block in the grid
export interface Block {
  id: string;
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
  isNew: boolean;
  isMerging: boolean;
}

// Power-up state
export interface PowerUps {
  remove: number;
  swap: number;
  mergeAll: number;
}

// Game state
export interface GameState {
  grid: (Block | null)[][];
  score: number;
  personalBest: number;
  combo: number;
  comboMultiplier: number;
  powerUps: PowerUps;
  highestNumber: number;
  eliminatedNumbers: number[];
  progressPoints: number;
  progressLevel: number;
  selectedBlocks: Block[];
  isGameOver: boolean;
  isPaused: boolean;
  activePowerUp: PowerUpType | null;
  swapFirstBlock: Block | null;
  mergeAllTargetValue: number | null;
  settings: GameSettings;
  unlockedMilestones: number[];
  difficulty: DifficultyLevel;
}

// Game settings
export interface GameSettings {
  soundEnabled: boolean;
}

// Initial power-up counts
export const INITIAL_POWERUPS: PowerUps = {
  remove: 1,
  swap: 1,
  mergeAll: 1
};

// Max power-up capacity
export const MAX_POWERUP_COUNT = 5;

// Starting numbers for new blocks (before any eliminations)
export const STARTING_NUMBERS = [2, 4, 8, 16, 32, 64];

// Helper to get available spawn numbers based on eliminated numbers
export function getAvailableSpawnNumbers(eliminatedNumbers: number[]): number[] {
  return STARTING_NUMBERS.filter(n => !eliminatedNumbers.includes(n));
}

// Helper to format number for display
export function formatNumber(value: number): string {
  return NUMBER_LABELS[value] || value.toString();
}

// Helper to get color for a number
export function getBlockColor(value: number): string {
  return NUMBER_COLORS[value] || "#888888";
}

// Generate unique block ID
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if two blocks are adjacent (horizontally, vertically, or diagonally)
export function areBlocksAdjacent(block1: Block, block2: Block): boolean {
  const rowDiff = Math.abs(block1.row - block2.row);
  const colDiff = Math.abs(block1.col - block2.col);
  // Adjacent if within 1 step in any direction (including diagonals)
  return rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0);
}

// Zod schemas for validation
export const blockSchema = z.object({
  id: z.string(),
  value: z.number(),
  row: z.number(),
  col: z.number(),
  isSelected: z.boolean(),
  isNew: z.boolean(),
  isMerging: z.boolean()
});

export const powerUpsSchema = z.object({
  remove: z.number().min(0).max(MAX_POWERUP_COUNT),
  swap: z.number().min(0).max(MAX_POWERUP_COUNT),
  mergeAll: z.number().min(0).max(MAX_POWERUP_COUNT)
});

export const gameSettingsSchema = z.object({
  soundEnabled: z.boolean()
});

export const difficultyLevelSchema = z.enum(["kids", "normal", "hard"]);

export const gameStateSchema = z.object({
  grid: z.array(z.array(blockSchema.nullable())),
  score: z.number(),
  personalBest: z.number(),
  combo: z.number(),
  comboMultiplier: z.number(),
  powerUps: powerUpsSchema,
  highestNumber: z.number(),
  eliminatedNumbers: z.array(z.number()),
  progressPoints: z.number(),
  selectedBlocks: z.array(blockSchema),
  isGameOver: z.boolean(),
  isPaused: z.boolean(),
  activePowerUp: z.enum(["remove", "swap", "mergeAll"]).nullable(),
  swapFirstBlock: blockSchema.nullable(),
  settings: gameSettingsSchema,
  unlockedMilestones: z.array(z.number()),
  difficulty: difficultyLevelSchema
});
