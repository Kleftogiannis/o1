import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * BettingService - Manage follow-through bets on decisions
 *
 * PSYCHOLOGY:
 * - Commitment device: Betting makes you accountable
 * - Loss aversion: Fear of losing points > desire to gain them
 * - Skin in the game: When you bet, you're more likely to follow through
 * - Honor system: Self-reporting works for personal use (Beeminder model)
 *
 * FLOW:
 * 1. User makes decision (Gym vs Rest)
 * 2. On completion screen: "Bet on follow-through?" [25/50/100/Skip]
 * 3. Bet saved as "pending"
 * 4. History tab shows "Pending Bets"
 * 5. User marks ✅ Done or ❌ Skipped
 * 6. Points awarded/deducted immediately
 *
 * FUTURE: Push notifications (Phase 4-5)
 * - 24h after decision: "Did you go to the gym? (50pts bet)"
 * - Deep link to resolution screen
 */

export interface DecisionBet {
  id: string;
  decisionId: string;
  question: string;
  winner: string; // What they decided to do
  betAmount: number; // Points at stake
  createdAt: number;
  resolvedAt?: number;
  outcome?: 'completed' | 'skipped'; // Did they follow through?
  pointsAwarded?: number; // +bet or -bet
}

export interface BettingState {
  pendingBets: DecisionBet[];
  resolvedBets: DecisionBet[];
  totalBetsPlaced: number;
  totalBetsWon: number;
  totalBetsLost: number;
  totalPointsWon: number;
  totalPointsLost: number;
}

const STORAGE_KEY = '@O1_betting';

export const BET_AMOUNTS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 100,
} as const;

class BettingService {
  private state: BettingState = {
    pendingBets: [],
    resolvedBets: [],
    totalBetsPlaced: 0,
    totalBetsWon: 0,
    totalBetsLost: 0,
    totalPointsWon: 0,
    totalPointsLost: 0,
  };

  private listeners: Set<(state: BettingState) => void> = new Set();

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load betting state:', error);
    }
  }

  /**
   * Create a new bet on a decision
   */
  async placeBet(
    decisionId: string,
    question: string,
    winner: string,
    betAmount: number
  ): Promise<DecisionBet> {
    await this.initialize();

    const bet: DecisionBet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      decisionId,
      question,
      winner,
      betAmount,
      createdAt: Date.now(),
    };

    this.state.pendingBets.push(bet);
    this.state.totalBetsPlaced += 1;

    await this.save();
    this.notifyListeners();

    return bet;
  }

  /**
   * Resolve a bet (user reports follow-through)
   */
  async resolveBet(
    betId: string,
    outcome: 'completed' | 'skipped'
  ): Promise<{
    bet: DecisionBet;
    pointsAwarded: number;
  }> {
    await this.initialize();

    const betIndex = this.state.pendingBets.findIndex((b) => b.id === betId);

    if (betIndex === -1) {
      throw new Error('Bet not found');
    }

    const bet = this.state.pendingBets[betIndex];

    // Calculate points
    const pointsAwarded = outcome === 'completed' ? bet.betAmount : -bet.betAmount;

    // Update bet
    bet.resolvedAt = Date.now();
    bet.outcome = outcome;
    bet.pointsAwarded = pointsAwarded;

    // Move from pending to resolved
    this.state.pendingBets.splice(betIndex, 1);
    this.state.resolvedBets.push(bet);

    // Update stats
    if (outcome === 'completed') {
      this.state.totalBetsWon += 1;
      this.state.totalPointsWon += bet.betAmount;
    } else {
      this.state.totalBetsLost += 1;
      this.state.totalPointsLost += bet.betAmount;
    }

    await this.save();
    this.notifyListeners();

    return { bet, pointsAwarded };
  }

  /**
   * Get all pending bets (need resolution)
   */
  async getPendingBets(): Promise<DecisionBet[]> {
    await this.initialize();
    // Sort by newest first
    return [...this.state.pendingBets].sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get recent resolved bets
   */
  async getResolvedBets(limit: number = 10): Promise<DecisionBet[]> {
    await this.initialize();
    return [...this.state.resolvedBets]
      .sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0))
      .slice(0, limit);
  }

  /**
   * Get betting statistics
   */
  async getStats(): Promise<{
    totalBetsPlaced: number;
    totalBetsWon: number;
    totalBetsLost: number;
    winRate: number;
    totalPointsWon: number;
    totalPointsLost: number;
    netPoints: number;
    pendingBetsCount: number;
    pendingBetsValue: number;
  }> {
    await this.initialize();

    const winRate =
      this.state.totalBetsPlaced > 0
        ? (this.state.totalBetsWon / this.state.totalBetsPlaced) * 100
        : 0;

    const pendingBetsValue = this.state.pendingBets.reduce(
      (sum, bet) => sum + bet.betAmount,
      0
    );

    return {
      totalBetsPlaced: this.state.totalBetsPlaced,
      totalBetsWon: this.state.totalBetsWon,
      totalBetsLost: this.state.totalBetsLost,
      winRate: Math.round(winRate),
      totalPointsWon: this.state.totalPointsWon,
      totalPointsLost: this.state.totalPointsLost,
      netPoints: this.state.totalPointsWon - this.state.totalPointsLost,
      pendingBetsCount: this.state.pendingBets.length,
      pendingBetsValue,
    };
  }

  /**
   * Check if a decision has a pending bet
   */
  async hasPendingBet(decisionId: string): Promise<boolean> {
    await this.initialize();
    return this.state.pendingBets.some((bet) => bet.decisionId === decisionId);
  }

  /**
   * Subscribe to betting state changes
   */
  subscribe(listener: (state: BettingState) => void): () => void {
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
      console.error('Failed to save betting state:', error);
    }
  }

  /**
   * Reset all bets (for testing)
   */
  async reset(): Promise<void> {
    this.state = {
      pendingBets: [],
      resolvedBets: [],
      totalBetsPlaced: 0,
      totalBetsWon: 0,
      totalBetsLost: 0,
      totalPointsWon: 0,
      totalPointsLost: 0,
    };
    await this.save();
    this.notifyListeners();
  }
}

export const bettingService = new BettingService();
