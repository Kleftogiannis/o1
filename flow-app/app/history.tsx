import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { decisionService, type DecisionRecord } from '../services/DecisionService';
import { bettingService, type DecisionBet } from '../services/BettingService';
import { pointsService } from '../services/PointsService';
import { PointsAnimation } from '../components/PointsAnimation';

type GroupedDecisions = {
  today: DecisionRecord[];
  yesterday: DecisionRecord[];
  thisWeek: DecisionRecord[];
  earlier: DecisionRecord[];
};

export default function HistoryScreen() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [groupedDecisions, setGroupedDecisions] = useState<GroupedDecisions>({
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingBets, setPendingBets] = useState<DecisionBet[]>([]);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [pointsReason, setPointsReason] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const allDecisions = await decisionService.getDecisions({ completed: true });
      const statsData = await decisionService.getStats();
      const bets = await bettingService.getPendingBets();
      setPendingBets(bets);

      // Group decisions by time
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const oneWeekMs = 7 * oneDayMs;

      const grouped: GroupedDecisions = {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: [],
      };

      allDecisions.forEach((decision) => {
        const age = now - decision.createdAt;
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const startOfYesterday = startOfToday - oneDayMs;

        if (decision.createdAt >= startOfToday) {
          grouped.today.push(decision);
        } else if (decision.createdAt >= startOfYesterday) {
          grouped.yesterday.push(decision);
        } else if (age <= oneWeekMs) {
          grouped.thisWeek.push(decision);
        } else {
          grouped.earlier.push(decision);
        }
      });

      setDecisions(allDecisions);
      setGroupedDecisions(grouped);
      setStats({
        total: statsData.totalDecisions,
        thisWeek: grouped.today.length + grouped.yesterday.length + grouped.thisWeek.length,
        avgDuration: statsData.averageDurationMs,
      });
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number | undefined): string => {
    if (!ms) return '—';
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      'LUNCH': '#FF6B35',
      'WORKOUT': '#00E676',
      'WEEKEND': '#00B8D4',
      'COFFEE': '#FFD600',
      'EVENING': '#AB47BC',
      'WORK FOCUS': '#FF5252',
    };
    return category ? (colors[category] || '#888888') : '#888888';
  };

  const toggleExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleResolveBet = async (betId: string, outcome: 'completed' | 'skipped') => {
    try {
      const { bet, pointsAwarded } = await bettingService.resolveBet(betId, outcome);

      // Award/deduct points
      await pointsService.addPoints(
        pointsAwarded,
        outcome === 'completed'
          ? `Bet won: ${bet.winner}`
          : `Bet lost: ${bet.winner}`,
        { decisionId: bet.decisionId, category: 'bet' }
      );

      // Show points animation
      setPointsEarned(pointsAwarded);
      setPointsReason(
        outcome === 'completed'
          ? `You did it! +${bet.betAmount}`
          : `Didn't follow through -${bet.betAmount}`
      );
      setShowPointsAnimation(true);

      // Reload bets
      const updatedBets = await bettingService.getPendingBets();
      setPendingBets(updatedBets);

      Haptics.notificationAsync(
        outcome === 'completed'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      console.error('Failed to resolve bet:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderDecisionCard = (decision: DecisionRecord) => {
    const isExpanded = expandedId === decision.id;
    const categoryColor = getCategoryColor(decision.category);

    return (
      <Pressable
        key={decision.id}
        onPress={() => toggleExpand(decision.id)}
        style={styles.decisionCard}
      >
        <View style={[styles.cardBorder, { borderLeftColor: categoryColor }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTime}>{formatTime(decision.createdAt)}</Text>
              {decision.category && (
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                  <Text style={styles.categoryBadgeText}>{decision.category}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDuration}>{formatDuration(decision.durationMs)}</Text>
          </View>

          {/* Question */}
          <Text style={styles.cardQuestion} numberOfLines={isExpanded ? undefined : 2}>
            {decision.question}
          </Text>

          {/* Winner */}
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerLabel}>WINNER:</Text>
            <Text style={[styles.winnerText, { color: categoryColor }]}>
              {decision.winner}
            </Text>
          </View>

          {/* Expanded Details */}
          {isExpanded && (
            <View style={styles.expandedDetails}>
              {decision.runnerUp && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Runner-up:</Text>
                  <Text style={styles.detailValue}>{decision.runnerUp}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Options:</Text>
                <Text style={styles.detailValue}>{decision.options.length} total</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Method:</Text>
                <Text style={styles.detailValue}>{decision.method}</Text>
              </View>
            </View>
          )}

          {/* Expand Indicator */}
          <View style={styles.expandIndicator}>
            <Text style={styles.expandIndicatorText}>
              {isExpanded ? '▲ Tap to collapse' : '▼ Tap for details'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSection = (title: string, decisions: DecisionRecord[]) => {
    if (decisions.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionCount}>{decisions.length}</Text>
        </View>
        {decisions.map(renderDecisionCard)}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E676" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>HISTORY</Text>
        </View>

        {/* Pending Bets Section */}
        {pendingBets.length > 0 && (
          <View style={styles.pendingBetsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.pendingBetsTitle}>⏳ PENDING BETS</Text>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionCount}>{pendingBets.length}</Text>
            </View>

            {pendingBets.map((bet) => (
              <View key={bet.id} style={styles.betCard}>
                <View style={styles.betHeader}>
                  <Text style={styles.betQuestion} numberOfLines={2}>
                    {bet.question}
                  </Text>
                  <View style={styles.betAmountBadge}>
                    <Text style={styles.betAmountText}>{bet.betAmount} pts</Text>
                  </View>
                </View>

                <View style={styles.betChoice}>
                  <Text style={styles.betChoiceLabel}>YOU CHOSE:</Text>
                  <Text style={styles.betChoiceText}>{bet.winner}</Text>
                </View>

                <View style={styles.betActions}>
                  <Pressable
                    style={[styles.betActionButton, styles.betActionDone]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleResolveBet(bet.id, 'completed');
                    }}
                  >
                    <Text style={styles.betActionTextDone}>✓ DID IT</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.betActionButton, styles.betActionSkipped]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleResolveBet(bet.id, 'skipped');
                    }}
                  >
                    <Text style={styles.betActionTextSkipped}>✗ SKIPPED</Text>
                  </Pressable>
                </View>

                <Text style={styles.betTimeAgo}>
                  {Math.floor((Date.now() - bet.createdAt) / (1000 * 60 * 60))}h ago
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['#1A1A1A', '#0F0F0F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>TOTAL DECISIONS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.thisWeek}</Text>
                <Text style={styles.statLabel}>THIS WEEK</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(stats.avgDuration)}</Text>
                <Text style={styles.statLabel}>AVG TIME</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Empty State */}
        {decisions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>No decisions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Make your first decision to see it here
            </Text>
          </View>
        )}

        {/* Timeline Sections */}
        {renderSection('TODAY', groupedDecisions.today)}
        {renderSection('YESTERDAY', groupedDecisions.yesterday)}
        {renderSection('THIS WEEK', groupedDecisions.thisWeek)}
        {renderSection('EARLIER', groupedDecisions.earlier)}

        <View style={styles.footer} />
      </ScrollView>

      {/* Points Animation Overlay */}
      <PointsAnimation
        points={pointsEarned}
        reason={pointsReason}
        visible={showPointsAnimation}
        onComplete={() => setShowPointsAnimation(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'monospace',
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  // Stats Card
  statsCard: {
    marginBottom: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#00E676',
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  statsGradient: {
    padding: 24,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00E676',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },

  // Empty State
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00E676',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  sectionDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#333333',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'monospace',
  },

  // Decision Card
  decisionCard: {
    marginBottom: 12,
  },
  cardBorder: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    fontFamily: 'monospace',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  cardDuration: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'monospace',
  },
  cardQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: '#CCCCCC',
    lineHeight: 22,
    marginBottom: 12,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  winnerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AAAAAA',
    fontFamily: 'monospace',
  },
  expandIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  expandIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#444444',
  },

  footer: {
    height: 20,
  },

  // Pending Bets
  pendingBetsSection: {
    marginBottom: 32,
  },
  pendingBetsTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD600',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  betCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD600',
    padding: 16,
    marginBottom: 12,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  betQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    lineHeight: 20,
  },
  betAmountBadge: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  betAmountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'monospace',
  },
  betChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  betChoiceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  betChoiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD600',
    flex: 1,
  },
  betActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  betActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  betActionDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  betActionSkipped: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  betActionTextDone: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  betActionTextSkipped: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  betTimeAgo: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
