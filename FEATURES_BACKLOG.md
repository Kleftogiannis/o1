# O(1) Decision Coach - Feature Backlog

This document tracks feature ideas and improvements to make the app more addictive and useful.

---

## 🎯 Priority Features (Phase 0.5 - Make It Addictive)

### ✅ Feature 1: Pre-Built Decision Templates
**Status:** In Progress
**Priority:** CRITICAL
**Estimated Time:** 2 hours

**The Hook:** One-tap decisions for common scenarios

**What to Build:**
- Home screen shows instant decision cards:
  - "What's for lunch?" (pre-loaded with Salad, Burger, Sushi, etc.)
  - "Gym or Netflix tonight?" (2 options, instant)
  - "Weekend: Productive or Chill?" (pre-configured)
  - "Coffee run or skip?" (quick binary choice)

**Why This Hooks You:**
- Zero typing - just tap and swipe
- Instant gratification - decision in 5 seconds
- Feels like a game - "Let me just check what lunch should be"
- Low friction - no cognitive load to get started

**Implementation Notes:**
- Use existing option pools from database seeding
- Tap card → straight to tournament with pre-loaded options
- No question typing needed
- Categories: Food, Workout, Weekend, Work, Evening

---

### Feature 2: Decision History Feed
**Status:** Pending
**Priority:** HIGH
**Estimated Time:** 1 hour

**The Hook:** See your past decisions and patterns

**What to Build:**
- New tab: "History"
- Shows all completed decisions in a feed
- Tap to see details (winner, runner-up, duration)
- Maybe add a "Why did I choose this?" note field

**Why This Hooks You:**
- Social proof for yourself - "I chose gym 7 times this week!"
- Pattern recognition - "I always pick salad on Mondays"
- Accountability - Did I follow through on my decisions?
- Quick access - "What did I decide yesterday?"

**Gamification Potential:**
- Streak counter: "5 decisions this week"
- Time savings: "You saved 47 minutes of indecision"
- Consistency badge: "Gym 3 days in a row"

**Implementation Notes:**
- New route: `app/history.tsx`
- Query `decisionService.getRecentDecisions()`
- Group by date (Today, Yesterday, This Week)
- Show stats at top (total decisions, average duration)

---

### Feature 3: Quick 2-Option Mode
**Status:** Pending
**Priority:** HIGH
**Estimated Time:** 1 hour

**The Hook:** Binary decisions are the most common

**What to Build:**
- Home screen shortcut: "Quick Choice"
- Only asks for 2 options
- Simplified UI: swipe left or right on ONE card
- No tournament, just instant A vs B

**Why This Hooks You:**
- Faster than tournament for simple choices
- Lower barrier - "Should I X or Y?"
- Most decisions are binary (gym/no gym, coffee/no coffee)

**Implementation Notes:**
- New route: `app/quick-choice.tsx`
- Simplified create screen (only 2 option fields)
- Different swipe UI: single card with A on left, B on right
- Skip tournament bracket entirely
- Instant result screen

---

## 💡 Additional Feature Ideas (Phase 1+)

### Feature 4: Daily Decision Prompts
**Status:** Backlog
**Priority:** MEDIUM
**Estimated Time:** 3 hours

**The Hook:** App suggests decisions BEFORE you think of them

**What to Build:**
- Morning prompt (9 AM): "What's your work focus today?"
- Lunch prompt (11:30 AM): "Lunch decision time"
- Evening prompt (6 PM): "Gym or rest tonight?"
- Uses local notifications (Expo Notifications)

**Why This Hooks You:**
- Anticipatory - you don't have to remember to use it
- Habit-forming - becomes part of your daily routine
- Feels magical - "It knows when I'm deciding lunch!"

**Technical Requirements:**
- Expo Notifications integration
- Background task scheduling
- Deep linking from notification to decision
- User preference for notification times
- Pattern learning (when do you usually decide?)

**Implementation Notes:**
- `expo install expo-notifications`
- Schedule local notifications based on time patterns
- Store user's decision timing preferences
- Link notification to pre-built template

---

### Feature 5: Randomize Mode
**Status:** Backlog
**Priority:** LOW
**Estimated Time:** 30 minutes

**The Hook:** Just give me an answer NOW

