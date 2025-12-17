import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';
import { pointsService } from '../services/PointsService';

interface PointsDisplayProps {
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show background */
  showBackground?: boolean;
  /** Pressable to view details */
  onPress?: () => void;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  size = 'medium',
  showBackground = true,
  onPress,
}) => {
  const [points, setPoints] = useState(0);
  const [displayPoints, setDisplayPoints] = useState(0);
  const glowAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    loadPoints();

    // Subscribe to points changes
    const unsubscribe = pointsService.subscribe((state) => {
      const newPoints = state.totalPoints;
      if (newPoints !== points) {
        setPoints(newPoints);
        animatePointsChange();
      }
    });

    // Continuous glow pulse
    const glowInterval = setInterval(() => {
      glowAnim.value = withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      );
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(glowInterval);
    };
  }, []);

  // Animate counter when points change
  useEffect(() => {
    if (points === displayPoints) return;

    const diff = points - displayPoints;
    const steps = Math.min(Math.abs(diff), 30); // Max 30 steps
    const increment = diff / steps;
    const duration = 800; // Total animation duration
    const stepDuration = duration / steps;

    let current = displayPoints;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setDisplayPoints(points);
        clearInterval(interval);
      } else {
        setDisplayPoints(Math.round(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [points]);

  const loadPoints = async () => {
    const total = await pointsService.getTotalPoints();
    setPoints(total);
    setDisplayPoints(total);
  };

  const animatePointsChange = () => {
    // Scale bounce
    scaleAnim.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  // Animated styles
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + glowAnim.value * 0.4,
    shadowRadius: 8 + glowAnim.value * 12,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // Size configurations
  const sizeConfig = {
    small: {
      container: styles.containerSmall,
      points: styles.pointsSmall,
      label: styles.labelSmall,
      icon: styles.iconSmall,
    },
    medium: {
      container: styles.containerMedium,
      points: styles.pointsMedium,
      label: styles.labelMedium,
      icon: styles.iconMedium,
    },
    large: {
      container: styles.containerLarge,
      points: styles.pointsLarge,
      label: styles.labelLarge,
      icon: styles.iconLarge,
    },
  };

  const config = sizeConfig[size];

  const content = (
    <Animated.View
      style={[
        styles.container,
        config.container,
        showBackground && styles.containerWithBg,
        glowStyle,
        scaleStyle,
      ]}
    >
      {/* Corner brackets */}
      {showBackground && (
        <>
          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />
        </>
      )}

      {/* Points Icon */}
      <View style={[styles.iconContainer, config.icon]}>
        <Text style={styles.iconText}>⚡</Text>
      </View>

      {/* Points Value */}
      <View style={styles.valueContainer}>
        <Text style={[styles.pointsValue, config.points]}>
          {formatPoints(displayPoints)}
        </Text>
        <Text style={[styles.pointsLabel, config.label]}>PTS</Text>
      </View>

      {/* Scan line effect */}
      {showBackground && <View style={styles.scanLine} />}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// Format points with K/M suffixes
const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  containerWithBg: {
    backgroundColor: Theme.colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
  },
  pressed: {
    opacity: 0.7,
  },

  // Size variants
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },

  // Icon
  iconContainer: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  iconSmall: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  iconMedium: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  iconLarge: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  iconText: {
    fontSize: 14,
  },

  // Value
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pointsValue: {
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pointsSmall: {
    fontSize: 14,
  },
  pointsMedium: {
    fontSize: 20,
  },
  pointsLarge: {
    fontSize: 28,
  },
  pointsLabel: {
    fontWeight: '800',
    color: Theme.colors.textTertiary,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  labelSmall: {
    fontSize: 8,
  },
  labelMedium: {
    fontSize: 10,
  },
  labelLarge: {
    fontSize: 12,
  },

  // Corner brackets (tech aesthetic)
  bracket: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderColor: Theme.colors.primary,
    opacity: 0.5,
  },
  bracketTL: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  bracketTR: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bracketBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bracketBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  // Scan line effect
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Theme.colors.primary,
    opacity: 0.2,
  },
});
