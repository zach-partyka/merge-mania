import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Play, RotateCcw, Settings, Trophy } from "lucide-react";
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
      className="min-h-screen bg-game-bg flex flex-col items-center justify-center px-6 select-none"
      style={{ 
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
      data-testid="home-screen"
    >
      {/* Game title */}
      <div className="text-center mb-8">
        <h1 className="font-game-display text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Number
        </h1>
        <h1 className="font-game-display text-5xl font-bold text-game-accent drop-shadow-lg">
          Match
        </h1>
      </div>

      {/* High score display */}
      {personalBest > 0 && (
        <div 
          className="bg-white/10 rounded-2xl px-6 py-4 mb-8 text-center"
          data-testid="high-score-display"
        >
          <div className="flex items-center justify-center gap-2 text-game-accent mb-1">
            <Trophy className="w-5 h-5" />
            <span className="font-game text-sm uppercase tracking-wide">High Score</span>
          </div>
          <div className="font-game-display text-4xl font-bold text-white">
            {personalBest.toLocaleString()}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full max-w-xs space-y-3">
        {hasSavedGame ? (
          <>
            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg font-game bg-game-primary hover:bg-game-primary/90 text-white rounded-xl"
              data-testid="button-continue"
            >
              <Play className="w-6 h-6 mr-2" />
              Continue
              <span className="ml-2 text-sm opacity-80">({savedScore.toLocaleString()} pts)</span>
            </Button>
            <Button
              onClick={handleNewGame}
              variant="outline"
              className="w-full h-12 text-base font-game border-white/30 text-white hover:bg-white/10 rounded-xl"
              data-testid="button-new-game"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              New Game
            </Button>
          </>
        ) : (
          <Button
            onClick={handleNewGame}
            className="w-full h-14 text-lg font-game bg-game-primary hover:bg-game-primary/90 text-white rounded-xl"
            data-testid="button-play"
          >
            <Play className="w-6 h-6 mr-2" />
            Play
          </Button>
        )}
        
        {/* Settings button */}
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          className="w-full h-12 text-base font-game text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          data-testid="button-settings"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </Button>
      </div>

      {/* How to play hint */}
      <p className="text-white/40 text-sm font-game mt-8 text-center max-w-xs">
        Connect matching numbers to merge them into bigger values
      </p>

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
        onResetGame={handleResetProgress}
      />
    </div>
  );
}
