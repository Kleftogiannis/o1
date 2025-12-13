import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

export interface VoiceAlignment {
  [voiceTemplate: string]: number; // -1 (oppose) to 1 (support)
}

export default class Factor extends Model {
  static table = 'factors';

  @field('statement') statement!: string;
  @field('category') category!: string;
  @field('is_custom') isCustom!: boolean;
  @field('usage_count') usageCount!: number;

  @json('voice_alignment', (json) => json) voiceAlignment!: VoiceAlignment;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  async incrementUsage(): Promise<void> {
    await this.update((factor) => {
      factor.usageCount += 1;
    });
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Factor model for decision-making statements users swipe on
 *
 * WHY:
 * - Phase 2 core feature: factor-based swiping (not just option comparison)
 * - Micro-decisions: "You haven't treated yourself in 10 days" → swipe right/left
 * - Voice alignment: Each factor aligns with certain voices
 *
 * HOW:
 * - statement: The factor text shown on card
 * - voiceAlignment: Maps voice template → score (-1 to 1)
 * - category: Groups factors ('health', 'finance', 'social', etc.)
 * - usageCount: Track which factors are most relevant
 *
 * Example:
 * Factor: "You haven't treated yourself in 10 days"
 * voiceAlignment: { disciplined: -0.5, lazy: 1.0, budget: -0.8 }
 * - Lazy Me strongly agrees (1.0)
 * - Budget Me opposes (-0.8)
 * - Disciplined Me slightly opposes (-0.5)
 *
 * USAGE:
 * const factor = await database.write(async () => {
 *   return await database.get<Factor>('factors').create(f => {
 *     f.statement = "You haven't treated yourself in 10 days";
 *     f.category = "self_care";
 *     f.voiceAlignment = {
 *       disciplined: -0.5,
 *       lazy: 1.0,
 *       budget: -0.8,
 *     };
 *     f.isCustom = false;
 *     f.usageCount = 0;
 *   });
 * });
 *
 * ARCHITECTURE:
 * - Phase 2: Factor-based swiping UI
 * - Phase 3: Voice voting uses factor alignment
 * - Phase 7: AI generates custom factors per decision
 *
 * =============================================================================
 */
