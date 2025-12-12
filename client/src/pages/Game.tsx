import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { IoSettingsSharp, IoClose } from "react-icons/io5";
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
      className="min-h-screen bg-game-bg flex flex-col items-center select-none overflow-hidden relative"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
      data-testid="game-screen"
    >
      {/* Subtle animated backgrounds - gameplay focused */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 20% 30%, #7c3aed 0%, transparent 50%)",
            opacity: 0.08,
            animation: "float 10s ease-in-out infinite"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 80% 70%, #fb7185 0%, transparent 50%)",
            opacity: 0.10,
            animation: "float 12s ease-in-out infinite reverse"
          }}
        />
      </div>

      <CelebrationParticles
        trigger={showCelebration}
        intensity="high"
        onComplete={() => setShowCelebration(false)}
      />
      {/* Header */}
      <header className="w-full flex items-center justify-between gap-2 px-4 py-4 relative z-10">
        <div className="w-10" />

        <ScoreDisplay
          highestNumber={gameState.highestNumber}
          progressLevel={gameState.progressLevel}
          difficulty={gameState.difficulty}
        />

        <button
          onClick={togglePause}
          className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
          }}
          data-testid="button-pause"
        >
          <IoSettingsSharp className="w-6 h-6" />
        </button>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 w-full">
        <ProgressBar
          progressPoints={gameState.progressPoints}
          difficulty={gameState.difficulty}
          progressLevel={gameState.progressLevel}
        />
      </div>

      {/* Active power-up indicator */}
      {gameState.activePowerUp && gameState.activePowerUp !== "mergeAll" && (
        <div
          className="flex items-center gap-3 mt-3 px-6 py-3 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl relative z-10 animate-bounce-in"
          style={{
            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.3)"
          }}
        >
          <span className="font-game text-white text-base font-semibold">
            {gameState.activePowerUp === "remove" && "Tap a block to remove it"}
            {gameState.activePowerUp === "swap" && (
              gameState.swapFirstBlock
                ? "Tap another block to swap with"
                : "Tap the first block to swap"
            )}
          </span>
          <button
            onClick={cancelPowerUp}
            className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center"
            data-testid="button-cancel-powerup"
          >
            <IoClose className="w-5 h-5" strokeWidth={3} />
          </button>
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

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: scale(1) translate(0, 0);
          }
          33% {
            transform: scale(1.05) translate(15px, -15px);
          }
          66% {
            transform: scale(0.95) translate(-10px, 10px);
          }
        }
      `}</style>
    </div>
  );
}
