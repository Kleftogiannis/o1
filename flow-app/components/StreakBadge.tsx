import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakBadgeProps {
  streakDays: number;
  position?: 'top-right' | 'top-left';
  onPress?: () => void;
}

/**
 * StreakBadge - Psychologically-optimized streak counter
 *
 * PSYCHOLOGY TACTICS:
 * - Fire emoji = visual metaphor for "keeping the flame alive"
 * - Pulsing glow = creates urgency and draws attention
 * - Large numbers = social proof and achievement
 * - Gold gradient = reward/treasure aesthetic
 * - Animate on milestone = dopamine spike
 *
 * ADDICTIVENESS:
 * - Loss aversion: "Don't let the fire die!"
 * - Progress tracking: "I'm at 14 days, can't stop now!"
 * - Social proof: Big numbers feel impressive
 */
export function StreakBadge({ streakDays, position = 'top-right', onPress }: StreakBadgeProps) {
  // Animations
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const numberScale = useSharedValue(1);

  useEffect(() => {
    // Continuous pulse animation (heartbeat effect)
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite
      false
    );

    // Pulsing glow (creates urgency)
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    // Celebrate when number changes (milestone reached)
    numberScale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, [streakDays]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  return (
    <View style={[styles.container, position === 'top-left' ? styles.topLeft : styles.topRight]}>
      {/* Outer Glow (pulsing halo effect) */}
      <Animated.View style={[styles.glowOuter, glowStyle]}>
        <View style={styles.glowInner} />
      </Animated.View>

      {/* Main Badge */}
      <Animated.View style={[styles.badge, pulseStyle]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF6B35']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.badgeInner}>
            {/* Fire Emoji */}
            <Text style={styles.fireEmoji}>🔥</Text>

            {/* Streak Number */}
            <Animated.Text style={[styles.streakNumber, numberStyle]}>
              {streakDays}
            </Animated.Text>

            {/* Label */}
            <Text style={styles.streakLabel}>DAY{streakDays !== 1 ? 'S' : ''}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Milestone Badge (shows at 7, 14, 30, 100 days) */}
      {[7, 14, 30, 50, 100].includes(streakDays) && (
        <View style={styles.milestoneContainer}>
          <LinearGradient
            colors={['#00E676', '#00C853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.milestoneBadge}
          >
            <Text style={styles.milestoneText}>🏆 MILESTONE!</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  topRight: {
    top: 16,
    right: 16,
  },
  topLeft: {
    top: 16,
    left: 16,
  },

  // Glow Effect (creates urgency + draws eye)
  glowOuter: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    opacity: 0.6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  glowInner: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },

  // Badge Container
  badge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 45,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },

  // Fire Emoji
  fireEmoji: {
    fontSize: 28,
    marginBottom: -4,
  },

  // Streak Number (BIG and BOLD)
  streakNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textShadowColor: '#FFA500',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Label
  streakLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },

  // Milestone Badge (appears below main badge)
  milestoneContainer: {
    position: 'absolute',
    top: 84,
    left: -8,
    right: -8,
  },
  milestoneBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
