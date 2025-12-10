import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopBlocker } from "@/components/game/DesktopBlocker";
import { useIsMobile } from "@/hooks/useIsMobile";
import { type DifficultyLevel, DIFFICULTY_CONFIGS } from "@shared/schema";

const STORAGE_KEY = "numberMatch_gameState";

export default function NewGame() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem("numberMatch_difficulty", difficulty);
    setLocation("/game");
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (!isMobile) {
    return <DesktopBlocker />;
  }

  return (
    <div 
      className="min-h-screen bg-game-bg flex flex-col items-center justify-center px-6 select-none"
      style={{ 
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
      data-testid="new-game-screen"
    >
      <h1 className="font-game-display text-3xl font-bold text-white text-center mb-8">
        Choose Mode
      </h1>

      <div className="w-full max-w-xs space-y-4">
        <Button
          onClick={() => handleDifficultySelect("kids")}
          className="w-full h-20 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
          data-testid="button-difficulty-kids"
        >
          <div className="flex items-center gap-3">
            <Play className="w-8 h-8" fill="currentColor" />
            <span className="font-game-display font-bold text-2xl">
              {DIFFICULTY_CONFIGS.kids.label}
            </span>
          </div>
          <span className="font-game text-sm opacity-90">
            {DIFFICULTY_CONFIGS.kids.gridCols}x{DIFFICULTY_CONFIGS.kids.gridRows} grid
          </span>
        </Button>

        <Button
          onClick={() => handleDifficultySelect("normal")}
          className="w-full h-14 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl flex items-center justify-center gap-2"
          data-testid="button-difficulty-normal"
        >
          <span className="font-game-display font-bold text-lg">
            {DIFFICULTY_CONFIGS.normal.label}
          </span>
          <span className="font-game text-sm text-gray-700">
            {DIFFICULTY_CONFIGS.normal.gridCols}x{DIFFICULTY_CONFIGS.normal.gridRows}
          </span>
        </Button>

        <Button
          onClick={() => handleDifficultySelect("hard")}
          className="w-full h-14 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl flex items-center justify-center gap-2"
          data-testid="button-difficulty-hard"
        >
          <span className="font-game-display font-bold text-lg">
            {DIFFICULTY_CONFIGS.hard.label}
          </span>
          <span className="font-game text-sm text-gray-700">
            {DIFFICULTY_CONFIGS.hard.gridCols}x{DIFFICULTY_CONFIGS.hard.gridRows}
          </span>
        </Button>
      </div>

      <p className="text-white/60 text-sm font-game mt-8 text-center max-w-xs">
        Kids mode has a smaller grid and earns power-ups faster
      </p>

      <button
        onClick={handleBack}
        className="mt-8 font-game text-white/70 hover:text-white text-base underline underline-offset-4 transition-colors"
        data-testid="button-back"
      >
        Back
      </button>
    </div>
  );
}
