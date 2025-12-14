import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/brand';
import { Theme } from '../constants/theme';
import { decisionService } from '../services/DecisionService';
import { streakService } from '../services/StreakService';
import { StreakBadge } from '../components/StreakBadge';
import { BottomNav } from '../components/BottomNav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns with spacing

// Pre-built decision templates
const DECISION_TEMPLATES = [
  {
    id: 'lunch',
    emoji: '🍽️',
    title: 'LUNCH',
    question: 'What should I eat for lunch?',
    options: ['Salad', 'Burger', 'Sushi', 'Pizza', 'Sandwich'],
    color: '#FF6B35',
    gradient: ['#FF6B35', '#FF8C42'] as const,
  },
  {
    id: 'workout',
    emoji: '💪',
    title: 'WORKOUT',
    question: 'Should I work out tonight?',
    options: ['Gym', 'Home Workout', 'Rest Day', 'Quick Walk'],
    color: '#00E676',
    gradient: ['#00E676', '#00C853'] as const,
  },
  {
    id: 'weekend',
    emoji: '🎉',
    title: 'WEEKEND',
    question: 'What should I do this weekend?',
    options: ['Go Out', 'Stay Home', 'Side Project', 'Visit Friends', 'Adventure'],
    color: '#00B8D4',
    gradient: ['#00B8D4', '#0097A7'] as const,
  },
  {
    id: 'coffee',
    emoji: '☕',
    title: 'COFFEE',
    question: 'Coffee run or skip?',
    options: ['Get Coffee', 'Make at Home', 'Skip It'],
    color: '#FFD600',
    gradient: ['#FFD600', '#FFC107'] as const,
  },
  {
    id: 'evening',
    emoji: '🌙',
    title: 'EVENING',
    question: 'What to do tonight?',
    options: ['Netflix', 'Read', 'Side Project', 'Call Friend', 'Early Sleep'],
    color: '#AB47BC',
    gradient: ['#AB47BC', '#8E24AA'] as const,
  },
  {
    id: 'focus',
    emoji: '🎯',
    title: 'WORK FOCUS',
    question: 'What should I focus on?',
    options: ['Deep Work', 'Quick Tasks', 'Meetings', 'Break Time'],
    color: '#FF5252',
    gradient: ['#FF5252', '#E53935'] as const,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load streak on mount
  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const streak = await streakService.getCurrentStreak();
      setStreakDays(streak);
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  };

  const handleTemplatePress = async (template: typeof DECISION_TEMPLATES[0]) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Creating decision for template:', template.title);

      // Create decision in database
      const decision = await decisionService.createDecision({
        question: template.question,
        options: template.options,
        category: template.title,
        method: 'tournament',
      });

      console.log('Decision created:', decision.id);

      // Navigate to tournament
      router.push({
        pathname: '/tournament',
        params: {
          decisionId: decision.id,
          question: template.question,
          options: JSON.stringify(template.options),
        },
      });
    } catch (error) {
      console.error('Failed to create template decision:', error);
      alert('Error creating decision: ' + (error as Error).message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/create-decision');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Back to O(1) Home Button (top-left) */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/');
          }}
          style={styles.backToHomeButton}
        >
          <Text style={styles.backToHomeText}>← O(1)</Text>
        </Pressable>

        {/* Streak Badge (floating top-right) */}
        <StreakBadge streakDays={streakDays} position="top-right" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>{Brand.name}</Text>
            <View style={styles.logoBorder} />
          </View>
          <Text style={styles.tagline}>{Brand.tagline}</Text>
          <Text style={styles.subtitle}>Tap a card. Make a decision. Done.</Text>
        </View>

        {/* Decision Template Grid */}
        <View style={styles.grid}>
          {DECISION_TEMPLATES.map((template) => (
            <Pressable
              key={template.id}
              onPressIn={() => {
                setPressedCard(template.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onPressOut={() => setPressedCard(null)}
              onPress={() => handleTemplatePress(template)}
              style={[
                styles.templateCard,
                pressedCard === template.id && styles.templateCardPressed,
              ]}
            >
              <View
                style={[
                  styles.cardBorder,
                  { borderColor: template.color },
                  pressedCard === template.id && styles.cardBorderPressed,
                ]}
              >
                <LinearGradient
                  colors={template.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardEmoji}>{template.emoji}</Text>
                  <View style={styles.cardDivider} />
                  <Text style={styles.cardTitle}>{template.title}</Text>
                  <Text style={styles.cardOptions}>
                    {template.options.length} options
                  </Text>
                </LinearGradient>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Choice Card */}
        <Pressable
          onPressIn={() => {
            setPressedCard('quick');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => setPressedCard(null)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/quick-choice');
          }}
          style={[
            styles.quickCard,
            pressedCard === 'quick' && styles.quickCardPressed,
          ]}
        >
          <LinearGradient
            colors={['#00E676', '#00C853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickCardGradient}
          >
            <Text style={styles.quickCardEmoji}>⚡</Text>
            <Text style={styles.quickCardText}>QUICK CHOICE</Text>
            <Text style={styles.quickCardSubtext}>A vs B • 3 seconds</Text>
          </LinearGradient>
        </Pressable>

        {/* Custom Decision Card */}
        <Pressable
          onPressIn={() => {
            setPressedCard('custom');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => setPressedCard(null)}
          onPress={handleCustomPress}
          style={[
            styles.customCard,
            pressedCard === 'custom' && styles.customCardPressed,
          ]}
        >
          <View style={styles.customCardContent}>
            <Text style={styles.customCardIcon}>+</Text>
            <Text style={styles.customCardText}>CUSTOM DECISION</Text>
            <Text style={styles.customCardSubtext}>Make your own</Text>
          </View>
        </Pressable>

        {/* Footer Spacer - increased for bottom nav */}
        <View style={styles.footer} />
      </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  backToHomeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.backgroundSecondary,
    borderRadius: 8,
  },
  backToHomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary,
    fontFamily: 'monospace',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Extra space for bottom nav + floating button
  },

  // Hero Section
  hero: {
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  logo: {
    fontSize: 64,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  logoBorder: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: Theme.colors.primary,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Template Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },

  // Template Card
  templateCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
  },
  templateCardPressed: {
    transform: [{ scale: 0.96 }],
  },
  cardBorder: {
    flex: 1,
    borderWidth: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBorderPressed: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 48,
    marginTop: 8,
  },
  cardDivider: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  cardOptions: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Quick Choice Card
  quickCard: {
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  quickCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  quickCardGradient: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  quickCardEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  quickCardText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  quickCardSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  // Custom Card
  customCard: {
    marginTop: 4,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: Theme.colors.backgroundSecondary,
    overflow: 'hidden',
  },
  customCardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: Theme.colors.surface,
  },
  customCardContent: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  customCardIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: Theme.colors.textTertiary,
    marginBottom: 8,
  },
  customCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  customCardSubtext: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
    fontWeight: '500',
  },

  // Footer
  footer: {
    height: 20,
  },
});
