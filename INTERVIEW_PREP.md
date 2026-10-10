# O(1) Decision Coach - Interview Preparation Guide

> **Your go-to study guide** for explaining this project in React Native job interviews.

---

## Quick Elevator Pitch (30 seconds)

**"I built O(1) Decision Coach, a gamified decision-making mobile app using React Native and Expo. The name comes from computer science notation - decisions happen in constant time, regardless of complexity. I turned the boring pros/cons list into an addictive Tinder-style swipe game with tournament brackets, points, streaks, and accountability betting. The app is fully offline-first, with sub-100ms interactions using LokiJS, Reanimated animations at 60fps, and a psychology-backed gamification system. I built it to solve my own decision fatigue and validated it works by using it 5+ times daily for weeks."**

---

## Project Overview

### What Problem Does It Solve?
**Decision fatigue** - the mental exhaustion from making too many choices. Traditional tools (spreadsheets, pros/cons lists) make deciding *more* tedious. I wanted an app that makes deciding *fun*, like a 5-second game.

### Why React Native?
- **Cross-platform**: One codebase for iOS + Android
- **Performance**: 60fps animations with native modules
- **Developer experience**: Expo for instant testing via QR code
- **Career goal**: I want to work professionally with React Native, so I built a production-quality portfolio project

---

## Technical Architecture

### Tech Stack Breakdown

| Layer | Technology | Why This Choice? |
|-------|-----------|------------------|
| **Framework** | React Native 0.81.5 | Industry-standard cross-platform framework |
| **Build Tool** | Expo ~54.0 | Faster development, OTA updates, simplified deployment |
| **Language** | TypeScript 5.9.2 (strict) | Type safety, better IDE support, enterprise-ready |
| **Database** | LokiJS 1.5.12 | Offline-first, 20ms reads, Expo Go compatible, simple migration path |
| **State** | Zustand 5.0.9 | Lightweight (3KB), minimal boilerplate vs Redux |
| **Animations** | react-native-reanimated 4.1.1 | Runs on UI thread (60fps), no JS bridge bottleneck |
| **Gestures** | react-native-gesture-handler 2.29.1 | Native gesture recognition, built for Reanimated |
| **Navigation** | Expo Router | File-based routing (Next.js-style), deep linking support |
| **Persistence** | AsyncStorage | Simple key-value store for points/bets |

---

## Architecture Decisions (Be Ready to Defend These!)

### 1. **Why LokiJS instead of WatermelonDB?**

**Interviewer might ask:** "Why not use WatermelonDB, which is built for React Native?"

**Answer:**
- **Prototyping speed**: LokiJS has zero native modules, works instantly in Expo Go. WatermelonDB requires custom dev client builds (adds 30-60 min to iteration cycle).
- **Sufficient performance**: Measured <20ms reads, <50ms writes for single-user use case. No scaling bottleneck yet.
- **Migration path**: Both are installed. I can migrate to WatermelonDB when I add cloud sync or multi-user features (Phase 3 roadmap).
- **Real-world pragmatism**: Ship fast, optimize later. I validated the core concept first before over-engineering.

**Key insight to mention**: "I prioritized iteration speed over theoretical performance. For a single-user offline app, LokiJS was the right choice. If this were a multi-user chat app, I'd choose WatermelonDB from day one."

---

### 2. **Why Offline-First?**

**Answer:**
- **User experience**: 87% of users abandon apps with 2-second delays (cite research). Every interaction feels instant.
- **Real-world usage**: People make decisions in subway tunnels, airplanes, rural areas - network can't be a dependency.
- **Technical challenge**: Demonstrates understanding of sync complexity, eventual consistency, conflict resolution (planned for Phase 3).

**Example:** "When you swipe a card, it writes to LokiJS in <50ms, then persists to AsyncStorage asynchronously. No spinners, no waiting. Cloud sync will happen in the background when I add it."

---

### 3. **Why Zustand over Redux/Context?**

**Answer:**
- **Simplicity**: No boilerplate (actions, reducers, providers). Just `create()` and `useStore()`.
- **Performance**: Built-in selectors prevent unnecessary re-renders. `useStore(state => state.points)` only re-renders when points change.
- **Size**: 3KB vs Redux's 9KB + Redux Toolkit's 40KB.
- **Modern**: Zustand embraces hooks, while Redux still feels class-component era.

**When to use Redux instead:** "If I needed time-travel debugging, middleware ecosystems (sagas, thunks), or Redux DevTools integration. For this app's scope, Zustand is perfect."

---

## Key Features & Implementations

### 1. **Tournament Mode** (Most Complex Feature)

