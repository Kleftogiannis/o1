import Loki from 'lokijs';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LokiJS Database Instance (Expo Go Compatible)
 * Pure JavaScript database - no native code required
 */

// Define collection names
export const COLLECTIONS = {
  DECISIONS: 'decisions',
  VOICES: 'voices',
  GOALS: 'goals',
  OPTION_POOLS: 'option_pools',
  PREFERENCES: 'preferences',
  ROUTINE_CHECKS: 'routine_checks',
  FACTORS: 'factors',
  USER_STATS: 'user_stats',
} as const;

// Database instance
let db: Loki | null = null;
let isInitialized = false;

/**
 * Initialize LokiJS database with React Native persistence
 */
export async function initDatabase(): Promise<Loki> {
  if (db && isInitialized) {
    return db;
  }

  return new Promise((resolve, reject) => {
    // Create custom adapter for React Native AsyncStorage
    const adapter = {
      loadDatabase: async (dbname: string, callback: (data: string | null) => void) => {
        try {
          const serialized = await AsyncStorage.getItem(dbname);
          callback(serialized);
        } catch (error) {
          console.error('Failed to load database:', error);
          callback(null);
        }
      },
      saveDatabase: async (dbname: string, dbstring: string, callback: () => void) => {
        try {
          await AsyncStorage.setItem(dbname, dbstring);
          callback();
        } catch (error) {
          console.error('Failed to save database:', error);
          callback();
        }
      },
    };

    db = new Loki('o1-decisions.db', {
      adapter: adapter as any,
      autoload: true,
      autoloadCallback: () => {
        // Initialize collections if they don't exist
        if (!db!.getCollection(COLLECTIONS.DECISIONS)) {
          db!.addCollection(COLLECTIONS.DECISIONS, {
            indices: ['createdAt'],
          });
        }
        if (!db!.getCollection(COLLECTIONS.VOICES)) {
          db!.addCollection(COLLECTIONS.VOICES, {
            indices: ['name'],
          });
        }
        if (!db!.getCollection(COLLECTIONS.GOALS)) {
          db!.addCollection(COLLECTIONS.GOALS);
        }
        if (!db!.getCollection(COLLECTIONS.OPTION_POOLS)) {
          db!.addCollection(COLLECTIONS.OPTION_POOLS, {
            indices: ['category'],
          });
        }
        if (!db!.getCollection(COLLECTIONS.PREFERENCES)) {
          db!.addCollection(COLLECTIONS.PREFERENCES);
        }
        if (!db!.getCollection(COLLECTIONS.ROUTINE_CHECKS)) {
          db!.addCollection(COLLECTIONS.ROUTINE_CHECKS);
        }
        if (!db!.getCollection(COLLECTIONS.FACTORS)) {
          db!.addCollection(COLLECTIONS.FACTORS);
        }
        if (!db!.getCollection(COLLECTIONS.USER_STATS)) {
          db!.addCollection(COLLECTIONS.USER_STATS);
        }

        isInitialized = true;
        resolve(db!);
      },
      autosave: true,
      autosaveInterval: 1000, // Auto-save every second
    });
  });
}

/**
 * Get database instance (initialize if needed)
 */
export async function getDatabase(): Promise<Loki> {
  if (!db || !isInitialized) {
    return await initDatabase();
  }
  return db;
}

/**
 * Reset database (for development/testing only)
 * WARNING: Deletes all data!
 */
export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();

  // Remove all collections
  Object.values(COLLECTIONS).forEach(collectionName => {
    const collection = database.getCollection(collectionName);
    if (collection) {
      database.removeCollection(collectionName);
    }
  });

  // Recreate collections
  database.addCollection(COLLECTIONS.DECISIONS, { indices: ['createdAt'] });
  database.addCollection(COLLECTIONS.VOICES, { indices: ['name'] });
  database.addCollection(COLLECTIONS.GOALS);
  database.addCollection(COLLECTIONS.OPTION_POOLS, { indices: ['category'] });
  database.addCollection(COLLECTIONS.PREFERENCES);
  database.addCollection(COLLECTIONS.ROUTINE_CHECKS);
  database.addCollection(COLLECTIONS.FACTORS);
  database.addCollection(COLLECTIONS.USER_STATS);

  // Save changes
  await saveDatabase();

  // Re-seed
  await seedDatabase();
}

/**
 * Manually save database
 */
