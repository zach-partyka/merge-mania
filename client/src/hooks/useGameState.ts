import { useState, useCallback, useEffect } from "react";
import {
  type GameState,
  type Block,
  type PowerUpType,
  type GameSettings,
  type DifficultyLevel,
  GRID_COLS,
  GRID_ROWS,
  INITIAL_POWERUPS,
  MAX_POWERUP_COUNT,
  POWERUP_MILESTONES,
  SCORE_POWERUP_THRESHOLD,
  ELIMINATION_MILESTONES,
  DIFFICULTY_CONFIGS,
  generateBlockId,
  areBlocksAdjacent,
  getAvailableSpawnNumbers,
  getProgressThreshold
} from "@shared/schema";

const STORAGE_KEY = "numberMatch_gameState";
const BEST_SCORE_KEY = "numberMatch_personalBest";
const SETTINGS_KEY = "numberMatch_settings";
const DIFFICULTY_KEY = "numberMatch_difficulty";

// Create a new block with random value
function createRandomBlock(row: number, col: number, eliminatedNumbers: number[]): Block {
  const availableNumbers = getAvailableSpawnNumbers(eliminatedNumbers);
  const value = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  
  return {
    id: generateBlockId(),
    value,
    row,
    col,
    isSelected: false,
    isNew: true,
    isMerging: false
  };
}

// Initialize a new grid
function createInitialGrid(eliminatedNumbers: number[] = [], gridRows: number = GRID_ROWS, gridCols: number = GRID_COLS): (Block | null)[][] {
  const grid: (Block | null)[][] = [];
  
  for (let row = 0; row < gridRows; row++) {
    grid[row] = [];
    for (let col = 0; col < gridCols; col++) {
      grid[row][col] = createRandomBlock(row, col, eliminatedNumbers);
    }
  }
  
  return grid;
}

