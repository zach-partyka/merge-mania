import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, ISourceOptions } from "@tsparticles/engine";

interface CelebrationParticlesProps {
  trigger: boolean;
  intensity?: "low" | "medium" | "high";
  onComplete?: () => void;
}

export function CelebrationParticles({ trigger, intensity = "medium", onComplete }: CelebrationParticlesProps) {
  const [init, setInit] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    if (container) {
      container.refresh();
    }
  }, []);

  if (!init || !show) return null;

  const counts = { low: 30, medium: 60, high: 100 };
  const particleCount = counts[intensity];

  const options: ISourceOptions = {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: {
        value: particleCount,
      },
      color: {
        value: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF9F43", "#26de81", "#fd79a8"],
      },
      shape: {
        type: ["circle", "square", "triangle"],
      },
      opacity: {
        value: { min: 0.6, max: 1 },
        animation: {
          enable: true,
          speed: 1,
          startValue: "max",
          destroy: "min",
        },
      },
      size: {
        value: { min: 4, max: 12 },
      },
      move: {
        enable: true,
        speed: { min: 10, max: 25 },
        direction: "none",
        random: true,
        straight: false,
        outModes: {
          default: "out",
        },
        gravity: {
          enable: true,
          acceleration: 15,
        },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: {
          enable: true,
          speed: 30,
        },
      },
      tilt: {
        enable: true,
        value: { min: 0, max: 360 },
        direction: "random",
        animation: {
          enable: true,
          speed: 30,
        },
      },
      wobble: {
        enable: true,
        distance: 15,
        speed: 10,
      },
      life: {
        duration: {
          sync: false,
          value: 2,
        },
        count: 1,
      },
    },
    emitters: {
      position: {
        x: 50,
        y: 30,
      },
      rate: {
        quantity: particleCount,
        delay: 0,
      },
      life: {
        count: 1,
        duration: 0.1,
      },
      size: {
        width: 100,
        height: 0,
      },
    },
    detectRetina: true,
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <Particles
        id="celebration-particles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}
