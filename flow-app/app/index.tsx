import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Brand } from '../constants/brand';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{Brand.name}</Text>
        <Text style={styles.subtitle}>{Brand.tagline}</Text>
        <Text style={styles.description}>
          {Brand.description}
        </Text>

        <Link href="/create-decision" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Make a Decision</Text>
          </Pressable>
        </Link>

        <Link href="/debug" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Debug Database</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F5F5F5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0A0',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2D5F4F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 240,
    shadowColor: '#2D5F4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#6B4E71',
    fontSize: 16,
    fontWeight: '600',
  },
});
