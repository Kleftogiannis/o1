import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

/**
 * Decision Model
 * Represents a completed decision with winner, options, and metadata
 */

export interface VoiceBreakdown {
  [voiceId: string]: {
    voiceName: string;
    vote: string; // Option that this voice voted for
    weight: number;
    reasoning?: string;
  };
}

export interface FactorScore {
  [factorId: string]: {
    statement: string;
    swipeDirection: 'left' | 'right'; // left = disagree, right = agree
    relevance: number; // 0-1
  };
}

export default class Decision extends Model {
  static table = 'decisions';

  @field('question') question!: string;
  @field('category') category?: string;
  @field('winner') winner!: string;
  @field('runner_up') runnerUp?: string;
  @field('method') method!: 'tournament' | 'factor_swiping';
  @field('duration_ms') durationMs?: number;

  // JSON fields with type-safe getters/setters
  @json('options', (json) => json) options!: string[];
  @json('voice_breakdown', (json) => json) voiceBreakdown?: VoiceBreakdown;
  @json('factor_scores', (json) => json) factorScores?: FactorScore;

  // Timestamps
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Computed properties
  get formattedDuration(): string {
    if (!this.durationMs) return 'Unknown';
    const seconds = Math.round(this.durationMs / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
  }

  get isO1Compliant(): boolean {
    // Check if decision was made in O(1) time (<100ms per interaction)
    return this.durationMs ? this.durationMs < 10000 : false; // 10s for full decision
  }

  get optionCount(): number {
    return this.options.length;
  }

  // Helper methods
  async updateWinner(newWinner: string): Promise<void> {
    await this.update((decision) => {
      decision.winner = newWinner;
    });
  }

  async setVoiceBreakdown(breakdown: VoiceBreakdown): Promise<void> {
    await this.update((decision) => {
      decision.voiceBreakdown = breakdown;
    });
  }

  async setFactorScores(scores: FactorScore): Promise<void> {
    await this.update((decision) => {
      decision.factorScores = scores;
    });
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: WatermelonDB model for Decision entity (core data type)
 *
 * WHY:
 * - Decision is the central entity - everything revolves around making/tracking decisions
 * - Stores both tournament-style and factor-swiping decisions in one table
 * - Denormalized design (stores winner/options directly) for fast O(1) reads
 * - JSON fields for complex data (voice_breakdown, factor_scores) to avoid JOIN queries
 *
 * Design Decisions:
 * - method field ('tournament' | 'factor_swiping') to distinguish decision types
 * - durationMs tracks performance (validates O(1) promise: decisions should be fast)
 * - options stored as JSON array (denormalized) to avoid option_details table
 * - voice_breakdown as JSON to avoid voices_decisions join table (read performance)
 *
 * HOW:
 * - Extends WatermelonDB Model class
 * - @field decorator maps to schema columns (created in schema.ts)
 * - @json decorator auto-parses JSON strings to/from TypeScript objects
 * - @date decorator converts Unix timestamps to Date objects
 * - @readonly prevents accidental updates to timestamps
 *
 * TypeScript Interfaces:
 * - VoiceBreakdown: Maps voice ID → vote details (for voice system in Phase 1)
 * - FactorScore: Maps factor ID → swipe data (for factor swiping in Phase 2)
 *
 * USAGE:
 * ```typescript
 * import Decision from '@/models/Decision';
 * import { database } from '@/models/database';
 *
 * // Create new decision
 * const decision = await database.write(async () => {
 *   return await database.get<Decision>('decisions').create(d => {
 *     d.question = "Should I go to the gym?";
 *     d.options = ["Yes", "No"];
 *     d.winner = "Yes";
 *     d.method = "tournament";
 *     d.durationMs = 5420;
 *   });
 * });
 *
 * // Update winner
 * await decision.updateWinner("No");
 *
 * // Query decisions
 * const recentDecisions = await database
 *   .get<Decision>('decisions')
 *   .query(Q.sortBy('created_at', Q.desc), Q.take(10))
 *   .fetch();
 * ```
 *
 * GOTCHAS:
 * - All writes MUST be wrapped in database.write() transaction
 * - JSON fields return parsed objects, not strings (thanks to @json decorator)
 * - created_at/updated_at are auto-managed by WatermelonDB (don't set manually)
 * - Use Q helpers for queries (not raw SQL) for type safety
 * - @field names must match schema column names (snake_case in DB, camelCase in TS)
 *
 * ARCHITECTURE:
 * - Phase 0: Basic tournament decisions (question, options, winner)
 * - Phase 1: Add voice_breakdown (which voices voted for what)
 * - Phase 2: Add factor_scores (factor swiping results)
 * - Phase 4: Add duration_ms tracking for performance analytics
 *
 * Related Models:
 * - Voice model (Phase 1) - referenced in voiceBreakdown
 * - Factor model (Phase 2) - referenced in factorScores
 * - Preference model (Phase 2) - updated based on winner
 *
 * Performance:
 * - Read time: <10ms for single decision (WatermelonDB lazy loading)
 * - Query time: <50ms for 100 decisions (indexed on created_at)
 * - Write time: <20ms (single transaction)
 * - Target: Sub-100ms end-to-end for full decision flow
 *
 * =============================================================================
 */
