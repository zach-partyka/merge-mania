import {
  type Block,
  type DifficultyLevel,
  type PowerUps,
  GRID_COLS,
  GRID_ROWS,
  DIFFICULTY_CONFIGS,
  generateBlockId,
  getAvailableSpawnNumbers,
  areBlocksAdjacent
} from "./schema";

export function createRandomBlock(row: number, col: number, eliminatedNumbers: number[]): Block {
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

export function createInitialGrid(
  eliminatedNumbers: number[] = [],
  gridRows: number = GRID_ROWS,
  gridCols: number = GRID_COLS
): (Block | null)[][] {
  const grid: (Block | null)[][] = [];
  
  for (let row = 0; row < gridRows; row++) {
    grid[row] = [];
    for (let col = 0; col < gridCols; col++) {
      grid[row][col] = createRandomBlock(row, col, eliminatedNumbers);
    }
  }
  
  return grid;
}

export function checkForValidMoves(grid: (Block | null)[][]): boolean {
  const gridRows = grid.length;
  const gridCols = grid[0]?.length || 0;
  
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const block = grid[row][col];
      if (!block) continue;
      
      const neighbors = [
        grid[row - 1]?.[col],
        grid[row + 1]?.[col],
        grid[row]?.[col - 1],
        grid[row]?.[col + 1],
        grid[row - 1]?.[col - 1],
        grid[row - 1]?.[col + 1],
        grid[row + 1]?.[col - 1],
        grid[row + 1]?.[col + 1]
      ];
      
      if (neighbors.some(n => n && n.value === block.value)) {
        return true;
      }
    }
  }
  return false;
}

export function isValidChainConnection(
  selectedBlocks: Block[],
  newBlock: Block
): boolean {
  if (selectedBlocks.length === 0) return false;
  
  const lastBlock = selectedBlocks[selectedBlocks.length - 1];
  if (!areBlocksAdjacent(lastBlock, newBlock)) return false;
  
  const baseValue = selectedBlocks[0].value;
  const baseCount = selectedBlocks.filter(b => b.value === baseValue).length;
  const lastValue = lastBlock.value;
  const currentMaxValue = Math.max(...selectedBlocks.map(b => b.value));
  
  if (newBlock.value === lastValue) {
    return true;
  }
  
  if (baseCount >= 2 && newBlock.value === lastValue * 2 && newBlock.value > currentMaxValue) {
    return true;
  }
  
  return false;
}

export interface MergeResult {
  newValue: number;
  progressEarned: number;
}

export function calculateMergeResult(
  selectedBlocks: Block[],
  difficulty: DifficultyLevel
): MergeResult {
  const baseValue = selectedBlocks[0].value;
  const baseCount = selectedBlocks.filter(b => b.value === baseValue).length;
  
  const chainValues = Array.from(new Set(selectedBlocks.map(b => b.value))).sort((a, b) => a - b);
  const chainLength = chainValues.length;
  
  let newValue: number;
  
  if (chainLength === 1) {
    newValue = baseValue;
    for (let i = 1; i < selectedBlocks.length; i++) {
      newValue *= 2;
    }
  } else {
    let chainResult = baseValue;
    for (let i = 1; i < baseCount; i++) {
      chainResult *= 2;
    }
    
    for (let i = 1; i < chainLength; i++) {
      const tierValue = chainValues[i];
      const tierCount = selectedBlocks.filter(b => b.value === tierValue).length;
      for (let j = 0; j < tierCount; j++) {
        chainResult *= 2;
      }
    }
    newValue = chainResult;
  }
  
  const sumOfOriginalValues = selectedBlocks.reduce((sum, b) => sum + b.value, 0);
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
  const progressEarned = Math.round(sumOfOriginalValues * difficultyConfig.powerUpMultiplier);
  
  return { newValue, progressEarned };
}

