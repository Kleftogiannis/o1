/**
 * Brand Constants for O(1)
 * Central source of truth for all branding, messaging, and identity
 */

export const Brand = {
  name: 'O(1)',
  fullName: 'O(1) Decision App',
  tagline: 'Decide in Constant Time',
  description: 'Every decision, O(1) complexity',

  messaging: {
    valueProps: [
      'Instant decisions, regardless of complexity',
      'Offline-first, always O(1) response time',
      'Your brain, optimized to constant time',
    ],
    targetAudience: 'Developers and decision-makers who value speed',
    positioning: 'The only decision app that guarantees constant-time decisions',
  },

  urls: {
    scheme: 'o1app',
    website: 'https://geto1.app',
    support: 'https://geto1.app/support',
    privacy: 'https://geto1.app/privacy',
  },

  social: {
    hashtag: '#O1Decisions',
    shareText: 'I just made another decision in O(1) time with O(1) ⚡️',
  },
} as const;

export const CompetitivePositioning = {
  vsEitherOrAI: {
    them: 'Reactive, AI-dependent, online-only, form-based',
    us: 'Anticipatory, offline-first, swipe-based, instant',
  },
  keyDifferentiators: [
    'Sub-100ms decision time (literally O(1))',
    'Works completely offline',
    'Anticipatory notifications before you ask',
    'Swipe-based UX (not spreadsheets)',
    'Free tier is fully functional',
  ],
} as const;

/**
 * =============================================================================
 * DEVELOPER DOCUMENTATION
 * =============================================================================
 *
 * WHAT: Centralized brand constants for O(1) app
 *
 * WHY:
 * - Single source of truth for all branding (prevents inconsistency)
 * - Easy to update taglines/messaging across entire app
 * - Documents competitive positioning for team alignment
 * - TypeScript const assertions ensure compile-time safety
 *
 * HOW:
 * - Import this file wherever you need brand text
 * - Use Brand.name, Brand.tagline, etc.
 * - All values are readonly (const assertion)
 *
 * USAGE:
 * ```typescript
 * import { Brand } from '@/constants/brand';
 *
 * <Text>{Brand.tagline}</Text>  // "Decide in Constant Time"
 * Linking.openURL(Brand.urls.website);
 * ```
 *
 * GOTCHAS:
 * - Don't hardcode "O(1)" or taglines in components - use this file
 * - Update social.shareText when marketing copy evolves
 * - CompetitivePositioning is for internal docs/pitch decks
 *
 * ARCHITECTURE:
 * - Used by: All UI components, share features, onboarding screens
 * - Related: constants/theme.ts (visual brand), app.json (app metadata)
 * - Single update here propagates to entire app
 *
 * =============================================================================
 */
