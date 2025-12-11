const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
}

export function playMergePop(chainLength: number = 2) {
  const baseFreq = 440 + (chainLength * 60);
  playTone(baseFreq, 0.15, "sine", 0.25);
  
  setTimeout(() => {
    playTone(baseFreq * 1.5, 0.1, "sine", 0.15);
  }, 50);
}

export function playComboSound(comboLevel: number) {
  const frequencies = [523, 659, 784, 880, 1047];
  const freq = frequencies[Math.min(comboLevel, frequencies.length - 1)];
  
  playTone(freq, 0.12, "triangle", 0.2);
  setTimeout(() => playTone(freq * 1.25, 0.08, "triangle", 0.15), 60);
  setTimeout(() => playTone(freq * 1.5, 0.06, "triangle", 0.1), 100);
}

export function playPowerUpActivate() {
  playTone(880, 0.08, "square", 0.15);
  setTimeout(() => playTone(1100, 0.08, "square", 0.12), 60);
  setTimeout(() => playTone(1320, 0.1, "sine", 0.18), 120);
}

export function playCelebration() {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.2, "sine", 0.2);
    }, i * 80);
  });
}

export function playMilestone() {
  playTone(523, 0.15, "sine", 0.25);
  setTimeout(() => playTone(659, 0.15, "sine", 0.25), 100);
  setTimeout(() => playTone(784, 0.2, "sine", 0.3), 200);
  setTimeout(() => playTone(1047, 0.3, "sine", 0.35), 300);
}

export function playBlockSelect() {
  playTone(600, 0.05, "sine", 0.1);
}

export function playBlockAdd() {
  playTone(800, 0.04, "sine", 0.08);
}
