import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, getBlockColor, type Block } from "@shared/schema";

interface NumberBlockProps {
  block: Block;
  size?: number;
  isInPath?: boolean;
  isHighest?: boolean;
  onTouchStart?: (block: Block) => void;
  onTouchEnter?: (block: Block) => void;
}

export function NumberBlock({ 
  block, 
  size = 60,
  isInPath = false,
  isHighest = false,
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

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-xl font-game-display font-bold text-white select-none transition-all duration-75",
        getFontSize(),
        block.isNew && "animate-block-drop",
        block.isMerging && "animate-block-merge"
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
