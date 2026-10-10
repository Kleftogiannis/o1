# O(1) Decision Coach

> **Decide in Constant Time** - A gamified decision-making mobile app that eliminates decision fatigue by turning choices into addictive 5-second games.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![LokiJS](https://img.shields.io/badge/Database-LokiJS-orange.svg)](https://github.com/techfort/LokiJS)

<p align="center">
  <strong>Transform decision-making from tedious spreadsheets into engaging 5-second games</strong>
</p>

---

## About

**O(1)** (pronounced "Oh-One") is a React Native mobile application that gamifies decision-making using psychology-backed engagement mechanisms. The name comes from computer science notation representing **constant time complexity** - every decision takes O(1) time, regardless of how complex the choice.

Instead of traditional pros/cons lists or spreadsheets, users swipe through Tinder-style tournament brackets, earn points for speed, maintain daily streaks, and bet points on following through with their decisions.

### Why This Matters

Decision fatigue is real. This app uses **behavioral psychology** to make deciding feel fun instead of exhausting:
- **Loss aversion**: Streaks create fear of breaking them (-100 point penalty)
- **Commitment devices**: Betting points forces follow-through (honor system)
- **Immediate rewards**: Points burst animations on every completion
- **Urgency mechanisms**: 60-second timer prevents overthinking
- **Randomize escape valve**: "Can't decide?" button picks for you

---

## Key Features

### Core Mechanics
- **Tournament Mode**: Multi-round bracket elimination (Option A vs B → winner vs C → final choice)
- **Quick Choice**: Fast binary decisions with split-screen swipe interface
- **Decision Templates**: One-tap templates for common decisions (Lunch, Workout, Weekend, Coffee, Evening, Work Focus)
- **Randomize Button**: Escape valve for indecision - picks random winner

### Gamification
- **Points System**: Earn points based on decision speed (+100 pts for <10s, penalties for timeouts)
- **Streak Tracking**: Daily decision streaks with fire emoji badge (🔥 14 Day Streak)
- **Accountability Betting**: Bet 25/50/100 points on following through with your decision
- **60-Second Timer**: Creates urgency with haptic feedback at milestones (30s, 10s, 5s warnings)

### User Experience
- **Decision History**: Timeline of all past decisions with stats, filtering, and pending bet resolution
- **Offline-First**: All features work without internet (sub-100ms interactions)
- **60fps Animations**: Physics-based swipe gestures with haptic feedback
- **Zero Loading Spinners**: Instant interactions, local database persistence

---

## Tech Stack

### Mobile Framework
- **React Native 0.81.5** with **Expo ~54.0** (cross-platform iOS/Android)
- **TypeScript 5.9.2** (strict mode, 100% typed)
- **Expo Router** (file-based navigation)

### State & Data
- **LokiJS 1.5.12** - Fast in-memory database with AsyncStorage persistence
- **Zustand 5.0.9** - Lightweight state management
- **AsyncStorage** - Persistent storage for points/bets

### Animations & Gestures
- **react-native-reanimated 4.1.1** - 60fps animations on UI thread
- **react-native-gesture-handler 2.29.1** - Native gesture recognition
- **expo-haptics** - Tactile feedback on swipes/milestones
- **expo-linear-gradient** - Vibrant card gradients

---

## Architecture Highlights

### Offline-First Design
All interactions work instantly without network:
- Database writes in <50ms
- Database reads in <20ms
- Zero loading spinners
- Cloud sync planned for Phase 3 (background process)

### Performance Benchmarks

| Metric | Target | Achieved |
|--------|--------|----------|
| Card swipe response | <100ms | ✅ <100ms |
| Database write | <100ms | ✅ <50ms |
| Database read | <100ms | ✅ <20ms |
| Animation frame rate | 60fps | ✅ 60fps |
| Haptic latency | <100ms | ✅ <50ms |

### Clean Architecture
- **Service layer**: `DecisionService`, `PointsService`, `BettingService`, `StreakService`
- **Type safety**: 100% TypeScript with strict mode (no `any` types)
- **Error handling**: Try/catch blocks, graceful fallbacks
- **Separation of concerns**: Models, services, components clearly divided

---

## Project Structure

```
decisionCoach/
├── flow-app/                         # Main React Native app
│   ├── app/                          # Expo Router screens
│   │   ├── index.tsx                 # Splash/landing screen
│   │   ├── home.tsx                  # Main dashboard with templates
│   │   ├── tournament.tsx            # Multi-round elimination voting
│   │   ├── quick-choice.tsx          # Binary A vs B decisions
│   │   ├── create-decision.tsx       # Custom decision form
│   │   ├── history.tsx               # Past decisions timeline
│   │   └── _layout.tsx               # Root navigation
│   ├── components/
│   │   ├── BottomNav.tsx             # 3-tab navigation
│   │   ├── DecisionTimer.tsx         # 60s countdown
│   │   ├── PointsAnimation.tsx       # Celebratory burst effect
│   │   ├── PointsDisplay.tsx         # Real-time point counter
│   │   ├── RandomizeButton.tsx       # "Can't decide?" picker
│   │   └── StreakBadge.tsx           # Fire emoji streak counter
│   ├── services/
│   │   ├── DecisionService.ts        # CRUD for decisions
│   │   ├── PointsService.ts          # Points economy
│   │   ├── BettingService.ts         # Follow-through accountability
│   │   └── StreakService.ts          # Daily streak tracking
│   ├── models/
│   │   ├── database.ts               # LokiJS initialization
│   │   └── schema.ts                 # WatermelonDB schema (future)
│   └── constants/
│       ├── theme.ts                  # Design system
│       └── brand.ts                  # O(1) branding
├── INTERVIEW_PREP.md                 # Study guide for interviews
├── PROGRESS.md                       # Development roadmap
├── FEATURES_BACKLOG.md               # Future features
└── README.md                         # This file
```

---

## Installation & Setup

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/decisionCoach.git
cd decisionCoach/flow-app

# Install dependencies
npm install

# Start development server
npm start
```

**Scan QR code** with Expo Go app to launch on your phone.

### Alternative Commands
```bash
npm run android   # Launch on Android emulator
npm run ios       # Launch on iOS simulator (macOS only)
npm run web       # Launch in web browser
```

---

## Usage Examples

### 1. Quick Template Decision (5 seconds)
1. Tap **LUNCH** template on home screen
2. Auto-loads 5 lunch options from local database
3. Swipe through tournament brackets (Pizza vs Salad → winner vs Burger)
4. Winner announced with confetti animation
5. Earn +100 points for fast decision (<10s)

### 2. Custom Decision with Betting
1. Tap **Create Decision**
2. Enter question: "Should I go to the gym?"
3. Add options: "Workout now", "Rest today", "Go later"
4. Complete tournament mode by swiping
5. Bet 50 points on follow-through
6. Resolve bet tomorrow in History tab (honor system)

### 3. Quick Binary Choice
1. Tap **Quick Choice** on home screen
2. Enter two options (e.g., "Coffee" vs "Skip")
3. Swipe left (❌) or right (✅) to choose instantly
4. Earn points based on speed (no tournament rounds)

---

## Key Technical Implementations

### 1. Tournament Bracket Algorithm
Generates dynamic elimination rounds, handles odd numbers of options with "byes", tracks state across multiple rounds.

**Example**: `[A, B, C, D, E]` →
Round 1: `[A vs B, C vs D]` →
Round 2: `[winner1 vs E]` →
Final: `[winner2]`

### 2. Swipe Gesture System (60fps)
Physics-based card animations using `react-native-reanimated` worklets:
- Runs on UI thread (no JS bridge bottleneck)
- Interpolated opacity/rotation based on translateX
- Haptic feedback when threshold crossed
- Spring physics on snap-back if cancelled

### 3. Points Economy
Transaction-based system with automatic calculations:
- `<10s` → +100 pts (lightning fast)
- `10-30s` → +50 pts (quick)
- `30-60s` → +25 pts (standard)
- `>60s` → +10 pts (overtime)
- Timeout → -50 pts penalty
- Broke streak → -100 pts

### 4. Offline-First Database
All operations write to LokiJS in-memory, then persist to AsyncStorage:
- Zero network required for any feature
- Sub-50ms writes, sub-20ms reads
- Migration path to WatermelonDB planned (Phase 3)

---

## Design System

### Brand Identity
**"Arcade Cabinet meets Swiss Design"**
- Chunky 4px borders, heavy shadows
- Racing stripe corner accents
- Monospace fonts for stats/timers
- Press animations (scale: 0.96)

### Color Palette
```typescript
background: '#0F0F0F'    // Deep charcoal
primary: '#2A5F6F'       // Deep teal
secondary: '#7A6B8F'     // Soft lila
text: '#F0F0F2'          // Mist white

// Category colors
lunch: '#FF6B35'         // Electric orange
workout: '#00E676'       // Neon green
weekend: '#00B8D4'       // Cyber blue
coffee: '#FFD600'        // Lightning yellow
```

---

## Development Roadmap

### ✅ Phase 0 - Personal Prototype (COMPLETED)
- Tournament mode with swipe gestures
- LokiJS offline storage
- Decision templates (6 pre-built)
- Points system with animations
- 60-second timer with haptics
- Betting system
- Streak tracking
- Decision history timeline

### 🔮 Phase 1-2 - Voice System (Planned)
- Multiple internal personas (Disciplined Me, Lazy Me, Future Me, Budget Me)
- Voice voting on decision factors
- Time-based voice weighting (e.g., Disciplined Me gets 2x weight in mornings)
- Voice templates (pre-configured personalities)

### 🔮 Phase 3 - Database Evaluation (Planned)
- Evaluate LokiJS performance with real usage data
- Consider WatermelonDB migration if needed
- Database optimization (indexing, query performance)
- Background sync architecture
- Cloud sync (Supabase)

### 🔮 Future Phases
- AI voice generation (Claude/GPT API)
- Calendar/location integration
- Anticipatory notifications ("11:30 AM = lunch decision")
- Social features (Decision Buddy mode)
- Analytics dashboard

---

## Code Quality

### TypeScript Strictness
- ✅ Strict mode enabled (no implicit `any`)
- ✅ 100% typed interfaces for all data structures
- ✅ Type guards for runtime validation
- ✅ Explicit return types for all functions

### Performance Optimizations
- ✅ React.memo for expensive components
- ✅ useCallback to prevent function re-creation
- ✅ Reanimated worklets (UI thread animations)
- ✅ Lazy loading for heavy components
- ✅ LokiJS indexing for fast queries

### Testing Strategy
- Unit tests for business logic (bracket generation, points calculation)
- Integration tests for database operations
- Manual testing on physical devices (iOS + Android)
- Performance validation with Reanimated debug mode

---

## What Makes This Special

### 1. Psychology-Driven Design
Every feature backed by behavioral psychology research:
- Loss aversion (Kahneman & Tversky)
- Commitment devices (BJ Fogg)
- Hook model (Nir Eyal)
- Dopamine-driven engagement

### 2. Offline-First Philosophy
Built for instant interactions:
- Zero loading spinners
- Sub-100ms database operations
- Works in airplane mode, subway tunnels
- Cloud sync optional (background process)

### 3. Performance Obsession
- 60fps animations (no jank)
- <100ms swipe response time
- Memoization, lazy loading, virtualization
- Profiled with React DevTools

### 4. Clean Architecture
- Service layer abstraction
- Separation of concerns
- No `any` types, no commented code, no dead code
- Migration path to WatermelonDB planned

---

## Why I Built This

**Problem**: Decision fatigue drains mental energy. Traditional tools (spreadsheets, pros/cons lists) make deciding *more* tedious.

**Solution**: Turn decision-making into an addictive 5-second game using gamification psychology.

**Validation**: I used this app 5+ times daily for weeks to validate the core concept works. If the creator doesn't naturally reach for the app, it needs iteration.

**Portfolio Goal**: Demonstrate production-quality React Native development with:
- Offline-first architecture
- 60fps animations
- Clean TypeScript
- Psychology-driven UX
- Scalable service layers

---

## Contributing

This is a personal portfolio project, but feedback is welcome! If you have suggestions:
1. Open an issue describing the idea
2. Reference relevant psychology research if applicable
3. Consider the "build for personal use first" philosophy

---

## License

MIT License - see LICENSE file for details

---

## Contact

**Developer**: Your Name
**Email**: your.email@example.com
**LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
**Portfolio**: [yourportfolio.com](https://yourportfolio.com)

---

## Acknowledgments

- **Inspiration**: Decision fatigue research, Tinder's swipe UX, Duolingo's gamification
- **Psychology**: Kahneman & Tversky (loss aversion), BJ Fogg (behavior design), Nir Eyal (Hook model)
- **Community**: React Native community, Expo team, TypeScript evangelists

---

**Built with an obsession for eliminating decision fatigue** ⚡