export async function saveDatabase(): Promise<void> {
  return new Promise((resolve) => {
    if (db) {
      db.saveDatabase(() => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Seed initial data (hardcoded option pools, voice templates)
 */
export async function seedDatabase(): Promise<void> {
  const database = await getDatabase();
  const optionPools = database.getCollection(COLLECTIONS.OPTION_POOLS);
  const voices = database.getCollection(COLLECTIONS.VOICES);

  // Check if already seeded
  if (optionPools.count() > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Seed option pools
  optionPools.insert({
    category: 'Food',
    subcategory: 'Lunch',
    options: ['Salad', 'Burger', 'Sushi', 'Pizza', 'Sandwich', 'Pasta'],
    isCustom: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  optionPools.insert({
    category: 'Food',
    subcategory: 'Coffee',
    options: ['Get Coffee', 'Skip Coffee', 'Make Coffee at Home'],
    isCustom: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  optionPools.insert({
    category: 'Weekend',
    subcategory: 'Activities',
    options: [
      'Go Hiking',
      'Stay Home',
      'Visit Friends',
      'Work on Side Project',
      'Gym',
      'Movie Theater',
    ],
    isCustom: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  optionPools.insert({
    category: 'Work',
    subcategory: 'Focus',
    options: [
      'Deep Work Session',
      'Quick Tasks',
      'Take a Break',
      'Meeting Prep',
    ],
    isCustom: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  optionPools.insert({
    category: 'Evening',
    subcategory: 'Activities',
    options: [
      'Gym',
      'Netflix',
      'Read Book',
      'Side Project',
      'Call Friend',
      'Early Sleep',
    ],
    isCustom: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Seed default voices (templates)
  const voiceTemplates = [
    {
      name: 'Disciplined Me',
      description: 'Strict, goal-focused, long-term thinking',
      weight: 1.5,
      phrases: [
        "Think about your goals",
        "You'll regret this later",
        "Stay on track",
        "This aligns with your priorities",
      ],
      timeWeights: {
        morning: 2.0,
        afternoon: 1.2,
        evening: 0.8,
        night: 0.5,
        weekday: 1.5,
        weekend: 0.8,
      },
      priorityGoals: [],
      isActive: true,
      isTemplate: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      name: 'Lazy Me',
      description: 'Comfort-seeking, rest-focused, present pleasure',
      weight: 1.0,
      phrases: [
        "You deserve a break",
        "Life is short, enjoy it",
        "Just this once won't hurt",
        "Rest is important too",
      ],
      timeWeights: {
        morning: 0.5,
        afternoon: 1.0,
        evening: 1.5,
        night: 2.0,
        weekday: 0.8,
        weekend: 1.5,
      },
      priorityGoals: [],
      isActive: true,
      isTemplate: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      name: 'Future Me',
      description: 'Consequences-focused, long-term outcomes',
      weight: 1.3,
      phrases: [
        "Future you will thank you",
        "Think 10 years ahead",
        "Compound effects matter",
        "Your future self is watching",
      ],
      timeWeights: {
        morning: 1.8,
        afternoon: 1.3,
        evening: 1.0,
        night: 0.7,
      },
      priorityGoals: [],
      isActive: true,
      isTemplate: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      name: 'Budget Me',
      description: 'Money-conscious, financial responsibility',
      weight: 1.2,
      phrases: [
        "Check your budget first",
        "That's $X you could save",
        "Financial freedom > temporary pleasure",
        "Every dollar counts",
      ],
      timeWeights: {
        morning: 1.5,
        afternoon: 1.2,
        evening: 1.0,
        night: 0.8,
      },
      priorityGoals: [],
      isActive: true,
      isTemplate: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  voiceTemplates.forEach(template => voices.insert(template));

  // Save database
  await saveDatabase();

  console.log('Database seeded successfully!');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  decisions: number;
  voices: number;
  goals: number;
  optionPools: number;
}> {
  const database = await getDatabase();

  return {
    decisions: database.getCollection(COLLECTIONS.DECISIONS)?.count() || 0,
    voices: database.getCollection(COLLECTIONS.VOICES)?.count() || 0,
    goals: database.getCollection(COLLECTIONS.GOALS)?.count() || 0,
    optionPools: database.getCollection(COLLECTIONS.OPTION_POOLS)?.count() || 0,
  };
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: LokiJS database initialization (Expo Go compatible)
 *
 * WHY:
 * - WatermelonDB requires native code (JSI) - doesn't work in Expo Go
 * - LokiJS is pure JavaScript - works everywhere including Expo Go
 * - Allows testing on iPhone immediately without $99 Apple Developer account
 * - Good enough performance for Phase 0 (100-1000 decisions)
 *
 * ARCHITECTURE DECISION:
 * - Phase 0: Use LokiJS (pure JS, Expo Go compatible)
 * - Phase 3: Migrate to WatermelonDB (native performance, 10,000+ decisions)
 * - For now: "Build the simplest version that YOU will use today"
 *
 * HOW IT WORKS:
 * - LokiJS stores data in-memory with auto-save to AsyncStorage
 * - Custom adapter bridges LokiJS <-> React Native AsyncStorage
 * - Auto-save every 1 second ensures data persists
 * - Collections created on first load (like SQL tables)
 *
 * PERFORMANCE:
 * - Single record read: <5ms (in-memory)
 * - Query 100 records: <20ms (in-memory, indexed)
 * - Write with auto-save: <50ms (AsyncStorage bottleneck)
 * - Good for 100-1000 decisions, slower at 10,000+
 *
 * MIGRATION PATH (Phase 3):
 * When scaling to WatermelonDB:
 * 1. Export all LokiJS data to JSON
 * 2. Switch to WatermelonDB schema
 * 3. Import JSON data into WatermelonDB
 * 4. API stays similar (both use collections/documents pattern)
 *
 * USAGE:
 * ```typescript
 * import { getDatabase, COLLECTIONS } from './models/database';
 *
 * // Get database
 * const db = await getDatabase();
 *
 * // Insert decision
 * const decisions = db.getCollection(COLLECTIONS.DECISIONS);
 * decisions.insert({
 *   question: "Should I go to the gym?",
 *   options: ["Yes", "No"],
 *   winner: "Yes",
 *   method: "tournament",
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 * });
 *
 * // Query decisions
 * const recentDecisions = decisions
 *   .chain()
 *   .find()
 *   .simplesort('createdAt', true)
 *   .limit(10)
 *   .data();
 * ```
 *
 * GOTCHAS:
 * - LokiJS uses $loki and meta fields internally - don't use these names
 * - Timestamps are numbers (Date.now()), not Date objects
 * - Auto-save is async - data might not persist immediately if app crashes
 * - Collections must be initialized before use
 * - Queries use different syntax than WatermelonDB (simpler, but different)
 *
 * =============================================================================
 */
