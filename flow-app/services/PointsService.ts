import AsyncStorage from '@react-native-async-storage/async-storage';

// Points economy constants
export const POINTS_CONFIG = {
  EARN: {
    FAST_DECISION: 100,      // < 10s
    MEDIUM_DECISION: 50,     // 10-30s
    SLOW_DECISION: 25,       // 30-60s
    OVERTIME_DECISION: 10,   // > 60s
    STREAK_BONUS: 50,        // Daily streak maintained
    FIRST_TODAY: 25,         // First decision of the day
  },
  LOSE: {
    TIMEOUT: -50,            // Failed to decide in time
    BROKE_STREAK: -100,      // Missed a day
    GOAL_CONTRADICTION: -100, // Went against your goals
  },
  MILESTONES: [
    { points: 500, reward: '🎯 Quick Thinker' },
    { points: 1000, reward: '⚡ Speed Demon' },
    { points: 2500, reward: '🏆 Decision Master' },
    { points: 5000, reward: '👑 O(1) Legend' },
    { points: 10000, reward: '🚀 Ultimate Optimizer' },
  ],
};

export interface PointTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  decisionId?: string;
  category?: string;
}

export interface PointsState {
  totalPoints: number;
  transactions: PointTransaction[];
  highestBalance: number;
  milestonesUnlocked: number[];
}

const STORAGE_KEY = '@O1_points';

class PointsService {
  private state: PointsState = {
    totalPoints: 0,
    transactions: [],
    highestBalance: 0,
    milestonesUnlocked: [],
  };

  private listeners: Set<(state: PointsState) => void> = new Set();

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load points state:', error);
    }
  }

  async getTotalPoints(): Promise<number> {
    await this.initialize();
    return this.state.totalPoints;
  }

  async getState(): Promise<PointsState> {
    await this.initialize();
    return { ...this.state };
  }

  /**
   * Add points and create transaction record
   */
  async addPoints(
    amount: number,
    reason: string,
    metadata?: { decisionId?: string; category?: string }
  ): Promise<PointTransaction> {
    await this.initialize();

    const transaction: PointTransaction = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      amount,
      reason,
      timestamp: Date.now(),
      decisionId: metadata?.decisionId,
      category: metadata?.category,
    };

    this.state.transactions.push(transaction);
    this.state.totalPoints += amount;

    // Track highest balance
    if (this.state.totalPoints > this.state.highestBalance) {
      this.state.highestBalance = this.state.totalPoints;
    }

    // Check for milestone unlocks
    const newMilestones = POINTS_CONFIG.MILESTONES.filter(
      (m) =>
        this.state.totalPoints >= m.points &&
        !this.state.milestonesUnlocked.includes(m.points)
    );

    newMilestones.forEach((m) => {
      this.state.milestonesUnlocked.push(m.points);
    });

    await this.save();
    this.notifyListeners();

    return transaction;
  }

  /**
   * Calculate points for a decision based on time taken
   */
  calculateDecisionPoints(timeInSeconds: number, isFirstToday: boolean = false): {
    points: number;
    reason: string;
    category: 'fast' | 'medium' | 'slow' | 'overtime';
  } {
    let points = 0;
    let reason = '';
    let category: 'fast' | 'medium' | 'slow' | 'overtime' = 'overtime';

    if (timeInSeconds < 10) {
      points = POINTS_CONFIG.EARN.FAST_DECISION;
      reason = 'Lightning fast decision!';
      category = 'fast';
    } else if (timeInSeconds < 30) {
      points = POINTS_CONFIG.EARN.MEDIUM_DECISION;
      reason = 'Quick decision';
      category = 'medium';
    } else if (timeInSeconds < 60) {
      points = POINTS_CONFIG.EARN.SLOW_DECISION;
      reason = 'Decision made';
      category = 'slow';
    } else {
      points = POINTS_CONFIG.EARN.OVERTIME_DECISION;
      reason = 'Overtime decision';
      category = 'overtime';
    }

    // Add first decision bonus
    if (isFirstToday) {
      points += POINTS_CONFIG.EARN.FIRST_TODAY;
      reason += ' + First today!';
    }

    return { points, reason, category };
  }

  /**
   * Add streak bonus points
   */
  async addStreakBonus(streakDays: number): Promise<PointTransaction> {
    const bonus = POINTS_CONFIG.EARN.STREAK_BONUS;
    return this.addPoints(
      bonus,
      `${streakDays} day streak maintained!`,
      { category: 'streak' }
    );
  }

  /**
   * Deduct points for breaking streak
   */
  async deductStreakPenalty(): Promise<PointTransaction> {
    return this.addPoints(
      POINTS_CONFIG.LOSE.BROKE_STREAK,
      'Streak broken',
      { category: 'penalty' }
    );
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<PointTransaction[]> {
    await this.initialize();
    return this.state.transactions
      .slice(-limit)
      .reverse();
  }

  /**
   * Get stats for analytics
   */
  async getStats(): Promise<{
    totalPoints: number;
    totalEarned: number;
    totalLost: number;
    transactionCount: number;
    averagePerDecision: number;
    highestBalance: number;
    milestonesUnlocked: number;
  }> {
    await this.initialize();

    const totalEarned = this.state.transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLost = Math.abs(
      this.state.transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const decisionTransactions = this.state.transactions.filter(
      (t) => t.decisionId
    );

    return {
      totalPoints: this.state.totalPoints,
      totalEarned,
      totalLost,
      transactionCount: this.state.transactions.length,
      averagePerDecision:
        decisionTransactions.length > 0
          ? totalEarned / decisionTransactions.length
          : 0,
      highestBalance: this.state.highestBalance,
      milestonesUnlocked: this.state.milestonesUnlocked.length,
    };
  }

  /**
   * Subscribe to points changes
   */
  subscribe(listener: (state: PointsState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save points state:', error);
    }
  }

  /**
   * Reset all points (for testing)
   */
  async reset(): Promise<void> {
    this.state = {
      totalPoints: 0,
      transactions: [],
      highestBalance: 0,
      milestonesUnlocked: [],
    };
    await this.save();
    this.notifyListeners();
  }
}

export const pointsService = new PointsService();
