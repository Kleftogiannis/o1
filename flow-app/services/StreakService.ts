import { getDatabase, COLLECTIONS, saveDatabase } from '../models/database';

/**
 * StreakService - Track daily decision streaks
 *
 * PSYCHOLOGY:
 * - Loss aversion: Fear of breaking streak > desire to build one
 * - Daily habit formation: Encourages opening app every day
 * - Social proof: High streak numbers feel impressive
 * - Milestone dopamine: Celebrate 7, 14, 30, 100 days
 *
 * STREAK LOGIC:
 * - Increment: User makes at least 1 decision today
 * - Break: User misses a full day (24+ hours since last decision)
 * - Reset: Starts at 0, builds daily
 */

export interface UserStats {
  $loki?: number;
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastDecisionDate: number; // Unix timestamp of last decision
  totalDecisions: number;
  totalPoints: number;
  createdAt: number;
  updatedAt: number;
}

class StreakService {
  /**
   * Get or create user stats
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const db = await getDatabase();
      let statsCollection = db.getCollection<UserStats>(COLLECTIONS.USER_STATS);

      // Create collection if it doesn't exist
      if (!statsCollection) {
        statsCollection = db.addCollection(COLLECTIONS.USER_STATS);
        await saveDatabase();
      }

      // Get existing stats
      const existingStats = statsCollection.findOne({ id: 'primary' });

      if (existingStats) {
        return existingStats;
      }

      // Create new stats
      const newStats: UserStats = {
        id: 'primary',
        currentStreak: 0,
        longestStreak: 0,
        lastDecisionDate: 0,
        totalDecisions: 0,
        totalPoints: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const inserted = statsCollection.insert(newStats);
      await saveDatabase();

      return inserted;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw new Error('Could not load stats');
    }
  }

  /**
   * Update streak after a decision is made
   * Returns object with new streak count and whether streak was broken
   */
  async updateStreakAfterDecision(): Promise<{
    newStreak: number;
    streakBroken: boolean;
    previousStreak: number;
  }> {
    try {
      const db = await getDatabase();
      let statsCollection = db.getCollection<UserStats>(COLLECTIONS.USER_STATS);

      if (!statsCollection) {
        statsCollection = db.addCollection(COLLECTIONS.USER_STATS);
        await saveDatabase();
      }

      const stats = await this.getUserStats();
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const previousStreak = stats.currentStreak;
      let streakBroken = false;

      // Check if last decision was today (same calendar day)
      const lastDecisionDate = new Date(stats.lastDecisionDate);
      const today = new Date(now);
      const isSameDay =
        lastDecisionDate.getDate() === today.getDate() &&
        lastDecisionDate.getMonth() === today.getMonth() &&
        lastDecisionDate.getFullYear() === today.getFullYear();

      // If already decided today, don't increment streak
      if (isSameDay) {
        stats.totalDecisions += 1;
        stats.updatedAt = now;
        statsCollection.update(stats);
        await saveDatabase();
        return {
          newStreak: stats.currentStreak,
          streakBroken: false,
          previousStreak,
        };
      }

      // Check if streak is broken (missed yesterday)
      const timeSinceLastDecision = now - stats.lastDecisionDate;
      const yesterday = new Date(now - oneDayMs);
      const isYesterday =
        lastDecisionDate.getDate() === yesterday.getDate() &&
        lastDecisionDate.getMonth() === yesterday.getMonth() &&
        lastDecisionDate.getFullYear() === yesterday.getFullYear();

      if (stats.lastDecisionDate === 0 || timeSinceLastDecision >= 2 * oneDayMs) {
        // First decision ever OR missed more than 1 day = reset streak
        if (stats.lastDecisionDate !== 0 && stats.currentStreak > 0) {
          // Streak was broken (not first time)
          streakBroken = true;
        }
        stats.currentStreak = 1;
      } else if (isYesterday || timeSinceLastDecision < oneDayMs) {
        // Decided yesterday or within 24h = increment streak
        stats.currentStreak += 1;
      } else {
        // Missed a day = reset
        if (stats.currentStreak > 0) {
          streakBroken = true;
        }
        stats.currentStreak = 1;
      }

      // Update longest streak
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }

      // Update stats
      stats.lastDecisionDate = now;
      stats.totalDecisions += 1;
      stats.updatedAt = now;

      statsCollection.update(stats);
      await saveDatabase();

      return {
        newStreak: stats.currentStreak,
        streakBroken,
        previousStreak,
      };
    } catch (error) {
      console.error('Failed to update streak:', error);
      throw new Error('Could not update streak');
    }
  }

  /**
   * Get current streak
   */
  async getCurrentStreak(): Promise<number> {
    try {
      const stats = await this.getUserStats();

      // Check if streak is still valid (didn't miss a day)
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const timeSinceLastDecision = now - stats.lastDecisionDate;

      // If more than 48 hours passed, streak is broken
      if (timeSinceLastDecision >= 2 * oneDayMs && stats.lastDecisionDate !== 0) {
        return 0; // Streak broken but not yet reset in DB
      }

      return stats.currentStreak;
    } catch (error) {
      console.error('Failed to get current streak:', error);
      return 0;
    }
  }

  /**
   * Check if today's streak is at a milestone (7, 14, 30, 50, 100 days)
   */
  async isStreakMilestone(): Promise<boolean> {
    try {
      const streak = await this.getCurrentStreak();
      return [7, 14, 30, 50, 100].includes(streak);
    } catch (error) {
      console.error('Failed to check milestone:', error);
      return false;
    }
  }

  /**
   * Reset streak manually (for testing)
   */
  async resetStreak(): Promise<void> {
    try {
      const db = await getDatabase();
      let statsCollection = db.getCollection<UserStats>(COLLECTIONS.USER_STATS);

      if (!statsCollection) {
        statsCollection = db.addCollection(COLLECTIONS.USER_STATS);
        await saveDatabase();
      }

      const stats = await this.getUserStats();
      stats.currentStreak = 0;
      stats.lastDecisionDate = 0;
      stats.updatedAt = Date.now();

      statsCollection.update(stats);
      await saveDatabase();
    } catch (error) {
      console.error('Failed to reset streak:', error);
      throw new Error('Could not reset streak');
    }
  }

  /**
   * Get stats summary
   */
  async getStatsSummary(): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalDecisions: number;
    totalPoints: number;
  }> {
    try {
      const stats = await this.getUserStats();
      const currentStreak = await this.getCurrentStreak();

      return {
        currentStreak,
        longestStreak: stats.longestStreak,
        totalDecisions: stats.totalDecisions,
        totalPoints: stats.totalPoints,
      };
    } catch (error) {
      console.error('Failed to get stats summary:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDecisions: 0,
        totalPoints: 0,
      };
    }
  }
}

