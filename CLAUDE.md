# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**O(1)** (pronounced "Oh-One") is an anticipatory decision-making mobile application built with React Native. The name represents the computer science concept of constant time complexity - decisions are made instantly, regardless of complexity. The app presents users with binary choices before they ask, uses swipeable factor cards instead of spreadsheets, and externalizes internal voices (Disciplined Me vs Lazy Me) to make decisions feel like a 5-second game.

**Brand Positioning:** "Decide in Constant Time" - Every decision takes O(1) time, not O(n).

### Core Philosophy

Build for personal use first. If it works for daily use by the creator, it will work for others. The app must be addictive enough to use 5+ times per day.

## Tech Stack

### Mobile App
- **Framework:** React Native with Expo
- **Language:** TypeScript (strict typing for complex voice logic)
- **Database:** LokiJS (initial development) → WatermelonDB (migration planned for Phase 3 after personal testing)
- **Animations:** Rive (for interactive state machine animations - mascot eye tracking, not Lottie)
- **State Management:** Zustand (lightweight)
- **Gestures:** react-native-reanimated + react-native-gesture-handler
- **Haptics:** expo-haptics
- **Navigation:** Expo Router (file-based routing)

### Backend (Later Phases)
- **API:** Node.js + Express OR Python FastAPI
- **Database:** PostgreSQL
- **Cache:** Redis
- **Real-time:** Supabase Realtime or WebSockets
- **AI/ML:** OpenAI/Claude API for voice generation

### Key Integrations (Post-MVP)
- Calendar API (Google Calendar, iOS Calendar)
- Location Services (geofencing)
- Weather API
- Push Notifications (Expo Notifications)
- Payments (RevenueCat)

## Architecture Principles

### 1. Offline-First Architecture
- All interactions must work offline immediately
- Write to local database first (LokiJS initially, WatermelonDB after migration), sync to cloud later
- No loading spinners (87% of abandonments happen during 2-sec delays)
- Target: Sub-100ms interaction times
- Background sync only when internet available

**Database Strategy:**
- **Phase 0-2:** Use LokiJS for rapid prototyping and personal testing
  - Simpler setup, easier debugging
  - Sufficient for single-user offline storage
  - Focus on validating core features and usage patterns
- **Phase 3:** Evaluate performance and consider WatermelonDB migration
  - Migrate when scaling requirements become clear
  - Only migrate if performance bottlenecks are identified
  - Migration triggered by: multi-user needs, complex sync requirements, or performance issues

### 2. Anticipatory UX System
The app generates decisions BEFORE the user asks, using:
- **Time patterns:** "11:30 AM = lunch decision"
- **Location context:** "Near gym + 6 PM = workout decision"
- **Calendar events:** "Meeting in 30 mins = coffee or nap?"
- **Weather data:** "Raining = different lunch options"
- **Behavioral patterns:** Learn when user is weak, disciplined, or needs a push

### 3. Multiple Voices System
The core differentiator. Users create 3-5 internal personas:
- **Disciplined Me:** Strict, goal-focused, long-term thinking
- **Lazy Me:** Comfort-seeking, rest-focused
- **Future Me:** Consequences-focused
- **Budget Me:** Money-conscious
- **Chaotic Me:** YOLO energy

Each voice "votes" on decision factors with weighted influence based on:
- User-configured priority
- Time of day (e.g., Disciplined Me gets 2x weight in mornings)
- Context (e.g., Lazy Me gets 0.5x weight late at night)

### 4. Factor-Based Swiping (Not Option-Based)
Instead of choosing between "Option A vs B", users swipe on micro-factors:
- "You haven't treated yourself in 10 days" → Swipe right (yes, this matters)
- "Your budget is tight this week" → Swipe left (no, ignore this)
- "Most people regret this purchase" → Swipe right (yes, consider this)

The app aggregates swipes to make final decision.

## Development Phases

### Phase 0 (Week 1): Personal Prototype
- Manual decision entry only (no AI)
- Tournament-style elimination (Option A vs B, winner vs C)
- Factor-based swiping
- LokiJS offline storage (simple, fast setup for prototyping)
- **Success criteria:** Use it 5+ times per day

### Phase 1-2 (Weeks 2-3): Voice System
- Manual voice configuration (no AI yet)
- Voice voting on factors
- Time-based voice weighting
- Voice templates (pre-configured personalities)

