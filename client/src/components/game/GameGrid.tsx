import { useRef, useCallback } from "react";
import { NumberBlock } from "./NumberBlock";
import { GRID_COLS, GRID_ROWS, type Block } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GameGridProps {
  grid: (Block | null)[][];
  selectedBlocks: Block[];
  onTouchStart: (block: Block) => void;
  onTouchMove: (block: Block) => void;
  onTouchEnd: () => void;
}

export function GameGrid({
  grid,
  selectedBlocks,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: GameGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const blockSize = Math.min(
    (window.innerWidth - 48) / GRID_COLS,
    60
  );

  // Get block at touch position
  const getBlockAtPosition = useCallback((clientX: number, clientY: number): Block | null => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const gap = 8;
    const totalBlockWidth = blockSize + gap;
    
    const col = Math.floor(x / totalBlockWidth);
    const row = Math.floor(y / totalBlockWidth);
    
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      return grid[row]?.[col] || null;
    }
    return null;
  }, [grid, blockSize]);

  // Handle touch move to detect entering new blocks
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const block = getBlockAtPosition(touch.clientX, touch.clientY);
    if (block) {
      onTouchMove(block);
    }
  }, [getBlockAtPosition, onTouchMove]);

  // Check if a block is in the current selection path
  const isBlockInPath = (block: Block): boolean => {
    return selectedBlocks.some(b => b.id === block.id);
  };

  return (
    <div 
      ref={gridRef}
      className="relative bg-game-grid rounded-2xl p-3 touch-none"
      style={{
        boxShadow: "inset 0 4px 20px rgba(0,0,0,0.3)"
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      data-testid="game-grid"
    >
      {/* Grid cells */}
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, ${blockSize}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${blockSize}px)`
        }}
      >
        {Array.from({ length: GRID_ROWS }).map((_, rowIndex) =>
          Array.from({ length: GRID_COLS }).map((_, colIndex) => {
            const block = grid[rowIndex]?.[colIndex];
            
            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "rounded-xl transition-all duration-150",
                  !block && "bg-game-grid-border/50 border-2 border-dashed border-game-grid-border"
                )}
                style={{
                  width: blockSize,
                  height: blockSize,
                }}
              >
                {block && (
                  <NumberBlock
                    block={block}
                    size={blockSize}
                    isInPath={isBlockInPath(block)}
                    onTouchStart={onTouchStart}
                    onTouchEnter={onTouchMove}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Connection lines between selected blocks */}
      {selectedBlocks.length > 1 && (
        <svg
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <ConnectionPath 
            blocks={selectedBlocks} 
            blockSize={blockSize} 
            gap={8}
            padding={12}
          />
        </svg>
      )}
    </div>
  );
}

// Draw connection lines between selected blocks
function ConnectionPath({ 
  blocks, 
  blockSize, 
  gap,
  padding 
}: { 
  blocks: Block[]; 
  blockSize: number; 
  gap: number;
  padding: number;
}) {
  if (blocks.length < 2) return null;

  const getCenter = (block: Block) => ({
    x: padding + block.col * (blockSize + gap) + blockSize / 2,
    y: padding + block.row * (blockSize + gap) + blockSize / 2
  });

  const pathData = blocks.map((block, index) => {
    const { x, y } = getCenter(block);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(" ");

  return (
    <>
      {/* Glow effect */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main line */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="none"
      />
    </>
  );
}
