import { FaTrophy } from "react-icons/fa";
import { FaStarOfLife } from "react-icons/fa6";
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
    <div className="flex flex-col items-center gap-3 w-full" data-testid="score-display">
      {/* Highest number indicator with enhanced styling */}
      <div
        className="flex items-center gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300"
        style={{
          boxShadow: "0 4px 16px rgba(251, 191, 36, 0.2)"
        }}
      >
        <FaTrophy className="w-5 h-5 text-amber-400 drop-shadow-lg animate-pulse" />
        <span className="font-game text-base font-bold text-white drop-shadow-md" data-testid="highest-number">
          {formatNumber(highestNumber)}
        </span>
      </div>

      {/* Level display with dramatic gradient and glow */}
      <div className="relative flex items-center gap-3">
        <FaStarOfLife className="w-5 h-5 text-game-accent animate-pulse drop-shadow-lg" />
        <span
          className={`font-game-display text-5xl font-black text-transparent bg-clip-text ${isKidsMode ? "animate-bounce-subtle" : ""} hover:scale-105 transition-transform duration-300`}
          style={{
            backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #fb7185 50%, #fbbf24 100%)",
            filter: "drop-shadow(0 4px 16px rgba(124, 58, 237, 0.6)) drop-shadow(0 0 40px rgba(251, 113, 133, 0.4))"
          }}
          data-testid="level-display"
        >
          Level {progressLevel + 1}
        </span>
        <FaStarOfLife className="w-5 h-5 text-game-accent animate-pulse drop-shadow-lg" style={{ animationDelay: "0.5s" }} />
      </div>
    </div>
  );
}
