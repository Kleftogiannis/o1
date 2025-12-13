import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type TournamentOption = {
  text: string;
  wins: number;
};

export default function TournamentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const question = params.question as string;
  const optionsParam = params.options as string;

  const [tournamentOptions, setTournamentOptions] = useState<TournamentOption[]>([]);
  const [currentMatchup, setCurrentMatchup] = useState<[number, number]>([0, 1]);
  const [round, setRound] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [winner, setWinner] = useState<string>('');

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (optionsParam) {
      const parsed = JSON.parse(optionsParam);
      setTournamentOptions(parsed.map((text: string) => ({ text, wins: 0 })));
    }
  }, [optionsParam]);

  const handleChoice = (chosenIndex: number) => {
    const [option1, option2] = currentMatchup;
    const newOptions = [...tournamentOptions];

    if (chosenIndex === 0) {
      newOptions[option1].wins++;
    } else {
      newOptions[option2].wins++;
    }

    setTournamentOptions(newOptions);

    // Determine next matchup or end tournament
    const remainingOptions = newOptions
      .map((opt, idx) => ({ ...opt, originalIndex: idx }))
      .filter(opt => opt.wins >= round);

    if (remainingOptions.length === 1) {
      // We have a winner!
      setWinner(remainingOptions[0].text);
      setIsComplete(true);
    } else if (remainingOptions.length >= 2) {
      // Continue to next match
      const nextMatch: [number, number] = [
        remainingOptions[0].originalIndex,
        remainingOptions[1].originalIndex,
      ];
      setCurrentMatchup(nextMatch);
      setRound(round + 1);
    }

    // Reset card position
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 20;

      // Haptic feedback when crossing threshold
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right - choose option 2
        translateX.value = withTiming(SCREEN_WIDTH);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => runOnJS(handleChoice)(1), 200);
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped left - choose option 1
        translateX.value = withTiming(-SCREEN_WIDTH);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => runOnJS(handleChoice)(0), 200);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
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

  if (!tournamentOptions.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={styles.confettiContainer}>
            <Text style={styles.confettiText}>🎉</Text>
          </View>
          <Text style={styles.resultTitle}>Decision Made!</Text>
          <Text style={styles.resultQuestion}>{question}</Text>
          <View style={styles.winnerCard}>
            <Text style={styles.winnerLabel}>Your Choice</Text>
            <Text style={styles.winnerText}>{winner}</Text>
          </View>
          <Pressable
            style={styles.doneButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const [option1Index, option2Index] = currentMatchup;
  const option1 = tournamentOptions[option1Index];
  const option2 = tournamentOptions[option2Index];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionText}>{question}</Text>
        <Text style={styles.roundText}>Round {round}</Text>
      </View>

      <View style={styles.tournamentArea}>
        {/* Choice indicators */}
        <Animated.View style={[styles.choiceIndicator, styles.leftIndicator, leftIndicatorStyle]}>
          <Text style={styles.choiceText}>✓</Text>
        </Animated.View>
        <Animated.View style={[styles.choiceIndicator, styles.rightIndicator, rightIndicatorStyle]}>
          <Text style={styles.choiceText}>✓</Text>
        </Animated.View>

        {/* Swipeable card */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <View style={styles.cardContent}>
              <View style={styles.vsContainer}>
                <View style={styles.optionContainer}>
                  <Text style={styles.vsLabel}>OPTION A</Text>
                  <Text style={styles.optionText}>{option1.text}</Text>
                </View>

                <View style={styles.vsDivider}>
                  <Text style={styles.vsText}>VS</Text>
                </View>

                <View style={styles.optionContainer}>
                  <Text style={styles.vsLabel}>OPTION B</Text>
                  <Text style={styles.optionText}>{option2.text}</Text>
                </View>
              </View>

              <Text style={styles.swipeHint}>← Swipe to choose →</Text>
            </View>
          </Animated.View>
        </GestureDetector>

        {/* Manual choice buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.choiceButton, styles.leftButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleChoice(0);
            }}
          >
            <Text style={styles.choiceButtonText}>Choose A</Text>
          </Pressable>

          <Pressable
            style={[styles.choiceButton, styles.rightButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleChoice(1);
            }}
          >
            <Text style={styles.choiceButtonText}>Choose B</Text>
          </Pressable>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  roundText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tournamentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  vsContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  optionContainer: {
    alignItems: 'center',
    gap: 12,
  },
  vsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  optionText: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  vsDivider: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.primary,
    letterSpacing: 2,
  },
  swipeHint: {
    fontSize: 14,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
  choiceIndicator: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  leftIndicator: {
    left: 40,
    backgroundColor: Theme.colors.primaryLight,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
  },
  rightIndicator: {
    right: 40,
    backgroundColor: Theme.colors.primaryLight,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
  },
  choiceText: {
    fontSize: 40,
    color: Theme.colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: CARD_WIDTH,
  },
  choiceButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  leftButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  rightButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
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
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  winnerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    padding: 18,
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
