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
import { PointsDisplay } from '../components/PointsDisplay';

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
  const [decisionsToday, setDecisionsToday] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load streak and stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const streak = await streakService.getCurrentStreak();
      setStreakDays(streak);

      // Count decisions made today
      const today = new Date().toDateString();
      const allDecisions = await decisionService.getDecisions();
      const todayDecisions = allDecisions.filter(d => {
        const decisionDate = new Date(d.createdAt).toDateString();
        return decisionDate === today && d.completed;
      });
      setDecisionsToday(todayDecisions.length);
    } catch (error) {
      console.error('Failed to load stats:', error);
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Compact Logo */}
        <View style={styles.compactHeader}>
          <Text style={styles.compactLogo}>{Brand.name}</Text>
          <View style={styles.compactLogoBorder} />
        </View>

        {/* Racing Scoreboard - 3 Stats */}
        <View style={styles.scoreboard}>
          {/* Streak Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🔥</Text>
            </View>
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={styles.statValue}>{streakDays}</Text>
            <View style={styles.statCornerTL} />
            <View style={styles.statCornerBR} />
          </View>

          {/* Points Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⚡</Text>
            </View>
            <Text style={styles.statLabel}>POINTS</Text>
            <PointsDisplay size="small" showBackground={false} />
            <View style={styles.statCornerTL} />
            <View style={styles.statCornerBR} />
          </View>

          {/* Today Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📊</Text>
            </View>
            <Text style={styles.statLabel}>TODAY</Text>
            <Text style={styles.statValue}>{decisionsToday}</Text>
            <View style={styles.statCornerTL} />
            <View style={styles.statCornerBR} />
          </View>
        </View>

        {/* Hero: Quick Choice */}
        <Pressable
          onPressIn={() => {
            setPressedCard('quick');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          onPressOut={() => setPressedCard(null)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push('/quick-choice');
          }}
          style={[
            styles.heroQuickChoice,
            pressedCard === 'quick' && styles.heroQuickChoicePressed,
          ]}
        >
          <LinearGradient
            colors={['#00E676', '#00C853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroQuickGradient}
          >
            <View style={styles.heroQuickContent}>
              <Text style={styles.heroQuickEmoji}>⚡</Text>
              <View style={styles.heroQuickTextContainer}>
                <Text style={styles.heroQuickTitle}>QUICK CHOICE</Text>
                <Text style={styles.heroQuickSubtext}>A vs B • Instant decision</Text>
              </View>
              <View style={styles.heroQuickArrow}>
                <Text style={styles.heroQuickArrowText}>→</Text>
              </View>
            </View>
            {/* Racing corners */}
            <View style={styles.heroCornerTL} />
            <View style={styles.heroCornerTR} />
            <View style={styles.heroCornerBL} />
            <View style={styles.heroCornerBR} />
          </LinearGradient>
        </Pressable>

        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionTitle}>TEMPLATES</Text>
          <View style={styles.dividerLine} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Extra space for bottom nav
  },

  // Compact Header
  compactHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  compactLogo: {
    fontSize: 40,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  compactLogoBorder: {
    width: 80,
    height: 4,
    backgroundColor: Theme.colors.primary,
    marginTop: 8,
  },

  // Racing Scoreboard
  scoreboard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    minHeight: 100,
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statIcon: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.textTertiary,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  statCornerTL: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 10,
    height: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Theme.colors.primary,
  },
  statCornerBR: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Theme.colors.primary,
  },

  // Hero Quick Choice
  heroQuickChoice: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  heroQuickChoicePressed: {
    transform: [{ scale: 0.97 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  heroQuickGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  heroQuickContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroQuickEmoji: {
    fontSize: 48,
  },
  heroQuickTextContainer: {
    flex: 1,
  },
  heroQuickTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  heroQuickSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroQuickArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroQuickArrowText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  heroCornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroCornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroCornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 16,
    height: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroCornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textTertiary,
    letterSpacing: 2,
    fontFamily: 'monospace',
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