### Phase 3 (Week 4): Database Evaluation & Offline-First Polish
- **Migration Checkpoint:** Evaluate LokiJS performance with real usage data
- Consider WatermelonDB migration if needed (only if performance issues identified)
- Database optimization (indexing, query performance)
- Zero loading states
- Background sync architecture
- Optimistic UI updates

### Phase 4-5 (Weeks 5-6): Anticipatory Engine (Basic)
- Time-based triggers (hardcoded initially)
- Push notifications with binary choices
- Deep links from notifications
- Pattern tracking

### Phase 6 (Week 7): Psychology Hacks
- Default timer with countdown
- Auto-choose if no swipe (loss aversion)
- Decision betting (stake points on streaks)
- Points/avatar system

### Phase 7-8 (Weeks 8-9): AI Voice Generation
- LLM API integration (Claude/GPT)
- Personality-based response generation
- Conversational tone ("bro don't buy that" vs "Based on analysis...")
- AI-generated factor suggestions

### Phase 9 (Week 10): Context Ingestion
- Calendar integration
- Location services (geofencing)
- Weather API
- Simple ML pattern learning

### Phase 10 (Week 11): Collaborative Modes
- Decision Buddy invites
- Real-time sync
- Democracy vs veto voting modes

### Phase 11-12 (Weeks 12-13): Polish & Beta
- Voice/photo/link input
- Decision templates
- Shareable result cards
- App store assets

## Database Schema (LokiJS → WatermelonDB)

**Initial Implementation (LokiJS):**
```typescript
// Core collections for MVP (LokiJS format)

Collection: goals
- id, name, priority (1-5), created_at

Collection: routine_checks
- id, question, type (boolean/number/text), value, reset_frequency

Collection: option_pools
- id, category (Food/Weekend/Work), options (JSON array)

Collection: voices
- id, name, priority_goals (JSON), weight, phrases (JSON), time_weights (JSON)

Collection: decisions
- id, category, winner, runner_up, timestamp, voice_breakdown (JSON)

Collection: preferences
- id, category, option_name, score (wins count), last_chosen
```

**Note:** Schema structure will remain the same when migrating to WatermelonDB in Phase 3. Migration will focus on performance optimization and sync capabilities, not data model changes.

## Development Commands

Since this is a pre-development repository, there are no build commands yet. When the Expo project is initialized:

```bash
# Initialize project
npx create-expo-app@latest flow-app -t expo-template-blank-typescript

# Development
npx expo start              # Start dev server
npx expo start --tunnel     # Use tunnel for remote testing

# Testing on device
# Install Expo Go app on phone, scan QR code

# Build for testing
eas build --profile development --platform android
eas build --profile development --platform ios

# Production build
eas build --platform android
eas build --platform ios
```

## Key Implementation Notes

### Mascot Strategy
- Use ONE mascot (The Guide), not 5
- Mascot is the non-judgmental coach/referee between voices
- Implements with Rive state machine (not static images)
- Mascot reacts to swipes (eyes follow finger, emotions based on choice)

### Mascot States (Rive)
- **Idle:** Breathing, looking around
- **Anticipation:** Eyes follow user's thumb during swipe
- **Win:** Confetti, smile, jump
- **Discard:** Shrug, "meh" face
- **Concern:** If stress level is high

### Rive Integration Pattern
```typescript
// Map React Native variables to Rive State Machine
riveRef.current.setInputState("State Machine 1", "LookX", swipePosition);
riveRef.current.setInputState("State Machine 1", "Stress", stressLevel);
```

### Performance Requirements
- **Card swipe response:** <100ms
- **App open time:** <200ms
- **Notification → deep link:** <500ms
- **AI response (when added):** <3 seconds
- **No loading spinners** anywhere in core flows

### Voice Scoring Algorithm
```typescript
Score = (VoiceWeight * FactorAlignment) + ContextBonus

// Example:
// Morning (6 AM): Disciplined Me weight = 2.0
// Night (10 PM): Lazy Me weight = 0.5
// Weekend: Lazy Me weight = 1.5
```

## Design Principles

### Visual Identity
"If Tinder and Notion had a baby"
- Tinder's card UI (playful, familiar)
- Calm/Headspace color palette (soft, not overwhelming)
- Duolingo's micro-interactions (fun but not childish)
- Modern iOS/Material You aesthetics

### Animation Guidelines
- Smooth, physics-based card movements
- Subtle celebrations (elegant confetti)
- Haptic feedback on every swipe
- 60fps minimum for all interactions

