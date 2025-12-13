import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { initDatabase, seedDatabase } from '../models/database';

export default function RootLayout() {
  // Initialize database on app mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        await seedDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A0A0A',
          },
          headerTintColor: '#F5F5F5',
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#0A0A0A',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'O(1)'
          }}
        />
        <Stack.Screen
          name="create-decision"
          options={{
            title: 'New Decision',
            presentation: 'card',
            headerBackTitle: 'Cancel',
          }}
        />
        <Stack.Screen
          name="tournament"
          options={{
            title: 'Tournament',
            presentation: 'card',
            headerBackTitle: 'Back',
            gestureEnabled: false, // Prevent accidental swipe back
          }}
        />
        <Stack.Screen
          name="debug"
          options={{
            title: 'Debug Database',
            presentation: 'modal'
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