**How it works:**
1. User creates decision with 3-5 options
2. App generates bracket matchups (binary elimination)
3. User swipes left/right to vote (Option A vs Option B)
4. Winner advances, loser eliminated
5. Multi-round until final winner

**Technical highlights:**
- **Bracket generation algorithm**: Handles odd numbers with "byes" (e.g., 5 options → Round 1: A vs B, C vs D, then winners vs E → Final)
- **State management**: Tracks current round, current matchup, past winners
- **Gesture detection**: `Gesture.Pan()` with threshold detection (30% screen width = swipe trigger)
- **Physics animations**: Interpolated opacity/rotation based on `translateX` value

**Code snippet to memorize:**
```typescript
// services/DecisionService.ts
generateBrackets(options: string[]): Round[] {
  // Creates tournament tree
  // Example: [A,B,C,D,E] → [[A,B],[C,D]] → [winner1, E] → [final winner]
}
```

---

### 2. **Swipe Gesture System** (60fps Performance)

**Technical approach:**
- Uses `react-native-reanimated` worklets (runs on UI thread, not JS thread)
- Shared values (`useSharedValue`) for animated translateX/rotation/opacity
- Haptic feedback with `expo-haptics` when threshold crossed
- Spring physics on snap-back if swipe cancelled

**Why 60fps matters:**
"On the JS thread, animations can drop to 30fps during bridge communication. By using Reanimated worklets, the animation runs natively at 60fps even if JS is busy. This is critical for swipe gestures to feel responsive."

**Performance benchmark:**
- Swipe response time: <100ms (measured)
- Animation frame rate: 60fps (validated with Reanimated debug mode)

**Code pattern:**
```typescript
const gesture = Gesture.Pan()
  .onChange((e) => {
    translateX.value = e.translationX; // Runs on UI thread
    opacity.value = interpolate(translateX.value, [-200, 0, 200], [0.3, 1, 0.3]);
  })
  .onEnd(() => {
    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
      runOnJS(handleSwipeComplete)(); // Bridge to JS only at the end
    }
  });
```

---

### 3. **Points Economy System** (Gamification)

**How it works:**
- Earn points based on decision speed:
  - `<10s` → +100 pts (lightning fast)
  - `10-30s` → +50 pts (quick)
  - `30-60s` → +25 pts (standard)
  - `>60s` → +10 pts (overtime)
  - Timeout → -50 pts penalty
  - Broke streak → -100 pts

**Why this matters (psychology):**
- **Immediate rewards**: Dopamine hit on every decision
- **Loss aversion**: Fear of losing points creates urgency
- **Milestones**: 500pts, 1000pts, 2500pts unlock achievements
- **Commitment device**: Betting points on follow-through forces accountability

**Implementation:**
- `PointsService.ts` manages economy
- Transaction log for history/debugging
- AsyncStorage persistence (simple key-value)
- Subscribe pattern for real-time UI updates

**Example:**
```typescript
// services/PointsService.ts
calculateDecisionPoints(timeInSeconds: number): number {
  if (timeInSeconds < 10) return 100;
  if (timeInSeconds < 30) return 50;
  if (timeInSeconds < 60) return 25;
  return 10;
}
```

---

### 4. **Betting System** (Accountability Mechanism)

**How it works:**
1. After decision, user bets 25/50/100 points on follow-through
2. Tomorrow, resolve bet in History tab (honor system)
3. Completed → win bet amount back + bonus
4. Skipped → lose bet amount

**Why honor system?**
- No external verification needed (gym check-ins, calendar scraping)
- Relies on **loss aversion psychology** - users punish themselves for lying
- Simpler MVP, can add verification later (Phase 9: Calendar integration)

**Data structure:**
```typescript
interface DecisionBet {
  id: string;
  decisionId: string;
  question: string;
  winner: string;
  amount: number;
  placedAt: number;
  status: 'pending' | 'completed' | 'skipped';
  resolvedAt?: number;
}
```

---

### 5. **60-Second Timer** (Urgency Mechanism)

**How it works:**
- Countdown starts when tournament begins
- Visual progress bar animates
- Haptic feedback at milestones (30s, 10s, 5s)
- Timeout penalty (-50 pts)

**Why 60 seconds?**
- Research shows: optimal decision time for low-stakes choices is 30-60s
- Longer → overthinking, paralysis
- Shorter → rushed, regretful
- 60s creates urgency without panic

**Technical implementation:**
- `DecisionTimer.tsx` component
- `useEffect` with `setInterval` (1000ms)
- `expo-haptics` for notifications
- Reanimated progress bar animation

---

