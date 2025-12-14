import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { Theme } from '../constants/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>👤 PROFILE</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.description}>
            Manage your voices, preferences, and settings.
          </Text>
        </View>
      </SafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
