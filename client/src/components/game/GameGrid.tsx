import { useRef, useCallback, useEffect } from "react";
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

interface CellBounds {
  row: number;
  col: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function GameGrid({
  grid,
  selectedBlocks,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: GameGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellBoundsRef = useRef<CellBounds[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastBlockRef = useRef<string | null>(null);
  const isGestureActiveRef = useRef(false);
  
  const blockSize = Math.min(
    (window.innerWidth - 48) / GRID_COLS,
    60
  );
  const gap = 8;
  const padding = 12;

  // Recalculate cell bounds - called at gesture start to handle layout changes
  const recalculateBounds = useCallback(() => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const bounds: CellBounds[] = [];
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const left = rect.left + padding + col * (blockSize + gap);
        const top = rect.top + padding + row * (blockSize + gap);
        bounds.push({
          row,
          col,
          left,
          top,
          right: left + blockSize,
          bottom: top + blockSize
        });
      }
    }
    
    cellBoundsRef.current = bounds;
  }, [blockSize, gap, padding]);

  // Get block at touch position using cached bounds
  const getBlockAtPosition = useCallback((clientX: number, clientY: number): Block | null => {
    const bounds = cellBoundsRef.current;
    
    for (const cell of bounds) {
      if (clientX >= cell.left && clientX <= cell.right &&
          clientY >= cell.top && clientY <= cell.bottom) {
        return grid[cell.row]?.[cell.col] || null;
      }
    }
    return null;
  }, [grid]);

  // Handle pointer move with RAF throttling
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const block = getBlockAtPosition(clientX, clientY);
      if (block && block.id !== lastBlockRef.current) {
        lastBlockRef.current = block.id;
        onTouchMove(block);
      }
    });
  }, [getBlockAtPosition, onTouchMove]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  }, [handlePointerMove]);

  // Handle touch start on grid - recalculate bounds for fresh gesture
  const handleGridTouchStart = useCallback(() => {
    recalculateBounds();
    isGestureActiveRef.current = true;
  }, [recalculateBounds]);

  // Handle touch end - clear refs
  const handleTouchEnd = useCallback(() => {
    lastBlockRef.current = null;
    isGestureActiveRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    onTouchEnd();
  }, [onTouchEnd]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
      onTouchStart={handleGridTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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
            const inPath = block ? isBlockInPath(block) : false;
            
            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "rounded-xl transition-all duration-100",
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
                    isInPath={inPath}
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
            gap={gap}
            padding={padding}
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
      {/* Subtle outer shadow */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main line - subtle white */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}
