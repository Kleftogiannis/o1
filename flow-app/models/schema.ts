import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * WatermelonDB Schema for O(1) App
 * Defines all tables and their columns for offline-first storage
 */

export const schema = appSchema({
  version: 1,
  tables: [
    // Decisions table - stores all completed decisions
    tableSchema({
      name: 'decisions',
      columns: [
        { name: 'question', type: 'string' },
        { name: 'category', type: 'string', isOptional: true },
        { name: 'winner', type: 'string' },
        { name: 'runner_up', type: 'string', isOptional: true },
        { name: 'options', type: 'string' }, // JSON array of all options
        { name: 'method', type: 'string' }, // 'tournament' or 'factor_swiping'
        { name: 'voice_breakdown', type: 'string', isOptional: true }, // JSON object
        { name: 'factor_scores', type: 'string', isOptional: true }, // JSON object
        { name: 'duration_ms', type: 'number', isOptional: true }, // Time to complete
        { name: 'created_at', type: 'number' }, // Unix timestamp
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Voices table - stores user's internal personas
    tableSchema({
      name: 'voices',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'weight', type: 'number' }, // Base weight (0.0 - 2.0)
        { name: 'priority_goals', type: 'string' }, // JSON array of goal IDs
        { name: 'phrases', type: 'string' }, // JSON array of characteristic phrases
        { name: 'time_weights', type: 'string' }, // JSON object: { morning: 2.0, afternoon: 1.0, ... }
        { name: 'is_active', type: 'boolean' },
        { name: 'is_template', type: 'boolean' }, // True for pre-built templates
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Goals table - stores user's long-term goals
    tableSchema({
      name: 'goals',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'priority', type: 'number' }, // 1-5
        { name: 'category', type: 'string', isOptional: true }, // 'health', 'career', 'finance', etc.
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Option Pools table - pre-configured option lists by category
    tableSchema({
      name: 'option_pools',
      columns: [
        { name: 'category', type: 'string' }, // 'Food', 'Weekend', 'Work', etc.
        { name: 'subcategory', type: 'string', isOptional: true },
        { name: 'options', type: 'string' }, // JSON array of option strings
        { name: 'is_custom', type: 'boolean' }, // False for hardcoded, true for user-created
        { name: 'usage_count', type: 'number' }, // Track popularity
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Preferences table - tracks which options user prefers over time
    tableSchema({
      name: 'preferences',
      columns: [
        { name: 'category', type: 'string' },
        { name: 'option_name', type: 'string' },
        { name: 'win_count', type: 'number' }, // How many times chosen as winner
        { name: 'loss_count', type: 'number' }, // How many times rejected
        { name: 'last_chosen_at', type: 'number', isOptional: true },
        { name: 'last_rejected_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Routine Checks table - recurring yes/no questions for tracking
    tableSchema({
      name: 'routine_checks',
      columns: [
        { name: 'question', type: 'string' },
        { name: 'type', type: 'string' }, // 'boolean', 'number', 'text'
        { name: 'value', type: 'string', isOptional: true }, // Current value
        { name: 'reset_frequency', type: 'string' }, // 'daily', 'weekly', 'monthly'
        { name: 'last_reset_at', type: 'number', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Factors table - reusable decision factors
    tableSchema({
      name: 'factors',
      columns: [
        { name: 'statement', type: 'string' }, // "You haven't treated yourself in 10 days"
        { name: 'category', type: 'string' }, // 'health', 'finance', 'social', etc.
        { name: 'voice_alignment', type: 'string' }, // JSON object: { disciplined: -1, lazy: 1, ... }
        { name: 'usage_count', type: 'number' },
        { name: 'is_custom', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: WatermelonDB schema definition for O(1) app's offline-first database
 *
 * WHY:
 * - WatermelonDB chosen for sub-100ms query performance (critical for O(1) UX)
 * - Offline-first architecture: all data local by default, sync to cloud later
 * - SQLite-based on device, no network required for core functionality
 * - Lazy loading pattern: read instantly from local DB, sync in background
 *
 * Schema Design Decisions:
 * - JSON columns for flexible data (voice_breakdown, options array)
 * - Timestamps as numbers (Unix ms) for easy sorting/filtering
 * - Separate tables for normalization (voices, goals, factors) vs denormalization (decisions)
 * - Usage counters (usage_count) to track patterns and optimize suggestions
 *
 * HOW:
 * - Schema version 1 (increment on breaking changes, triggers migrations)
 * - Each table has created_at/updated_at for sync conflict resolution
 * - Boolean flags (is_active, is_custom, is_template) for filtering
 * - JSON strings for complex data (parsed in model getters/setters)
 *
 * Table Relationships:
 * - decisions → voices (via voice_breakdown JSON)
 * - voices → goals (via priority_goals JSON array)
 * - decisions → factors (via factor_scores JSON)
 * - preferences → option_pools (via category + option_name)
 *
 * USAGE:
 * ```typescript
 * import { schema } from './schema';
 * import { Database } from '@nozbe/watermelondb';
 *
 * const database = new Database({
 *   adapter: ...,
 *   modelClasses: [...],
 *   schema,
 * });
 * ```
 *
 * GOTCHAS:
 * - Schema changes require version increment and migration
 * - JSON columns must be stringified before saving, parsed after reading
 * - created_at/updated_at are numbers (Date.now()), not Date objects
 * - WatermelonDB requires snake_case column names (not camelCase)
 *
 * ARCHITECTURE:
 * - Phase 0: decisions, option_pools (tournament mode)
 * - Phase 1: voices, goals (personality-driven decisions)
 * - Phase 2: factors, preferences (factor swiping + ML patterns)
 * - Phase 3+: routine_checks (habit tracking integration)
 *
 * Performance Optimizations:
 * - Indexes will be added in separate migration (see models/migrations.ts)
 * - Query optimization via WatermelonDB Q helpers (e.g., Q.where, Q.sortBy)
 * - Batch operations for multiple writes (reduces transaction overhead)
 *
 * =============================================================================
 */
