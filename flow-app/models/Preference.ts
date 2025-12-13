import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Preference extends Model {
  static table = 'preferences';

  @field('category') category!: string;
  @field('option_name') optionName!: string;
  @field('win_count') winCount!: number;
  @field('loss_count') lossCount!: number;
  @field('last_chosen_at') lastChosenAt?: number;
  @field('last_rejected_at') lastRejectedAt?: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  get winRate(): number {
    const total = this.winCount + this.lossCount;
    return total === 0 ? 0 : this.winCount / total;
  }

  async recordWin(): Promise<void> {
    await this.update((pref) => {
      pref.winCount += 1;
      pref.lastChosenAt = Date.now();
    });
  }

  async recordLoss(): Promise<void> {
    await this.update((pref) => {
      pref.lossCount += 1;
      pref.lastRejectedAt = Date.now();
    });
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Preference tracking for option choices over time
 *
 * WHY:
 * - Learn user patterns: "You always choose salad for lunch"
 * - ML readiness: Track wins/losses for future predictions
 * - Personalization: Pre-rank options based on history
 *
 * HOW:
 * - winCount/lossCount: Simple counters
 * - winRate computed property: % of times chosen
 * - Updated after each decision completion
 *
 * ARCHITECTURE:
 * - Phase 2: Basic tracking
 * - Phase 6: Use for option ordering/suggestions
 * - Phase 9: ML pattern learning
 *
 * =============================================================================
 */