// Export singleton instance
export const streakService = new StreakService();

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Streak tracking service with loss aversion psychology
 *
 * WHY:
 * - Daily habit formation: Encourages users to open app every day
 * - Loss aversion: Fear of breaking streak > desire to build one
 * - Gamification: Streaks are proven to increase engagement (see Duolingo, Snapchat)
 * - Social proof: High numbers feel impressive to share
 *
 * PSYCHOLOGY:
 * - Duolingo: 🔥 Fire emoji = "keep the flame alive" metaphor
 * - Snapchat: Streak anxiety drives daily usage
 * - Loss aversion: Losing a 30-day streak hurts more than gaining it felt good
 * - Milestone celebrations: 7, 14, 30, 100 days = dopamine spikes
 *
 * USAGE:
 * ```typescript
 * import { streakService } from '@/services/StreakService';
 *
 * // After creating a decision:
 * const newStreak = await streakService.updateStreakAfterDecision();
 * console.log(`Streak: ${newStreak} days!`);
 *
 * // Display current streak:
 * const streak = await streakService.getCurrentStreak();
 * // <StreakBadge streakDays={streak} />
 * ```
 *
 * STREAK LOGIC:
 * - Day 0: No decisions yet (streak = 0)
 * - Day 1: First decision (streak = 1)
 * - Day 2: Decide again within 48h of Day 1 (streak = 2)
 * - Day 3: Decide again within 48h of Day 2 (streak = 3)
 * - Day X: Miss a day (>48h gap) → streak resets to 1
 *
 * GOTCHAS:
 * - Streak counts CALENDAR DAYS, not 24h periods
 * - Same-day decisions don't increment streak
 * - Missing ONE day (48h gap) breaks the streak
 * - Longest streak is tracked separately (never decreases)
 *
 * FUTURE ENHANCEMENTS:
 * - Streak freeze: Pay 100 points to protect streak for 1 day
 * - Streak recovery: Decide 3x in one day to restore broken streak
 * - Push notification: "Don't break your 14-day streak!"
 *
 * =============================================================================
 */
