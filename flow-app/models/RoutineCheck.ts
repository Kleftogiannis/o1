import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class RoutineCheck extends Model {
  static table = 'routine_checks';

  @field('question') question!: string;
  @field('type') type!: 'boolean' | 'number' | 'text';
  @field('value') value?: string;
  @field('reset_frequency') resetFrequency!: 'daily' | 'weekly' | 'monthly';
  @field('last_reset_at') lastResetAt?: number;
  @field('is_active') isActive!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  async updateValue(newValue: string): Promise<void> {
    await this.update((check) => {
      check.value = newValue;
    });
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Routine check-ins (e.g., "Did you work out today?")
 *
 * WHY:
 * - Habit tracking integration
 * - Context for decisions: "Haven't worked out in 5 days" → gym decision
 * - Phase 3+ feature for anticipatory system
 *
 * HOW:
 * - type: boolean (yes/no), number (count), text (freeform)
 * - resetFrequency: When to clear value
 * - Used in Phase 3+ for context-aware decisions
 *
 * ARCHITECTURE:
 * - Phase 3+: Basic routine checks
 * - Phase 9: Integrate with decision context
 *
 * =============================================================================
 */