### Color Scheme
- Soft gradients (not harsh neon)
- Pastel accents: green=like, red=pass, purple=maybe
- Dark mode: deep purples/blues
- Light mode: cream/off-white backgrounds

## Critical Success Metrics

### MVP Validation
- **Personal use:** 5+ decisions per day for 2 weeks straight
- **Partner test:** GF uses it 3+ times per day
- If creator doesn't use it daily, iteration required

### Beta Success (100-500 users)
- 30% complete 3+ decisions
- 20% invite at least one buddy
- 10% upgrade to premium
- 4+ star average rating
- <5% crash rate

### North Star Metric
**Weekly decisions completed per active user** (indicates engagement + value)

## Cost Structure

### Personal Use (Free)
- React Native + Expo: Free
- WatermelonDB: Free (on-device storage)
- Development: Free (Expo Go app)
- Testing with 2+ people: Free

### Beta Testing (€0-25)
- TestFlight (iOS): Free
- Google Play Developer: €25 one-time (only if publishing to store)
- Supabase free tier: Sufficient for 100 users

### Production (1000+ users)
- Supabase: €25/month
- Expo EAS: €29/month
- AI (optional): €50-100/month
- Total: €50-150/month

## Important Constraints

### What NOT to Build Initially
- ❌ AI-generated decisions (add in Phase 7-8)
- ❌ External integrations (add in Phase 9)
- ❌ Backend server (add when needed for sync)
- ❌ Anticipatory notifications (add in Phase 4-5)
- ❌ LLM-generated voices (add in Phase 7-8)

### Build Philosophy
1. Build the simplest version that YOU will use today
2. Manual configuration beats AI complexity initially
3. Hardcoded option pools before dynamic generation
4. Tournament elimination before AI recommendations
5. Validate core concept before adding intelligence

## Monetization (Future)

### Free Tier
- 5 active decisions at a time
- Up to 2 decision buddies
- Basic templates
- Ads (non-intrusive)

### Premium (€4.99/month or €39.99/year)
- Unlimited decisions
- Unlimited buddies/groups
- AI option suggestions (unlimited)
- Advanced analytics
- Custom themes
- Ad-free
- Export decisions

## Platform Strategy

**Mobile-first:** React Native app for iOS + Android
- Swipe gestures are mobile-native
- Gen Z/TikTok generation uses phones primarily
- App Store presence = discoverability
- PWA limitations (haptics, animations, monetization)

**Web dashboard:** Optional, for desktop viewing (post-launch)

## Development Rules & Guidelines

### Skill Usage

**ALWAYS use the `example-skills:frontend-design` skill for:**
- Creating new UI components
- Implementing screens and layouts
- Making design decisions (colors, spacing, typography)
- Building animations and transitions
- Implementing the card swipe interface
- Creating the mascot integration UI
- Any visual/interactive work

This saves tokens and ensures high-quality, production-grade frontend code.

### Code Quality Standards

**TypeScript:**
- Strict mode enabled at all times
- No `any` types - use proper typing or `unknown` with type guards
- Define interfaces for all data structures (Voices, Decisions, Factors, etc.)
- Use type inference where obvious, explicit types for function signatures
- Leverage discriminated unions for state management (e.g., voice types)

**Component Structure:**
- Functional components with hooks only (no class components)
- Extract custom hooks for complex logic (e.g., `useVoiceScoring`, `useSwipeGesture`)
- Keep components under 200 lines - break down larger ones
- Co-locate related files (Component.tsx, Component.styles.ts, Component.test.tsx)
- Use React.memo for expensive renders (card lists, animations)

**Code Cleanliness:**
- Remove all unused imports, variables, and functions immediately
- No commented-out code - use git for history
- No console.logs in production code - use proper logging library
- No TODO comments - create GitHub issues instead
- Delete dead code paths completely (no "backwards-compatibility hacks")

### Error Handling & Validation

**Always implement:**
- Try-catch blocks for async operations (DB queries, API calls)
- Error boundaries for component crashes
- Graceful fallbacks for missing data
- Input validation before database writes
- Type guards for runtime data validation

