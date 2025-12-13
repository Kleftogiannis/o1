import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

export default class OptionPool extends Model {
  static table = 'option_pools';

  @field('category') category!: string;
  @field('subcategory') subcategory?: string;
  @field('is_custom') isCustom!: boolean;
  @field('usage_count') usageCount!: number;

  @json('options', (json) => json) options!: string[];

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  async incrementUsage(): Promise<void> {
    await this.update((pool) => {
      pool.usageCount += 1;
    });
  }

  async addOption(newOption: string): Promise<void> {
    await this.update((pool) => {
      if (!pool.options.includes(newOption)) {
        pool.options = [...pool.options, newOption];
      }
    });
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Pre-configured option pools by category (Food, Weekend, Work, etc.)
 *
 * WHY:
 * - Faster decision creation (select category vs typing all options)
 * - Learning from usage (track which pools are popular)
 * - Hardcoded pools for Phase 0, custom pools later
 *
 * HOW:
 * - isCustom: false for pre-built, true for user-created
 * - usageCount: Track popularity for ordering/recommendations
 * - options: JSON array of option strings
 *
 * USAGE:
 * const lunchPool = await database.write(async () => {
 *   return await database.get<OptionPool>('option_pools').create(p => {
 *     p.category = "Food";
 *     p.subcategory = "Lunch";
 *     p.options = ["Salad", "Burger", "Sushi", "Pizza"];
 *     p.isCustom = false;
 *     p.usageCount = 0;
 *   });
 * });
 *
 * ARCHITECTURE:
 * - Phase 0: Hardcoded pools (Food, Weekend, Work)
 * - Phase 2: User custom pools
 * - Phase 6: AI-suggested options based on patterns
 *
 * =============================================================================
 */
