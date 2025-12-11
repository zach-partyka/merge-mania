import { useLocation } from "wouter";
import { Play, Sparkles, Baby, Target, Zap } from "lucide-react";
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
      className="min-h-screen bg-game-bg flex flex-col items-center justify-center px-6 select-none relative overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
      data-testid="new-game-screen"
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at 50% 50%, #16a34a 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite"
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Title with gradient */}
        <div className="text-center mb-10">
          <h1
            className="font-game-display text-4xl font-black text-transparent bg-clip-text mb-3"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #16a34a 100%)",
              textShadow: "0 4px 20px rgba(22, 163, 74, 0.3)"
            }}
          >
            Choose Mode
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-game-accent animate-pulse" />
            <p className="text-white/60 text-sm font-game">Select your challenge</p>
            <Sparkles className="w-3 h-3 text-game-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Difficulty buttons */}
        <div className="w-full space-y-4">
          {/* Kids Mode */}
          <Button
            onClick={() => handleDifficultySelect("kids")}
            className="w-full h-24 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-white/20 relative overflow-hidden group"
            data-testid="button-difficulty-kids"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity">
              <div
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                  animation: "shine 2s ease-in-out infinite",
                  position: "absolute",
                  inset: 0
                }}
              />
            </div>
            <div className="relative z-10 flex items-center gap-3 mb-1">
              <Baby className="w-7 h-7" />
              <span className="font-game-display font-bold text-2xl">
                {DIFFICULTY_CONFIGS.kids.label}
              </span>
              <Play className="w-6 h-6" fill="currentColor" />
            </div>
            <span className="font-game text-sm opacity-90 relative z-10">
              {DIFFICULTY_CONFIGS.kids.gridCols}×{DIFFICULTY_CONFIGS.kids.gridRows} grid • Earn power-ups faster
            </span>
          </Button>

          {/* Normal Mode */}
          <Button
            onClick={() => handleDifficultySelect("normal")}
            className="w-full h-16 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm hover:from-white/20 hover:to-white/10 text-white rounded-2xl flex items-center justify-center gap-3 border-2 border-white/20 shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            data-testid="button-difficulty-normal"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity">
              <div
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                  animation: "shine 2s ease-in-out infinite",
                  position: "absolute",
                  inset: 0
                }}
              />
            </div>
            <Target className="w-6 h-6 relative z-10" />
            <span className="font-game-display font-bold text-xl relative z-10">
              {DIFFICULTY_CONFIGS.normal.label}
            </span>
            <span className="font-game text-sm text-white/70 relative z-10">
              {DIFFICULTY_CONFIGS.normal.gridCols}×{DIFFICULTY_CONFIGS.normal.gridRows}
            </span>
          </Button>

          {/* Hard Mode */}
          <Button
            onClick={() => handleDifficultySelect("hard")}
            className="w-full h-16 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm hover:from-white/20 hover:to-white/10 text-white rounded-2xl flex items-center justify-center gap-3 border-2 border-white/20 shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            data-testid="button-difficulty-hard"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity">
              <div
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                  animation: "shine 2s ease-in-out infinite",
                  position: "absolute",
                  inset: 0
                }}
              />
            </div>
            <Zap className="w-6 h-6 relative z-10" />
            <span className="font-game-display font-bold text-xl relative z-10">
              {DIFFICULTY_CONFIGS.hard.label}
            </span>
            <span className="font-game text-sm text-white/70 relative z-10">
              {DIFFICULTY_CONFIGS.hard.gridCols}×{DIFFICULTY_CONFIGS.hard.gridRows}
            </span>
          </Button>
        </div>

        {/* Back button */}
        <button
          onClick={handleBack}
          className="w-full mt-8 font-game text-white/70 hover:text-white text-base transition-colors py-2"
          data-testid="button-back"
        >
          ← Back
        </button>
      </div>

      <style jsx>{`
        @keyframes shine {
          0%, 100% { background-position: 200% 200%; }
          50% { background-position: -200% -200%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
