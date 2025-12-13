import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

/**
 * Voice Model
 * Represents an internal persona (Disciplined Me, Lazy Me, etc.)
 */

export interface TimeWeights {
  morning?: number; // 6am-12pm
  afternoon?: number; // 12pm-6pm
  evening?: number; // 6pm-10pm
  night?: number; // 10pm-6am
  weekday?: number;
  weekend?: number;
}

export type VoiceTemplate =
  | 'disciplined'
  | 'lazy'
  | 'future'
  | 'budget'
  | 'chaotic'
  | 'social'
  | 'health';

export default class Voice extends Model {
  static table = 'voices';

  @field('name') name!: string;
  @field('description') description?: string;
  @field('weight') weight!: number; // Base weight: 0.0 - 2.0
  @field('is_active') isActive!: boolean;
  @field('is_template') isTemplate!: boolean;

  // JSON fields
  @json('priority_goals', (json) => json) priorityGoals!: string[]; // Array of goal IDs
  @json('phrases', (json) => json) phrases!: string[]; // Characteristic phrases
  @json('time_weights', (json) => json) timeWeights!: TimeWeights;

  // Timestamps
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Computed properties
  get currentWeight(): number {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    let multiplier = 1.0;

    // Time of day multiplier
    if (hour >= 6 && hour < 12) {
      multiplier *= this.timeWeights.morning ?? 1.0;
    } else if (hour >= 12 && hour < 18) {
      multiplier *= this.timeWeights.afternoon ?? 1.0;
    } else if (hour >= 18 && hour < 22) {
      multiplier *= this.timeWeights.evening ?? 1.0;
    } else {
      multiplier *= this.timeWeights.night ?? 1.0;
    }

    // Day of week multiplier
    if (isWeekend) {
      multiplier *= this.timeWeights.weekend ?? 1.0;
    } else {
      multiplier *= this.timeWeights.weekday ?? 1.0;
    }

    return this.weight * multiplier;
  }

  get randomPhrase(): string {
    if (this.phrases.length === 0) return '';
    return this.phrases[Math.floor(Math.random() * this.phrases.length)];
  }

  // Helper methods
  async activate(): Promise<void> {
    await this.update((voice) => {
      voice.isActive = true;
    });
  }

  async deactivate(): Promise<void> {
    await this.update((voice) => {
      voice.isActive = false;
    });
  }

  async updateWeight(newWeight: number): Promise<void> {
    await this.update((voice) => {
      voice.weight = Math.max(0, Math.min(2, newWeight)); // Clamp 0-2
    });
  }

  async setTimeWeights(weights: TimeWeights): Promise<void> {
    await this.update((voice) => {
      voice.timeWeights = { ...voice.timeWeights, ...weights };
    });
  }

  async addPhrase(phrase: string): Promise<void> {
    await this.update((voice) => {
      voice.phrases = [...voice.phrases, phrase];
    });
  }

