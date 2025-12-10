import { Turtle, Rabbit, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type DifficultyLevel, DIFFICULTY_CONFIGS } from "@shared/schema";

interface DifficultyModalProps {
  isOpen: boolean;
  onSelect: (difficulty: DifficultyLevel) => void;
  onClose: () => void;
}

const DIFFICULTY_ICONS = {
  kids: Turtle,
  normal: Rabbit,
  hard: Zap,
};

const DIFFICULTY_COLORS = {
  kids: "bg-green-500 hover:bg-green-600",
  normal: "bg-yellow-500 hover:bg-yellow-600",
  hard: "bg-red-500 hover:bg-red-600",
};

export function DifficultyModal({ isOpen, onSelect, onClose }: DifficultyModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      data-testid="difficulty-modal"
    >
      <div 
        className="bg-game-grid rounded-3xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-game-display text-2xl font-bold text-white text-center mb-6">
          Choose Difficulty
        </h2>

        <div className="space-y-4">
          {(["kids", "normal", "hard"] as DifficultyLevel[]).map((level) => {
            const config = DIFFICULTY_CONFIGS[level];
            const Icon = DIFFICULTY_ICONS[level];
            const colorClass = DIFFICULTY_COLORS[level];
            const isKids = level === "kids";

            return (
              <Button
                key={level}
                onClick={() => onSelect(level)}
                className={`w-full ${isKids ? "h-20" : "h-14"} ${colorClass} text-white rounded-2xl flex flex-col items-center justify-center gap-1`}
                data-testid={`button-difficulty-${level}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={isKids ? "w-8 h-8" : "w-5 h-5"} />
                  <span className={`font-game-display font-bold ${isKids ? "text-2xl" : "text-lg"}`}>
                    {config.label}
                  </span>
                </div>
                <span className={`font-game opacity-80 ${isKids ? "text-sm" : "text-xs"}`}>
                  {config.gridCols}x{config.gridRows} grid
                </span>
              </Button>
            );
          })}
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-4 text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          data-testid="button-difficulty-cancel"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