// Load difficulty from localStorage
function loadDifficulty(): DifficultyLevel {
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

// Load settings from localStorage
function loadSettings(): GameSettings {
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

// Load personal best from localStorage
function loadPersonalBest(): number {
  try {
    const stored = localStorage.getItem(BEST_SCORE_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (e) {
    console.error("Failed to load personal best:", e);
  }
  return 0;
}

// Create initial game state
function createInitialState(): GameState {
  const difficulty = loadDifficulty();
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  return {
    grid: createInitialGrid([], config.gridRows, config.gridCols),
    score: 0,
    personalBest: loadPersonalBest(),
    combo: 0,
    comboMultiplier: 1,
    powerUps: { ...INITIAL_POWERUPS },
    highestNumber: 2,
    eliminatedNumbers: [],
    progressPoints: 0,
    progressLevel: 0,
    selectedBlocks: [],
    isGameOver: false,
    isPaused: false,
    activePowerUp: null,
    swapFirstBlock: null,
    settings: loadSettings(),
    unlockedMilestones: [],
    difficulty
  };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [showCombo, setShowCombo] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingRewards, setPendingRewards] = useState(0);

  // Save game state to localStorage
  const saveGameState = useCallback((state: GameState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (state.score > state.personalBest) {
        localStorage.setItem(BEST_SCORE_KEY, state.score.toString());
      }
    } catch (e) {
      console.error("Failed to save game state:", e);
    }
  }, []);

  // Save settings
  const saveSettings = useCallback((settings: GameSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, []);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((intensity: "light" | "medium" | "heavy" = "medium") => {
    if (!gameState.settings.hapticEnabled) return;
    
    if ("vibrate" in navigator) {
      const duration = intensity === "light" ? 10 : intensity === "medium" ? 25 : 50;
      navigator.vibrate(duration);
    }
  }, [gameState.settings.hapticEnabled]);

  // Start touch selection
  const handleTouchStart = useCallback((block: Block) => {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Handle power-up activation
    if (gameState.activePowerUp === "remove") {
      // Remove the block
      setGameState(prev => {
        const newGrid = prev.grid.map(row => [...row]);
        newGrid[block.row][block.col] = null;
        
        return {
          ...prev,
          grid: newGrid,
          activePowerUp: null,
          powerUps: {
            ...prev.powerUps,
            remove: prev.powerUps.remove - 1
          }
        };
      });
      triggerHaptic("heavy");
      // Trigger block dropping
      setTimeout(() => dropBlocks(), 100);
      return;
    }

    if (gameState.activePowerUp === "swap") {
      if (!gameState.swapFirstBlock) {
        // Select first block for swap
        setGameState(prev => ({
          ...prev,
          swapFirstBlock: block
        }));
        triggerHaptic("light");
      } else {
        // Swap the two blocks
        const firstBlock = gameState.swapFirstBlock;
        setGameState(prev => {
          const newGrid = prev.grid.map(row => [...row]);
          
          // Swap positions
          const tempValue = block.value;
          newGrid[block.row][block.col] = {
            ...firstBlock,
            row: block.row,
            col: block.col,
            id: generateBlockId()
          };
          newGrid[firstBlock.row][firstBlock.col] = {
            ...block,
            value: tempValue,
            row: firstBlock.row,
            col: firstBlock.col,
            id: generateBlockId()
          };
          
          return {
            ...prev,
            grid: newGrid,
            activePowerUp: null,
            swapFirstBlock: null,
            powerUps: {
              ...prev.powerUps,
              swap: prev.powerUps.swap - 1
            }
          };
        });
        triggerHaptic("heavy");
      }
      return;
    }

    // Normal selection for merging
    setGameState(prev => ({
      ...prev,
      selectedBlocks: [block],
      combo: 0
    }));
    triggerHaptic("light");
  }, [gameState.isGameOver, gameState.isPaused, gameState.activePowerUp, gameState.swapFirstBlock, triggerHaptic]);

  // Continue touch selection (drag)
  const handleTouchMove = useCallback((block: Block) => {
    if (gameState.isGameOver || gameState.isPaused || gameState.activePowerUp) return;
    
    setGameState(prev => {
      const { selectedBlocks } = prev;
      if (selectedBlocks.length === 0) return prev;
      
      // Check if block is already selected
      const isAlreadySelected = selectedBlocks.some(b => b.id === block.id);
      
      // If going back to previous block, remove the last one
      if (isAlreadySelected && selectedBlocks.length > 1) {
        const previousBlock = selectedBlocks[selectedBlocks.length - 2];
        if (previousBlock.id === block.id) {
          triggerHaptic("light");
          return {
            ...prev,
            selectedBlocks: selectedBlocks.slice(0, -1)
          };
        }
        return prev;
      }
      
      if (isAlreadySelected) return prev;
      
      // Check if adjacent to last selected block
      const lastBlock = selectedBlocks[selectedBlocks.length - 1];
      if (!areBlocksAdjacent(lastBlock, block)) return prev;
      
      // Chain combo logic:
      // 1. First, must connect 2+ blocks of the same base value
      // 2. After that, can only chain FORWARD to the next value (2x)
      // 3. Once you advance to a higher tier, you cannot go back
      const baseValue = selectedBlocks[0].value;
      const baseCount = selectedBlocks.filter(b => b.value === baseValue).length;
      const lastValue = lastBlock.value;
      const currentMaxValue = Math.max(...selectedBlocks.map(b => b.value));
      
      let isValidConnection = false;
      
      if (block.value === lastValue) {
        // Same value as last - valid
        isValidConnection = true;
      } else if (baseCount >= 2 && block.value === lastValue * 2 && block.value > currentMaxValue) {
        // Chaining forward to next value:
        // - Must have 2+ base blocks first
        // - Must be exactly 2x the last value
        // - Must be higher than any value already in the chain (no going back)
        isValidConnection = true;
      }
      
      if (!isValidConnection) return prev;
      
      triggerHaptic("light");
      return {
        ...prev,
        selectedBlocks: [...selectedBlocks, block]
      };
    });
  }, [gameState.isGameOver, gameState.isPaused, gameState.activePowerUp, triggerHaptic]);

  // End touch - perform merge if valid
  const handleTouchEnd = useCallback(() => {
    const { selectedBlocks } = gameState;
    
    if (selectedBlocks.length < 2) {
      // Reset combo and multiplier when selection ends without valid merge
      setGameState(prev => ({ ...prev, selectedBlocks: [], combo: 0, comboMultiplier: 1 }));
      return;
    }
    
    // Chain combo calculation:
    // - baseValue: the first block's value (starting point of chain)
    // - baseCount: how many of the base value were connected (becomes the multiplier)
    // - Each chain step doubles the value, carrying the base multiplier forward
    const baseValue = selectedBlocks[0].value;
    const baseCount = selectedBlocks.filter(b => b.value === baseValue).length;
    
    // Get unique values in the chain, sorted ascending
    const chainValues = Array.from(new Set(selectedBlocks.map(b => b.value))).sort((a, b) => a - b);
    const chainLength = chainValues.length;
    
    let newValue: number;
    
    if (chainLength === 1) {
      // Traditional merge: all same value, each block doubles
      newValue = baseValue;
      for (let i = 1; i < selectedBlocks.length; i++) {
        newValue *= 2;
      }
    } else {
      // Chain merge: base blocks create multiplier, then double through each chain level
      // Start with base value doubled for each base block beyond the first
      let chainResult = baseValue;
      for (let i = 1; i < baseCount; i++) {
        chainResult *= 2;
      }
      
      // Then double for each chain level we advanced through
      // Each new tier we touch adds another doubling
      for (let i = 1; i < chainLength; i++) {
        const tierValue = chainValues[i];
        const tierCount = selectedBlocks.filter(b => b.value === tierValue).length;
        // Each block at this tier doubles the result
        for (let j = 0; j < tierCount; j++) {
          chainResult *= 2;
        }
      }
      newValue = chainResult;
    }
    
    // Simplified scoring: newValue × comboMultiplier only
    // Combo bonus: +25% per consecutive merge, max 2x (at combo 4+)
    const comboMultiplier = 1 + Math.min(gameState.combo * 0.25, 1);
    // Apply difficulty score multiplier (fallback to normal if undefined)
    const difficultyConfig = DIFFICULTY_CONFIGS[gameState.difficulty] || DIFFICULTY_CONFIGS.normal;
    const mergeScore = Math.round(newValue * comboMultiplier * difficultyConfig.scoreMultiplier);
    
    setGameState(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      
      // Mark all selected blocks as merging (they will disappear)
      selectedBlocks.forEach(block => {
        if (newGrid[block.row][block.col]) {
          newGrid[block.row][block.col] = {
            ...newGrid[block.row][block.col]!,
            isMerging: true
          };
        }
      });
      
      // Place the new merged block at the last selected position
      const lastBlock = selectedBlocks[selectedBlocks.length - 1];
      
      // Clear all selected block positions except the last one
      selectedBlocks.slice(0, -1).forEach(block => {
        newGrid[block.row][block.col] = null;
      });
      
      // Set the new value at the last position
      newGrid[lastBlock.row][lastBlock.col] = {
        id: generateBlockId(),
        value: newValue,
        row: lastBlock.row,
        col: lastBlock.col,
        isSelected: false,
        isNew: true,
        isMerging: false
      };
      
      // Update highest number
      const newHighest = Math.max(prev.highestNumber, newValue);
      
      // Check for milestone unlocks
      let newMilestones = [...prev.unlockedMilestones];
      let newEliminated = [...prev.eliminatedNumbers];
      
      if (POWERUP_MILESTONES.includes(newValue) && !prev.unlockedMilestones.includes(newValue)) {
        newMilestones.push(newValue);
        setPendingRewards(r => r + 1);
      }
      
      // Check for number elimination
      const eliminationTarget = ELIMINATION_MILESTONES[newValue];
      if (eliminationTarget && !newEliminated.includes(eliminationTarget)) {
        newEliminated.push(eliminationTarget);
        // Remove all blocks with this value
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[0].length; c++) {
            if (newGrid[r][c]?.value === eliminationTarget) {
              newGrid[r][c] = null;
            }
          }
        }
      }
      
      // Calculate progress points from score (keeps score and progress connected)
      const config = DIFFICULTY_CONFIGS[prev.difficulty] || DIFFICULTY_CONFIGS.normal;
      const progressEarned = Math.round(mergeScore * config.powerUpMultiplier);
      let newProgressPoints = prev.progressPoints + progressEarned;
      
      // Check for score-based power-up earning (also affected by difficulty)
      const adjustedThreshold = Math.round(SCORE_POWERUP_THRESHOLD / config.powerUpMultiplier);
      const previousThreshold = Math.floor(prev.score / adjustedThreshold);
      const newThreshold = Math.floor((prev.score + mergeScore) / adjustedThreshold);
      if (newThreshold > previousThreshold) {
        setPendingRewards(r => r + (newThreshold - previousThreshold));
      }
      
      // Check for progress bar rewards (use dynamic threshold)
      const currentThreshold = getProgressThreshold(prev.difficulty, prev.progressLevel);
      let newProgressLevel = prev.progressLevel;
      if (newProgressPoints >= currentThreshold) {
        setShowRewardModal(true);
        newProgressPoints = newProgressPoints - currentThreshold;
        newProgressLevel = prev.progressLevel + 1;
      }
      
      // Update personal best
      const newScore = prev.score + mergeScore;
      const newPersonalBest = Math.max(prev.personalBest, newScore);
      
      return {
        ...prev,
        grid: newGrid,
        score: newScore,
        personalBest: newPersonalBest,
        combo: prev.combo + 1,
        comboMultiplier,
        highestNumber: newHighest,
        eliminatedNumbers: newEliminated,
        progressPoints: newProgressPoints,
        progressLevel: newProgressLevel,
        selectedBlocks: [],
        unlockedMilestones: newMilestones
      };
    });
    
    // Show combo indicator
    if (gameState.combo > 0) {
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 600);
    }
    
    triggerHaptic("medium");
    
    // Trigger block dropping after a short delay
    setTimeout(() => dropBlocks(), 300);
  }, [gameState, triggerHaptic]);

  // Drop blocks to fill gaps
  const dropBlocks = useCallback(() => {
    setGameState(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      const gridRows = newGrid.length;
      const gridCols = newGrid[0]?.length || 0;
      
      // For each column, move blocks down to fill gaps
      for (let col = 0; col < gridCols; col++) {
        let writeRow = gridRows - 1;
        
        // Move existing blocks down
        for (let row = gridRows - 1; row >= 0; row--) {
          if (newGrid[row][col] !== null && !newGrid[row][col]?.isMerging) {
            if (row !== writeRow) {
              newGrid[writeRow][col] = {
                ...newGrid[row][col]!,
                row: writeRow,
                isNew: false
              };
              newGrid[row][col] = null;
            } else {
              newGrid[writeRow][col] = {
                ...newGrid[writeRow][col]!,
                isNew: false
              };
            }
            writeRow--;
          }
        }
        
        // Fill remaining spots from top with new blocks
        while (writeRow >= 0) {
          newGrid[writeRow][col] = createRandomBlock(writeRow, col, prev.eliminatedNumbers);
          writeRow--;
        }
      }
      
      // Check for game over (no valid moves)
      const hasValidMoves = checkForValidMoves(newGrid);
      
      const newState = {
        ...prev,
        grid: newGrid,
        isGameOver: !hasValidMoves
      };
      
      saveGameState(newState);
      return newState;
    });
  }, [saveGameState]);

  // Check if there are any valid moves left (including diagonals)
  const checkForValidMoves = (grid: (Block | null)[][]): boolean => {
    const gridRows = grid.length;
    const gridCols = grid[0]?.length || 0;
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const block = grid[row][col];
        if (!block) continue;
        
        // Check all 8 adjacent blocks for same value (including diagonals)
        const neighbors = [
          grid[row - 1]?.[col],     // up
          grid[row + 1]?.[col],     // down
          grid[row]?.[col - 1],     // left
          grid[row]?.[col + 1],     // right
          grid[row - 1]?.[col - 1], // up-left
          grid[row - 1]?.[col + 1], // up-right
          grid[row + 1]?.[col - 1], // down-left
          grid[row + 1]?.[col + 1]  // down-right
        ];
        
        if (neighbors.some(n => n && n.value === block.value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Activate power-up
  const activatePowerUp = useCallback((type: PowerUpType) => {
    if (gameState.powerUps[type] === 0) return;
    
    if (type === "mergeAll") {
      // Find the most common number and merge all of them
      const valueCounts: Record<number, Block[]> = {};
      const gridRows = gameState.grid.length;
      const gridCols = gameState.grid[0]?.length || 0;
      
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const block = gameState.grid[row][col];
          if (block) {
            if (!valueCounts[block.value]) {
              valueCounts[block.value] = [];
            }
            valueCounts[block.value].push(block);
          }
        }
      }
      
      // Find value with most blocks (at least 2)
      let maxCount = 0;
      let targetValue = 0;
      
      for (const [value, blocks] of Object.entries(valueCounts)) {
        if (blocks.length > maxCount && blocks.length >= 2) {
          maxCount = blocks.length;
          targetValue = parseInt(value);
        }
      }
      
      if (targetValue === 0) return; // No valid targets
      
      const blocksToMerge = valueCounts[targetValue];
      
      setGameState(prev => {
        const newGrid = prev.grid.map(row => [...row]);
        
        // Calculate merged value
        let newValue = targetValue;
        for (let i = 1; i < blocksToMerge.length; i++) {
          newValue *= 2;
        }
        
        // Remove all but the last block
        blocksToMerge.slice(0, -1).forEach(block => {
          newGrid[block.row][block.col] = null;
        });
        
        // Update the last block with new value
        const lastBlock = blocksToMerge[blocksToMerge.length - 1];
        newGrid[lastBlock.row][lastBlock.col] = {
          id: generateBlockId(),
          value: newValue,
          row: lastBlock.row,
          col: lastBlock.col,
          isSelected: false,
          isNew: true,
          isMerging: false
        };
        
        const mergeScore = newValue * blocksToMerge.length;
        
        return {
          ...prev,
          grid: newGrid,
          score: prev.score + mergeScore,
          highestNumber: Math.max(prev.highestNumber, newValue),
          powerUps: {
            ...prev.powerUps,
            mergeAll: prev.powerUps.mergeAll - 1
          }
        };
      });
      
      triggerHaptic("heavy");
      setTimeout(() => dropBlocks(), 300);
      return;
    }
    
    // For remove and swap, set active mode
    setGameState(prev => ({
      ...prev,
      activePowerUp: type,
      swapFirstBlock: null
    }));
    
    triggerHaptic("light");
  }, [gameState.grid, gameState.powerUps, triggerHaptic, dropBlocks]);

  // Cancel active power-up
  const cancelPowerUp = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      activePowerUp: null,
      swapFirstBlock: null
    }));
  }, []);

  // Handle reward selection
  const handleSelectReward = useCallback((type: PowerUpType) => {
    setGameState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [type]: Math.min(prev.powerUps[type] + 1, MAX_POWERUP_COUNT)
      }
    }));
    
    if (pendingRewards > 1) {
      setPendingRewards(r => r - 1);
    } else {
      setShowRewardModal(false);
      setPendingRewards(0);
    }
    
    triggerHaptic("medium");
  }, [pendingRewards, triggerHaptic]);

  // Save reward for later (just close modal)
  const handleSaveForLater = useCallback(() => {
    setShowRewardModal(false);
    setPendingRewards(0);
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Unpause and prepare for quit (so Continue doesn't open paused)
  const prepareForQuit = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    const personalBest = loadPersonalBest();
    const settings = loadSettings();
    
    setGameState({
      ...createInitialState(),
      personalBest,
      settings
    });
    
    setShowRewardModal(false);
    setPendingRewards(0);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: GameSettings) => {
    setGameState(prev => ({ ...prev, settings: newSettings }));
    saveSettings(newSettings);
  }, [saveSettings]);

  // Reset all progress
  const resetAllProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BEST_SCORE_KEY);
    setGameState(createInitialState());
    setShowRewardModal(false);
    setPendingRewards(0);
  }, []);

  // Load saved game on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedState = JSON.parse(stored);
        // Reset isNew flags for all blocks
        if (savedState.grid) {
          savedState.grid = savedState.grid.map((row: (Block | null)[]) =>
            row.map((block: Block | null) =>
              block ? { ...block, isNew: false, isMerging: false, isSelected: false } : null
            )
          );
        }
        // Ensure difficulty is set (backwards compatibility)
        if (!savedState.difficulty) {
          savedState.difficulty = "normal";
        }
        // Ensure progressLevel is set (backwards compatibility)
        if (typeof savedState.progressLevel !== "number") {
          savedState.progressLevel = 0;
        }
        setGameState({
          ...savedState,
          selectedBlocks: [],
          isPaused: false,
          activePowerUp: null,
          swapFirstBlock: null
        });
      }
    } catch (e) {
      console.error("Failed to load saved game:", e);
    }
  }, []);

  return {
    gameState,
    showCombo,
    showRewardModal,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    activatePowerUp,
    cancelPowerUp,
    handleSelectReward,
    handleSaveForLater,
    togglePause,
    prepareForQuit,
    restartGame,
    updateSettings,
    resetAllProgress
  };
}