**What to Build:**
- On result screen, add "Not sure? Randomize" button
- Randomly picks from top 2 options
- Adds a "fate decided" feeling

**Why This Hooks You:**
- Decision fatigue relief - when you truly don't care
- Fun factor - adds chaos energy
- Removes responsibility - "The app decided, not me"

**Implementation Notes:**
- Add button to tournament result screen
- Math.random() between winner and runner-up
- Show "✨ Fate has decided" animation
- Save as `method: 'randomized'` in database

---

### Feature 6: Decision Timer & Points System
**Status:** Backlog
**Priority:** CRITICAL (for gamification)
**Estimated Time:** 3-4 hours
**Phase:** 0.5 or Phase 6 (Psychology Hacks)

**The Hook:** Race against time + earn/lose points = addictive loop

**What to Build:**

**Timer Options (User Research Needed - Test Both):**

1. **Countdown Timer (Loss Aversion Approach - RECOMMENDED)**
   - Start with 60 seconds countdown when decision begins
   - User must decide before timer hits 0
   - If timer expires: Auto-chooses based on goals/voice priorities OR user loses points
   - Visual: Red pulsing countdown on screen
   - Haptic feedback at 30s, 10s, 5s remaining
   - **Psychology:** Loss aversion is stronger than gain motivation
   - **UX:** "You have 60 seconds or you lose 50 points!"

2. **Count-Up Timer (Performance Tracking)**
   - Timer starts at 0:00, counts up while user decides
   - Tracks decision time for analytics
   - No pressure, just measurement
   - Shows in history: "You decided in 3.2s (0.8s faster than average)"
   - **Psychology:** Encourages self-improvement, less stressful
   - **UX:** "Personal best: 2.1s for lunch decisions"

**Recommended Hybrid Approach:**
- Use **countdown** for quick decisions (lunch, coffee, gym)
- Use **count-up** for big decisions (buy headphones, weekend plans)
- User can toggle timer mode per decision category

**Points System Architecture:**

**Earning Points:**
- Fast decision (<10s): +100 points
- Medium speed (10-30s): +50 points
- Slow decision (30-60s): +25 points
- Streak bonus: +50 points per day streak
- Voice alignment: +25 points (if decision matches Disciplined Voice)
- Follow-through confirmation: +200 points (if you actually did what you decided)

**Losing Points:**
- Timeout (>60s): -50 points
- Skip decision: -25 points
- Goal-contradicting choice: -100 points (e.g., chose "Skip Gym" when goal is fitness)
- Broke streak: -100 points
- Didn't follow through: -150 points

**Points Display:**
- Home screen: "💎 1,247 Points" (prominent)
- After decision: "+100 points! ⚡ Fast decision"
- Negative feedback: "-50 points. Timer expired!"
- Leaderboard (future): Compare with Decision Buddies

**Why This Hooks You:**
- **Immediate feedback loop:** Decision → Points → Dopamine
- **Loss aversion:** Fear of losing points drives action
- **Competition:** Beat your own records + compare with friends
- **Progression system:** Unlock rewards at point milestones
- **Urgency:** Timer creates pressure to act NOW (fights decision paralysis)

**Implementation Notes:**

**Database Schema (LokiJS):**
```typescript
Collection: user_stats {
  total_points: number,
  points_earned_today: number,
  points_lost_today: number,
  current_streak: number,
  longest_streak: number,
  fastest_decision_time: number,
  average_decision_time: number
}

Collection: decisions {
  // Add:
  timer_mode: 'countdown' | 'count-up',
  time_limit_seconds?: number,
  decision_time_ms: number,
  points_earned: number,
  points_reason: string, // "Fast decision" or "Timeout penalty"
  timed_out: boolean
}

Collection: point_transactions {
  id: string,
  timestamp: Date,
  amount: number, // positive or negative
  reason: string, // "Fast decision", "Streak bonus", "Timeout penalty"
  decision_id?: string,
  balance_after: number
}
```

**UI Components:**
- `CountdownTimer.tsx` - Red pulsing circle countdown
- `PointsDisplay.tsx` - Animated points badge (home screen)
- `PointsAnimation.tsx` - "+100" floating animation after decision
- `PointsHistory.tsx` - Transaction log (earn/lose breakdown)
- `StreakBadge.tsx` - Fire emoji + day count
- `PointsMilestones.tsx` - Unlock rewards (avatars, themes, badges)

