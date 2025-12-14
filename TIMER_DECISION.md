# Timer & Points System - Implementation Decision

## TL;DR
**Use HYBRID timer approach:** Countdown for quick decisions (urgency), count-up for big decisions (reflection).

---

## Timer Strategy

### Countdown Timer (60 seconds)
**Use for:** Quick daily decisions
- Food choices (lunch, dinner, snacks)
- Gym/workout decisions
- Coffee/break decisions
- Morning routine choices

**Visual:**
- Red pulsing circle countdown
- Haptic feedback at 30s, 10s, 5s
- Urgent animation when <10s remaining

**Penalty:**
- Timeout = -50 points
- Auto-choose based on goals/voice priorities OR force user to pick

**Psychology:**
- Loss aversion (fear of losing points)
- Creates urgency to act NOW
- Fights overthinking/analysis paralysis
- Makes decisions feel like a game

---

### Count-Up Timer (No limit)
**Use for:** Big important decisions
- Purchases >$100
- Career moves
- Relationship decisions
- Life-changing choices

**Visual:**
- Subtle gray stopwatch in corner
- No pressure, just tracking
- Shows improvement over time

**Reward:**
- Faster decisions = bonus points
- <30s on big decision = +50 bonus
- Track personal bests

**Psychology:**
- Self-improvement motivation
- No stress/pressure
- Encourages reflection without paralysis

---

## Points Economy

### Earning Points
- **Fast decision (<10s):** +100 points ⚡
- **Medium speed (10-30s):** +50 points
- **Slow decision (30-60s):** +25 points
- **Streak bonus (daily):** +50 points per day 🔥
- **Voice alignment:** +25 points (matches Disciplined Voice)
- **Follow-through confirmed:** +200 points (actually did it)

### Losing Points
- **Timeout (>60s on countdown):** -50 points ⏱️
- **Skip decision:** -25 points
- **Goal-contradicting choice:** -100 points (e.g., skip gym when fitness is a goal)
- **Broke streak:** -100 points 💔
- **Didn't follow through:** -150 points (said you'd do it, didn't)

### Net Balance Philosophy
**Users should feel successful, not punished**
- Average user: 200-300 points/day with normal use
- Losses should be rare (only timeouts or bad choices)
- Net positive = retained users
- Weekly reset option: Fresh start every Monday

---

## Points Unlock Milestones

- **500 points:** Unlock new mascot emotion 🎭
- **1,000 points:** Unlock custom theme 🎨
- **2,500 points:** Unlock "Chaotic Me" voice 🤪
- **5,000 points:** Unlock analytics dashboard 📊
- **10,000 points:** Unlock "Decision Buddy" multiplayer 👥

---

## User Settings

### Timer Preferences
- **Global default:** Countdown or Count-up
- **Per-category override:** "Always use countdown for Gym decisions"
- **Disable timer:** Option to turn off (but lose streak bonus)

### Points Settings
- **Weekly reset:** Start fresh every Monday (keeps hope alive)
- **Hide negative numbers:** Only show net positive balance (less discouraging)
- **Notification threshold:** Alert when points <0

---

## Implementation Checklist

### Database Schema (LokiJS)
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
  timer_mode: 'countdown' | 'count-up',
  time_limit_seconds?: number,
  decision_time_ms: number,
  points_earned: number,
  points_reason: string,
  timed_out: boolean
}

Collection: point_transactions {
  id: string,
  timestamp: Date,
  amount: number, // +100 or -50
  reason: string,
  decision_id?: string,
  balance_after: number
}
```

### UI Components
- [x] `CountdownTimer.tsx` - Red pulsing circle
- [x] `CountUpTimer.tsx` - Gray subtle stopwatch
- [x] `PointsDisplay.tsx` - Home screen badge
- [x] `PointsAnimation.tsx` - "+100" floating up
- [x] `PointsHistory.tsx` - Transaction log
- [x] `StreakBadge.tsx` - Fire emoji + count
- [x] `PointsMilestones.tsx` - Unlock screen

### Logic Services
- [x] `PointsService.ts` - Calculate points, track transactions
- [x] `TimerService.ts` - Handle countdown/count-up logic
- [x] `StreakService.ts` - Track daily streaks, reset logic

---

## Testing Plan

### Personal Use Validation
- [ ] Test countdown timer on 20 quick decisions
- [ ] Test count-up timer on 5 big decisions
- [ ] Verify points feel rewarding (net positive after 1 week)
- [ ] Confirm timer creates urgency without stress
- [ ] Check if streak drives daily habit

### Questions to Answer
1. Does countdown feel too stressful? (If yes, increase to 90s)
2. Are point amounts balanced? (Should earn 200-300/day)
3. Does timeout penalty feel fair? (If no, reduce to -25)
4. Is streak fear driving engagement? (Goal: check app daily)
5. Do milestones feel achievable? (First unlock at 500pts = ~3 days)

---

## Success Metrics

### Week 1
- 80%+ of users have positive point balance
- Average decision time decreases by 30%
- 60% of users complete 7-day streak

### Week 2
- 50% of users unlock first milestone (500pts)
- Timeout rate <10% (most decide before timer expires)
- App usage increases to 10+ decisions/day

---

## Iteration Plan

**If countdown feels too stressful:**
- Increase default to 90 seconds
- Add "chill mode" setting (2-minute timer)
- Reduce timeout penalty to -25 points

**If points aren't motivating:**
- Increase earn rates (+150 for fast, +75 for medium)
- Add more frequent small milestones (250pts, 750pts)
- Gamify with leaderboards (compare with Decision Buddies)

**If streaks aren't working:**
- Add "freeze" option (1 skip per week, costs 100pts)
- Reduce streak loss penalty to -50 points
- Add streak recovery: "Decide 3 times today to restore streak"

---

## Development Time Estimate

**Total: 3-4 hours**

- Timer implementation (countdown + count-up): 1.5 hours
- Points system (earn/lose logic): 1 hour
- Database schema updates: 30 minutes
- UI components (badges, animations): 1 hour

---

## Priority

**CRITICAL - Build in Phase 0.5**

This is the core gamification loop that transforms O(1) from a "decision tool" to an "addictive game."

Without timer + points:
- No urgency to act fast
- No reward for good behavior
- No loss aversion driving engagement
- No progression system

With timer + points:
- Immediate feedback loop (decision → points → dopamine)
- Fear of losing points drives action (loss aversion)
- Competition with self (beat personal records)
- Clear progression path (unlock milestones)

**Deploy immediately after Phase 0 validation.**
