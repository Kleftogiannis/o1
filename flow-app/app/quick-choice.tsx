import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { decisionService } from '../services/DecisionService';
import { streakService } from '../services/StreakService';
import { RandomizeButton } from '../components/RandomizeButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Screen = 'create' | 'decide' | 'result';

export default function QuickChoiceScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('create');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [winner, setWinner] = useState('');
  const [decisionId, setDecisionId] = useState('');
  const startTime = useRef(Date.now());
  const [isCreating, setIsCreating] = useState(false);

  // Animation values
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const leftOpacity = useSharedValue(1);
  const rightOpacity = useSharedValue(1);

  const canProceed = question.trim() && optionA.trim() && optionB.trim();

  const handleCreate = async () => {
    if (!canProceed || isCreating) return;

    try {
      setIsCreating(true);
      Keyboard.dismiss();

      // Create decision in database
      const decision = await decisionService.createDecision({
        question: question.trim(),
        options: [optionA.trim(), optionB.trim()],
        method: 'tournament',
      });

      setDecisionId(decision.id);
      startTime.current = Date.now();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScreen('decide');
    } catch (error) {
      console.error('Failed to create decision:', error);
      Alert.alert('Error', 'Could not create decision. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChoice = async (chosenOption: string, otherOption: string) => {
    setWinner(chosenOption);

    // Save to database
    try {
      const durationMs = Date.now() - startTime.current;
      await decisionService.updateDecision(decisionId, {
        winner: chosenOption,
        runnerUp: otherOption,
        completed: true,
        durationMs,
      });

      // Update streak
      await streakService.updateStreakAfterDecision();
    } catch (error) {
      console.error('Failed to save decision:', error);
    }

    // Show result
    setScreen('result');
  };

  const handleRandomChoice = () => {
    // Randomly pick between option A and B
    const randomIndex = Math.floor(Math.random() * 2);
    const chosenOption = randomIndex === 0 ? optionA : optionB;
    const otherOption = randomIndex === 0 ? optionB : optionA;

    handleChoice(chosenOption, otherOption);
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;

      // Fade out the side being rejected
      if (event.translationX < 0) {
        // Swiping left - choose A
        leftOpacity.value = interpolate(
          event.translationX,
          [-SWIPE_THRESHOLD, 0],
          [1, 0.3],
          Extrapolate.CLAMP
        );
        rightOpacity.value = interpolate(
          event.translationX,
          [-SWIPE_THRESHOLD, 0],
          [0.5, 1],
          Extrapolate.CLAMP
        );
      } else {
        // Swiping right - choose B
        rightOpacity.value = interpolate(
          event.translationX,
          [0, SWIPE_THRESHOLD],
          [1, 0.3],
          Extrapolate.CLAMP
        );
        leftOpacity.value = interpolate(
          event.translationX,
          [0, SWIPE_THRESHOLD],
          [0.5, 1],
          Extrapolate.CLAMP
        );
      }

      // Haptic when crossing threshold
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        // Chose A
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => runOnJS(handleChoice)(optionA, optionB), 250);
      } else if (event.translationX > SWIPE_THRESHOLD) {
        // Chose B
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 });
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => runOnJS(handleChoice)(optionB, optionA), 250);
      } else {
        // Return to center
        translateX.value = withSpring(0, { damping: 15 });
        leftOpacity.value = withSpring(1);
        rightOpacity.value = withSpring(1);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const leftAnimatedStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -50 ? Math.min(Math.abs(translateX.value) / 150, 1) : 0,
  }));

  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 50 ? Math.min(translateX.value / 150, 1) : 0,
  }));

  // CREATE SCREEN
  if (screen === 'create') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>QUICK CHOICE</Text>
            </View>

            <Text style={styles.subtitle}>Two options. One swipe. Done.</Text>

            {/* Question */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>YOUR QUESTION</Text>
              <TextInput
                style={styles.questionInput}
                placeholder="e.g., Should I go to the gym?"
                placeholderTextColor="#666666"
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={200}
                autoFocus
              />
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <View style={styles.optionInputCard}>
                <LinearGradient
                  colors={['#00B8D4', '#0097A7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionGradient}
                >
                  <Text style={styles.optionLabel}>OPTION A</Text>
                  <TextInput
                    style={styles.optionInput}
                    placeholder="First choice"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={optionA}
                    onChangeText={setOptionA}
                    maxLength={50}
                  />
                </LinearGradient>
              </View>

              <View style={styles.vsDivider}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              <View style={styles.optionInputCard}>
                <LinearGradient
                  colors={['#FF6B35', '#FF8C42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionGradient}
                >
                  <Text style={styles.optionLabel}>OPTION B</Text>
                  <TextInput
                    style={styles.optionInput}
                    placeholder="Second choice"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={optionB}
                    onChangeText={setOptionB}
                    maxLength={50}
                  />
                </LinearGradient>
              </View>
            </View>
          </ScrollView>

          {/* Bottom CTA */}
          <View style={styles.bottomBar}>
            <Pressable
              onPress={handleCreate}
              style={[styles.startButton, (!canProceed || isCreating) && styles.startButtonDisabled]}
              disabled={!canProceed || isCreating}
            >
              <LinearGradient
                colors={['#00E676', '#00C853']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>
                  {isCreating ? 'CREATING...' : 'START DECIDING'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // DECISION SCREEN
  if (screen === 'decide') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.decisionContainer}>

          {/* Question */}
          <View style={styles.decisionHeader}>
            <Text style={styles.decisionQuestion}>{question}</Text>
            <Text style={styles.decisionHint}>👆 Swipe or tap to choose</Text>
          </View>

          {/* Choice Indicators */}
          <Animated.View style={[styles.choiceIndicator, styles.leftChoiceIndicator, leftIndicatorStyle]}>
            <LinearGradient colors={['#00B8D4', '#0097A7']} style={styles.indicatorGradient}>
              <Text style={styles.choiceText}>✓</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.choiceIndicator, styles.rightChoiceIndicator, rightIndicatorStyle]}>
            <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.indicatorGradient}>
              <Text style={styles.choiceText}>✓</Text>
            </LinearGradient>
          </Animated.View>

          {/* Swipeable Card */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.swipeCard, animatedCardStyle]}>
              {/* Option A (Left) */}
              <Pressable
                onPress={() => handleChoice(optionA, optionB)}
                style={styles.optionHalf}
              >
                <Animated.View style={[styles.optionHalfInner, leftAnimatedStyle]}>
                  <LinearGradient
                    colors={['#00B8D4', '#0097A7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionHalfGradient}
                  >
                    <Text style={styles.optionLetter}>A</Text>
                    <Text style={styles.optionText}>{optionA}</Text>
                    <Text style={styles.swipeHint}>← Swipe</Text>
                  </LinearGradient>
                </Animated.View>
              </Pressable>

              {/* VS Divider */}
              <View style={styles.centerDivider}>
                <LinearGradient
                  colors={['#00E676', '#00C853']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.vsCircle}
                >
                  <Text style={styles.vsCircleText}>VS</Text>
                </LinearGradient>
              </View>

              {/* Option B (Right) */}
              <Pressable
                onPress={() => handleChoice(optionB, optionA)}
                style={styles.optionHalf}
              >
                <Animated.View style={[styles.optionHalfInner, rightAnimatedStyle]}>
                  <LinearGradient
                    colors={['#FF6B35', '#FF8C42']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionHalfGradient}
                  >
                    <Text style={styles.optionLetter}>B</Text>
                    <Text style={styles.optionText}>{optionB}</Text>
                    <Text style={styles.swipeHint}>Swipe →</Text>
                  </LinearGradient>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </GestureDetector>

          {/* Random Choice Button */}
          <View style={styles.randomizeContainer}>
            <RandomizeButton
              options={[optionA, optionB]}
              onRandomize={handleRandomChoice}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // RESULT SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F0F0F', '#1A1A1A']} style={styles.resultContainer}>
        <View style={styles.resultContent}>
          <View style={styles.confettiContainer}>
            <Text style={styles.confettiText}>🎉</Text>
          </View>
          <Text style={styles.resultTitle}>Decision Made!</Text>
          <Text style={styles.resultQuestion}>{question}</Text>
          <View style={styles.winnerCard}>
            <LinearGradient
              colors={['#00E676', '#00C853']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.winnerCardGradient}
            >
              <Text style={styles.winnerLabel}>YOUR CHOICE</Text>
              <Text style={styles.winnerText}>{winner}</Text>
            </LinearGradient>
          </View>
          <Pressable
            style={styles.doneButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
          >
            <Text style={styles.doneButtonText}>DONE</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 15,
    color: '#888888',
    marginBottom: 32,
    paddingLeft: 4,
  },

  // Question Input
  inputCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00E676',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  questionInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    minHeight: 60,
  },

  // Options
  optionsContainer: {
    gap: 20,
  },
  optionInputCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  optionGradient: {
    padding: 20,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  optionInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vsDivider: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#666666',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  // Bottom Bar
  bottomBar: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 8 : 20,
    backgroundColor: '#0F0F0F',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  startButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  startButtonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },

  // Decision Screen
  decisionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  decisionHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    gap: 8,
  },
  decisionQuestion: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  decisionHint: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  swipeCard: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.4,
    flexDirection: 'row',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#2F2F35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  optionHalf: {
    flex: 1,
  },
  optionHalfInner: {
    flex: 1,
  },
  optionHalfGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  swipeHint: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  centerDivider: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  vsCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  vsCircleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  choiceIndicator: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    zIndex: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  indicatorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 50,
  },
  leftChoiceIndicator: {
    left: 50,
  },
  rightChoiceIndicator: {
    right: 50,
  },
  choiceText: {
    fontSize: 50,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  randomizeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },

  // Result Screen
  resultContainer: {
    flex: 1,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  resultQuestion: {
    fontSize: 17,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 32,
  },
  winnerCard: {
    borderRadius: 24,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  winnerCardGradient: {
    padding: 40,
    alignItems: 'center',
  },
  winnerLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  winnerText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  doneButton: {
    marginTop: 40,
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
});
