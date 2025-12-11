import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
        xl: "0.75rem", /* 12px for game blocks */
        "2xl": "1rem", /* 16px */
      },
      colors: {
        // Premium Minimal color palette for game
        game: {
          bg: "#0f1419", /* Deep slate - darker, more sophisticated */
          "bg-dark": "#0a0d11", /* Even darker for contrast */
          grid: "#1a1f29", /* Subtle grid background */
          "grid-border": "#252b38", /* Muted borders */
          primary: "#7c3aed", /* Deep purple */
          accent: "#fb7185", /* Rose gold */
          success: "#14b8a6", /* Teal for wins */
        },
        // Premium number block progression: Purple → Violet → Rose → Teal
        // Designed for clear differentiation and sophisticated aesthetic
        block: {
          // Early game: Cool purples (readable, calm)
          2: "#8b5cf6",    /* Vibrant purple */
          4: "#a78bfa",    /* Light purple */
          8: "#c4b5fd",    /* Pale purple */
          16: "#ddd6fe",   /* Very pale purple */
          // Mid game: Deeper purples (more intense)
          32: "#7c3aed",   /* Deep purple (brand color) */
          64: "#6d28d9",   /* Royal purple */
          128: "#5b21b6",  /* Dark purple */
          256: "#4c1d95",  /* Very dark purple */
          // High numbers: Rose/pink (warm, exciting)
          512: "#fb7185",  /* Rose gold (accent color) */
          1024: "#f472b6", /* Pink */
          "2k": "#e879f9", /* Fuchsia */
          "4k": "#d946ef", /* Magenta */
          // Very high: Teal/cyan (success, achievement)
          "8k": "#14b8a6", /* Teal (success color) */
          "16k": "#06b6d4", /* Cyan */
          "32k": "#0891b2", /* Dark cyan */
          "64k": "#0e7490", /* Darker cyan */
          // Ultra high: Gold/amber (prestige)
          "131k": "#f59e0b", /* Amber */
          "262k": "#d97706", /* Dark amber */
          "524k": "#b45309", /* Darker amber */
          "1m": "#92400e",  /* Very dark amber */
        },
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        game: ["Nunito", "sans-serif"],
        "game-display": ["Fredoka", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "block-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "block-merge": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
        "block-drop": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "combo-pop": {
          "0%": { transform: "scale(0) translateY(0)", opacity: "0" },
          "50%": { transform: "scale(1.2) translateY(-10px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(-20px)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.4)" },
          "50%": { boxShadow: "0 0 20px 10px rgba(124, 58, 237, 0.2)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        "progress-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "chain-shake-subtle": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(-1px) rotate(-0.5deg)" },
          "75%": { transform: "translateX(1px) rotate(0.5deg)" },
        },
        "chain-shake-medium": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(-2px) rotate(-1deg)" },
          "75%": { transform: "translateX(2px) rotate(1deg)" },
        },
        "chain-shake-intense": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "20%": { transform: "translateX(-3px) rotate(-1.5deg)" },
          "40%": { transform: "translateX(3px) rotate(1.5deg)" },
          "60%": { transform: "translateX(-3px) rotate(-1.5deg)" },
          "80%": { transform: "translateX(3px) rotate(1.5deg)" },
        },
        "squash-stretch": {
          "0%": { transform: "scale(0.3, 0.3)" },
          "30%": { transform: "scale(1.15, 0.85)" },
          "50%": { transform: "scale(0.9, 1.1)" },
          "70%": { transform: "scale(1.05, 0.95)" },
          "100%": { transform: "scale(1, 1)" },
        },
        "glow-fade": {
          "0%": { boxShadow: "0 0 20px 8px rgba(124, 58, 237, 0.6), 0 0 40px 16px rgba(251, 113, 133, 0.4)" },
          "100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0), 0 0 0 0 rgba(251, 113, 133, 0)" },
        },
        "sparkle": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "50%": { transform: "scale(1) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(0) rotate(360deg)", opacity: "0" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100px) rotate(720deg)", opacity: "0" },
        },
        "screen-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "40%": { transform: "scale(1.1)", opacity: "1" },
          "60%": { transform: "scale(0.9)" },
          "80%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "block-pop": "block-pop 0.2s ease-out",
        "block-merge": "block-merge 0.3s ease-out forwards",
        "block-drop": "block-drop 0.3s ease-out",
        "combo-pop": "combo-pop 0.6s ease-out forwards",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "shake": "shake 0.3s ease-in-out",
        "bounce-subtle": "bounce-subtle 0.5s ease-in-out",
        "progress-pulse": "progress-pulse 1s ease-in-out infinite",
        "chain-shake-subtle": "chain-shake-subtle 0.15s ease-in-out infinite",
        "chain-shake-medium": "chain-shake-medium 0.12s ease-in-out infinite",
        "chain-shake-intense": "chain-shake-intense 0.1s ease-in-out infinite",
        "squash-stretch": "squash-stretch 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "glow-fade": "glow-fade 0.6s ease-out forwards",
        "sparkle": "sparkle 0.5s ease-out forwards",
        "confetti-fall": "confetti-fall 1s ease-out forwards",
        "screen-shake": "screen-shake 0.4s ease-in-out",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pop-in": "pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
