# UI Design Reference - Streak Badge & Randomize Button

## Design Philosophy

**Aesthetic**: Neon Arcade Game meets Dopamine-Driven Product Design
- Think: Duolingo streak notifications + TikTok endless scroll satisfaction
- Vibrant neon accents on dark backgrounds (#0F0F0F)
- Animated numbers that "pop" and celebrate
- Pulse effects and glow halos for urgency

---

## Component 1: Streak Badge 🔥

### Visual Description
```
┌─────────────────────────────────────┐
│                            ╔═══╗    │ ← Positioned top-right
│                            ║ 🔥║    │
│                            ║ 14 ║    │ ← Gold gradient border
│                            ║DAYS║    │
│                            ╚═══╝    │
│                         [MILESTONE!] │ ← Shows at 7,14,30,50,100
└─────────────────────────────────────┘
```

### Color Palette
- **Border Gradient**: Gold → Orange → Red-Orange
  - `['#FFD700', '#FFA500', '#FF6B35']`
- **Inner Background**: Dark gray `#1A1A1A`
- **Number Color**: Gold `#FFD700` with orange shadow
- **Glow**: Pulsing gold halo (opacity 0.6-1.0)

### Animations
1. **Continuous Pulse** (heartbeat effect)
   - Scale: 1.0 → 1.05 → 1.0
   - Duration: 1.6s loop
   - Easing: ease-in-out

2. **Glow Pulse** (urgency indicator)
   - Opacity: 0.6 → 1.0 → 0.6
   - Duration: 2s loop
   - Shadow radius: 20px

3. **Number Pop** (on milestone)
   - Scale: 1.0 → 1.4 → 1.0
   - Spring physics (bouncy)
   - Triggers when streak increases

### Dimensions
- Badge: 90x90px circular
- Font sizes:
  - Fire emoji: 28px
  - Number: 24px (bold, monospace)
  - Label: 9px (uppercase, spaced)

### Milestone Badge
- Appears below main badge at 7, 14, 30, 50, 100 days
- Green gradient background `['#00E676', '#00C853']`
- Text: "🏆 MILESTONE!" (white, bold, 10px)
- Border: 2px white
- Positioned 84px from top (just below fire badge)

---

## Component 2: Randomize Button 🎲

### Visual Description
```
┌────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════╗ │
│  ║   🎲   NOT SURE?              →          ║ │ ← Purple gradient
│  ║         Let fate decide                  ║ │
│  ║   ✨ (rotating sparkle in background)    ║ │
│  ╚═══════════════════════════════════════════╝ │
│          Randomly picks from 5 options         │ ← Helper text
└────────────────────────────────────────────────┘
```

### Color Palette
- **Background Gradient**: Purple → Dark purple
  - `['#AB47BC', '#8E24AA', '#6A1B9A']`
- **Border**: White 3px
- **Glow**: Purple halo `#AB47BC` (opacity 0.6)
- **Text**: White with slight shadow

### Animations
1. **Sparkle Rotation** (continuous)
   - ✨ emoji rotates 360° in 2s loop
   - Positioned top-right, opacity 0.3
   - Creates "magical" atmosphere

2. **Dice Spin** (on press)
   - 🎲 emoji rotates 1080° (3 full spins)
   - Duration: 800ms
   - Easing: ease-out cubic
   - Slot machine effect

3. **Scale Pulse** (on press)
   - Button scale: 1.0 → 1.1 → 1.0
   - Spring physics
   - Synchronized with spin

4. **Shimmer Effect** (idle state)
   - Diagonal light sweep across button
   - Subtle moving gradient
   - Adds polish/premium feel

### Dimensions
- Button: Full width - 48px (margins)
- Padding: 20px vertical, 24px horizontal
- Border radius: 20px
- Font sizes:
  - Dice emoji: 36px
  - Main text: 16px (bold, monospace, uppercase)
  - Sub text: 12px (italic, semi-transparent)
  - Arrow: 20px (bold)

### States
- **Idle**: Shimmer effect, sparkle rotating
- **Pressed**: Slightly smaller (scale 0.98), reduced shadow
- **Randomizing**: Text changes to "CHOOSING...", dice spinning
- **Disabled**: No interaction during 800ms animation

### Layout
```
┌─────────────────────────────────────────┐
│  [🎲]  [NOT SURE?        ]  [→]        │
│         [Let fate decide ]              │
│                                         │
│        (sparkle ✨ rotating in bg)      │
└─────────────────────────────────────────┘
```

---

## Psychology-Driven Design Choices

### Streak Badge

#### Why It's Addictive
1. **Fire emoji** = Emotional metaphor ("don't let the fire die!")
2. **Pulsing glow** = Subconscious urgency (Zeigarnik effect)
3. **Large numbers** = Achievement + social proof
4. **Gold color** = Reward/treasure association
5. **Top-right placement** = Always visible (can't ignore)

#### Loss Aversion Triggers
- Continuous pulse = "This is important!"
- Glow halo = "Pay attention!"
- Milestone celebration = "You're on a roll!"
- Breaking streak = Emotional pain (Duolingo proven tactic)

### Randomize Button

#### Why It's Addictive
1. **Dice emoji** = Gambling/lottery psychology
2. **Spin animation** = Slot machine dopamine hit
3. **Purple chaos color** = Unpredictability + fun
4. **"Fate decides" copy** = Removes decision guilt
5. **Instant result** = Zero cognitive load

#### Decision Fatigue Relief
- No thinking required = Brain rest
- Random = No wrong choice
- Fast animation = Immediate gratification
- Chaos energy = Fun/playful (not serious)

---

## Integration Placement

### Home Screen
```
┌───────────────────────────────────┐
│  O(1)                    [🔥 14]  │ ← Streak badge
│  DECIDE IN CONSTANT TIME   DAYS   │
│  Tap a card. Make a decision.     │
│                                   │
│  ┌─────┐  ┌─────┐                │
│  │🍽️   │  │💪   │                │ ← Template cards
│  │LUNCH│  │GYM  │                │
│  └─────┘  └─────┘                │
│                                   │
│        [📋 HISTORY]               │ ← Floating button
└───────────────────────────────────┘
```

### Result Screen
```
┌───────────────────────────────────┐
│                                   │
│         🎉                        │
│    Decision Made!                 │
│                                   │
│  ┌─────────────────────────────┐ │
│  │   Your Choice:              │ │
│  │   Go to the Gym            │ │ ← Winner card
│  └─────────────────────────────┘ │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ 🎲 NOT SURE?           →   │ │ ← Randomize button
│  │    Let fate decide          │ │
│  └─────────────────────────────┘ │
│                                   │
│        [Done]                     │ ← Done button
└───────────────────────────────────┘
```

---

## Dark Mode Optimized

All components designed for dark backgrounds:
- Base background: `#0F0F0F` (near black)
- Secondary: `#1A1A1A` (dark gray)
- Tertiary: `#333333` (medium gray)
- Text: `#FFFFFF` (white)
- Accents: Vibrant neons (gold, green, purple)

**Why dark mode?**
- Less eye strain
- Neon colors "pop" more on dark backgrounds
- Modern aesthetic (gaming, productivity apps)
- Battery savings on OLED screens

---

## Haptic Feedback

### Streak Badge
- **On milestone**: Success notification (3 buzzes)
- **On tap** (future): Light impact

### Randomize Button
- **On press start**: Heavy impact (strong feedback)
- **On result**: Success notification (celebration)

---

## Accessibility

### Streak Badge
- Large numbers (24px) = readable at a glance
- High contrast (gold on dark gray)
- No reliance on color alone (number + emoji)

### Randomize Button
- Clear call-to-action ("NOT SURE?")
- Large touch target (full width, 60px height)
- High contrast text (white on purple)
- Descriptive helper text below

---

## Performance

### Animations
- **60fps** on modern devices (iPhone 12+, Android flagship)
- **Reanimated 2** worklets (UI thread, not JS thread)
- **Spring physics** for natural feel
- **No jank** during scrolling

### Memory
- Static emojis (no images to load)
- CSS gradients (no bitmap assets)
- Minimal re-renders (useSharedValue)

---

## Future Enhancements

### Streak Badge
- **Streak freeze**: Tap to pay 100 points, protect streak for 1 day
- **Share button**: Screenshot + share "14-day streak!" to social
- **Leaderboard**: Compare with Decision Buddies

### Randomize Button
- **Confetti explosion**: On randomize result
- **Sound effect**: Optional slot machine "ding!"
- **History tag**: Mark decisions as "randomized" in history

---

## Assets Required

### Custom Images/Icons
**NONE!** ✅

Everything uses:
- Emojis (🔥, 🎲, ✨, 🏆, 🎉)
- Linear gradients
- React Native built-in components
- Reanimated 2 animations

### Fonts
**Monospace** (system font)
- iOS: SF Mono
- Android: Roboto Mono
- Web: Courier New fallback

---

## Summary

**Streak Badge**: Gold pulsing fire badge with milestone celebrations
**Randomize Button**: Purple slot machine button with spinning dice

**Total custom assets needed**: 0
**Implementation time**: 2 hours
**Addictiveness level**: 🔥🔥🔥🔥🔥 (Duolingo-tier)

**Ready to make decisions addictive!** 🚀
