import { cn } from "@/lib/utils";
import { formatNumber, getBlockColor, type Block } from "@shared/schema";

interface NumberBlockProps {
  block: Block;
  size?: number;
  isInPath?: boolean;
  isDimmed?: boolean;
  onTouchStart?: (block: Block) => void;
  onTouchEnter?: (block: Block) => void;
}

export function NumberBlock({ 
  block, 
  size = 60,
  isInPath = false,
  isDimmed = false,
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
        "relative flex items-center justify-center rounded-xl font-game-display font-bold text-white select-none transition-all duration-100",
        getFontSize(),
        block.isNew && "animate-block-drop",
        block.isMerging && "animate-block-merge",
        isDimmed && "opacity-40"
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: isInPath 
          ? `0 0 0 3px white, 0 0 20px 4px rgba(255,255,255,0.6), 0 4px 0 0 ${adjustColor(color, -30)}, 0 6px 10px rgba(0,0,0,0.3)`
          : `0 4px 0 0 ${adjustColor(color, -30)}, 0 6px 10px rgba(0,0,0,0.3)`,
        transform: isInPath ? "scale(1.08)" : "scale(1)",
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
      
      {/* Crown icon for 1M blocks */}
      {block.value >= 1048576 && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-300 text-sm">
          ♛
        </div>
      )}

      {/* Selection glow ring */}
      {isInPath && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 8px rgba(255,255,255,0.5)"
          }}
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
