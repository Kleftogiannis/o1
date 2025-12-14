import { useState, useEffect } from 'react';
import { initDatabase, getDatabase, seedDatabase } from '../models/database';
import type Loki from 'lokijs';

/**
 * Hook to initialize and access the database
 * Ensures database is ready before components use it
 */
export function useDatabase() {
  const [db, setDb] = useState<Loki | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const database = await initDatabase();

        // Seed database if empty (first launch)
        await seedDatabase();

        if (mounted) {
          setDb(database);
          setIsReady(true);
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown database error'));
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return { db, isReady, error };
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: React hook for database initialization and access
 *
 * WHY:
 * - Ensures database is initialized before components use it
 * - Handles loading and error states
 * - Follows React hooks pattern (familiar to React developers)
 * - Auto-seeds database on first launch
 * - Prevents memory leaks with cleanup
 *
 * USAGE:
 * ```typescript
 * import { useDatabase } from '@/hooks/useDatabase';
 *
 * function MyComponent() {
 *   const { db, isReady, error } = useDatabase();
 *
 *   if (!isReady) {
 *     return <Text>Loading database...</Text>;
 *   }
 *
 *   if (error) {
 *     return <Text>Error: {error.message}</Text>;
 *   }
 *
 *   // Database is ready, use services
 *   return <YourComponent />;
 * }
 * ```
 *
 * ALTERNATIVE (RECOMMENDED):
 * Instead of using this hook in every component, initialize database once
 * in app root (_layout.tsx) and use services directly:
 *
 * ```typescript
 * // In _layout.tsx
 * const { isReady } = useDatabase();
 * if (!isReady) return <SplashScreen />;
 *
 * // In other components
 * import { decisionService } from '@/services/DecisionService';
 * const decision = await decisionService.createDecision(...);
 * ```
 *
 * PERFORMANCE:
 * - Runs only once per app launch (useEffect with empty deps)
 * - Database initialization: <100ms (target)
 * - Auto-seeding: <200ms (only on first launch)
 *
 * =============================================================================
 */
