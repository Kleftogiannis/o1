import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, getDatabaseStats, resetDatabase, COLLECTIONS, saveDatabase } from '../models/database';

interface Decision {
  $loki?: number;
  question: string;
  options: string[];
  winner: string;
  runnerUp?: string;
  method: 'tournament' | 'factor_swiping';
  durationMs?: number;
  createdAt: number;
  updatedAt: number;
}

interface Voice {
  $loki?: number;
  name: string;
  description?: string;
  weight: number;
  isActive: boolean;
  isTemplate: boolean;
  phrases: string[];
  timeWeights: {
    morning?: number;
    afternoon?: number;
    evening?: number;
    night?: number;
    weekday?: number;
    weekend?: number;
  };
  priorityGoals: string[];
  createdAt: number;
  updatedAt: number;
}

export default function DebugScreen() {
  const [stats, setStats] = useState({ decisions: 0, voices: 0, goals: 0, optionPools: 0 });
  const [lastDecision, setLastDecision] = useState<Decision | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadVoices();
  }, []);

  const loadStats = async () => {
    const dbStats = await getDatabaseStats();
    setStats(dbStats);
  };

  const loadVoices = async () => {
    const db = await getDatabase();
    const voicesCollection = db.getCollection<Voice>(COLLECTIONS.VOICES);
    const voiceList = voicesCollection?.find() || [];
    setVoices(voiceList);
  };

  const getCurrentWeight = (voice: Voice): number => {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    let multiplier = 1.0;

    // Time of day multiplier
    if (hour >= 6 && hour < 12) {
      multiplier *= voice.timeWeights.morning ?? 1.0;
    } else if (hour >= 12 && hour < 18) {
      multiplier *= voice.timeWeights.afternoon ?? 1.0;
    } else if (hour >= 18 && hour < 22) {
      multiplier *= voice.timeWeights.evening ?? 1.0;
    } else {
      multiplier *= voice.timeWeights.night ?? 1.0;
    }

    // Day of week multiplier
    if (isWeekend) {
      multiplier *= voice.timeWeights.weekend ?? 1.0;
    } else {
      multiplier *= voice.timeWeights.weekday ?? 1.0;
    }

    return voice.weight * multiplier;
  };

  const formatDuration = (durationMs?: number): string => {
    if (!durationMs) return 'Unknown';
    const seconds = Math.round(durationMs / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
  };

  const testCreateDecision = async () => {
    setLoading(true);
    try {
      const db = await getDatabase();
      const decisions = db.getCollection<Decision>(COLLECTIONS.DECISIONS);

      const decision: Decision = {
        question: 'Should I go to the gym?',
        options: ['Yes, go to gym', 'No, stay home'],
        winner: 'Yes, go to gym',
        runnerUp: 'No, stay home',
        method: 'tournament',
        durationMs: 5420,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      decisions.insert(decision);
      await saveDatabase();

      setLastDecision(decision);
      await loadStats();
      Alert.alert('Success', 'Decision created successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to create decision: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testReadDecisions = async () => {
    setLoading(true);
    try {
      const db = await getDatabase();
      const decisions = db.getCollection<Decision>(COLLECTIONS.DECISIONS);
      const allDecisions = decisions?.find() || [];

      Alert.alert(
        'Decisions',
        `Found ${allDecisions.length} decisions\n\n${allDecisions
          .slice(0, 3)
          .map((d) => `• ${d.question} → ${d.winner}`)
          .join('\n')}`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to read decisions: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateDecision = async () => {
    if (!lastDecision) {
      Alert.alert('Error', 'Create a decision first!');
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      const decisions = db.getCollection<Decision>(COLLECTIONS.DECISIONS);

      const decisionToUpdate = decisions.findOne({ $loki: lastDecision.$loki });
      if (decisionToUpdate) {
        decisionToUpdate.winner = 'No, stay home';
        decisionToUpdate.updatedAt = Date.now();
        decisions.update(decisionToUpdate);
        await saveDatabase();

        setLastDecision(decisionToUpdate);
        Alert.alert('Success', 'Decision updated! Winner changed to "No, stay home"');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to update decision: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteDecision = async () => {
    if (!lastDecision) {
      Alert.alert('Error', 'Create a decision first!');
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      const decisions = db.getCollection<Decision>(COLLECTIONS.DECISIONS);

      const decisionToDelete = decisions.findOne({ $loki: lastDecision.$loki });
      if (decisionToDelete) {
        decisions.remove(decisionToDelete);
        await saveDatabase();

        setLastDecision(null);
        await loadStats();
        Alert.alert('Success', 'Decision deleted!');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to delete decision: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete ALL data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await resetDatabase();
              setLastDecision(null);
              await loadStats();
              await loadVoices();
              Alert.alert('Success', 'Database reset complete!');
            } catch (error) {
              Alert.alert('Error', `Failed to reset database: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Database Debug</Text>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Stats</Text>
          <Text style={styles.stat}>Decisions: {stats.decisions}</Text>
          <Text style={styles.stat}>Voices: {stats.voices}</Text>
          <Text style={styles.stat}>Goals: {stats.goals}</Text>
          <Text style={styles.stat}>Option Pools: {stats.optionPools}</Text>
        </View>

        {/* Voices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loaded Voices</Text>
          {voices.map((voice) => (
            <Text key={voice.$loki} style={styles.stat}>
              • {voice.name} (weight: {getCurrentWeight(voice).toFixed(2)})
            </Text>
          ))}
        </View>

        {/* Last Decision */}
        {lastDecision && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Decision</Text>
            <Text style={styles.stat}>Q: {lastDecision.question}</Text>
            <Text style={styles.stat}>Winner: {lastDecision.winner}</Text>
            <Text style={styles.stat}>Duration: {formatDuration(lastDecision.durationMs)}</Text>
          </View>
        )}

        {/* CRUD Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CRUD Operations</Text>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testCreateDecision}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Create Decision</Text>
          </Pressable>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testReadDecisions}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Read All Decisions</Text>
          </Pressable>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testUpdateDecision}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Update Last Decision</Text>
          </Pressable>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testDeleteDecision}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Delete Last Decision</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonDanger, loading && styles.buttonDisabled]}
            onPress={handleResetDatabase}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Reset Database</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  stat: {
    fontSize: 15,
    color: '#6E6E73',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Debug screen for testing LokiJS CRUD operations
 *
 * WHY:
 * - Verify database setup works correctly with LokiJS
 * - Test Create, Read, Update, Delete operations
 * - Inspect database stats (record counts)
 * - Check seeded data (voices, option pools)
 * - Development/testing tool (remove before production)
 *
 * CHANGES FROM WATERMELONDB VERSION:
 * - Uses plain JavaScript objects instead of WatermelonDB Model classes
 * - Direct collection access via getDatabase() and COLLECTIONS
 * - Manual save calls with saveDatabase() (LokiJS doesn't auto-save on every operation)
 * - $loki field for record IDs instead of id field
 * - Timestamps are numbers (Date.now()) instead of Date objects
 *
 * HOW:
 * - Displays database stats on load
 * - Shows all seeded voices with current time-weighted scores
 * - Provides buttons to test each CRUD operation
 * - Displays last created decision for testing
 * - Reset database button for clean state
 *
 * USAGE:
 * Navigate to /debug in the app to access this screen
 * Use during development to verify database functionality
 *
 * GOTCHAS:
 * - Reset Database is DESTRUCTIVE - deletes everything
 * - This screen should be removed/hidden in production
 * - Use for development and testing only
 * - LokiJS auto-saves every 1 second, but manual saveDatabase() ensures immediate persistence
 *
 * ARCHITECTURE:
 * - Phase 0 tool: Verify LokiJS database setup
 * - Remove or protect with dev-only flag before launch
 * - Useful for debugging database issues during development
 *
 * =============================================================================
 */
