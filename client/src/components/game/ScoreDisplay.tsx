import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@shared/schema";

interface ScoreDisplayProps {
  score: number;
  personalBest: number;
  comboMultiplier: number;
  showCombo: boolean;
}

export function ScoreDisplay({ 
  score, 
  personalBest, 
  comboMultiplier, 
  showCombo 
}: ScoreDisplayProps) {
  const isNewBest = score > 0 && score >= personalBest;
  
  return (
    <div className="flex flex-col items-center gap-2 w-full" data-testid="score-display">
      {/* Personal best indicator */}
      <div className="flex items-center gap-2 text-white/60">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="font-game text-sm" data-testid="personal-best">
          {formatNumber(personalBest)}
        </span>
      </div>
      
      {/* Current score */}
      <div className="relative">
        <span 
          className={cn(
            "font-game-display text-4xl font-bold text-white",
            isNewBest && score > 0 && "text-yellow-300"
          )}
          data-testid="current-score"
        >
          {formatNumber(score)}
        </span>
        
        {/* Combo multiplier badge */}
        {showCombo && comboMultiplier > 1 && (
          <div 
            className="absolute -right-12 top-1/2 -translate-y-1/2 animate-combo-pop"
            data-testid="combo-badge"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-game-display font-bold px-2 py-1 rounded-lg text-lg shadow-lg">
              {comboMultiplier}x
            </div>
          </div>
        )}
      </div>
      
      {/* New best indicator */}
      {isNewBest && score > 0 && (
        <div className="text-yellow-400 font-game text-xs animate-pulse">
          New Best!
        </div>
      )}
    </div>
  );
}