## Database Schema & Services

### LokiJS Collections

```typescript
// models/database.ts

Collection: decisions
{
  id: string,              // UUID
  question: string,
  options: string[],
  winner: string,
  runnerUp: string,
  method: 'tournament' | 'factor_swiping',
  category: string,        // 'Lunch', 'Workout', etc.
  durationMs: number,
  completed: boolean,
  createdAt: number,       // Unix timestamp
  updatedAt: number
}

Collection: option_pools (pre-seeded templates)
{
  id: string,
  category: string,        // 'Food/Lunch', 'Weekend', etc.
  options: string[]        // ['Pizza', 'Salad', 'Burger', ...]
}

Collection: user_stats (streaks)
{
  id: string,
  current_streak: number,
  longest_streak: number,
  last_decision_date: number
}
```

### Service Layer Pattern

**Why service layer?**
- **Separation of concerns**: UI components don't know about LokiJS internals
- **Testability**: Can mock `DecisionService` for unit tests
- **Migration path**: When I switch to WatermelonDB, only service layer changes
- **Error handling**: Centralized try/catch blocks

**Example:**
```typescript
// services/DecisionService.ts
export class DecisionService {
  static async createDecision(data: CreateDecisionInput): Promise<Decision> {
    try {
      const collection = db.getCollection('decisions');
      const decision = {
        id: uuid(),
        ...data,
        createdAt: Date.now(),
        completed: false
      };
      collection.insert(decision);
      db.saveDatabase(); // Persist to AsyncStorage
      return decision;
    } catch (error) {
      logger.error('Failed to create decision', { error });
      throw error;
    }
  }
}
```

---

## Performance Optimizations

### What I Measured & Why

| Metric | Target | Achieved | How I Measured |
|--------|--------|----------|----------------|
| Swipe response | <100ms | ✅ <100ms | `console.time()` in gesture handlers |
| DB read | <100ms | ✅ <20ms | LokiJS query timing |
| DB write | <100ms | ✅ <50ms | LokiJS insert timing |
| Animation FPS | 60fps | ✅ 60fps | Reanimated debug mode overlay |
| Haptic latency | <100ms | ✅ <50ms | Manual testing, user perception |

### Optimization Strategies Used

1. **Memoization**: `React.memo()` on expensive components (card lists)
2. **useCallback**: Prevent function re-creation in renders
3. **Reanimated worklets**: Move animations to UI thread
4. **Lazy loading**: Heavy components load on-demand
5. **LokiJS indexing**: `.ensureIndex('timestamp')` for fast queries

**Example to mention:**
"I profiled with React DevTools Profiler and found the PointsDisplay component was re-rendering 60 times/second during animations. I wrapped it in `React.memo()` with a custom equality function - now it only updates when points actually change."

---

## Design System

### Brand Identity
**"Arcade Cabinet meets Swiss Design"**

Why this aesthetic?
- **Arcade**: Gamification, fun, nostalgic
- **Swiss Design**: Clean, minimal, high contrast
- **Result**: Playful but professional

### Color Palette

```typescript
// constants/theme.ts
export const colors = {
  background: '#0F0F0F',    // Deep charcoal (arcade cabinet)
  primary: '#2A5F6F',       // Deep teal (calm, trustworthy)
  secondary: '#7A6B8F',     // Soft lila (creative, unique)
  text: '#F0F0F2',          // Mist white (high contrast)
  border: '#2F2F35',        // Minimal mist (subtle separation)

  // Category colors (high energy)
  lunch: '#FF6B35',         // Electric orange
  workout: '#00E676',       // Neon green
  weekend: '#00B8D4',       // Cyber blue
  coffee: '#FFD600',        // Lightning yellow
};
```

**Why these colors?**
- High contrast for accessibility (WCAG AA compliance)
- Vibrant accents for dopamine hits (gamification psychology)
- Dark mode default (battery-friendly on OLED screens)

---

## Code Quality & Best Practices

### TypeScript Strictness
- **Strict mode enabled**: No implicit `any` types
- **100% typed**: All functions have explicit return types
- **Type guards**: Runtime validation with `typeof`, `in` checks
- **Discriminated unions**: For state machines (tournament rounds)

**Example:**
```typescript
// Good - explicit typing
interface CreateDecisionInput {
  question: string;
  options: string[];
  category: string;
}

function createDecision(data: CreateDecisionInput): Decision {
  // Implementation
}

// Bad - implicit any
function createDecision(data) {
  // Don't do this!
}
```

### Error Handling Pattern
- **Always try/catch** for async operations (DB, API)
- **Graceful fallbacks**: If DB fails, show cached data
- **User-friendly messages**: "Something went wrong" not "Error: null.insert()"

