import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Goal extends Model {
  static table = 'goals';

  @field('name') name!: string;
  @field('description') description?: string;
  @field('priority') priority!: number; // 1-5
  @field('category') category?: string;
  @field('is_active') isActive!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  async updatePriority(newPriority: number): Promise<void> {
    await this.update((goal) => {
      goal.priority = Math.max(1, Math.min(5, newPriority)); // Clamp 1-5
    });
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Goal model for user's long-term objectives
 *
 * WHY:
 * - Voices can align with goals (Future Me prioritizes "Financial Freedom" goal)
 * - Used in Phase 3+ for goal-based decision weighting
 * - Helps personalize voice voting (voices vote based on goal alignment)
 *
 * HOW:
 * - priority: 1 (low) to 5 (high) importance
 * - category: Groups related goals ('health', 'career', 'finance', etc.)
 * - isActive: Allows archiving old goals without deletion
 *
 * USAGE:
 * const goal = await database.write(async () => {
 *   return await database.get<Goal>('goals').create(g => {
 *     g.name = "Financial Freedom";
 *     g.priority = 5;
 *     g.category = "finance";
 *     g.isActive = true;
 *   });
 * });
 *
 * ARCHITECTURE:
 * - Phase 1: Basic goal creation/management
 * - Phase 3: Link voices to goals (voice.priorityGoals)
 * - Phase 6: AI suggests goals based on decision patterns
 *
 * =============================================================================
 */
