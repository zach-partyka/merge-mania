# Number Match Game

## Overview

A mobile-first puzzle game where players connect matching number blocks to merge them into higher values (2048-style). The game features a 5x7 grid, power-ups (remove, swap, merge all), combo multipliers, and milestone-based number elimination. Built as a touch-optimized experience with vibrant, playful visuals targeting mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state, custom hooks (`useGameState`) for game logic
- **Styling**: Tailwind CSS with custom game-themed color palette (Apollo-inspired), shadcn/ui component library
- **Typography**: Nunito and Fredoka fonts for playful game aesthetic

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: REST endpoints prefixed with `/api`
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Static file serving from built Vite output

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains game constants, types, and database models
- **Migrations**: Drizzle Kit for schema management (`drizzle-kit push`)
- **Current Storage**: In-memory storage implementation exists as fallback (`MemStorage` class)

### Game State Management
- Local storage for persisting game state, personal best scores, and settings
- Client-side game logic handles grid manipulation, block merging, and power-up activation
- Game constants (number values, colors, elimination milestones) defined in shared schema

### Key Design Decisions
1. **Mobile-only enforcement**: Desktop users see a blocker component; game designed exclusively for touch input
2. **Touch gesture system**: Custom touch handling for block selection paths across the grid
3. **Shared types**: TypeScript types and game constants shared between client and server via `@shared` alias
4. **Component architecture**: Game UI split into modular components (GameGrid, NumberBlock, PowerUpTray, modals)

### Animation & Sound System
- **GSAP**: Professional animation library for smooth, three-phase animations (anticipation → action → settle)
- **Web Audio API**: Synthesized sound effects for merge pops, power-up activation, and celebrations
- **tsParticles**: Canvas-based particle system for celebration effects on milestones
- **Animation files**: `client/src/lib/animations.ts` (reusable GSAP utilities), `client/src/lib/sounds.ts` (audio synthesis)

## External Dependencies

### UI Components
- Radix UI primitives for accessible interactive components
- shadcn/ui component library (new-york style)
- Lucide React for icons
- Embla Carousel for carousel functionality

### Database & ORM
- PostgreSQL (via `DATABASE_URL` environment variable)
- Drizzle ORM with Zod integration for schema validation
- connect-pg-simple for session storage

### Build & Development
- Vite with React plugin
- Replit-specific plugins (runtime error overlay, cartographer, dev banner)
- esbuild for production server bundling
- TypeScript with strict mode

### Styling
- Tailwind CSS with custom configuration
- Class Variance Authority for component variants
- Google Fonts (Nunito, Fredoka)

### Animation Libraries
- GSAP for professional-quality animations with elastic/back easing
- tsParticles with @tsparticles/react for canvas particle effects