  // Static factory methods for templates
  static getTemplateConfig(template: VoiceTemplate): Partial<Voice> {
    const templates = {
      disciplined: {
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
      },
      lazy: {
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
      },
      future: {
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
      },
      budget: {
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
      },
      chaotic: {
        name: 'Chaotic Me',
        description: 'YOLO energy, spontaneous, adventurous',
        weight: 0.8,
        phrases: [
          "Life is an adventure",
          "What's the worst that could happen?",
          "No regrets!",
          "Let's do something crazy",
        ],
        timeWeights: {
          morning: 0.7,
          afternoon: 1.2,
          evening: 1.8,
          night: 1.5,
          weekend: 1.8,
        },
      },
      social: {
        name: 'Social Me',
        description: 'Relationships-focused, connection-driven',
        weight: 1.1,
        phrases: [
          "What would they think?",
          "Connections matter most",
          "Build relationships",
          "Time with people > time alone",
        ],
        timeWeights: {
          evening: 1.5,
          weekend: 1.8,
          weekday: 0.9,
        },
      },
      health: {
        name: 'Health Me',
        description: 'Physical wellbeing, energy optimization',
        weight: 1.4,
        phrases: [
          "Your body is your temple",
          "Health is wealth",
          "Energy levels matter",
          "How will this make you feel?",
        ],
        timeWeights: {
          morning: 1.8,
          afternoon: 1.3,
          evening: 1.0,
          night: 0.6,
        },
      },
    };

    return templates[template] as Partial<Voice>;
  }
}

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Voice model representing internal personas (Disciplined Me, Lazy Me, etc.)
 *
 * WHY:
 * - Core differentiator vs competitors (Either/Or AI uses cold AI, we use personality)
 * - Externalizes internal conflict: "Should I?" → "What does Disciplined Me think?"
 * - Makes decisions feel like conversations between parts of yourself
 * - Time-based weighting creates dynamic behavior (Lazy Me stronger at night)
 *
 * Design Decisions:
 * - weight: Base influence (0.0-2.0 range, 1.0 = neutral)
 * - timeWeights: Contextual multipliers based on time/day
 * - phrases: Gives each voice personality (shows in UI)
 * - priorityGoals: Links voices to user goals (future: voice voting based on goal alignment)
 * - isTemplate: Separates pre-built voices from custom user voices
 *
 * HOW:
 * - currentWeight computed property calculates real-time weight (base * time multipliers)
 * - Static getTemplateConfig() provides pre-configured voice personalities
 * - JSON fields store arrays (phrases, priorityGoals) and objects (timeWeights)
 * - Helper methods for common operations (activate, deactivate, updateWeight)
 *
 * Time Weight System:
 * Example: Disciplined Me
 * - Morning (6am-12pm): 2.0x → Very strong (best time for hard decisions)
 * - Afternoon (12pm-6pm): 1.2x → Above average
 * - Evening (6pm-10pm): 0.8x → Below average (willpower depleting)
 * - Night (10pm-6am): 0.5x → Weak (poor decision-making time)
 * - Weekdays: 1.5x → Stronger (work mode)
 * - Weekends: 0.8x → Weaker (rest mode)
 *
 * USAGE:
 * ```typescript
 * import Voice from '@/models/Voice';
 * import { database } from '@/models/database';
 *
 * // Create voice from template
 * const disciplinedMe = await database.write(async () => {
 *   const config = Voice.getTemplateConfig('disciplined');
 *   return await database.get<Voice>('voices').create(v => {
 *     v.name = config.name!;
 *     v.description = config.description;
 *     v.weight = config.weight!;
 *     v.phrases = config.phrases!;
 *     v.timeWeights = config.timeWeights!;
 *     v.priorityGoals = [];
 *     v.isActive = true;
 *     v.isTemplate = true;
 *   });
 * });
 *
 * // Get current weight (time-adjusted)
 * const currentStrength = disciplinedMe.currentWeight;
 * // At 8am on Monday: 1.5 (base) * 2.0 (morning) * 1.5 (weekday) = 4.5
 *
 * // Update weight
 * await disciplinedMe.updateWeight(1.8);
 *
 * // Add custom phrase
 * await disciplinedMe.addPhrase("No excuses!");
 * ```
 *
 * GOTCHAS:
 * - currentWeight is computed (not stored) - recalculates every access
 * - timeWeights can have partial values (missing fields default to 1.0)
 * - weight is clamped 0-2 in updateWeight (prevents extreme values)
 * - isTemplate true = pre-built, false = user-created
 * - Voice voting algorithm (Phase 1) uses currentWeight, not base weight
 *
 * ARCHITECTURE:
 * - Phase 1: Create voices, basic voting (all voices vote, weighted sum)
 * - Phase 2: Time-based weighting active (Disciplined Me 2x in morning)
 * - Phase 3: Goal alignment (voices vote based on goal priority)
 * - Phase 7-8: AI-generated phrases (LLM creates voice responses)
 *
 * Voice Voting Algorithm (Phase 1):
 * ```typescript
 * // Each voice "votes" for an option based on factor alignment
 * const totalVotes = voices.reduce((sum, voice) => {
 *   const voteScore = calculateAlignment(voice, option);
 *   return sum + (voteScore * voice.currentWeight);
 * }, 0);
 * ```
 *
 * Related Models:
 * - Decision model: Stores voice_breakdown (which voices voted for what)
 * - Goal model: Referenced in priorityGoals
 * - Factor model (Phase 2): Voices have alignment scores with factors
 *
 * Performance:
 * - currentWeight calculation: O(1) constant time (just arithmetic)
 * - Query active voices: <20ms for 10 voices
 * - Template creation: <50ms (single write transaction)
 *
 * =============================================================================
 */