export function findBlocksOfValue(grid: (Block | null)[][], targetValue: number): Block[] {
  const blocks: Block[] = [];
  const gridRows = grid.length;
  const gridCols = grid[0]?.length || 0;
  
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const block = grid[row][col];
      if (block && block.value === targetValue) {
        blocks.push(block);
      }
    }
  }
  
  return blocks;
}

export function getAvailableNumbersForMergeAll(grid: (Block | null)[][]): { value: number; count: number }[] {
  const valueCounts = new Map<number, number>();
  const gridRows = grid.length;
  const gridCols = grid[0]?.length || 0;
  
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const block = grid[row][col];
      if (block) {
        valueCounts.set(block.value, (valueCounts.get(block.value) || 0) + 1);
      }
    }
  }
  
  return Array.from(valueCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);
}

export interface ExecuteRemoveResult {
  newGrid: (Block | null)[][];
  newPowerUps: PowerUps;
}

export function executeRemovePowerUp(
  grid: (Block | null)[][],
  block: Block,
  powerUps: PowerUps
): ExecuteRemoveResult {
  const newGrid = grid.map(row => [...row]);
  newGrid[block.row][block.col] = null;
  
  return {
    newGrid,
    newPowerUps: {
      ...powerUps,
      remove: powerUps.remove - 1
    }
  };
}

export interface ExecuteSwapResult {
  newGrid: (Block | null)[][];
  newPowerUps: PowerUps;
}

export function executeSwapPowerUp(
  grid: (Block | null)[][],
  firstBlock: Block,
  secondBlock: Block,
  powerUps: PowerUps
): ExecuteSwapResult {
  const newGrid = grid.map(row => [...row]);
  
  newGrid[secondBlock.row][secondBlock.col] = {
    ...firstBlock,
    row: secondBlock.row,
    col: secondBlock.col,
    id: generateBlockId()
  };
  newGrid[firstBlock.row][firstBlock.col] = {
    ...secondBlock,
    row: firstBlock.row,
    col: firstBlock.col,
    id: generateBlockId()
  };
  
  return {
    newGrid,
    newPowerUps: {
      ...powerUps,
      swap: powerUps.swap - 1
    }
  };
}

export interface ExecuteMergeAllResult {
  newGrid: (Block | null)[][];
  newPowerUps: PowerUps;
  newValue: number;
  progressEarned: number;
}

export function executeMergeAllPowerUp(
  grid: (Block | null)[][],
  targetValue: number,
  powerUps: PowerUps,
  difficulty: DifficultyLevel
): ExecuteMergeAllResult | null {
  const blocksToMerge = findBlocksOfValue(grid, targetValue);
  
  if (blocksToMerge.length < 2) return null;
  
  const newGrid = grid.map(row => [...row]);
  
  let newValue = targetValue;
  for (let i = 1; i < blocksToMerge.length; i++) {
    newValue *= 2;
  }
  
  blocksToMerge.slice(0, -1).forEach(block => {
    newGrid[block.row][block.col] = null;
  });
  
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
  
  const sumOfOriginalValues = blocksToMerge.reduce((sum, b) => sum + b.value, 0);
  const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
  const progressEarned = Math.round(sumOfOriginalValues * config.powerUpMultiplier);
  
  return {
    newGrid,
    newPowerUps: {
      ...powerUps,
      mergeAll: powerUps.mergeAll - 1
    },
    newValue,
    progressEarned
  };
}

export function dropBlocksInGrid(
  grid: (Block | null)[][],
  eliminatedNumbers: number[]
): (Block | null)[][] {
  const newGrid = grid.map(row => [...row]);
  const gridRows = newGrid.length;
  const gridCols = newGrid[0]?.length || 0;
  
  for (let col = 0; col < gridCols; col++) {
    let writeRow = gridRows - 1;
    
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
    
    while (writeRow >= 0) {
      newGrid[writeRow][col] = createRandomBlock(writeRow, col, eliminatedNumbers);
      writeRow--;
    }
  }
  
  return newGrid;
}

export function shouldAwardPowerUp(
  progressPoints: number,
  threshold: number
): boolean {
  return progressPoints >= threshold;
}
