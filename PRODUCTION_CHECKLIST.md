# Production Launch Checklist

## ✅ Status: COMPLETED
- [x] Error boundaries added

## 🚨 CRITICAL (Must Fix Before Launch)

### 2. Add Schema Versioning for Saved Games
**Risk:** App updates that change game state structure will break existing saved games.

**Fix needed in:** `client/src/hooks/useGamePersistence.ts`

```typescript
// Add at top of file
const SCHEMA_VERSION = 1;
const STORAGE_KEY = "numberMatch_gameState";

// Before loading saved state:
export function loadGameState(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check version
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      console.log("Schema version mismatch, clearing old save");
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.state;
  } catch (e) {
    console.error("Failed to load game:", e);
    return null;
  }
}

// When saving:
export function saveGameState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      state
    }));
  } catch (e) {
    console.error("Failed to save game:", e);
  }
}
```

### 3. Fix LocalStorage Quota Exceeded Error
**Risk:** On iOS Safari, localStorage can fail silently or throw QuotaExceededError.

**Fix needed in:** All localStorage writes

```typescript
// Wrap all localStorage.setItem calls:
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && (
      e.code === 22 || // QuotaExceededError
      e.code === 1014 || // Firefox
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      console.warn("LocalStorage quota exceeded");
      // Show user a warning toast
      return false;
    }
    throw e;
  }
}
```

### 4. Validate Grid Dimensions on Load
**Risk:** If saved game has different grid size than current difficulty, blocks reference invalid positions.

**Fix needed in:** `client/src/hooks/useGameState.ts:415-444`

```typescript
// After loading saved state:
const config = DIFFICULTY_CONFIGS[savedState.difficulty];
if (savedState.grid.length !== config.gridRows ||
    savedState.grid[0]?.length !== config.gridCols) {
  console.warn("Grid size mismatch, starting fresh game");
  return createInitialState();
}
```

### 5. Add Timeout Cleanup Guards
**Risk:** Timeouts firing after component unmount can cause state updates on unmounted component.

**Fix needed in:** `client/src/hooks/useGameState.ts:113-128`

```typescript
// Replace direct setTimeout with guarded version:
const isMountedRef = useRef(true);

useEffect(() => {
  return () => {
    isMountedRef.current = false;
  };
}, []);

// Then in timeout:
if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);
removeTimeoutRef.current = setTimeout(() => {
  if (!isMountedRef.current) return; // Guard against unmount

  setGameState(prev => {
    // ... rest of logic
  });
}, 300);
```

---

## ⚠️ HIGH PRIORITY (Should Fix)

### 6. Add Network State Detection
**Risk:** If the app has backend dependencies (unclear from review), offline users get broken experience.

```typescript
// Add to App.tsx or root component:
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Show banner when offline
{!isOnline && (
  <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
    You're offline. Progress will sync when connection returns.
  </div>
)}
```

### 7. Add Performance Monitoring
**Risk:** You won't know if users experience lag/crashes after launch.

```typescript
// Add to main.tsx or App.tsx:
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.duration);
    // TODO: Send to analytics service
  });
}
```

### 8. Extract Magic Numbers to Constants
**Risk:** Inconsistent feel if you tweak values later without catching all instances.

Create: `client/src/lib/constants.ts`
```typescript
export const ANIMATION_DURATION = {
  BLOCK_DROP: 300,
  BLOCK_MERGE: 200,
  SCREEN_SHAKE: 40,
} as const;

export const LAYOUT = {
  BLOCK_SIZE_MOBILE: 60,
  BLOCK_SIZE_KIDS: 90,
  BLOCK_GAP: 8,
  GRID_PADDING: 12,
} as const;

export const TIMEOUTS = {
  REMOVE_POWER_UP: 300,
  DROP_BLOCKS: 100,
  MERGE_DROP: 300,
} as const;
```

Then replace hardcoded values throughout codebase.

### 9. Add Loading States
**Risk:** Users see blank screen on slow connections.

```typescript
// Add to main.tsx:
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  // Simulate checking for saved state, assets, etc.
  const timer = setTimeout(() => setIsLoading(false), 100);
  return () => clearTimeout(timer);
}, []);

if (isLoading) {
  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center">
      <div className="text-white font-game-display text-2xl animate-pulse">
        Loading...
      </div>
    </div>
  );
}
```

---

## 📊 MEDIUM PRIORITY (Nice to Have)

### 10. Add Analytics Events
Track key user behaviors:
- Game started
- Game over (with final score)
- Power-up used
- Highest number reached
- Difficulty selected

### 11. Add Haptic Feedback Polyfill
iOS Safari supports haptics via `navigator.vibrate()`, but you should check support:

```typescript
export function triggerHaptic(pattern: 'light' | 'medium' | 'heavy') {
  if (!navigator.vibrate) return;

  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
  };

  navigator.vibrate(patterns[pattern]);
}
```

### 12. Optimize Bundle Size
Current risk: 50+ shadcn/ui components imported but likely <15 used.

**Action:**
1. Run `npm run build` and check bundle analyzer
2. Remove unused UI components from `client/src/components/ui/`
3. Consider lazy loading the Game page

```typescript
// In App.tsx:
const Game = lazy(() => import("@/pages/Game"));

// Then wrap Router in Suspense:
<Suspense fallback={<LoadingScreen />}>
  <Router />
</Suspense>
```

### 13. Add Meta Tags for PWA
Make it installable as a native app:

