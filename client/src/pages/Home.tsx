import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Play, RotateCcw, Settings, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopBlocker } from "@/components/game/DesktopBlocker";
import { SettingsModal } from "@/components/game/SettingsModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { type GameSettings } from "@shared/schema";

const STORAGE_KEY = "numberMatch_gameState";
const BEST_PROGRESS_KEY = "numberMatch_bestProgress";
const SETTINGS_KEY = "numberMatch_settings";

export default function Home() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const [personalBest, setPersonalBest] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [savedScore, setSavedScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({ soundEnabled: true });

  useEffect(() => {
    // Load personal best
    try {
      const best = localStorage.getItem(BEST_PROGRESS_KEY);
      if (best) {
        setPersonalBest(parseInt(best, 10));
      }
    } catch (e) {
      console.error("Failed to load personal best:", e);
    }

    // Check for saved game
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        const totalProgress = (state.progressPoints || 0) + ((state.progressLevel || 0) * 1000);
        if (totalProgress > 0 && !state.isGameOver) {
          setHasSavedGame(true);
          setSavedScore(totalProgress);
        }
      }
    } catch (e) {
      console.error("Failed to check saved game:", e);
    }

    // Load settings
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  const handleContinue = () => {
    setLocation("/game");
  };

  const handleNewGame = () => {
    setLocation("/new-game");
  };

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BEST_PROGRESS_KEY);
    setPersonalBest(0);
    setHasSavedGame(false);
    setSavedScore(0);
    setShowSettings(false);
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
      data-testid="home-screen"
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
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "radial-gradient(circle at 50% 80%, #14b8a6 0%, transparent 40%)",
            animation: "float 12s ease-in-out infinite"
          }}
        />
      </div>

      {/* Game title with dramatic gradient and glow */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-block animate-bounce-in">
          <h1
            className="font-game-display text-7xl font-black text-transparent bg-clip-text mb-2 transition-all duration-300 hover:scale-105"
            style={{
              backgroundImage: "linear-gradient(90deg, #a78bfa 0%, #fb7185 100%)",
              filter: "drop-shadow(0 4px 16px rgba(124, 58, 237, 0.6)) drop-shadow(0 0 40px rgba(124, 58, 237, 0.3))"
            }}
          >
            Merge
          </h1>
          <h1
            className="font-game-display text-7xl font-black text-transparent bg-clip-text transition-all duration-300 hover:scale-105"
            style={{
              backgroundImage: "linear-gradient(90deg, #fb7185 0%, #f472b6 100%)",
              filter: "drop-shadow(0 4px 16px rgba(251, 113, 133, 0.6)) drop-shadow(0 0 40px rgba(251, 113, 133, 0.3))"
            }}
          >
            Mania
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-game-accent animate-pulse" />
            <p className="text-white/80 text-base font-game tracking-wider font-semibold">
              Connect • Merge • Win
            </p>
            <Sparkles className="w-5 h-5 text-game-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
      </div>

      {/* High score display - enhanced */}
      {personalBest > 0 && (
        <div
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl px-10 py-6 mb-10 text-center border border-white/20 shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300"
          data-testid="high-score-display"
          style={{
            boxShadow: "0 8px 32px rgba(124, 58, 237, 0.3), 0 0 60px rgba(251, 113, 133, 0.2)"
          }}
        >
          {/* Animated background glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)"
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 text-game-accent mb-3">
              <Trophy className="w-7 h-7 animate-pulse" />
              <span className="font-game text-base uppercase tracking-wider font-bold">Personal Best</span>
              <Trophy className="w-7 h-7 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            <div
              className="font-game-display text-6xl font-black text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #fb7185 50%, #a78bfa 100%)",
                filter: "drop-shadow(0 4px 12px rgba(251, 191, 36, 0.5))"
              }}
            >
              {personalBest.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons - enhanced with glow */}
      <div className="w-full max-w-sm space-y-5 relative z-10">
        {hasSavedGame ? (
          <>
            <Button
              onClick={handleContinue}
              className="w-full h-18 text-xl font-game text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #fb7185 100%)",
                boxShadow: "0 8px 32px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)"
              }}
              data-testid="button-continue"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Play className="w-8 h-8 mr-3 drop-shadow-lg" />
              <span className="relative">Continue Game</span>
              <span className="ml-auto text-sm font-bold bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full">
                {savedScore.toLocaleString()}
              </span>
            </Button>
            <Button
              onClick={handleNewGame}
              variant="outline"
              className="w-full h-16 text-lg font-game border-2 border-white/30 text-white hover:bg-white/15 hover:border-white/50 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-md hover:shadow-2xl"
              data-testid="button-new-game"
              style={{
                boxShadow: "0 4px 16px rgba(255, 255, 255, 0.1)"
              }}
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              New Game
            </Button>
          </>
        ) : (
          <Button
            onClick={handleNewGame}
            className="w-full h-18 text-2xl font-game text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #fb7185 100%)",
              boxShadow: "0 8px 32px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)"
            }}
            data-testid="button-play"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Play className="w-8 h-8 mr-3 drop-shadow-lg relative" />
            <span className="relative">Play Now</span>
          </Button>
        )}

        {/* Settings button */}
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          className="w-full h-14 text-base font-game text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all duration-300 hover:scale-102 backdrop-blur-sm border border-white/10 hover:border-white/20"
          data-testid="button-settings"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </Button>
      </div>

      {/* How to play hint */}
      <div className="mt-12 text-center max-w-md relative z-10 px-4">
        <p className="text-white/70 text-base font-game leading-relaxed backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          Swipe to connect matching numbers and merge them into bigger values
        </p>
      </div>

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
        onResetGame={handleResetProgress}
      />

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
