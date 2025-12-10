import { useLocation } from "wouter";
import { Play, ArrowLeft } from "lucide-react";
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
      <Button
        onClick={handleBack}
        variant="ghost"
        size="icon"
        className="absolute top-6 left-6 text-white/60 hover:text-white hover:bg-white/10"
        data-testid="button-back"
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>

      <h1 className="font-game-display text-3xl font-bold text-white text-center mb-10">
        Choose Mode
      </h1>

      <div className="w-full max-w-xs space-y-6">
        <Button
          onClick={() => handleDifficultySelect("kids")}
          className="w-full h-24 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2"
          data-testid="button-difficulty-kids"
        >
          <div className="flex items-center gap-3">
            <Play className="w-10 h-10" />
            <span className="font-game-display font-bold text-3xl">
              {DIFFICULTY_CONFIGS.kids.label}
            </span>
          </div>
          <span className="font-game text-sm opacity-80">
            {DIFFICULTY_CONFIGS.kids.gridCols}x{DIFFICULTY_CONFIGS.kids.gridRows} grid
          </span>
        </Button>

        <div className="flex justify-center gap-8 pt-4">
          <button
            onClick={() => handleDifficultySelect("normal")}
            className="font-game text-white/50 hover:text-white text-sm underline underline-offset-2 transition-colors"
            data-testid="button-difficulty-normal"
          >
            {DIFFICULTY_CONFIGS.normal.label} ({DIFFICULTY_CONFIGS.normal.gridCols}x{DIFFICULTY_CONFIGS.normal.gridRows})
          </button>
          <button
            onClick={() => handleDifficultySelect("hard")}
            className="font-game text-white/50 hover:text-white text-sm underline underline-offset-2 transition-colors"
            data-testid="button-difficulty-hard"
          >
            {DIFFICULTY_CONFIGS.hard.label} ({DIFFICULTY_CONFIGS.hard.gridCols}x{DIFFICULTY_CONFIGS.hard.gridRows})
          </button>
        </div>
      </div>

      <p className="text-white/40 text-sm font-game mt-12 text-center max-w-xs">
        Kids mode has a smaller grid and earns power-ups faster
      </p>
    </div>
  );
}
