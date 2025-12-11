import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, getBlockColor, type Block } from "@shared/schema";

interface NumberBlockProps {
  block: Block;
  size?: number;
  isInPath?: boolean;
  chainLength?: number;
  isHighest?: boolean;
  isSwapFirst?: boolean;
  isMergeTarget?: boolean;
  onTouchStart?: (block: Block) => void;
  onTouchEnter?: (block: Block) => void;
}

function SparkleParticles({ size }: { size: number }) {
  const particles = [
    { x: -0.3, y: -0.4, delay: 0, scale: 0.6 },
    { x: 0.4, y: -0.3, delay: 0.05, scale: 0.5 },
    { x: 0.3, y: 0.4, delay: 0.1, scale: 0.7 },
    { x: -0.4, y: 0.3, delay: 0.08, scale: 0.5 },
    { x: 0, y: -0.5, delay: 0.03, scale: 0.6 },
    { x: 0.5, y: 0, delay: 0.12, scale: 0.4 },
  ];

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: `calc(50% + ${p.x * size}px)`,
            top: `calc(50% + ${p.y * size}px)`,
            animationDelay: `${p.delay}s`,
            transform: `scale(${p.scale})`,
          }}
        >
          <Sparkles className="w-3 h-3 text-yellow-300 drop-shadow-lg" />
        </div>
      ))}
    </>
  );
}

export function NumberBlock({ 
  block, 
  size = 60,
  isInPath = false,
  chainLength = 0,
  isHighest = false,
  isSwapFirst = false,
  isMergeTarget = false,
  onTouchStart,
  onTouchEnter 
}: NumberBlockProps) {
  const label = formatNumber(block.value);
  const color = getBlockColor(block.value);
  
  // Determine font size based on label length
  const getFontSize = () => {
    if (label.length <= 2) return "text-2xl";
    if (label.length <= 3) return "text-xl";
    if (label.length <= 4) return "text-lg";
    return "text-base";
  };
  
  // Get progressive shake class based on chain length
  const getChainShakeClass = () => {
    if (!isInPath || chainLength < 3) return "";
    if (chainLength >= 6) return "animate-chain-shake-intense";
    if (chainLength >= 4) return "animate-chain-shake-medium";
    return "animate-chain-shake-subtle";
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-xl font-game-display font-bold text-white select-none transition-all duration-75",
        getFontSize(),
        block.isNew && "animate-squash-stretch",
        block.isNew && "animate-glow-fade",
        block.isMerging && "animate-block-merge",
        getChainShakeClass()
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: isInPath 
          ? `0 2px 0 0 ${adjustColor(color, -40)}, 0 3px 6px rgba(0,0,0,0.4)`
          : `0 4px 0 0 ${adjustColor(color, -30)}, 0 6px 10px rgba(0,0,0,0.3)`,
        transform: isInPath ? "scale(0.92) translateY(2px)" : "scale(1)",
        zIndex: isInPath ? 10 : 1
      }}
      data-testid={`block-${block.row}-${block.col}`}
      data-value={block.value}
      onTouchStart={(e) => {
        e.preventDefault();
        onTouchStart?.(block);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        onTouchStart?.(block);
      }}
      onMouseEnter={(e) => {
        if (e.buttons === 1) {
          onTouchEnter?.(block);
        }
      }}
    >
      <span className="relative z-10 drop-shadow-md">{label}</span>
      
      {/* Highlight effect for higher numbers */}
      {block.value >= 1024 && (
        <div 
          className="absolute inset-0 rounded-xl opacity-30"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)"
          }}
        />
      )}
      
      {/* Crown icon for highest value block on board */}
      {isHighest && (
        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow-md">
          <Crown className="w-3 h-3 text-yellow-900" />
        </div>
      )}

      {/* Dark overlay when selected (pressed effect) */}
      {isInPath && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none bg-black/20"
        />
      )}
      
      {/* Swap first block highlight */}
      {isSwapFirst && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none ring-4 ring-purple-400 animate-pulse"
        />
      )}
      
      {/* Merge all target highlight */}
      {isMergeTarget && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none ring-4 ring-blue-400 animate-pulse"
        />
      )}

      {/* Sparkle particles on new blocks */}
      {block.isNew && <SparkleParticles size={size} />}
    </div>
  );
}

// Helper to darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