**Technical Considerations:**
- Use `useAnimatedStyle` for smooth countdown animation
- Haptic feedback with `expo-haptics` at timer milestones
- Store points locally (LokiJS), sync to cloud later
- Prevent point manipulation (validate transactions server-side when backend added)
- Auto-save points on app close/background

**Gamification Milestones (Points Unlock Rewards):**
- 500 points: Unlock new mascot emotion
- 1,000 points: Unlock custom theme
- 2,500 points: Unlock "Chaotic Me" voice
- 5,000 points: Unlock "Time Saved" analytics dashboard
- 10,000 points: Unlock "Decision Buddy" multiplayer mode

**Testing Scenarios:**
- Personal use: Does timer create urgency without stress?
- Point balance: Are earn/lose amounts balanced? (should be net positive with normal use)
- Streak system: Does it drive daily habit formation?
- Timer preference: Do users prefer countdown vs count-up for different decisions?

**Success Metrics:**
- 80%+ of users have positive point balance after 1 week
- Average decision time decreases by 30% after 3 days
- Streak retention: 40% maintain 7-day streak
- User feedback: "Timer made me stop overthinking"

---

### Feature 7: Pending Decisions Queue (from Reference Image 1)
**Status:** Backlog
**Priority:** HIGH
**Estimated Time:** 2 hours
**Phase:** 0.5

**The Hook:** App anticipates decisions before you ask

**What to Build:**
- Home screen shows 3-5 pending decision cards
- Each card has:
  - Category icon (🏃 Health, 🍔 Food, 💼 Work)
  - Decision title: "Morning Run?"
  - Deadline: "Due by 8:00 AM"
  - Quick binary buttons: "Skip it" vs "Lace up"
  - Voice preview on buttons: "(Lazy Voice: It's cold outside)" vs "(Disciplined Voice: You'll feel better after)"
- Tap card → full tournament mode
- Tap button → instant binary decision (no tournament)

**Why This Hooks You:**
- Zero friction - decisions are ready when you are
- Time pressure - "Due by 8:00 AM" creates urgency
- Voice preview - see internal debate BEFORE swiping
- Queue visualization - "3 decisions pending" = clear todo list

**Implementation Notes:**
- New component: `PendingDecisionCard.tsx`
- Database: Add `deadline` and `is_pending` fields to decisions
- Voice preview: Extract first phrase from each voice
- Quick decision bypass: Skip tournament for binary choices
- Sort by deadline (earliest first)

**Technical Requirements:**
- Time-based triggers (hardcoded initially): "Gym decision at 6 PM daily"
- Push notifications when decision deadline approaches
- Deep link from notification to decision card
- Auto-archive if deadline passed

---

### Feature 8: Voice Speech Bubble UI (from Reference Image 2)
**Status:** Backlog
**Priority:** MEDIUM
**Estimated Time:** 2-3 hours
**Phase:** 1-2 (Voice System)

**The Hook:** Internal voices feel like real characters arguing

**What to Build:**
- Factor cards show voice avatars (mascot variations: Otto-Disciplined, Otto-Lazy)
- Speech bubble format for voice arguments
- Visual stamps: "NOPE" (rejected) or "YES" (accepted) on swipe
- Swipe instruction: "Swipe Left for Lazy Voice, Right for Disciplined Voice"
- Each factor has opposing voice arguments:
  - Left bubble (Lazy): "That's half rent. We don't need them."
  - Right bubble (Disciplined): "It's an investment in deep work productivity."

**Why This Hooks You:**
- **Personality:** Voices feel like real characters, not abstract concepts
- **Conflict visualization:** See the internal debate externalized
- **Immediate feedback:** Stamps show which voice "won" that factor
- **Storytelling:** Decisions become mini-dramas

**Implementation Notes:**
- Component: `VoiceSpeechBubble.tsx` (chat-style UI)
- Component: `SwipeStampOverlay.tsx` (NOPE/YES animations)
- Voice avatar system: 5 mascot variations (color-coded)
- Swipe left = agree with left voice, right = agree with right voice
- Animate stamp appearance on swipe with haptic feedback

