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
      {/* Highest number indicator with refined styling */}
      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="font-game text-sm font-semibold text-white/90" data-testid="highest-number">
          {formatNumber(highestNumber)}
        </span>
      </div>

      {/* Level display with refined gradient - 90° linear */}
      <div className="relative flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-game-accent animate-pulse" />
        <span
          className={`font-game-display text-4xl font-black text-transparent bg-clip-text ${isKidsMode ? "animate-bounce-subtle" : ""}`}
          style={{
            backgroundImage: "linear-gradient(90deg, #a78bfa 0%, #fb7185 100%)",
            filter: "drop-shadow(0 2px 8px rgba(124, 58, 237, 0.3))"
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