**LokiJS specific (Phase 0-2):**
```typescript
// Good - with error handling
try {
  const decision = decisionsCollection.findOne({ id: decisionId });
  if (decision) {
    decision.winner = option.name;
    decisionsCollection.update(decision);
    db.saveDatabase(); // Persist to file system
  }
} catch (error) {
  logger.error('Failed to update decision', { error, decisionId });
  // Show user-friendly error
}

// Use proper indexing for performance
decisionsCollection.ensureIndex('timestamp');
decisionsCollection.ensureIndex('category');
```

**WatermelonDB specific (Phase 3+, after migration):**
```typescript
// Good - with error handling
try {
  await database.write(async () => {
    await decision.update(d => {
      d.winner = option.name;
    });
  });
} catch (error) {
  logger.error('Failed to update decision', { error, decisionId: decision.id });
  // Show user-friendly error
}

// Bad - no error handling
await database.write(async () => {
  await decision.update(d => { d.winner = option.name; });
});
```

### Security Best Practices

**Mobile App Security:**
- Never store sensitive data in AsyncStorage - use Expo SecureStore
- Validate all user inputs (decision names, custom options, voice phrases)
- Sanitize data before rendering (prevent injection in custom voice phrases)
- Use HTTPS only for all API calls
- Implement certificate pinning for production API calls
- Never log sensitive information (user IDs, tokens, personal data)

**API Keys & Secrets:**
- Use environment variables via `expo-constants`
- Never commit `.env` files
- Rotate API keys before public launch
- Use separate keys for dev/staging/production

