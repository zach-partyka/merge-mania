# Number Match Game - Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from modern mobile puzzle games (2048, Threes, Drop7) with emphasis on the colorful, playful aesthetic shown in the reference screenshots. Focus on clarity, immediate visual feedback, and delightful micro-interactions.

## Core Design Principles
1. **Clarity First**: Game state must be instantly readable at a glance
2. **Playful Energy**: Vibrant, encouraging visual language appropriate for kids
3. **Touch-Optimized**: All interactive elements sized generously for touch input
4. **Celebration-Driven**: Visual rewards for achievements and milestones

## Typography System

**Numbers on Blocks**:
- Primary: Bold, rounded sans-serif (e.g., Nunito Bold, Fredoka)
- Sizes scale based on digit count:
  - 1-2 digits: text-4xl (very large)
  - 3 digits: text-3xl
  - 4+ digits: text-2xl with abbreviations (1K, 1M)
- Always centered, high contrast against block backgrounds

**UI Text**:
- Headers: text-xl to text-2xl, bold weight
- Scores/Stats: text-lg to text-xl, semibold
- Labels: text-sm to text-base, medium weight

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8
- Component padding: p-4, p-6
- Element gaps: gap-2, gap-3, gap-4
- Margins: m-2, m-4, m-6

**Portrait Mode Structure** (100vh):
- Header area: Score, personal best, combo multiplier (h-20 to h-24)
- Game grid: Centered, max available space (flex-1)
- Power-up tray: Fixed bottom bar (h-24)
- All content within safe-area-inset

## Component Library

### Game Grid
- 5x7 grid with equal-sized squares
- Gap between blocks: gap-2
- Each block: Rounded corners (rounded-xl), shadow for depth
- Block size: Dynamic based on viewport, minimum tap target 60x60px
- Number blocks use Apollo palette colors mapped to values
- Empty cells: Subtle background with dashed border

### Power-Up Tray (Bottom Bar)
- Three power-up buttons side-by-side with equal spacing
- Each button: Icon + count badge (top-right corner)
- Badge: Small circle showing remaining uses (0-5)
- Disabled state when count = 0
- Icon-first design with minimal text labels

### Score Display (Top Bar)
- Current score: Large, prominent
- Personal best: Smaller, secondary position
- Combo multiplier: Animated badge that appears during combos (2x, 3x, 4x)
- Progress bar: Thin horizontal bar showing progress to next reward

### Modal Overlays
**Pause Menu**:
- Semi-transparent backdrop (backdrop-blur)
- Centered card: Resume, Restart, Settings buttons stacked vertically
- Generous touch targets (min h-14)

**Reward Selection**:
- Shows when progress bar fills
- Display 3 power-up options with large icons
- "Claim" or "Save for Later" actions
- Celebration visuals (confetti, glow effects)

**Game Over**:
- Final score large and centered
- Personal best comparison
- "Play Again" primary button
- Compact stats (highest number reached, total merges)

### Visual Feedback Elements
- **Drag Path**: Thick line connecting selected blocks (stroke-4)
- **Merge Animation**: Brief scale-up/pop effect (minimal, 200ms)
- **Combo Indicator**: Floating "+2x" text above merged blocks
- **Number Elimination**: Cascade fade-out when milestone reached
- **New Block Drop**: Subtle drop-in animation from top

### Settings Menu
- Simple list of toggles: Haptic Feedback (ON/OFF), Sound (ON/OFF)
- Version number at bottom
- "Reset Game" option with confirmation

## Desktop Message Overlay
- Full viewport centered message
- Large icon (mobile phone crossed out)
- Friendly message: "This game is designed for mobile devices"
- Instruction: "Please visit on your phone or tablet"
- Subtle background pattern

## Accessibility & Polish
- Minimum touch target: 48x48px (WCAG AAA)
- High contrast text on all block colors
- Clear visual focus states for all interactive elements
- Generous spacing prevents accidental taps
- Numbers always readable against block backgrounds

## Visual Hierarchy
1. Current number blocks (largest, most colorful)
2. Score and combo multiplier
3. Power-up availability
4. Progress bar and personal best
5. Settings/pause button (top-right corner, subtle)

## Block Color Mapping
Use Apollo palette to create distinct colors for each number tier. Ensure progression from cooler/lighter tones (2, 4, 8) to warmer/brighter tones (higher numbers). Each number value gets a unique, vibrant color for instant recognition.