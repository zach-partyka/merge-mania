import { useState, useCallback, useEffect, useRef } from "react";
import {
  type GameState,
  type Block,
  type PowerUpType,
  type GameSettings,
  type DifficultyLevel,
  INITIAL_POWERUPS,
  MAX_POWERUP_COUNT,
  POWERUP_MILESTONES,
  ELIMINATION_MILESTONES,
  DIFFICULTY_CONFIGS,
  generateBlockId,
  getProgressThreshold
} from "@shared/schema";
import {
  createInitialGrid,
  checkForValidMoves,
  isValidChainConnection,
  calculateMergeResult,
  findBlocksOfValue,
  executeRemovePowerUp,
  executeSwapPowerUp,
  executeMergeAllPowerUp,
  dropBlocksInGrid
} from "@shared/gameLogic";
import {
  useGamePersistence,
  loadDifficulty,
  loadSettings
} from "./useGamePersistence";

function createInitialState(): GameState {
  const difficulty = loadDifficulty();
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  return {
    grid: createInitialGrid([], config.gridRows, config.gridCols),
    score: 0,
    personalBest: 0,
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
    mergeAllTargetValue: null,
    settings: loadSettings(),
    unlockedMilestones: [],
    difficulty
  };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingRewards, setPendingRewards] = useState(0);

  const { saveGameState, saveSettings, clearGameState } = useGamePersistence();

  const removeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mergeDropTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);
      if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
      if (mergeDropTimeoutRef.current) clearTimeout(mergeDropTimeoutRef.current);
    };
  }, []);

  const triggerHaptic = useCallback((intensity: "light" | "medium" | "heavy" = "medium") => {
    if (!gameState.settings.hapticEnabled) return;
    
    if ("vibrate" in navigator) {
      const duration = intensity === "light" ? 10 : intensity === "medium" ? 25 : 50;
      navigator.vibrate(duration);
    }
  }, [gameState.settings.hapticEnabled]);

  const dropBlocks = useCallback(() => {
    setGameState(prev => {
      const newGrid = dropBlocksInGrid(prev.grid, prev.eliminatedNumbers);
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

  const handleTouchStart = useCallback((block: Block) => {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    if (gameState.activePowerUp === "remove") {
      setGameState(prev => ({
        ...prev,
        selectedBlocks: [block]
      }));
      triggerHaptic("light");
      
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);
      removeTimeoutRef.current = setTimeout(() => {
        setGameState(prev => {
          const result = executeRemovePowerUp(prev.grid, block, prev.powerUps);
          return {
            ...prev,
            grid: result.newGrid,
            activePowerUp: null,
            selectedBlocks: [],
            powerUps: result.newPowerUps
          };
        });
        triggerHaptic("heavy");
        
        if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
        dropTimeoutRef.current = setTimeout(() => dropBlocks(), 100);
      }, 300);
      return;
    }

    if (gameState.activePowerUp === "swap") {
      if (!gameState.swapFirstBlock) {
        setGameState(prev => ({
          ...prev,
          swapFirstBlock: block
        }));
        triggerHaptic("light");
      } else {
        const firstBlock = gameState.swapFirstBlock;
        setGameState(prev => {
          const result = executeSwapPowerUp(prev.grid, firstBlock, block, prev.powerUps);
          return {
            ...prev,
            grid: result.newGrid,
            activePowerUp: null,
            swapFirstBlock: null,
            powerUps: result.newPowerUps
          };
        });
        triggerHaptic("heavy");
      }
      return;
    }

    setGameState(prev => ({
      ...prev,
      selectedBlocks: [block],
      combo: 0
    }));
    triggerHaptic("light");
  }, [gameState.isGameOver, gameState.isPaused, gameState.activePowerUp, gameState.swapFirstBlock, triggerHaptic, dropBlocks]);

  const handleTouchMove = useCallback((block: Block) => {
    if (gameState.isGameOver || gameState.isPaused || gameState.activePowerUp) return;
    
    setGameState(prev => {
      const { selectedBlocks } = prev;
      if (selectedBlocks.length === 0) return prev;
      
      const isAlreadySelected = selectedBlocks.some(b => b.id === block.id);
      
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
      
      if (!isValidChainConnection(selectedBlocks, block)) return prev;
      
      triggerHaptic("light");
      return {
        ...prev,
        selectedBlocks: [...selectedBlocks, block]
      };
    });
  }, [gameState.isGameOver, gameState.isPaused, gameState.activePowerUp, triggerHaptic]);

  const handleTouchEnd = useCallback(() => {
    const { selectedBlocks } = gameState;
    
    if (selectedBlocks.length < 2) {
      setGameState(prev => ({ ...prev, selectedBlocks: [], combo: 0, comboMultiplier: 1 }));
      return;
    }
    
    const { newValue, progressEarned } = calculateMergeResult(selectedBlocks, gameState.difficulty);
    
    setGameState(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      
      selectedBlocks.forEach(block => {
        if (newGrid[block.row][block.col]) {
          newGrid[block.row][block.col] = {
            ...newGrid[block.row][block.col]!,
            isMerging: true
          };
        }
      });
      
      const lastBlock = selectedBlocks[selectedBlocks.length - 1];
      
      selectedBlocks.slice(0, -1).forEach(block => {
        newGrid[block.row][block.col] = null;
      });
      
      newGrid[lastBlock.row][lastBlock.col] = {
        id: generateBlockId(),
        value: newValue,
        row: lastBlock.row,
        col: lastBlock.col,
        isSelected: false,
        isNew: true,
        isMerging: false
      };
      
      const newHighest = Math.max(prev.highestNumber, newValue);
      
      let newMilestones = [...prev.unlockedMilestones];
      let newEliminated = [...prev.eliminatedNumbers];
      
      if (POWERUP_MILESTONES.includes(newValue) && !prev.unlockedMilestones.includes(newValue)) {
        newMilestones.push(newValue);
        setPendingRewards(r => r + 1);
      }
      
      const eliminationTarget = ELIMINATION_MILESTONES[newValue];
      if (eliminationTarget && !newEliminated.includes(eliminationTarget)) {
        newEliminated.push(eliminationTarget);
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[0].length; c++) {
            if (newGrid[r][c]?.value === eliminationTarget) {
              newGrid[r][c] = null;
            }
          }
        }
      }
      
      let newProgressPoints = prev.progressPoints + progressEarned;
      
      const currentThreshold = getProgressThreshold(prev.difficulty, prev.progressLevel);
      let newProgressLevel = prev.progressLevel;
      if (newProgressPoints >= currentThreshold) {
        setShowRewardModal(true);
        newProgressPoints = newProgressPoints - currentThreshold;
        newProgressLevel = prev.progressLevel + 1;
      }
      
      return {
        ...prev,
        grid: newGrid,
        highestNumber: newHighest,
        eliminatedNumbers: newEliminated,
        progressPoints: newProgressPoints,
        progressLevel: newProgressLevel,
        selectedBlocks: [],
        unlockedMilestones: newMilestones,
        combo: 0,
        comboMultiplier: 1
      };
    });
    
    triggerHaptic("medium");
    
    if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
    dropTimeoutRef.current = setTimeout(() => dropBlocks(), 300);
  }, [gameState, triggerHaptic, dropBlocks]);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    if (gameState.powerUps[type] === 0) return;
    
    if (type === "mergeAll") {
      setGameState(prev => ({
        ...prev,
        activePowerUp: type,
        mergeAllTargetValue: null
      }));
      triggerHaptic("light");
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      activePowerUp: type,
      swapFirstBlock: null,
      mergeAllTargetValue: null
    }));
    
    triggerHaptic("light");
  }, [gameState.powerUps, triggerHaptic]);

  const cancelPowerUp = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      activePowerUp: null,
      swapFirstBlock: null,
      mergeAllTargetValue: null,
      selectedBlocks: []
    }));
  }, []);
  
  const selectMergeAllTarget = useCallback((targetValue: number) => {
    const blocksToHighlight = findBlocksOfValue(gameState.grid, targetValue);
    
    setGameState(prev => ({
      ...prev,
      mergeAllTargetValue: targetValue,
      selectedBlocks: blocksToHighlight
    }));
    triggerHaptic("light");
  }, [gameState.grid, triggerHaptic]);
  
  const executeMergeAll = useCallback(() => {
    const targetValue = gameState.mergeAllTargetValue;
    if (!targetValue) return;
    
    const result = executeMergeAllPowerUp(
      gameState.grid,
      targetValue,
      gameState.powerUps,
      gameState.difficulty
    );
    
    if (!result) return;
    
    setGameState(prev => {
      let newProgressPoints = prev.progressPoints + result.progressEarned;
      const currentThreshold = getProgressThreshold(prev.difficulty, prev.progressLevel);
      let newProgressLevel = prev.progressLevel;
      
      if (newProgressPoints >= currentThreshold) {
        setShowRewardModal(true);
        newProgressPoints = newProgressPoints - currentThreshold;
        newProgressLevel = prev.progressLevel + 1;
      }
      
      return {
        ...prev,
        grid: result.newGrid,
        progressPoints: newProgressPoints,
        progressLevel: newProgressLevel,
        highestNumber: Math.max(prev.highestNumber, result.newValue),
        activePowerUp: null,
        mergeAllTargetValue: null,
        selectedBlocks: [],
        powerUps: result.newPowerUps
      };
    });
    
    triggerHaptic("heavy");
    
    if (mergeDropTimeoutRef.current) clearTimeout(mergeDropTimeoutRef.current);
    mergeDropTimeoutRef.current = setTimeout(() => dropBlocks(), 300);
  }, [gameState.grid, gameState.mergeAllTargetValue, gameState.powerUps, gameState.difficulty, triggerHaptic, dropBlocks]);

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

  const handleSaveForLater = useCallback(() => {
    setShowRewardModal(false);
    setPendingRewards(0);
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const prepareForQuit = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const restartGame = useCallback(() => {
    const settings = loadSettings();
    
    setGameState({
      ...createInitialState(),
      settings
    });
    
    setShowRewardModal(false);
    setPendingRewards(0);
  }, []);

  const updateSettings = useCallback((newSettings: GameSettings) => {
    setGameState(prev => ({ ...prev, settings: newSettings }));
    saveSettings(newSettings);
  }, [saveSettings]);

  const resetAllProgress = useCallback(() => {
    clearGameState();
    setGameState(createInitialState());
    setShowRewardModal(false);
    setPendingRewards(0);
  }, [clearGameState]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("numberMatch_gameState");
      if (stored) {
        const savedState = JSON.parse(stored);
        if (savedState.grid) {
          savedState.grid = savedState.grid.map((row: (Block | null)[]) =>
            row.map((block: Block | null) =>
              block ? { ...block, isNew: false, isMerging: false, isSelected: false } : null
            )
          );
        }
        if (!savedState.difficulty) {
          savedState.difficulty = "normal";
        }
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
    showRewardModal,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    activatePowerUp,
    cancelPowerUp,
    selectMergeAllTarget,
    executeMergeAll,
    handleSelectReward,
    handleSaveForLater,
    togglePause,
    prepareForQuit,
    restartGame,
    updateSettings,
    resetAllProgress
  };
}
