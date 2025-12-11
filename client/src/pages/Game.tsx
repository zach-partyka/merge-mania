import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Settings, X } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { GameGrid } from "@/components/game/GameGrid";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { ProgressBar } from "@/components/game/ProgressBar";
import { PowerUpTray } from "@/components/game/PowerUpTray";
import { PauseModal } from "@/components/game/PauseModal";
import { SettingsModal } from "@/components/game/SettingsModal";
import { GameOverModal } from "@/components/game/GameOverModal";
import { RewardModal } from "@/components/game/RewardModal";
import { MergeAllPicker } from "@/components/game/MergeAllPicker";
import { DesktopBlocker } from "@/components/game/DesktopBlocker";
import { CelebrationParticles } from "@/components/game/CelebrationParticles";
import { useGameState } from "@/hooks/useGameState";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { type PowerUpType } from "@shared/schema";
import { playMergePop, playPowerUpActivate, playCelebration } from "@/lib/sounds";

export default function Game() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const prevProgressLevel = useRef(0);
  
  const {
    gameState,
    showRewardModal,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd: originalHandleTouchEnd,
    activatePowerUp,
    cancelPowerUp,
    selectMergeAllTarget,
    executeMergeAll,
    handleSelectReward,
    handleSaveForLater,
    togglePause,
    prepareForQuit,
    restartGame,
    updateSettings,
    resetAllProgress
  } = useGameState();

  const handleTouchEnd = useCallback(() => {
    if (gameState.selectedBlocks.length >= 2 && !gameState.activePowerUp) {
      playMergePop(gameState.selectedBlocks.length);
    }
    originalHandleTouchEnd();
  }, [gameState.selectedBlocks.length, gameState.activePowerUp, originalHandleTouchEnd]);

  useEffect(() => {
    if (gameState.progressLevel > prevProgressLevel.current) {
      playCelebration();
      setShowCelebration(true);
    }
    prevProgressLevel.current = gameState.progressLevel;
  }, [gameState.progressLevel]);

  const triggerScreenShake = useCallback(() => {
    if (gameContainerRef.current) {
      gsap.timeline()
        .to(gameContainerRef.current, { x: -6, duration: 0.04 })
        .to(gameContainerRef.current, { x: 6, duration: 0.04 })
        .to(gameContainerRef.current, { x: -4, duration: 0.04 })
        .to(gameContainerRef.current, { x: 4, duration: 0.04 })
        .to(gameContainerRef.current, { x: 0, duration: 0.04 });
    }
  }, []);

  const handlePowerUpSelect = useCallback((type: PowerUpType) => {
    activatePowerUp(type);
    playPowerUpActivate();
    triggerScreenShake();
  }, [activatePowerUp, triggerScreenShake]);

  // Show desktop blocker if not on mobile
  if (!isMobile) {
    return <DesktopBlocker />;
  }

  return (
    <div 
      ref={gameContainerRef}
      className="min-h-screen bg-game-bg flex flex-col items-center select-none overflow-hidden"
      style={{ 
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
      data-testid="game-screen"
    >
      <CelebrationParticles 
        trigger={showCelebration} 
        intensity="high"
        onComplete={() => setShowCelebration(false)}
      />
      {/* Header */}
      <header className="w-full flex items-center justify-between gap-2 px-4 py-3">
        <div className="w-10" />
        
        <ScoreDisplay
          highestNumber={gameState.highestNumber}
          progressLevel={gameState.progressLevel}
          difficulty={gameState.difficulty}
        />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={togglePause}
          className="text-white/60 hover:text-white hover:bg-white/10"
          data-testid="button-pause"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </header>

      {/* Progress bar */}
      <ProgressBar 
        progressPoints={gameState.progressPoints}
        difficulty={gameState.difficulty}
        progressLevel={gameState.progressLevel}
      />

      {/* Active power-up indicator */}
      {gameState.activePowerUp && gameState.activePowerUp !== "mergeAll" && (
        <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 rounded-full">
          <span className="font-game text-white text-sm">
            {gameState.activePowerUp === "remove" && "Tap a block to remove it"}
            {gameState.activePowerUp === "swap" && (
              gameState.swapFirstBlock 
                ? "Tap another block to swap with" 
                : "Tap the first block to swap"
            )}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={cancelPowerUp}
            className="w-6 h-6 text-white/60 hover:text-white"
            data-testid="button-cancel-powerup"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Game grid */}
      <main className={cn(
        "flex-1 flex items-center justify-center py-4",
        gameState.activePowerUp && "ring-2 ring-white/30 rounded-2xl m-2"
      )}>
        <GameGrid
          grid={gameState.grid}
          selectedBlocks={gameState.selectedBlocks}
          swapFirstBlock={gameState.swapFirstBlock}
          mergeAllTargetValue={gameState.mergeAllTargetValue}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          difficulty={gameState.difficulty}
        />
      </main>

      {/* Power-up tray */}
      <footer className="w-full pb-4">
        <PowerUpTray
          powerUps={gameState.powerUps}
          activePowerUp={gameState.activePowerUp}
          onPowerUpSelect={handlePowerUpSelect}
          disabled={gameState.isGameOver || gameState.isPaused}
          difficulty={gameState.difficulty}
        />
      </footer>

      {/* Modals */}
      <PauseModal
        isOpen={gameState.isPaused && !showSettings}
        onResume={togglePause}
        onRestart={() => {
          restartGame();
          togglePause();
        }}
        onSettings={() => setShowSettings(true)}
        onQuit={() => {
          prepareForQuit();
          setLocation("/");
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        settings={gameState.settings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={updateSettings}
        onResetGame={() => {
          resetAllProgress();
          setShowSettings(false);
        }}
      />

      <GameOverModal
        isOpen={gameState.isGameOver}
        progressLevel={gameState.progressLevel}
        highestNumber={gameState.highestNumber}
        onPlayAgain={restartGame}
      />

      <RewardModal
        isOpen={showRewardModal}
        onSelectPowerUp={handleSelectReward}
        onSaveForLater={handleSaveForLater}
      />

      {/* Merge All Picker */}
      {gameState.activePowerUp === "mergeAll" && (
        <MergeAllPicker
          grid={gameState.grid}
          selectedValue={gameState.mergeAllTargetValue}
          onSelectValue={selectMergeAllTarget}
          onConfirm={executeMergeAll}
          onCancel={cancelPowerUp}
        />
      )}
    </div>
  );
}