**Example:**
```typescript
try {
  const decision = await DecisionService.createDecision(data);
  navigation.navigate('tournament', { decisionId: decision.id });
} catch (error) {
  console.error('Failed to create decision:', error);
  Alert.alert('Oops!', 'Could not create decision. Please try again.');
}
```

### Performance Anti-Patterns Avoided
- ❌ No inline function definitions in render
- ❌ No `JSON.parse/stringify` in hot paths
- ❌ No `Math.random()` for React keys (use stable UUIDs)
- ❌ No `Animated` API (old, JS-thread only) - use Reanimated
- ❌ No `PanResponder` (old gesture API) - use gesture-handler

---

## Challenges & Solutions

### Challenge 1: Swipe Gesture Conflicts with ScrollView

**Problem:** Tournament screen has scrollable content, but swipe gestures were conflicting with scroll.

**Solution:**
- Used `simultaneousGestures()` from gesture-handler
- Added Y-axis threshold (if vertical movement > 20px, treat as scroll, not swipe)
- Disabled vertical scroll while actively swiping card

**Code:**
```typescript
const panGesture = Gesture.Pan()
  .onChange((e) => {
    if (Math.abs(e.translationY) > 20) {
      // User is scrolling, not swiping card
      return;
    }
    translateX.value = e.translationX;
  });
```

---

### Challenge 2: Timer Continuing After Screen Navigation

**Problem:** If user navigated away mid-decision, timer kept running in background.

**Solution:**
- Used `useFocusEffect` from React Navigation to pause/resume timer
- Cleanup `setInterval` in `useEffect` return function
- Store elapsed time in component state, resume on return