---

### Feature 9: Analytics Dashboard (from Reference Image 3)
**Status:** Backlog
**Priority:** MEDIUM
**Estimated Time:** 3-4 hours
**Phase:** 6 or later

**The Hook:** See how much time you saved by deciding faster

**What to Build:**

**Performance Card:**
- "2.4 hours saved this week by deciding faster"
- Average decision time: "1.2s (↓ 0.5s from last week)"
- Mascot celebration animation

**Internal Dialogue Breakdown:**
- Bar chart: "85% Disciplined | 35% Lazy"
- Text: "You listened to the Disciplined Voice 45 times this week"
- Shows which voice is "winning" over time

**Recent Constant-Time Wins:**
- List of fastest decisions:
  - "Morning Run: 0.8s decision time" ✅
  - "Snoozed Alarm: 1.1s decision time" ❌
- Shows decision quality (goal-aligned vs not)

**Why This Hooks You:**
- **Quantified progress:** Tangible proof you're getting better
- **Time saved metric:** Makes you feel productive
- **Voice accountability:** "Am I listening to Lazy Me too much?"
- **Pattern recognition:** "I'm fast at workout decisions but slow at food"

**Implementation Notes:**
- New route: `app/dashboard.tsx` or `app/(tabs)/stats.tsx`
- Calculate time saved: `(baseline_avg - current_avg) * decisions_count`
- Baseline assumption: 5 minutes average deliberation time
- Voice breakdown: Count decisions where each voice "won"
- Chart library: `react-native-chart-kit` or custom with `react-native-svg`

---

### Feature 10: Streak System (from Reference Image 1)
**Status:** Backlog
**Priority:** HIGH
**Estimated Time:** 1 hour
**Phase:** 0.5

**The Hook:** Don't break the streak!

**What to Build:**
- Badge on home screen: "🔥 14 Day Streak"
- Streak counter updates daily when user makes at least 1 decision
- Breaks if user misses a day
- Push notification at 9 PM: "Don't break your streak! Make 1 decision today."
- Streak milestones: 7 days, 14 days, 30 days, 100 days

**Why This Hooks You:**
- **Loss aversion:** Fear of breaking streak > desire to build one
- **Daily habit formation:** Encourages opening app every day
- **Social proof:** Share streak achievements
- **Milestone dopamine:** Celebrate 30-day streak

**Implementation Notes:**
- Database field: `current_streak`, `longest_streak`, `last_decision_date`
- Logic: If `Date.now() - last_decision_date > 24h`, reset streak
- Display prominently on home screen (top-right corner)
- Animation on milestone: Confetti + mascot celebration
- Track in analytics: Streak retention rate

---

## 🔮 Future Phase Ideas (Post-MVP)

### Voice System Integration (Phase 1)
- Disciplined Me vs Lazy Me voting
- Voice-based factor weighting
- Personality-driven recommendations
- **NEW:** Speech bubble UI for voice arguments (Feature 8)
- **NEW:** Voice avatars (mascot variations)

### Context-Aware Decisions (Phase 2)
- Time-based suggestions (lunch at 12pm)
- Location-based (near gym = workout prompt)
- Weather integration (rainy = different lunch options)
- Calendar integration (meeting soon = coffee decision)
- **NEW:** Pending decisions queue with deadlines (Feature 7)

### Social Features (Phase 3)
- Decision Buddy invites
- "Ask a friend" option
- Collaborative decision-making
- Shared decision templates
- **NEW:** Leaderboard (points comparison)

### Gamification (Phase 4)
- **UPDATED:** Decision streaks (Feature 10)
- **UPDATED:** Points for fast decisions (Feature 6)
- **NEW:** Timer system (countdown/count-up) (Feature 6)
- **NEW:** Point milestones unlock rewards (Feature 6)
- Avatar/mascot reactions
- Achievement badges
- Weekly decision summary

### Advanced Analytics (Phase 5)
- **UPDATED:** Time saved dashboard (Feature 9)
- **UPDATED:** Voice usage breakdown (Feature 9)
- **NEW:** Average decision time tracking (Feature 9)
- Decision patterns over time
- Category preferences
- Time-of-day trends
- Regret tracking ("Did this work out?")
- Consistency scores

