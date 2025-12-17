import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PointsAnimationProps {
  /** Points amount (positive = gain, negative = loss) */
  points: number;
  /** Reason text */
  reason?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Show animation */
  visible: boolean;
}

export const PointsAnimation: React.FC<PointsAnimationProps> = ({
  points,
  reason,
  onComplete,
  visible,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  // Particle animations (geometric burst)
  const particle1 = useSharedValue(0);
  const particle2 = useSharedValue(0);
  const particle3 = useSharedValue(0);
  const particle4 = useSharedValue(0);
  const particle5 = useSharedValue(0);
  const particle6 = useSharedValue(0);

  const isPositive = points > 0;
  const color = isPositive ? Theme.colors.success : Theme.colors.error;

  useEffect(() => {
    if (visible) {
      playAnimation();
    }
  }, [visible]);

  const playAnimation = () => {
    // Haptic feedback
    if (isPositive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Main card animation
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(2000, withTiming(0, { duration: 300 }))
    );

    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 10, stiffness: 100 }),
      withDelay(1800, withSpring(0.8, { damping: 10 }))
    );

    translateY.value = withSequence(
      withSpring(-20, { damping: 10, stiffness: 100 }),
      withDelay(1800, withTiming(-60, { duration: 300 }))
    );

    rotateZ.value = withSequence(
      withSpring(isPositive ? 5 : -5, { damping: 15 }),
      withSpring(0, { damping: 10 }),
      withDelay(1800, withTiming(isPositive ? -10 : 10, { duration: 300 }))
    );

    // Particle burst (hexagonal pattern)
    const particleConfig = {
      duration: 800,
      easing: Easing.out(Easing.quad),
    };

    particle1.value = withTiming(1, particleConfig);
    particle2.value = withDelay(50, withTiming(1, particleConfig));
    particle3.value = withDelay(100, withTiming(1, particleConfig));
    particle4.value = withDelay(150, withTiming(1, particleConfig));
    particle5.value = withDelay(200, withTiming(1, particleConfig));
    particle6.value = withDelay(250, withTiming(1, particleConfig));

    // Call onComplete after animation
    setTimeout(() => {
      onComplete?.();
      resetAnimation();
    }, 2500);
  };

  const resetAnimation = () => {
    opacity.value = 0;
    scale.value = 0.5;
    translateY.value = 0;
    rotateZ.value = 0;
    particle1.value = 0;
    particle2.value = 0;
    particle3.value = 0;
    particle4.value = 0;
    particle5.value = 0;
    particle6.value = 0;
  };

  // Main card style
  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  // Particle styles (geometric burst in 6 directions)
  const createParticleStyle = (
    particleValue: Animated.SharedValue<number>,
    angle: number,
    distance: number
  ) => {
    return useAnimatedStyle(() => {
      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians) * distance * particleValue.value;
      const y = Math.sin(radians) * distance * particleValue.value;

      return {
        opacity: 1 - particleValue.value,
        transform: [
          { translateX: x },
          { translateY: y },
          { scale: 1 - particleValue.value * 0.5 },
          { rotate: `${particleValue.value * 360}deg` },
        ],
      };
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Particle burst (hexagonal pattern) */}
      <View style={styles.particlesContainer}>
        <Animated.View
          style={[
            styles.particle,
            { backgroundColor: color },
            createParticleStyle(particle1, 0, 100),
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            { backgroundColor: color },
            createParticleStyle(particle2, 60, 100),
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            { backgroundColor: color },
            createParticleStyle(particle3, 120, 100),
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            { backgroundColor: color },
            createParticleStyle(particle4, 180, 100),
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            { backgroundColor: color },
            createParticleStyle(particle5, 240, 100),
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            { backgroundColor: color },
            createParticleStyle(particle6, 300, 100),
          ]}
        />
      </View>

      {/* Main points card */}
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Glow effect */}
        <View
          style={[
            styles.glow,
            {
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Points value */}
          <View style={styles.pointsContainer}>
            <Text style={[styles.pointsSign, { color }]}>
              {isPositive ? '+' : ''}
            </Text>
            <Text style={[styles.pointsValue, { color }]}>
              {Math.abs(points)}
            </Text>
            <Text style={styles.pointsLabel}>PTS</Text>
          </View>

          {/* Reason */}
          {reason && (
            <View style={styles.reasonContainer}>
              <View style={styles.reasonBorder} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}

          {/* Decorative elements */}
          <View style={styles.decorativeLines}>
            <View style={[styles.decorLine, { backgroundColor: color }]} />
            <View style={[styles.decorLine, { backgroundColor: color }]} />
            <View style={[styles.decorLine, { backgroundColor: color }]} />
          </View>
        </View>

        {/* Corner accents */}
        <View style={[styles.corner, styles.cornerTL, { borderColor: color }]} />
        <View style={[styles.corner, styles.cornerTR, { borderColor: color }]} />
        <View style={[styles.corner, styles.cornerBL, { borderColor: color }]} />
        <View style={[styles.corner, styles.cornerBR, { borderColor: color }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  // Particles
  particlesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  // Main card
  card: {
    backgroundColor: Theme.colors.background,
    borderWidth: 4,
    borderColor: Theme.colors.border,
    borderRadius: 16,
    padding: 24,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },

  // Glow effect
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 30,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },

  // Content
  content: {
    alignItems: 'center',
    gap: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pointsSign: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  pointsValue: {
    fontSize: 56,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    textShadowOpacity: 0.8,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: Theme.colors.textTertiary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginLeft: 4,
  },

  // Reason
  reasonContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reasonBorder: {
    width: 60,
    height: 2,
    backgroundColor: Theme.colors.border,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Decorative lines
  decorativeLines: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  decorLine: {
    width: 20,
    height: 3,
    opacity: 0.3,
  },

  // Corner accents
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
});
