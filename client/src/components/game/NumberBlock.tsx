import { useRef, useEffect } from "react";
import { Crown } from "lucide-react";
import gsap from "gsap";
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
  const blockRef = useRef<HTMLDivElement>(null);
  const label = formatNumber(block.value);
  const color = getBlockColor(block.value);

  useEffect(() => {
    if (block.isNew && blockRef.current) {
      const el = blockRef.current;
      gsap.set(el, { scale: 0, opacity: 0 });
      
      gsap.timeline()
        .to(el, {
          scale: 1.15,
          opacity: 1,
          duration: 0.15,
          ease: "back.out(2)"
        })
        .to(el, {
          scale: 1,
          duration: 0.25,
          ease: "elastic.out(1, 0.4)"
        });
    }
  }, [block.isNew, block.id]);

  useEffect(() => {
    if (block.isMerging && blockRef.current) {
      gsap.to(blockRef.current, {
        scale: 0.7,
        opacity: 0.5,
        duration: 0.1,
        ease: "power2.in"
      });
    }
  }, [block.isMerging]);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    
    gsap.killTweensOf(el, "rotation");
    
    if (isInPath && chainLength >= 3) {
      const intensity = Math.min(chainLength - 2, 4);
      const angle = 2 * intensity;
      
      gsap.to(el, {
        rotation: angle,
        duration: 0.08,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut"
      });
    } else {
      gsap.set(el, { rotation: 0 });
    }
    
    return () => {
      if (el) {
        gsap.killTweensOf(el, "rotation");
        gsap.set(el, { rotation: 0 });
      }
    };
  }, [isInPath, chainLength]);
  
  // Determine font size based on label length
  const getFontSize = () => {
    if (label.length <= 2) return "text-2xl";
    if (label.length <= 3) return "text-xl";
    if (label.length <= 4) return "text-lg";
    return "text-base";
  };
  
  // Get enhanced glow color based on value tier
  const getGlowEffect = () => {
    if (block.value >= 8192) return `0 0 20px rgba(20, 184, 166, 0.6), 0 0 40px rgba(20, 184, 166, 0.3)`;
    if (block.value >= 512) return `0 0 16px rgba(251, 113, 133, 0.5), 0 0 32px rgba(251, 113, 133, 0.25)`;
    if (block.value >= 32) return `0 0 12px rgba(124, 58, 237, 0.4), 0 0 24px rgba(124, 58, 237, 0.2)`;
    return '';
  };

  return (
    <div
      ref={blockRef}
      className={cn(
        "relative flex items-center justify-center rounded-xl font-game-display font-bold text-white select-none transition-all duration-200",
        getFontSize()
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: isInPath
          ? `0 2px 0 0 ${adjustColor(color, -40)}, 0 3px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)`
          : `0 4px 0 0 ${adjustColor(color, -30)}, 0 6px 16px rgba(0,0,0,0.4), ${getGlowEffect()}`,
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
      <span className="relative z-10 drop-shadow-lg font-black tracking-tight">{label}</span>

      {/* Enhanced shimmer effect for higher numbers */}
      {block.value >= 512 && (
        <div
          className="absolute inset-0 rounded-xl opacity-40"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(255,255,255,0.2) 100%)"
          }}
        />
      )}

      {/* Premium glow overlay for very high numbers */}
      {block.value >= 8192 && (
        <div
          className="absolute inset-0 rounded-xl opacity-30 animate-pulse"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)"
          }}
        />
      )}
      
      {/* Crown icon for highest value block on board - enhanced */}
      {isHighest && (
        <div
          className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full p-1 shadow-lg animate-bounce-subtle"
          style={{
            boxShadow: "0 0 16px rgba(251, 191, 36, 0.8), 0 0 32px rgba(251, 191, 36, 0.4)"
          }}
        >
          <Crown className="w-4 h-4 text-amber-900 drop-shadow-md" />
        </div>
      )}

      {/* Dark overlay when selected (pressed effect) with glow */}
      {isInPath && (
        <>
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/30" />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.2)"
            }}
          />
        </>
      )}

      {/* Swap first block highlight - enhanced */}
      {isSwapFirst && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none ring-4 ring-purple-400 animate-pulse"
          style={{
            boxShadow: "0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)"
          }}
        />
      )}

      {/* Merge all target highlight - enhanced */}
      {isMergeTarget && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none ring-4 ring-cyan-400 animate-pulse"
          style={{
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)"
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
