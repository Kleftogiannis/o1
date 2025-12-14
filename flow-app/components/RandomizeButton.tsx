import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface RandomizeButtonProps {
  onRandomize: () => void;
  options: string[];
}

/**
 * RandomizeButton - Slot machine-style instant decision
 *
 * PSYCHOLOGY TACTICS:
 * - Sparkle emoji = lottery/magic aesthetic
 * - Spin animation = slot machine dopamine
 * - "Fate decides" copy = removes decision responsibility
 * - Chaos colors (purple/pink) = unpredictability
 * - Fast animation = instant gratification
 *
 * ADDICTIVENESS:
 * - Random = gambling/slot machine psychology
 * - No cognitive load = decision fatigue relief
 * - Fun factor = chaos energy
 * - Instant result = dopamine hit
 */
export function RandomizeButton({ onRandomize, options }: RandomizeButtonProps) {
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Animations
  const rotateValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const sparkleRotate = useSharedValue(0);

  // Continuous sparkle rotation (always spinning)
  React.useEffect(() => {
    sparkleRotate.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const handlePress = async () => {
    if (isRandomizing) return;

    setIsRandomizing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Slot machine effect - multiple spins with deceleration
    rotateValue.value = withSequence(
      // Fast spins (slot machine starting)
      withTiming(360 * 2, { duration: 400, easing: Easing.linear }),
      // Medium speed spins
      withTiming(360 * 4, { duration: 600, easing: Easing.out(Easing.quad) }),
      // Slow down dramatically (slot machine stopping)
      withTiming(360 * 5, { duration: 500, easing: Easing.out(Easing.cubic) }),
      // Reset to 0
      withTiming(0, { duration: 0 })
    );

    // Scale pulse with multiple beats
    scaleValue.value = withSequence(
      withSpring(1.08, { damping: 10, stiffness: 200 }),
      withSpring(0.98, { damping: 12, stiffness: 180 }),
      withSpring(1.05, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 150 })
    );

    // Haptic feedback during spin (at intervals)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 800);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 1200);

    // Wait for animation (1.5 seconds total), then trigger randomize
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRandomize();
      setIsRandomizing(false);
    }, 1500);
  };

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, scaleStyle]}>
      <Pressable
        onPress={handlePress}
        disabled={isRandomizing}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <LinearGradient
          colors={['#AB47BC', '#8E24AA', '#6A1B9A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Spinning Sparkle Background */}
          <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
            <Text style={styles.sparkleEmoji}>✨</Text>
          </Animated.View>

          {/* Main Content */}
          <View style={styles.content}>
            <Animated.View style={rotateStyle}>
              <Text style={styles.diceEmoji}>🎲</Text>
            </Animated.View>

            <View style={styles.textContainer}>
              <Text style={styles.mainText}>
                {isRandomizing ? 'CHOOSING...' : 'NOT SURE?'}
              </Text>
              <Text style={styles.subText}>
                Let fate decide
              </Text>
            </View>

            {/* Arrow indicator */}
            <Text style={styles.arrow}>→</Text>
          </View>

          {/* Shimmer effect overlay */}
          {!isRandomizing && (
            <View style={styles.shimmer}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </View>
          )}
        </LinearGradient>

        {/* Glow border */}
        <View style={styles.glowBorder} />
      </Pressable>

      {/* Helper text */}
      <Text style={styles.helperText}>
        Randomly picks from {options.length} options
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 12,
  },

  // Button
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#AB47BC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
  },

  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'visible',
    minHeight: 80,
  },

  // Sparkle Background (always rotating)
  sparkleContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    opacity: 0.3,
  },
  sparkleEmoji: {
    fontSize: 60,
  },

  // Content
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },

  diceEmoji: {
    fontSize: 32,
    width: 40,
    textAlign: 'center',
  },

  textContainer: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },

  mainText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
    lineHeight: 18,
  },

  subText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    lineHeight: 14,
  },

  arrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '900',
    width: 24,
    textAlign: 'center',
  },

  // Shimmer effect (moving light)
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    opacity: 0.5,
  },
  shimmerGradient: {
    flex: 1,
    transform: [{ translateX: -50 }, { skewX: '-20deg' }],
  },

  // Glow border
  glowBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#AB47BC',
    opacity: 0.4,
  },

  // Helper text
  helperText: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
