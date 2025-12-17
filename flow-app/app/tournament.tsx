import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';
import { decisionService } from '../services/DecisionService';
import { streakService } from '../services/StreakService';
import { pointsService } from '../services/PointsService';
import { bettingService, BET_AMOUNTS } from '../services/BettingService';
import { RandomizeButton } from '../components/RandomizeButton';
import { DecisionTimer } from '../components/DecisionTimer';
import { PointsAnimation } from '../components/PointsAnimation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type TournamentOption = {
  text: string;
  eliminated: boolean;
  roundEliminated?: number;
};

type Matchup = {
  option1Index: number;
  option2Index: number;
  roundNumber: number;
};

export default function TournamentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const decisionId = params.decisionId as string;
  const question = params.question as string;
  const optionsParam = params.options as string;
  const startTime = useRef(Date.now());

  const [tournamentOptions, setTournamentOptions] = useState<TournamentOption[]>([]);
  const [bracket, setBracket] = useState<Matchup[]>([]);
  const [currentMatchupIndex, setCurrentMatchupIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [eliminatedOptions, setEliminatedOptions] = useState<TournamentOption[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [pointsReason, setPointsReason] = useState('');
  const [showBettingPanel, setShowBettingPanel] = useState(false);
  const [wasRandomPick, setWasRandomPick] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const leftCardOpacity = useSharedValue(1);
  const rightCardOpacity = useSharedValue(1);

  // Save decision result to database and award points
  const saveDecisionResult = async (winner: string, runnerUp: string, durationMs: number) => {
    if (!decisionId) {
      console.warn('No decisionId provided, skipping save');
      return;
    }

    try {
      await decisionService.updateDecision(decisionId, {
        winner,
        runnerUp,
        completed: true,
        durationMs,
      });

      // Update streak after completing decision
      const streakResult = await streakService.updateStreakAfterDecision();

      // Apply streak break penalty if applicable
      if (streakResult.streakBroken && streakResult.previousStreak > 0) {
        await pointsService.addPoints(
          -100,
          `Streak broken (lost ${streakResult.previousStreak} days)`,
          { category: 'penalty' }
        );
      }

      // Calculate and award points
      const timeInSeconds = Math.floor(durationMs / 1000);
      const { points, reason } = pointsService.calculateDecisionPoints(timeInSeconds, false);

      // Add points to user's balance
      await pointsService.addPoints(points, reason, {
        decisionId,
        category: 'decision',
      });

      // If streak was broken, show warning in points reason
      let finalReason = reason;
      if (streakResult.streakBroken && streakResult.previousStreak > 0) {
        finalReason = `${reason} | ⚠️ Streak broken -100`;
      }

      // Show points animation
      setPointsEarned(points);
      setPointsReason(finalReason);
      setShowPointsAnimation(true);
    } catch (error) {
      console.error('Failed to save decision:', error);
      // Don't show error to user - decision is complete in UI regardless
    }
  };

  // Initialize tournament options and create initial bracket
  useEffect(() => {
    if (optionsParam) {
      const parsed = JSON.parse(optionsParam);
      const initialOptions: TournamentOption[] = parsed.map((text: string) => ({
        text,
        eliminated: false,
      }));
      setTournamentOptions(initialOptions);

      // Create initial round 1 bracket
      const initialBracket: Matchup[] = [];
      for (let i = 0; i < parsed.length - 1; i += 2) {
        if (i + 1 < parsed.length) {
          initialBracket.push({
            option1Index: i,
            option2Index: i + 1,
            roundNumber: 1,
          });
        }
      }

      // If odd number of options, the last one gets a bye
      if (parsed.length % 2 !== 0) {
        // The last option will automatically advance
        // We'll handle this in the matchup logic
      }

      setBracket(initialBracket);
    }
  }, [optionsParam]);

  const handleChoice = (chosenIndex: number) => {
    const currentMatchup = bracket[currentMatchupIndex];
    if (!currentMatchup) return;

    const winnerIndex = chosenIndex === 0 ? currentMatchup.option1Index : currentMatchup.option2Index;
    const loserIndex = chosenIndex === 0 ? currentMatchup.option2Index : currentMatchup.option1Index;

    // Mark loser as eliminated
    const newOptions = [...tournamentOptions];
    newOptions[loserIndex].eliminated = true;
    newOptions[loserIndex].roundEliminated = currentMatchup.roundNumber;
    setTournamentOptions(newOptions);

    // Add to eliminated list for future reference
    setEliminatedOptions(prev => [...prev, newOptions[loserIndex]]);

    // Reset card position and opacity for next round
    translateX.value = 0;
    translateY.value = 0;
    rotate.value = 0;
    scale.value = 1;
    leftCardOpacity.value = 1;
    rightCardOpacity.value = 1;

    // Check if this is the last matchup in current round
    const currentRound = currentMatchup.roundNumber;
    const matchupsInCurrentRound = bracket.filter(m => m.roundNumber === currentRound);
    const currentRoundIndex = matchupsInCurrentRound.findIndex(
      m => m.option1Index === currentMatchup.option1Index && m.option2Index === currentMatchup.option2Index
    );

    // Get all non-eliminated options
    const remainingOptions = newOptions
      .map((opt, idx) => ({ ...opt, index: idx }))
      .filter(opt => !opt.eliminated);

    // Check if we have a winner
    if (remainingOptions.length === 1) {
      const finalWinner = remainingOptions[0].text;
      const finalRunnerUp = newOptions[loserIndex].text; // Last eliminated option is runner-up

      setWinner(finalWinner);
      setIsComplete(true);

      // Save decision result to database
      const durationMs = Date.now() - startTime.current;
      saveDecisionResult(finalWinner, finalRunnerUp, durationMs);

      return;
    }

    // Check if current round is complete
    const allMatchupsInRoundComplete = matchupsInCurrentRound.every((matchup, idx) => {
      if (idx < currentRoundIndex) return true;
      if (idx === currentRoundIndex) return true;
      return newOptions[matchup.option1Index].eliminated || newOptions[matchup.option2Index].eliminated;
    });

    if (allMatchupsInRoundComplete && currentMatchupIndex + 1 >= bracket.filter(m => m.roundNumber === currentRound).length) {
      // Current round complete, create next round
      const nextRoundBracket: Matchup[] = [];

      for (let i = 0; i < remainingOptions.length - 1; i += 2) {
        if (i + 1 < remainingOptions.length) {
          nextRoundBracket.push({
            option1Index: remainingOptions[i].index,
            option2Index: remainingOptions[i + 1].index,
            roundNumber: currentRound + 1,
          });
        }
      }

      setBracket(prev => [...prev, ...nextRoundBracket]);
      setCurrentMatchupIndex(bracket.length);
    } else {
      // Move to next matchup in current round
      setCurrentMatchupIndex(currentMatchupIndex + 1);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 20;

      // Fade out the card that's being rejected
      if (event.translationX < 0) {
        // Swiping left, fade left card (option A)
        leftCardOpacity.value = interpolate(
          event.translationX,
          [-SWIPE_THRESHOLD, 0],
          [0.3, 1],
          Extrapolate.CLAMP
        );
        rightCardOpacity.value = 1;
      } else if (event.translationX > 0) {
        // Swiping right, fade right card (option B)
        rightCardOpacity.value = interpolate(
          event.translationX,
          [0, SWIPE_THRESHOLD],
          [1, 0.3],
          Extrapolate.CLAMP
        );
        leftCardOpacity.value = 1;
      }

      // Haptic feedback when crossing threshold
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right - choose option 2
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 });
        rightCardOpacity.value = withTiming(0, { duration: 200 });
        scale.value = withSequence(
          withTiming(1.05, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => runOnJS(handleChoice)(1), 250);
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped left - choose option 1
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        leftCardOpacity.value = withTiming(0, { duration: 200 });
        scale.value = withSequence(
          withTiming(1.05, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => runOnJS(handleChoice)(0), 250);
      } else {
        // Return to center
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
        rotate.value = withSpring(0, { damping: 15 });
        leftCardOpacity.value = withSpring(1);
        rightCardOpacity.value = withSpring(1);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -50 ? Math.min(Math.abs(translateX.value) / 150, 1) : 0,
  }));

  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 50 ? Math.min(translateX.value / 150, 1) : 0,
  }));

  const leftCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: leftCardOpacity.value,
  }));

  const rightCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rightCardOpacity.value,
  }));

  if (!tournamentOptions.length || !bracket.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const handlePlaceBet = async (betAmount: number) => {
    if (!decisionId) return;

    try {
      await bettingService.placeBet(decisionId, question, winner, betAmount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowBettingPanel(false);

      // Show confirmation
      Alert.alert(
        `Bet Placed! 🎲`,
        `You bet ${betAmount} pts on following through. Check History tab tomorrow to resolve it.`,
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.error('Failed to place bet:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Theme.colors.background, Theme.colors.primaryLight]}
          style={styles.gradient}
        >
          <View style={styles.resultContainer}>
            <View style={styles.confettiContainer}>
              <Text style={styles.confettiText}>{wasRandomPick ? '🎲' : '🎉'}</Text>
            </View>
            <Text style={styles.resultTitle}>
              {wasRandomPick ? 'Random Pick!' : 'Decision Made!'}
            </Text>
            <Text style={styles.resultQuestion}>{question}</Text>
            <View style={styles.winnerCard}>
              <LinearGradient
                colors={[Theme.colors.primary, '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.winnerCardGradient}
              >
                <Text style={styles.winnerLabel}>Your Choice</Text>
                <Text style={styles.winnerText}>{winner}</Text>
              </LinearGradient>
            </View>

            {/* Betting Panel - Only show if NOT random pick */}
            {!wasRandomPick && !showBettingPanel && (
              <Pressable
                style={styles.bettingPrompt}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowBettingPanel(true);
                }}
              >
                <Text style={styles.bettingPromptText}>💪 Bet on follow-through?</Text>
                <Text style={styles.bettingPromptSubtext}>Tap to place a bet</Text>
              </Pressable>
            )}

            {/* Betting Options */}
            {!wasRandomPick && showBettingPanel && (
              <View style={styles.bettingPanel}>
                <View style={styles.bettingHeader}>
                  <Text style={styles.bettingTitle}>BET ON FOLLOW-THROUGH</Text>
                  <Text style={styles.bettingSubtitle}>
                    Will you actually do it? Self-report tomorrow in History tab.
                  </Text>
                </View>

                <View style={styles.betButtons}>
                  <Pressable
                    style={[styles.betButton, styles.betButtonLow]}
                    onPress={() => handlePlaceBet(BET_AMOUNTS.LOW)}
                  >
                    <Text style={styles.betButtonLabel}>LOW</Text>
                    <Text style={styles.betButtonAmount}>{BET_AMOUNTS.LOW}</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.betButton, styles.betButtonMedium]}
                    onPress={() => handlePlaceBet(BET_AMOUNTS.MEDIUM)}
                  >
                    <Text style={styles.betButtonLabel}>MEDIUM</Text>
                    <Text style={styles.betButtonAmount}>{BET_AMOUNTS.MEDIUM}</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.betButton, styles.betButtonHigh]}
                    onPress={() => handlePlaceBet(BET_AMOUNTS.HIGH)}
                  >
                    <Text style={styles.betButtonLabel}>HIGH</Text>
                    <Text style={styles.betButtonAmount}>{BET_AMOUNTS.HIGH}</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.skipBetButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowBettingPanel(false);
                  }}
                >
                  <Text style={styles.skipBetText}>Skip Betting</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={styles.doneButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back();
              }}
            >
              <LinearGradient
                colors={[Theme.colors.primary, Theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneButtonGradient}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentMatchup = bracket[currentMatchupIndex];
  if (!currentMatchup) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error: No current matchup</Text>
      </SafeAreaView>
    );
  }

  const option1 = tournamentOptions[currentMatchup.option1Index];
  const option2 = tournamentOptions[currentMatchup.option2Index];
  const currentRound = currentMatchup.roundNumber;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background, Theme.colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.questionText}>{question}</Text>
          <View style={styles.roundBadge}>
            <LinearGradient
              colors={[Theme.colors.primary, Theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.roundBadgeGradient}
            >
              <Text style={styles.roundText}>Round {currentRound}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Decision Timer */}
        <View style={styles.timerContainer}>
          <DecisionTimer
            duration={60}
            isActive={!isComplete}
            onTick={(secondsRemaining) => {
              setElapsedSeconds(60 - secondsRemaining);
            }}
            onTimeout={async () => {
              // Deduct timeout penalty
              try {
                await pointsService.addPoints(
                  -50,
                  'Decision timeout',
                  { category: 'penalty' }
                );

                // Show penalty animation
                setPointsEarned(-50);
                setPointsReason('Decision timeout');
                setShowPointsAnimation(true);

                Alert.alert(
                  'Time\'s Up! -50 pts',
                  'The timer expired. Make a decision quickly!',
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Failed to apply timeout penalty:', error);
              }
            }}
          />
        </View>

        <View style={styles.tournamentArea}>
          {/* Choice indicators */}
          <Animated.View style={[styles.choiceIndicator, styles.leftIndicator, leftIndicatorStyle]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.indicatorGradient}
            >
              <Text style={styles.choiceText}>✓</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.choiceIndicator, styles.rightIndicator, rightIndicatorStyle]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.indicatorGradient}
            >
              <Text style={styles.choiceText}>✓</Text>
            </LinearGradient>
          </Animated.View>

          {/* Swipeable comparison view */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.comparisonContainer, animatedCardStyle]}>
              {/* Left Option Card */}
              <Animated.View style={[styles.optionCard, leftCardAnimatedStyle]}>
                <View style={styles.optionBadge}>
                  <LinearGradient
                    colors={[Theme.colors.primary, Theme.colors.primaryLight]}
                    style={styles.badgeGradient}
                  >
                    <Text style={styles.optionBadgeText}>A</Text>
                  </LinearGradient>
                </View>
                <View style={styles.optionCardContent}>
                  <Text style={styles.optionText}>{option1.text}</Text>
                </View>
                <View style={styles.swipeArrow}>
                  <Text style={styles.arrowText}>← Swipe Left</Text>
                </View>
              </Animated.View>

              {/* VS Divider */}
              <View style={styles.vsDivider}>
                <LinearGradient
                  colors={[Theme.colors.primary, '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.vsCircle}
                >
                  <Text style={styles.vsText}>VS</Text>
                </LinearGradient>
              </View>

              {/* Right Option Card */}
              <Animated.View style={[styles.optionCard, rightCardAnimatedStyle]}>
                <View style={styles.optionBadge}>
                  <LinearGradient
                    colors={[Theme.colors.primary, Theme.colors.primaryLight]}
                    style={styles.badgeGradient}
                  >
                    <Text style={styles.optionBadgeText}>B</Text>
                  </LinearGradient>
                </View>
                <View style={styles.optionCardContent}>
                  <Text style={styles.optionText}>{option2.text}</Text>
                </View>
                <View style={styles.swipeArrow}>
                  <Text style={styles.arrowText}>Swipe Right →</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          {/* Randomize Button (BEFORE swiping) */}
          <View style={styles.randomizeContainer}>
            <RandomizeButton
              options={tournamentOptions.filter(o => !o.eliminated).map(o => o.text)}
              onRandomize={async () => {
                // Pick random winner from ALL remaining options
                const remaining = tournamentOptions.filter(o => !o.eliminated);
                if (remaining.length > 0) {
                  const randomIndex = Math.floor(Math.random() * remaining.length);
                  const randomWinner = remaining[randomIndex].text;

                  // Find runner-up (next best option)
                  const runnerUp = remaining.find(o => o.text !== randomWinner)?.text || '';

                  // Save decision WITHOUT points (random picks don't earn points)
                  if (decisionId) {
                    try {
                      await decisionService.updateDecision(decisionId, {
                        winner: randomWinner,
                        runnerUp,
                        completed: true,
                        durationMs: Date.now() - startTime.current,
                      });
                    } catch (error) {
                      console.error('Failed to save random decision:', error);
                    }
                  }

                  // Set winner and complete (mark as random)
                  setWinner(randomWinner);
                  setWasRandomPick(true);
                  setIsComplete(true);

                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
            />
          </View>

          {/* Swipe hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>👆 Swipe to choose your favorite</Text>
          </View>
        </View>

        {/* Points Animation Overlay */}
        <PointsAnimation
          points={pointsEarned}
          reason={pointsReason}
          visible={showPointsAnimation}
          onComplete={() => setShowPointsAnimation(false)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  timerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  roundBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  roundBadgeGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  roundText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tournamentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  comparisonContainer: {
    width: CARD_WIDTH,
    height: SCREEN_HEIGHT * 0.35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    height: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: Theme.colors.border,
    justifyContent: 'space-between',
  },
  optionBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  optionCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  swipeArrow: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  arrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  vsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  vsText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  choiceIndicator: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 10,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  indicatorGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 40,
  },
  leftIndicator: {
    left: 50,
  },
  rightIndicator: {
    right: 50,
  },
  choiceText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  randomizeContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  hintContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confettiContainer: {
    marginBottom: 24,
  },
  confettiText: {
    fontSize: 80,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginBottom: 12,
  },
  resultQuestion: {
    fontSize: 17,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  winnerCard: {
    borderRadius: 24,
    width: '100%',
    overflow: 'hidden',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  winnerCardGradient: {
    padding: 40,
    alignItems: 'center',
  },
  winnerLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    opacity: 0.9,
  },
  winnerText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  doneButton: {
    borderRadius: 20,
    marginTop: 40,
    width: '100%',
    overflow: 'hidden',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Betting Prompt
  bettingPrompt: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    alignItems: 'center',
  },
  bettingPromptText: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  bettingPromptSubtext: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
    fontWeight: '600',
  },

  // Betting Panel
  bettingPanel: {
    marginTop: 20,
    padding: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    borderRadius: 16,
  },
  bettingHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  bettingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Theme.colors.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  bettingSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  betButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  betButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  betButtonLow: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  betButtonMedium: {
    backgroundColor: 'rgba(255, 214, 0, 0.1)',
    borderColor: '#FFD600',
  },
  betButtonHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  betButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textTertiary,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  betButtonAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    fontFamily: 'monospace',
  },
  skipBetButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipBetText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    textDecorationLine: 'underline',
  },
});
