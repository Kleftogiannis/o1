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

## 🔮 Future Phase Ideas (Post-MVP)

### Voice System Integration (Phase 1)
- Disciplined Me vs Lazy Me voting
- Voice-based factor weighting
- Personality-driven recommendations

### Context-Aware Decisions (Phase 2)
- Time-based suggestions (lunch at 12pm)
- Location-based (near gym = workout prompt)
- Weather integration (rainy = different lunch options)
- Calendar integration (meeting soon = coffee decision)

### Social Features (Phase 3)
- Decision Buddy invites
- "Ask a friend" option
- Collaborative decision-making
- Shared decision templates

### Gamification (Phase 4)
- Decision streaks
- Points for fast decisions
- Avatar/mascot reactions
- Achievement badges
- Weekly decision summary

### Advanced Analytics (Phase 5)
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
