import { Gift } from "lucide-react";
import { type DifficultyLevel, getProgressThreshold } from "@shared/schema";

interface ProgressBarProps {
  progressPoints: number;
  difficulty: DifficultyLevel;
  progressLevel: number;
  onRewardReady?: () => void;
}

export function ProgressBar({ progressPoints, difficulty, progressLevel }: ProgressBarProps) {
  const threshold = getProgressThreshold(difficulty, progressLevel);
  const progress = Math.min(progressPoints / threshold, 1);
  const isRewardReady = progressPoints >= threshold;
  
  return (
    <div className="w-full px-4" data-testid="progress-bar">
      <div className="relative h-6 bg-game-grid-border rounded-full overflow-hidden">
        {/* Progress fill */}
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
        
        {/* Threshold marker */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/80 text-xs font-game">
          <span>{threshold}</span>
          <Gift className={`w-4 h-4 ${isRewardReady ? "text-yellow-400 animate-pulse" : "text-white/60"}`} />
        </div>
        
        {/* Glow effect when ready */}
        {isRewardReady && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse" />
        )}
      </div>
    </div>
  );
}
