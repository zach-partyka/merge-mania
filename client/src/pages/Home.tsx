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
    // Load personal best (now based on progress)
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
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at 50% 50%, #16a34a 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite"
        }}
      />

      {/* Game title with gradient */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-block">
          <h1
            className="font-game-display text-6xl font-black text-transparent bg-clip-text mb-2"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #16a34a 100%)",
              textShadow: "0 4px 20px rgba(22, 163, 74, 0.3)"
            }}
          >
            Merge
          </h1>
          <h1
            className="font-game-display text-6xl font-black text-game-accent drop-shadow-lg"
            style={{
              textShadow: "0 4px 20px rgba(22, 163, 74, 0.5)"
            }}
          >
            Mania
          </h1>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Sparkles className="w-4 h-4 text-game-accent animate-pulse" />
            <p className="text-white/60 text-sm font-game tracking-wide">
              Connect • Merge • Win
            </p>
            <Sparkles className="w-4 h-4 text-game-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
      </div>

      {/* High score display - enhanced */}
      {personalBest > 0 && (
        <div
          className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl px-8 py-5 mb-10 text-center border border-white/10 shadow-xl relative overflow-hidden"
          data-testid="high-score-display"
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
              animation: "shine 3s ease-in-out infinite"
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 text-game-accent mb-2">
              <Trophy className="w-6 h-6" />
              <span className="font-game text-sm uppercase tracking-wider font-semibold">Personal Best</span>
            </div>
            <div className="font-game-display text-5xl font-bold text-white drop-shadow-lg">
              {personalBest.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons - enhanced */}
      <div className="w-full max-w-sm space-y-4 relative z-10">
        {hasSavedGame ? (
          <>
            <Button
              onClick={handleContinue}
              className="w-full h-16 text-xl font-game bg-gradient-to-r from-game-primary to-green-600 hover:from-green-600 hover:to-game-primary text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-white/20"
              data-testid="button-continue"
            >
              <Play className="w-7 h-7 mr-3" />
              Continue Game
              <span className="ml-auto text-sm font-normal opacity-90 bg-white/20 px-3 py-1 rounded-full">
                {savedScore.toLocaleString()}
              </span>
            </Button>
            <Button
              onClick={handleNewGame}
              variant="outline"
              className="w-full h-14 text-lg font-game border-2 border-white/30 text-white hover:bg-white/15 hover:border-white/50 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              data-testid="button-new-game"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              New Game
            </Button>
          </>
        ) : (
          <Button
            onClick={handleNewGame}
            className="w-full h-16 text-xl font-game bg-gradient-to-r from-game-primary to-green-600 hover:from-green-600 hover:to-game-primary text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-white/20"
            data-testid="button-play"
          >
            <Play className="w-7 h-7 mr-3" />
            Play Now
          </Button>
        )}

        {/* Settings button */}
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          className="w-full h-12 text-base font-game text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          data-testid="button-settings"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </Button>
      </div>

      {/* How to play hint - enhanced */}
      <div className="mt-10 text-center max-w-sm relative z-10">
        <p className="text-white/50 text-sm font-game leading-relaxed">
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
