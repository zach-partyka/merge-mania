import gsap from "gsap";

export function animateMerge(element: HTMLElement, onComplete?: () => void) {
  const tl = gsap.timeline({ onComplete });
  
  tl.to(element, {
    scale: 0.85,
    duration: 0.08,
    ease: "power2.in"
  })
  .to(element, {
    scale: 1.3,
    duration: 0.12,
    ease: "back.out(3)"
  })
  .to(element, {
    scale: 1,
    duration: 0.2,
    ease: "elastic.out(1, 0.5)"
  });
  
  return tl;
}

export function animateNewBlock(element: HTMLElement, delay: number = 0) {
  gsap.set(element, { scale: 0, opacity: 0 });
  
  const tl = gsap.timeline({ delay });
  
  tl.to(element, {
    scale: 1.15,
    opacity: 1,
    duration: 0.15,
    ease: "back.out(2)"
  })
  .to(element, {
    scale: 1,
    duration: 0.25,
    ease: "elastic.out(1, 0.4)"
  });
  
  return tl;
}

export function animateBlockPop(element: HTMLElement) {
  return gsap.to(element, {
    scale: 0,
    opacity: 0,
    duration: 0.15,
    ease: "power2.in"
  });
}

export function animateModalIn(element: HTMLElement) {
  gsap.set(element, { scale: 0.8, opacity: 0, y: 20 });
  
  return gsap.to(element, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: "back.out(1.7)"
  });
}

export function animateModalOut(element: HTMLElement, onComplete?: () => void) {
  return gsap.to(element, {
    scale: 0.9,
    opacity: 0,
    y: 10,
    duration: 0.2,
    ease: "power2.in",
    onComplete
  });
}

export function animateScreenShake(element: HTMLElement, intensity: number = 5) {
  const tl = gsap.timeline();
  
  tl.to(element, { x: -intensity, duration: 0.04 })
    .to(element, { x: intensity, duration: 0.04 })
    .to(element, { x: -intensity * 0.6, duration: 0.04 })
    .to(element, { x: intensity * 0.6, duration: 0.04 })
    .to(element, { x: 0, duration: 0.04 });
  
  return tl;
}

export function animateProgressPulse(element: HTMLElement) {
  return gsap.fromTo(element, 
    { scale: 1 },
    { 
      scale: 1.05, 
      duration: 0.15, 
      yoyo: true, 
      repeat: 1,
      ease: "power2.out"
    }
  );
}

export function animatePowerUpIcon(element: HTMLElement) {
  gsap.set(element, { scale: 0, rotation: -180 });
  
  return gsap.to(element, {
    scale: 1,
    rotation: 0,
    duration: 0.5,
    ease: "back.out(2)"
  });
}

export function animateComboText(element: HTMLElement, onComplete?: () => void) {
  gsap.set(element, { scale: 0.5, opacity: 0, y: 0 });
  
  const tl = gsap.timeline({ onComplete });
  
  tl.to(element, {
    scale: 1.2,
    opacity: 1,
    duration: 0.2,
    ease: "back.out(2)"
  })
  .to(element, {
    scale: 1,
    duration: 0.1
  })
  .to(element, {
    y: -30,
    opacity: 0,
    duration: 0.4,
    delay: 0.3,
    ease: "power2.in"
  });
  
  return tl;
}

export function animateBlockWiggle(element: HTMLElement, intensity: number = 1) {
  const angle = 3 * intensity;
  
  return gsap.to(element, {
    rotation: angle,
    duration: 0.1,
    yoyo: true,
    repeat: 3,
    ease: "power1.inOut",
    onComplete: () => {
      gsap.set(element, { rotation: 0 });
    }
  });
}

export function animateChainHighlight(elements: HTMLElement[]) {
  elements.forEach((el, i) => {
    gsap.to(el, {
      boxShadow: "0 0 20px rgba(255,255,255,0.8)",
      duration: 0.15,
      delay: i * 0.03,
      yoyo: true,
      repeat: 1
    });
  });
}
