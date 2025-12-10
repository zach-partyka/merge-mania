import { useState, useCallback, useEffect } from "react";
import {
  type GameState,
  type Block,
  type PowerUpType,
  type GameSettings,
  GRID_COLS,
  GRID_ROWS,
  INITIAL_POWERUPS,
  MAX_POWERUP_COUNT,
  PROGRESS_REWARD_THRESHOLD,
  POWERUP_MILESTONES,
  SCORE_POWERUP_THRESHOLD,
  ELIMINATION_MILESTONES,
  generateBlockId,
  areBlocksAdjacent,
  getAvailableSpawnNumbers
} from "@shared/schema";

const STORAGE_KEY = "numberMatch_gameState";
const BEST_SCORE_KEY = "numberMatch_personalBest";
const SETTINGS_KEY = "numberMatch_settings";

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
function createInitialGrid(eliminatedNumbers: number[] = []): (Block | null)[][] {
  const grid: (Block | null)[][] = [];
  
  for (let row = 0; row < GRID_ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      grid[row][col] = createRandomBlock(row, col, eliminatedNumbers);
    }
  }
  
  return grid;
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
  return {
    grid: createInitialGrid(),
    score: 0,
    personalBest: loadPersonalBest(),
    combo: 0,
    comboMultiplier: 1,
    powerUps: { ...INITIAL_POWERUPS },
    highestNumber: 2,
    eliminatedNumbers: [],
    progressPoints: 0,
    selectedBlocks: [],
    isGameOver: false,
    isPaused: false,
    activePowerUp: null,
    swapFirstBlock: null,
    settings: loadSettings(),
    unlockedMilestones: []
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
      
      // Check if same value
      if (block.value !== lastBlock.value) return prev;
      
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
      setGameState(prev => ({ ...prev, selectedBlocks: [] }));
      return;
    }
    
    // Calculate merged value
    const baseValue = selectedBlocks[0].value;
    const mergeCount = selectedBlocks.length;
    let newValue = baseValue;
    
    // Each pair of blocks doubles the value
    for (let i = 1; i < mergeCount; i++) {
      newValue *= 2;
    }
    
    // Calculate score
    const comboMultiplier = gameState.combo > 0 ? Math.min(gameState.combo + 1, 4) : 1;
    const mergeScore = newValue * mergeCount * comboMultiplier;
    
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
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (newGrid[r][c]?.value === eliminationTarget) {
              newGrid[r][c] = null;
            }
          }
        }
      }
      
      // Calculate progress points
      let newProgressPoints = prev.progressPoints + mergeScore;
      
      // Check for score-based power-up earning
      const previousThreshold = Math.floor(prev.score / SCORE_POWERUP_THRESHOLD);
      const newThreshold = Math.floor((prev.score + mergeScore) / SCORE_POWERUP_THRESHOLD);
      if (newThreshold > previousThreshold) {
        setPendingRewards(r => r + (newThreshold - previousThreshold));
      }
      
      // Check for progress bar rewards
      if (newProgressPoints >= PROGRESS_REWARD_THRESHOLD) {
        setShowRewardModal(true);
        newProgressPoints = newProgressPoints % PROGRESS_REWARD_THRESHOLD;
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
      
      // For each column, move blocks down to fill gaps
      for (let col = 0; col < GRID_COLS; col++) {
        let writeRow = GRID_ROWS - 1;
        
        // Move existing blocks down
        for (let row = GRID_ROWS - 1; row >= 0; row--) {
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

  // Check if there are any valid moves left
  const checkForValidMoves = (grid: (Block | null)[][]): boolean => {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const block = grid[row][col];
        if (!block) continue;
        
        // Check adjacent blocks for same value
        const neighbors = [
          grid[row - 1]?.[col],
          grid[row + 1]?.[col],
          grid[row]?.[col - 1],
          grid[row]?.[col + 1]
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
      
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
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
    restartGame,
    updateSettings,
    resetAllProgress
  };
}
