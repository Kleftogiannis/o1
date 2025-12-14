import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Theme } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing logo animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glowing accent animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/home');
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Animated glow effects */}
      {/* <Animated.View
        style={[
          styles.glowCircle,
          styles.glowTop,
          { opacity: glowOpacity }
        ]}
      />
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowBottom,
          { opacity: glowOpacity }
        ]}
      /> */}

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            {/* O(1) with racing stripe aesthetic */}
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>O(1)</Text>
              <View style={styles.underline} />
              <View style={[styles.underline, styles.underlineAccent]} />
            </View>
          </Animated.View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>DECIDE IN NO TIME</Text>
            <View style={styles.taglineLine} />
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Every decision takes O(1) time,{'\n'}not O(n)
          </Text>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          {/* Decorative element above button */}
          <View style={styles.decorAboveButton}>
            <View style={styles.decorLine} />
            <Text style={styles.decorText}>REMOVE DECISION FATIGUE</Text>
            <View style={styles.decorLine} />
          </View>

          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[Theme.colors.primary, Theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <View style={styles.ctaContent}>
                <Text style={styles.ctaText}>START DECIDING</Text>
                <View style={styles.ctaArrow}>
                  <View style={styles.arrowLine} />
                  <View style={styles.arrowHead} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Speed indicator */}
          <View style={styles.speedIndicator}>
            <View style={styles.speedDot} />
            <Text style={styles.speedText}>Instant • No thinking • Just decide</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  // Glow effects
  glowCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Theme.colors.primary,
    opacity: 0.3,
  },
  glowTop: {
    top: -200,
    right: -100,
    opacity: 0.15,
  },
  glowBottom: {
    bottom: -150,
    left: -150,
    opacity: 0.12,
  },

  // Main content
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: SCREEN_HEIGHT * 0.15,
    paddingBottom: 60,
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 96,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: -4,
    fontFamily: 'monospace',
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  underline: {
    width: '120%',
    height: 8,
    backgroundColor: Theme.colors.textPrimary,
    marginTop: 8,
  },
  underlineAccent: {
    backgroundColor: Theme.colors.primary,
    height: 4,
    marginTop: 4,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  // Tagline
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  taglineLine: {
    flex: 1,
    height: 2,
    backgroundColor: Theme.colors.primary,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  // Subtitle
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // CTA Section
  ctaSection: {
    alignItems: 'center',
    gap: 24,
  },
  decorAboveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
    marginBottom: 8,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16, // Modern rounded edges
    overflow: 'hidden',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.96 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  ctaGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  ctaArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowLine: {
    width: 30,
    height: 4,
    backgroundColor: '#FFFFFF',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: '#FFFFFF',
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },

  // Speed indicator
  speedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  speedText: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },

  // Decorative elements
  decorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  decorText: {
    fontSize: 9,
    color: Theme.colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
});
