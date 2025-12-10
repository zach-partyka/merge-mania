import { Trophy } from "lucide-react";
import { formatNumber, type DifficultyLevel } from "@shared/schema";

interface ScoreDisplayProps {
  highestNumber: number;
  progressLevel: number;
  difficulty: DifficultyLevel;
}

export function ScoreDisplay({ 
  highestNumber,
  progressLevel,
  difficulty
}: ScoreDisplayProps) {
  const isKidsMode = difficulty === "kids";
  
  return (
    <div className="flex flex-col items-center gap-1 w-full" data-testid="score-display">
      {/* Highest number indicator */}
      <div className="flex items-center gap-2 text-white/60">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="font-game text-sm" data-testid="highest-number">
          {formatNumber(highestNumber)}
        </span>
      </div>
      
      {/* Level display */}
      <div className="relative">
        <span 
          className={`font-game-display text-4xl font-bold text-white ${isKidsMode ? "animate-bounce-subtle" : ""}`}
          data-testid="level-display"
        >
          Level {progressLevel + 1}
        </span>
      </div>
    </div>
  );
}