**Code:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setTimeRemaining((prev) => Math.max(0, prev - 1));
  }, 1000);

  return () => clearInterval(interval); // Cleanup on unmount
}, []);
```

---

### Challenge 3: Database Persistence Failures

**Problem:** LokiJS would sometimes fail to save to AsyncStorage on app close.

**Solution:**
- Enabled `autosave: true` with 4-second interval
- Added manual `db.saveDatabase()` after critical operations (decision creation)
- Added error logging to catch persistence failures early

**Code:**
```typescript
const db = new loki('o1-decisions.db', {
  autosave: true,
  autosaveInterval: 4000, // Save every 4 seconds
  adapter: new LokiIndexedAdapter('loki')
});
```

---

## Future Roadmap (Show You Think Long-Term)

### Phase 1-2: Voice System
**What:** Multiple internal personas (Disciplined Me, Lazy Me, Future Me) vote on decisions
**Why:** Externalizes internal conflict, makes decisions feel collaborative
**Tech:** Time-weighted scoring algorithm, voice templates

### Phase 3: Database Migration Evaluation
**What:** Migrate to WatermelonDB if needed
**Why:** Better multi-user sync, observables for reactive UI
**Tech:** Migration scripts, schema versioning

### Phase 7-8: AI Voice Generation
**What:** LLM generates personality-based responses
**Why:** Voices say things like "bro don't buy that" vs "Based on analysis..."
**Tech:** Claude/GPT API integration, prompt engineering

### Phase 9: Context Ingestion
**What:** Calendar, location, weather integration
**Why:** Anticipatory decisions ("11:30 AM = lunch decision")
**Tech:** Google Calendar API, geofencing, weather API

### Phase 10: Social Features
**What:** Decision Buddy mode (invite friend to vote)
**Why:** Collaborative decisions, accountability partner
**Tech:** Real-time sync (Supabase), WebSockets

---

## Testing Strategy

### What I Test
- **Unit tests**: Business logic (voice scoring, bracket generation)
- **Integration tests**: Database operations (CRUD flows)
- **Manual testing**: Physical device (iPhone + Android) for gestures/haptics
- **Performance tests**: Reanimated debug mode for 60fps validation

### What I Would Add
- **E2E tests**: Detox or Appium for full user flows
- **Snapshot tests**: Jest snapshots for component rendering
- **Load tests**: 1000+ decisions in DB to test query performance

---

## Questions You Might Get Asked

### "Why build this instead of using an existing app?"

**Answer:**
"I wanted to solve my own decision fatigue, but more importantly, I wanted a production-quality portfolio project that demonstrates:
1. **Mobile expertise**: React Native, Expo, native animations
2. **Offline-first architecture**: Complex sync/persistence patterns
3. **Psychology-driven design**: Gamification, behavioral economics
4. **Performance obsession**: Sub-100ms interactions, 60fps animations
5. **Clean architecture**: Service layers, TypeScript, error handling

Existing decision apps are either too clinical (spreadsheets) or too simple (coin flips). I built something in between - fun but functional."

---

### "How would you scale this to 10,000 users?"

**Answer:**
"Right now it's single-user offline. For 10K users, I'd:

1. **Backend**: Add Node.js + PostgreSQL API for cloud storage
2. **Sync**: Migrate to WatermelonDB for built-in sync primitives
3. **Auth**: Expo SecureStore for tokens, Supabase Auth for providers
4. **Real-time**: WebSockets for collaborative decisions (Decision Buddy mode)
5. **Caching**: Redis for hot data (leaderboards, trending decisions)
6. **CDN**: Cloudflare for static assets (avatars, achievement icons)
7. **Monitoring**: Sentry for crash reports, Mixpanel for analytics
8. **Cost optimization**: PostgreSQL RLS for row-level security, minimize API calls

**Migration strategy**: Phase 3 of my roadmap is specifically for this evaluation. I'd A/B test with 100 beta users first."

---

### "What's your favorite part of the codebase?"

**Answer:**
"The swipe gesture system in `app/tournament.tsx`. It's 150 lines that demonstrate:
- **Reanimated worklets** for 60fps performance
- **Physics-based animations** (spring, interpolation)
- **Haptic feedback** for tactile confirmation
- **Gesture detection** with thresholds
- **State management** (Zustand) for decision flow

It's the core interaction that makes the app addictive. Users literally feel the decision in their hands."

---

### "What would you change if you rebuilt this?"

**Answer:**
"I'd start with:
1. **WatermelonDB from day one** - I now know the migration path, might as well use the better tool
2. **Unit tests earlier** - I focused on features first, tests second. Would reverse that.
3. **Design system tokens** - I hardcoded colors. Would use a theme provider with tokens from the start.
4. **Storybook** - Component library documentation for UI components
5. **Analytics from day one** - I added it late. Should track user behavior from launch.

But honestly? The iterative approach worked. I validated the concept before over-engineering."

---

## Key Talking Points to Emphasize

1. **"I ship fast, optimize later"** - LokiJS decision shows pragmatism
2. **"I built it for myself first"** - Validated by daily usage (5+ times/day)
3. **"Performance is a feature"** - Sub-100ms interactions, 60fps animations
4. **"Psychology drives engagement"** - Loss aversion, commitment devices, dopamine hits
5. **"Offline-first for UX"** - No loading spinners, instant interactions
6. **"Clean architecture for scale"** - Service layers, TypeScript, migration paths
7. **"I measure everything"** - Profiling, benchmarks, user testing
8. **"I think long-term"** - Roadmap to Phase 12, designed for scale

---

## Practice Demo Flow (2 minutes)

**Start:** "Let me walk you through the app."

1. **Open home screen**: "6 pre-built templates for zero-friction decisions."
2. **Tap LUNCH**: "One tap loads 5 options instantly from local database."
3. **Swipe through tournament**: "Tinder-style swipe, 60fps animations, haptic feedback."
4. **Show timer**: "60-second countdown creates urgency, penalties for timeout."
5. **Winner screen**: "Confetti animation, points awarded based on speed."
6. **Show betting**: "Bet 50 points on follow-through - accountability mechanism."
7. **History tab**: "All past decisions, stats, pending bets to resolve."
8. **Randomize button**: "Escape valve for indecision - picks randomly."

**End:** "All of this works offline, sub-100ms interactions, zero loading spinners. That's the core UX principle - deciding should feel instant."

---

## Resources to Review Before Interview

- **React Native docs**: https://reactnative.dev/
- **Reanimated docs**: https://docs.swmansion.com/react-native-reanimated/
- **LokiJS docs**: https://github.com/techfort/LokiJS
- **Expo docs**: https://docs.expo.dev/
- **Zustand docs**: https://github.com/pmndrs/zustand

---

## Final Confidence Boosters

**You built:**
- ✅ A production-quality React Native app from scratch
- ✅ Offline-first architecture with database persistence
- ✅ 60fps animations with Reanimated worklets
- ✅ Psychology-backed gamification system
- ✅ Clean TypeScript codebase (strict mode, zero `any`)
- ✅ Service layer abstraction for scalability
- ✅ Real-world validation (daily personal usage)

**You can explain:**
- ✅ Why you chose each technology
- ✅ How you optimized for performance
- ✅ What you'd change if you rebuilt it
- ✅ How you'd scale to 10K users
- ✅ The psychology behind your design decisions

**You are ready.** Go nail that interview! 🚀
