import { Trophy, Sparkles } from "lucide-react";
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
    <div className="flex flex-col items-center gap-2 w-full" data-testid="score-display">
      {/* Highest number indicator with enhanced styling */}
      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
        <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-glow" />
        <span className="font-game text-sm font-semibold text-white/90" data-testid="highest-number">
          {formatNumber(highestNumber)}
        </span>
      </div>

      {/* Level display with gradient */}
      <div className="relative flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-game-accent animate-pulse" />
        <span
          className={`font-game-display text-4xl font-black text-transparent bg-clip-text ${isKidsMode ? "animate-bounce-subtle" : ""}`}
          style={{
            backgroundImage: "linear-gradient(135deg, #ffffff 0%, #16a34a 100%)",
            textShadow: "0 2px 10px rgba(22, 163, 74, 0.3)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}
          data-testid="level-display"
        >
          Level {progressLevel + 1}
        </span>
        <Sparkles className="w-5 h-5 text-game-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>
    </div>
  );
}
