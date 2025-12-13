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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';

export default function CreateDecisionScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const optionInputRefs = useRef<(TextInput | null)[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const addOption = () => {
    if (options.length < 5) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const canProceed = question.trim() && options.filter(o => o.trim()).length >= 2;

  const handleStart = () => {
    if (canProceed) {
      Keyboard.dismiss();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to tournament screen with data
      router.push({
        pathname: '/tournament',
        params: {
          question,
          options: JSON.stringify(options.filter(o => o.trim())),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Decision</Text>
            <Text style={styles.headerSubtitle}>
              What are you deciding?
            </Text>
          </View>

          {/* Question Card */}
          <View style={[styles.card, styles.questionCard]}>
            <Text style={styles.label}>Your Question</Text>
            <TextInput
              style={styles.questionInput}
              placeholder="e.g., What should I do this weekend?"
              placeholderTextColor={Theme.colors.textTertiary}
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={200}
              autoFocus
            />
            <Text style={styles.charCount}>{question.length}/200</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Options</Text>
            <Text style={styles.sectionSubtitle}>
              Add 2-5 choices to compare
            </Text>

            {options.map((option, index) => (
              <View
                key={index}
                style={[
                  styles.optionCard,
                  focusedIndex === index && styles.optionCardFocused,
                ]}
                onLayout={(event) => {
                  // Store the Y position of each option card for scrolling
                  const layout = event.nativeEvent.layout;
                  if (!optionInputRefs.current[index]) {
                    optionInputRefs.current[index] = null;
                  }
                }}
              >
                <View style={styles.optionNumber}>
                  <Text style={styles.optionNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  ref={(ref) => {
                    optionInputRefs.current[index] = ref;
                  }}
                  style={styles.optionInput}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={Theme.colors.textTertiary}
                  value={option}
                  onChangeText={(value) => updateOption(index, value)}
                  onFocus={() => {
                    setFocusedIndex(index);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Scroll to make the focused input visible with some extra space
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: index * 80 + 200,
                        animated: true,
                      });
                    }, 100);
                  }}
                  onBlur={() => setFocusedIndex(null)}
                  maxLength={100}
                />
                {options.length > 2 && (
                  <Pressable
                    onPress={() => removeOption(index)}
                    style={styles.removeButton}
                    hitSlop={8}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </Pressable>
                )}
              </View>
            ))}

            {options.length < 5 && (
              <Pressable onPress={addOption} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add Option</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleStart}
            style={[
              styles.startButton,
              !canProceed && styles.startButtonDisabled,
            ]}
            disabled={!canProceed}
          >
            <Text style={styles.startButtonText}>
              Start Deciding
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 180,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 17,
    color: Theme.colors.textSecondary,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionCard: {
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  questionInput: {
    fontSize: 20,
    fontWeight: '500',
    color: Theme.colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
    textAlign: 'right',
    marginTop: 8,
  },
  optionsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardFocused: {
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  optionInput: {
    flex: 1,
    fontSize: 17,
    color: Theme.colors.textPrimary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 24,
    color: Theme.colors.textSecondary,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 8 : 20,
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  startButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: Theme.colors.backgroundSecondary,
    shadowOpacity: 0,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
