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
      {/* Dramatic animated background with multiple gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 30% 40%, #7c3aed 0%, transparent 50%)",
            animation: "float 8s ease-in-out infinite"
          }}
        />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: "radial-gradient(circle at 70% 60%, #fb7185 0%, transparent 50%)",
            animation: "float 10s ease-in-out infinite reverse"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Title with dramatic gradient */}
        <div className="text-center mb-12">
          <h1
            className="font-game-display text-5xl font-black text-transparent bg-clip-text mb-4 animate-bounce-in"
            style={{
              backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #fb7185 50%, #fbbf24 100%)",
              filter: "drop-shadow(0 4px 16px rgba(124, 58, 237, 0.6)) drop-shadow(0 0 40px rgba(251, 113, 133, 0.3))"
            }}
          >
            Choose Mode
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-game-accent animate-pulse drop-shadow-lg" />
            <p className="text-white/80 text-base font-game font-semibold tracking-wide">Select your challenge</p>
            <Sparkles className="w-5 h-5 text-game-accent animate-pulse drop-shadow-lg" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Difficulty buttons */}
        <div className="w-full space-y-4">
          {/* Kids Mode */}
          <Button
            onClick={() => handleDifficultySelect("kids")}
            className="w-full h-28 text-white rounded-3xl flex flex-col items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/30 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #0891b2 100%)",
              boxShadow: "0 8px 32px rgba(20, 184, 166, 0.5), 0 0 60px rgba(20, 184, 166, 0.3)"
            }}
            data-testid="button-difficulty-kids"
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative z-10 flex items-center gap-3 mb-1">
              <Baby className="w-8 h-8 drop-shadow-lg" />
              <span className="font-game-display font-black text-3xl drop-shadow-lg">
                {DIFFICULTY_CONFIGS.kids.label}
              </span>
              <Play className="w-7 h-7 drop-shadow-lg" fill="currentColor" />
            </div>
            <span className="font-game text-sm font-semibold opacity-95 relative z-10 backdrop-blur-sm bg-white/20 px-4 py-1 rounded-full">
              {DIFFICULTY_CONFIGS.kids.gridCols}×{DIFFICULTY_CONFIGS.kids.gridRows} grid • Earn power-ups faster
            </span>
          </Button>

          {/* Normal Mode */}
          <Button
            onClick={() => handleDifficultySelect("normal")}
            className="w-full h-20 text-white rounded-3xl flex items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/30 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #fb7185 100%)",
              boxShadow: "0 8px 32px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)"
            }}
            data-testid="button-difficulty-normal"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Target className="w-8 h-8 drop-shadow-lg relative z-10" />
            <span className="font-game-display font-black text-2xl drop-shadow-lg relative z-10">
              {DIFFICULTY_CONFIGS.normal.label}
            </span>
            <span className="font-game text-base text-white/90 font-semibold backdrop-blur-sm bg-white/20 px-3 py-1 rounded-full relative z-10">
              {DIFFICULTY_CONFIGS.normal.gridCols}×{DIFFICULTY_CONFIGS.normal.gridRows}
            </span>
          </Button>

          {/* Hard Mode */}
          <Button
            onClick={() => handleDifficultySelect("hard")}
            className="w-full h-20 text-white rounded-3xl flex items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/30 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #fb7185 0%, #f472b6 50%, #fbbf24 100%)",
              boxShadow: "0 8px 32px rgba(251, 113, 133, 0.5), 0 0 60px rgba(251, 113, 133, 0.3)"
            }}
            data-testid="button-difficulty-hard"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Zap className="w-8 h-8 drop-shadow-lg relative z-10" fill="currentColor" />
            <span className="font-game-display font-black text-2xl drop-shadow-lg relative z-10">
              {DIFFICULTY_CONFIGS.hard.label}
            </span>
            <span className="font-game text-base text-white/90 font-semibold backdrop-blur-sm bg-white/20 px-3 py-1 rounded-full relative z-10">
              {DIFFICULTY_CONFIGS.hard.gridCols}×{DIFFICULTY_CONFIGS.hard.gridRows}
            </span>
          </Button>
        </div>

        {/* Back button */}
        <button
          onClick={handleBack}
          className="w-full mt-10 font-game text-white/80 hover:text-white text-lg font-semibold transition-all duration-300 py-3 hover:scale-105 backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20"
          data-testid="button-back"
        >
          ← Back
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1) translate(0, 0);
          }
          33% {
            opacity: 0.25;
            transform: scale(1.1) translate(20px, -20px);
          }
          66% {
            opacity: 0.2;
            transform: scale(0.95) translate(-15px, 15px);
          }
        }
      `}</style>
    </div>
  );
}