**Data Privacy:**
- All user data stays local by default (WatermelonDB)
- Explicit consent before any cloud sync
- Allow users to export/delete all their data
- No analytics without user consent
- Minimal data collection (only what's needed)

### Build & Testing Requirements

**Before Every Commit:**
- Run TypeScript type checking: `npx tsc --noEmit`
- Check for build errors: `npx expo start` and verify no errors
- Test on both iOS and Android (Expo Go minimum)
- Verify no console warnings in development mode
- Check bundle size hasn't increased significantly

**Testing Strategy:**
- Write unit tests for business logic (voice scoring, decision algorithms)
- Integration tests for database operations (LokiJS initially, WatermelonDB after migration)
- E2E tests for critical flows (create decision → swipe → result)
- Manual testing on physical devices (not just simulator)
- Test offline mode explicitly (disable network)

**Performance Checks:**
- Profile with React DevTools Profiler before merging
- Monitor re-renders - aim for minimal re-renders during swipes
- Check memory leaks with Xcode Instruments / Android Profiler
- Verify 60fps during animations using Reanimated debug mode
- Test with 100+ decisions in database (performance at scale)

### Performance Optimization Rules

**Critical Performance Requirements:**
- Card swipe must feel instant (<100ms response)
- No jank during animations (maintain 60fps)
- App cold start under 2 seconds on mid-range devices
- Database queries optimized with proper indexes (LokiJS or WatermelonDB)

**Optimization Strategies:**
- Lazy load heavy components (mascot animations, charts)
- Use `react-native-fast-image` for images (not default Image)
- Memoize expensive calculations with `useMemo`
- Debounce/throttle frequent operations (swipe tracking)
- Virtualize long lists with `FlashList` (not FlatList)
- Pre-load next card during current swipe animation
- Use `InteractionManager` for post-animation tasks

### State Management Patterns

**Zustand Best Practices:**
- Keep stores focused (separate stores for decisions, voices, settings)
- Use selectors to prevent unnecessary re-renders
- No derived state in store - compute in components with useMemo
- Persist critical state with zustand/middleware

```typescript
// Good - focused store with selectors
const useDecisionStore = create<DecisionState>((set) => ({
  currentDecision: null,
  setCurrentDecision: (decision) => set({ currentDecision: decision }),
}));

// Use with selector
const winner = useDecisionStore(state => state.currentDecision?.winner);
```

### Animation Performance

**Reanimated Best Practices:**
- Run animations on UI thread (use `worklets`)
- Avoid JavaScript bridge for gesture handling
- Use `useSharedValue` for animated values
- Minimize re-renders with `useAnimatedStyle`
- Pre-calculate animation paths where possible

**Rive Integration:**
- Load .riv files asynchronously
- Use low-complexity state machines (<10 states)
- Optimize artboard size (keep under 1MB)
- Test performance on low-end devices

### Common Pitfalls to Avoid

**React Native Specific:**
- Don't use `PanResponder` - use `react-native-gesture-handler`
- Don't use `Animated` - use `react-native-reanimated`
- Don't import from wrong package (use `react-native` not `react-native-web`)
- Don't forget to run `npx pod-install` after adding native dependencies (iOS)

**LokiJS Specific (Phase 0-2):**
- Use `.insert()` for creating new documents
- Use `.find()` or `.findOne()` for queries
- Use `.update()` for modifications
- Call `db.saveDatabase()` after write operations to persist
- Create indexes with `.ensureIndex()` for frequently queried fields

**WatermelonDB Specific (Phase 3+, after migration):**
- Always use `@action` decorator for model methods
- Never modify observables outside database.write()
- Don't query in render - use `observe()` or `withObservables()`
- Create proper indexes for frequently queried fields

**Performance Killers:**
- Avoid inline function definitions in render (use useCallback)
- Don't use `JSON.parse/stringify` in hot paths
- Never use `Math.random()` for keys - use stable IDs
- Don't re-create styles on every render (use StyleSheet.create)

### Git Workflow

**Commit Standards:**
- Descriptive commit messages: "Add voice weighting algorithm" not "fix stuff"
- Small, focused commits (one feature/fix per commit)
- Run build check before pushing
- Never commit node_modules, .env, or build artifacts

**Branch Strategy:**
- `main` - stable, deployable code
- `dev` - integration branch
- Feature branches: `feature/voice-system`, `feature/swipe-cards`
- Hotfix branches: `hotfix/crash-on-swipe`

### Debugging & Logging

**Development Logging:**
- Use structured logging library (e.g., `react-native-logs`)
- Log levels: ERROR (crashes), WARN (degraded), INFO (important events), DEBUG (dev only)
- Include context in logs: `{ userId, decisionId, voiceType }`
- Never log in render methods (performance impact)

**Production Monitoring:**
- Integrate crash reporting (Sentry for React Native)
- Track key metrics: app starts, decision completions, errors
- Monitor API response times when backend is added
- Set up alerts for crash rate >1%

### Documentation Requirements

**Code Documentation:**
- JSDoc comments for public functions and complex algorithms
- Document "why" not "what" (code shows what, comments explain why)
- Keep README.md updated with setup instructions
- Document breaking changes in CHANGELOG.md

**Architecture Decisions:**
- Document major decisions (why LokiJS for Phase 0-2, why Rive over Lottie, migration path to WatermelonDB)
- Keep CLAUDE.md and PROGRESS.md updated as architecture evolves
- Create diagrams for complex flows (voice scoring, sync logic)
- Track completed and upcoming tasks in PROGRESS.md

### Accessibility

**Must Implement:**
- Proper accessibility labels for all interactive elements
- VoiceOver/TalkBack support for core flows
- Sufficient color contrast (WCAG AA minimum)
- Touch targets at least 44x44pt
- Haptic feedback for touch confirmation
- Support for increased font sizes

### Pre-Launch Checklist

Before any deployment:
- [ ] All TypeScript errors resolved
- [ ] No console warnings or errors
- [ ] Build succeeds on both iOS and Android
- [ ] Tested on physical devices (iOS + Android)
- [ ] Offline mode works completely
- [ ] No security vulnerabilities (dependency audit)
- [ ] Performance benchmarks met (60fps, <100ms swipes)
- [ ] Error boundaries in place
- [ ] Crash reporting configured
- [ ] Analytics consent implemented
- [ ] Data export/delete functionality works

## Repository Context

This repository contains a **working React Native application** (flow-app directory) currently in Phase 0.5 (core gamification features completed). The app has been validated through daily personal usage (5+ decisions per day) and is ready for portfolio presentation.

## Current Implementation Status

**Phase 0 (COMPLETED):**
- ✅ Tournament mode with swipe gestures
- ✅ LokiJS offline storage (sub-50ms writes, sub-20ms reads)
- ✅ Decision templates (6 pre-built templates)
- ✅ Quick choice mode (binary decisions)
- ✅ Points system with animated rewards
- ✅ 60-second timer with haptic feedback
- ✅ Betting system (accountability mechanism)
- ✅ Streak tracking with penalties
- ✅ Decision history timeline

**Next Phase:** Voice system (Disciplined Me vs Lazy Me voting)

## Reference Documents

- `README.md` - Project overview for GitHub/portfolio
- `INTERVIEW_PREP.md` - Comprehensive interview study guide
- `PROGRESS.md` - Development roadmap and task tracking
- `FEATURES_BACKLOG.md` - Future feature ideas