Create: `client/public/manifest.json`
```json
{
  "name": "Number Match",
  "short_name": "NumMatch",
  "description": "Merge matching numbers to create bigger values",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `client/index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#16a34a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### 14. Add Service Worker for Offline Play
Since it's a fully client-side game, it should work offline:

```bash
npm install workbox-cli --save-dev
```

Then configure basic caching in `vite.config.ts` or add a service worker.

---

## 🧪 TESTING (Recommended)

### 15. Add Critical Path Tests
At minimum, test the game logic:

Create: `shared/__tests__/gameLogic.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import {
  isValidChainConnection,
  calculateMergeResult,
  checkForValidMoves
} from '../gameLogic';

describe('Game Logic', () => {
  it('allows same-value chains', () => {
    const blocks = [
      { id: '1', value: 2, row: 0, col: 0, ... },
      { id: '2', value: 2, row: 0, col: 1, ... },
    ];
    const newBlock = { id: '3', value: 2, row: 0, col: 2, ... };

    expect(isValidChainConnection(blocks, newBlock)).toBe(true);
  });

  it('allows power-of-2 step-ups after 2+ base blocks', () => {
    const blocks = [
      { id: '1', value: 2, row: 0, col: 0, ... },
      { id: '2', value: 2, row: 0, col: 1, ... },
    ];
    const newBlock = { id: '3', value: 4, row: 0, col: 2, ... };

    expect(isValidChainConnection(blocks, newBlock)).toBe(true);
  });

  it('detects game over when no valid moves exist', () => {
    const grid = [
      [{ value: 2 }, { value: 4 }, { value: 8 }],
      [{ value: 16 }, { value: 32 }, { value: 64 }],
    ];

    expect(checkForValidMoves(grid)).toBe(false);
  });
});
```

---

## 🔒 SECURITY

### 16. Sanitize User Data (Low Risk)
Currently no user-generated content, but if you add leaderboards/usernames:
- Sanitize all text input
- Rate limit localStorage writes
- Don't trust client-side validation alone

---

## 📱 MOBILE TESTING

### 17. Test on Real Devices
**Required devices:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

**Test scenarios:**
1. Swipe gestures don't trigger browser back/forward
2. No scroll bounce during gameplay
3. Safe area insets work correctly (notch devices)
4. Haptics fire correctly (if implemented)
5. Sound plays (check autoplay policies)
6. LocalStorage persists after closing tab
7. Works in Private/Incognito mode

### 18. Performance on Low-End Devices
Test on:
- iPhone SE (older hardware)
- Budget Android (<2GB RAM)

Watch for:
- GSAP animations causing jank
- RequestAnimationFrame dropping frames
- Memory leaks from event listeners

---

## 📈 MONITORING (Post-Launch)

### 19. Add Error Tracking
Integrate Sentry or similar:
```typescript
// In ErrorBoundary.tsx componentDidCatch:
import * as Sentry from "@sentry/react";

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, { extra: errorInfo });
}
```

### 20. Track Key Metrics
- Daily Active Users (DAU)
- Average session duration
- Games completed vs abandoned
- Highest numbers reached (difficulty balance)
- Power-up usage rates (are they useful?)

---

## 🎨 POLISH

### 21. Add Tutorial/Onboarding
First-time users might not understand the mechanics. Add:
- Brief overlay on first game: "Swipe to connect matching numbers"
- Maybe 2-3 step tutorial
- Or animated GIF showing a merge

### 22. Add Sound Effects
You have `playMergePop()`, `playCelebration()` functions but no audio files referenced.
Ensure:
- Sounds exist in `/client/public/sounds/`
- User can mute (already have `soundEnabled` setting ✓)
- Sounds respect autoplay policies (require user interaction first)

### 23. Share/Social Features
Add "Share Score" button on game over:
```typescript
const shareScore = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Number Match',
      text: `I scored ${score} points! Can you beat me?`,
      url: window.location.href
    });
  }
};
```

---

## 🚀 DEPLOYMENT

### 24. Environment Variables
Ensure production build has correct config:
- API endpoints (if any)
- Analytics IDs
- Error tracking DSNs
- Feature flags

### 25. CDN Setup
Serve static assets from CDN:
- Images in `/attached_assets/`
- Fonts (if custom fonts used)
- Sound files

### 26. Compression
Ensure your build process:
- Minifies JS/CSS
- Gzips/Brotli compresses assets
- Optimizes images (PNGs → WebP where supported)

---

## ✨ FINAL CHECKS

### 27. Accessibility Audit
Run Lighthouse in Chrome DevTools:
- Target: 90+ accessibility score
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works (even if not primary input)

### 28. Performance Audit
Lighthouse targets:
- Performance: 90+
- Best Practices: 95+
- SEO: 90+ (if you want discoverability)

### 29. Browser Compatibility
Test on:
- iOS Safari (primary)
- Chrome Android (primary)
- Firefox Mobile (nice to have)
- Samsung Internet (if targeting Android)

### 30. Legal/Compliance
- Add Privacy Policy (especially if collecting analytics)
- Add Terms of Service
- Ensure COPPA compliance if "kids" mode is for children
- Add appropriate age ratings for app stores

---

## Summary: Launch Blockers

Before you can safely launch, you MUST fix:
1. ✅ Error boundaries (DONE)
2. Schema versioning
3. LocalStorage quota handling
4. Grid dimension validation
5. Timeout cleanup guards

Everything else is "ship and iterate."