---

## 📊 Feature Prioritization Framework

**Critical (Build Now):**
- Features that reduce friction to zero
- Features that create daily habits
- Features that provide instant value

**High Priority (Build Soon):**
- Features that increase engagement
- Features that provide insight
- Features that add delight

**Medium Priority (Build Later):**
- Features that automate existing flows
- Features that add convenience
- Features that expand use cases

**Low Priority (Nice to Have):**
- Features that add polish
- Features that add novelty
- Features that are "cool but not essential"

---

## 🎯 Success Metrics Per Feature

### Pre-Built Templates
- **Target:** 80% of decisions use templates (not custom)
- **Measure:** Template usage vs custom decision creation

### Decision History
- **Target:** 30% of users check history weekly
- **Measure:** History screen views per user

### Quick 2-Option Mode
- **Target:** 50% of binary decisions use quick mode
- **Measure:** Quick mode usage vs full tournament for 2 options

### Daily Prompts
- **Target:** 40% notification open rate
- **Measure:** Notification delivered vs decisions made from notification

### Randomize Mode
- **Target:** 10% of decisions use randomize
- **Measure:** Randomize button clicks vs total decisions

---

## 💭 User Research Questions

Before building each feature, validate:
1. Would this make me use the app MORE?
2. Does this reduce friction or add it?
3. Is this solving a real pain point?
4. Would I use this 5+ times per day?
5. Does this make decisions feel like a game?

**Golden Rule:** If the creator doesn't use it obsessively, users won't either.

---

## 📝 Notes & Learnings

*(Will be updated as features are built and tested)*

- **2025-12-14:** Created backlog with 5 initial feature ideas
- Priority: Templates > History > Quick Mode > Prompts > Randomize
- **2025-12-14 (Evening):** Added 5 new features from reference image analysis:
  - **Feature 6:** Decision Timer & Points System (CRITICAL - core gamification)
  - **Feature 7:** Pending Decisions Queue (from Reference 1)
  - **Feature 8:** Voice Speech Bubble UI (from Reference 2)
  - **Feature 9:** Analytics Dashboard (from Reference 3)
  - **Feature 10:** Streak System (from Reference 1)

---

## 🎯 Recommended Timer Implementation

**DECISION: Use HYBRID approach for maximum engagement**

### Quick Decisions (Food, Gym, Coffee) → Countdown Timer
- **Duration:** 60 seconds
- **Visual:** Red pulsing circle countdown
- **Penalty:** -50 points if timeout
- **Psychology:** Creates urgency, fights overthinking
- **Example:** "Morning Run? Decide in 60s or lose 50 points"

### Big Decisions (Purchases >$100, Career, Relationships) → Count-Up Timer
- **Duration:** No limit (tracks performance)
- **Visual:** Subtle gray stopwatch in corner
- **Reward:** Faster = more points (bonus for <30s)
- **Psychology:** Self-improvement, no stress
- **Example:** "Buy $350 headphones? Taking your time... 2m 14s"

### User Choice
- Settings toggle: "Timer Mode Preference"
- Per-category override: "Always use countdown for Gym decisions"
- Option to disable timer entirely (but lose streak bonus)

### Points Balance Philosophy
**Make users feel successful, not punished**
- Average user should earn 200-300 points/day with normal use
- Losses should be rare (only timeouts or goal contradictions)
- Net positive point balance = retained users
- Weekly reset option: Start fresh every Monday (keeps hope alive)

---

## 🔥 Phase 0.5 Implementation Priority (based on references)

**Build THESE features immediately after Phase 0 validation:**

1. **Feature 10: Streak System** (1 hour) - Easiest, highest impact
2. **Feature 6: Decision Timer & Points** (3-4 hours) - Core gamification loop
3. **Feature 7: Pending Decisions Queue** (2 hours) - Home screen upgrade
4. **Feature 2: Decision History Feed** (1 hour) - Already planned, needed for analytics

**Total time:** ~7-8 hours for Phase 0.5
**Impact:** Transforms app from "tool" to "addictive game"

**Defer to Phase 1+:**
- Feature 8: Voice Speech Bubble UI (wait for voice system)
- Feature 9: Analytics Dashboard (need data first)
