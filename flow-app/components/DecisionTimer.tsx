import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_HEIGHT = 60;

interface DecisionTimerProps {
  /** Duration in seconds */
  duration?: number;
  /** Callback when timer completes */
  onTimeout?: () => void;
  /** Callback every second with remaining time */
  onTick?: (secondsRemaining: number) => void;
  /** Whether timer is active */
  isActive?: boolean;
}

export const DecisionTimer: React.FC<DecisionTimerProps> = ({
  duration = 60,
  onTimeout,
  onTick,
  isActive = true,
}) => {
  const progress = useSharedValue(1); // 1 = full, 0 = empty
  const [secondsRemaining, setSecondsRemaining] = React.useState(duration);
  const [hasWarned30, setHasWarned30] = React.useState(false);
  const [hasWarned10, setHasWarned10] = React.useState(false);
  const [hasWarned5, setHasWarned5] = React.useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Animate progress bar from full to empty
    progress.value = withTiming(0, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    // Update seconds counter
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          clearInterval(interval);
          onTimeout?.();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return 0;
        }

        // Haptic feedback at milestones
        if (next === 30 && !hasWarned30) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setHasWarned30(true);
        } else if (next === 10 && !hasWarned10) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setHasWarned10(true);
        } else if (next === 5 && !hasWarned5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setHasWarned5(true);
        }

        onTick?.(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  // Animated progress bar style
  const progressBarStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.2, 0.5, 1],
      [
        Theme.colors.error,      // Empty = red
        '#FF6B35',               // Low = orange
        '#FFD600',               // Medium = yellow
        Theme.colors.success,    // Full = green
      ]
    );

    return {
      width: `${progress.value * 100}%`,
      backgroundColor,
    };
  });

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status text based on remaining time
  const getStatus = (): string => {
    if (secondsRemaining <= 5) return 'CRITICAL';
    if (secondsRemaining <= 10) return 'URGENT';
    if (secondsRemaining <= 30) return 'LOW TIME';
    return 'DECIDING';
  };

  // Get status color
  const getStatusColor = (): string => {
    if (secondsRemaining <= 5) return Theme.colors.error;
    if (secondsRemaining <= 10) return '#FF6B35';
    if (secondsRemaining <= 30) return '#FFD600';
    return Theme.colors.success;
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar Track */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />

        {/* Grid Lines (cyberpunk aesthetic) */}
        <View style={styles.gridLines}>
          {[...Array(10)].map((_, i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
      </View>

      {/* Tech Readout Panel */}
      <View style={styles.readoutPanel}>
        {/* Left: Status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatus()}
          </Text>
        </View>

        {/* Center: Time Display */}
        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>T-</Text>
          <Text style={styles.timeValue}>{formatTime(secondsRemaining)}</Text>
          <View style={styles.timeBorder} />
        </View>

        {/* Right: Progress Percent */}
        <View style={styles.percentSection}>
          <Text style={styles.percentValue}>
            {Math.round((secondsRemaining / duration) * 100)}%
          </Text>
        </View>
      </View>

      {/* Corner Accents (racing aesthetic) */}
      <View style={[styles.cornerAccent, styles.cornerTopLeft]} />
      <View style={[styles.cornerAccent, styles.cornerTopRight]} />
      <View style={[styles.cornerAccent, styles.cornerBottomLeft]} />
      <View style={[styles.cornerAccent, styles.cornerBottomRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: TIMER_HEIGHT,
    position: 'relative',
  },

  // Progress Bar
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: Theme.colors.backgroundSecondary,
    borderRadius: 0,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderTopColor: Theme.colors.border,
  },
  progressBar: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH / 20,
  },
  gridLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Tech Readout
  readoutPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TIMER_HEIGHT - 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.background,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderBottomWidth: 0,
  },

  // Status Section (Left)
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },

  // Time Section (Center)
  timeSection: {
    alignItems: 'center',
    position: 'relative',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  timeBorder: {
    position: 'absolute',
    bottom: -4,
    left: -8,
    right: -8,
    height: 2,
    backgroundColor: Theme.colors.primary,
  },

  // Percent Section (Right)
  percentSection: {
    alignItems: 'flex-end',
  },
  percentValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  // Corner Accents (Racing aesthetic)
  cornerAccent: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: Theme.colors.primary,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: 6,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: 6,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
});
