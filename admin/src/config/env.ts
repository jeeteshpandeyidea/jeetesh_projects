/**
 * Environment variables configuration
 * Centralized access to environment variables with type safety
 */

/**
 * Get the API URL for client-side requests.
 * In development we always use /api-proxy so the browser hits same-origin and Next.js rewrites to the backend (avoids CORS and "cannot reach" errors).
 * In production, use NEXT_PUBLIC_API_URL or fallback.
 */
const defaultClientApiUrl =
  process.env.NODE_ENV === 'development'
    ? '/api-proxy'
    : (typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined' && process.env.NEXT_PUBLIC_API_URL !== ''
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://localhost:3000');

export const API_URL = {
  CLIENT: defaultClientApiUrl,
  SERVER: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
} as const;

/**
 * Get the server port
 */
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

/**
 * Get the current environment
 */
export const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Check if running in development mode
 */
export const IS_DEV = NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const IS_PROD = NODE_ENV === 'production';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    /** Use same-origin API route so request body is reliably forwarded to the backend. */
    LOGIN: '/api/auth/login',
    LOGOUT: `${API_URL.CLIENT}/auth/logout`,
    REGISTER: `${API_URL.CLIENT}/auth/register`,
    REFRESH: `${API_URL.CLIENT}/auth/refresh`,
    FORGOT_PASSWORD: `${API_URL.CLIENT}/auth/forgot-password`,
    RESET_PASSWORD: `${API_URL.CLIENT}/auth/reset-password`,
    VERIFY_EMAIL: `${API_URL.CLIENT}/auth/verify-email`,
  },
  USER: {
    PROFILE: `${API_URL.CLIENT}/user/profile`,
    UPDATE_PROFILE: `${API_URL.CLIENT}/user/profile`,
  },
  ROLES: {
    LIST: `${API_URL.CLIENT}/roles`,
    CREATE: `${API_URL.CLIENT}/roles`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/roles/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/roles/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/roles/${id}`,
  },
  ROLE_PERMISSIONS: {
    LIST: `${API_URL.CLIENT}/role-permissions`,
    CREATE: `${API_URL.CLIENT}/role-permissions`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/role-permissions/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/role-permissions/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/role-permissions/${id}`,
  },
  USERS: {
    LIST: `${API_URL.CLIENT}/users`,
    CREATE: `${API_URL.CLIENT}/users`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/users/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/users/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/users/${id}`,
  },
  MENUS: {
    LIST: `${API_URL.CLIENT}/menus`,
    CREATE: `${API_URL.CLIENT}/menus`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/menus/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/menus/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/menus/${id}`,
  },
  MENU_ROUTES: {
    LIST: `${API_URL.CLIENT}/menu-routes`,
    CREATE: `${API_URL.CLIENT}/menu-routes`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/menu-routes/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/menu-routes/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/menu-routes/${id}`,
  },
  PROPERTY_TYPES: {
    LIST: `${API_URL.CLIENT}/property-types`,
    CREATE: `${API_URL.CLIENT}/property-types`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/property-types/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/property-types/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/property-types/${id}`,
  },
  CATEGORIES: {
    LIST: `${API_URL.CLIENT}/categories`,
    CREATE: `${API_URL.CLIENT}/categories`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/categories/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/categories/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/categories/${id}`,
  },
   SUBCATEGORIES: {
    LIST: `${API_URL.CLIENT}/subcategories`,
    CREATE: `${API_URL.CLIENT}/subcategories`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/subcategories/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/subcategories/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/subcategories/${id}`,
  },

  // Event Types
  EVENT_TYPES: {
    LIST: `${API_URL.CLIENT}/event-types`,
    CREATE: `${API_URL.CLIENT}/event-types`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/event-types/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/event-types/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/event-types/${id}`,
  },

  // Events
  EVENTS: {
    LIST: `${API_URL.CLIENT}/events`,
    CREATE: `${API_URL.CLIENT}/events`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/events/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/events/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/events/${id}`,
  },

  // Game Type
  GAME_TYPES: {
    LIST: `${API_URL.CLIENT}/game-type`,
    CREATE: `${API_URL.CLIENT}/game-type`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/game-type/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/game-type/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/game-type/${id}`,
  },

  // Eligibility
  ELIGIBILITY: {
    LIST: `${API_URL.CLIENT}/eligibility`,
    CREATE: `${API_URL.CLIENT}/eligibility`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/eligibility/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/eligibility/${id}`,
    GET: (id: string) => `${API_URL.CLIENT}/eligibility/${id}`,
  },

  // Grid Sizes
  GRID_SIZES: {
    LIST: `${API_URL.CLIENT}/grid-sizes`,
    CREATE: `${API_URL.CLIENT}/grid-sizes`,
    GET: (id: string) => `${API_URL.CLIENT}/grid-sizes/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/grid-sizes/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/grid-sizes/${id}`,
  },

  CARD_GENERATION: {
    LIST: `${API_URL.CLIENT}/card-generation-type`,
    CREATE: `${API_URL.CLIENT}/card-generation-type`,
    GET: (id: string) => `${API_URL.CLIENT}/card-generation-type/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/card-generation-type/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/card-generation-type/${id}`,
  },

  WINNING_PATTERN: {
    LIST: `${API_URL.CLIENT}/winning-pattern`,
    CREATE: `${API_URL.CLIENT}/winning-pattern`,
    GET: (id: string) => `${API_URL.CLIENT}/winning-pattern/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/winning-pattern/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/winning-pattern/${id}`,
  },

  WINNING_PATTERN_TYPES: {
    LIST: `${API_URL.CLIENT}/winning-pattern-types`,
    LIST_BY_PATTERN: (winningPatternId: string) =>
      `${API_URL.CLIENT}/winning-pattern-types?winning_pattern_id=${encodeURIComponent(winningPatternId)}`,
    CREATE: `${API_URL.CLIENT}/winning-pattern-types`,
    GET: (id: string) => `${API_URL.CLIENT}/winning-pattern-types/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/winning-pattern-types/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/winning-pattern-types/${id}`,
  },

  GAMES: {
    LIST: `${API_URL.CLIENT}/games`,
    CREATE: `${API_URL.CLIENT}/games`,
    GET: (id: string) => `${API_URL.CLIENT}/games/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/games/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/games/${id}`,
    OPEN: `${API_URL.CLIENT}/games/open`,
    MY: (userId: string) => `${API_URL.CLIENT}/games/my?userId=${encodeURIComponent(userId)}`,
    JOIN: `${API_URL.CLIENT}/games/join`,
    LEAVE: (id: string) => `${API_URL.CLIENT}/games/${id}/leave`,
    START: (id: string) => `${API_URL.CLIENT}/games/${id}/start`,
  },

  GAME_INVITES: {
    LIST_BY_GAME: (gameId: string) => `${API_URL.CLIENT}/game-invites/game/${gameId}`,
    CREATE: `${API_URL.CLIENT}/game-invites`,
    GET: (id: string) => `${API_URL.CLIENT}/game-invites/${id}`,
    ACCEPT: (id: string) => `${API_URL.CLIENT}/game-invites/${id}/accept`,
    REVOKE: (id: string, revokedBy: string) =>
      `${API_URL.CLIENT}/game-invites/${id}/revoke?revokedBy=${encodeURIComponent(revokedBy)}`,
  },

  GAME_CARDS: {
    GENERATE: `${API_URL.CLIENT}/game-cards/generate`,
    REGENERATE: (id: string) => `${API_URL.CLIENT}/game-cards/${id}/regenerate`,
    GET: (id: string) => `${API_URL.CLIENT}/game-cards/${id}`,
    LIST: (gameId: string, userId?: string) =>
      `${API_URL.CLIENT}/game-cards?gameId=${encodeURIComponent(gameId)}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`,
    UPDATE_SQUARES: (id: string) => `${API_URL.CLIENT}/game-cards/${id}/squares`,
    CLAIM: (cardId: string) => `${API_URL.CLIENT}/game-cards/${cardId}/claim`,
  },

  REWARDS: {
    LIST: `${API_URL.CLIENT}/rewards`,
    CREATE: `${API_URL.CLIENT}/rewards`,
    GET: (id: string) => `${API_URL.CLIENT}/rewards/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/rewards/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/rewards/${id}`,
  },

  ACHIEVEMENT_CRITERIA: {
    LIST: `${API_URL.CLIENT}/achievement-criteria`,
    CREATE: `${API_URL.CLIENT}/achievement-criteria`,
    GET: (id: string) => `${API_URL.CLIENT}/achievement-criteria/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/achievement-criteria/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/achievement-criteria/${id}`,
  },

  FACILITIES: {
    LIST: `${API_URL.CLIENT}/facilities`,
    CREATE: `${API_URL.CLIENT}/facilities`,
    GET: (id: string) => `${API_URL.CLIENT}/facilities/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/facilities/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/facilities/${id}`,
  },

  ROOM_TYPES: {
    LIST: `${API_URL.CLIENT}/room-types`,
    CREATE: `${API_URL.CLIENT}/room-types`,
    GET: (id: string) => `${API_URL.CLIENT}/room-types/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/room-types/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/room-types/${id}`,
  },

  ASSETS: {
    LIST: `${API_URL.CLIENT}/assets`,
    CREATE: `${API_URL.CLIENT}/assets`,
    UPLOAD: `${API_URL.CLIENT}/assets/upload`,
    GET: (id: string) => `${API_URL.CLIENT}/assets/${id}`,
    UPDATE: (id: string) => `${API_URL.CLIENT}/assets/${id}`,
    DELETE: (id: string) => `${API_URL.CLIENT}/assets/${id}`,
  },
} as const;

/**
 * Validate that required environment variables are set
 */
export function validateEnv() {
  const required = ['NEXT_PUBLIC_API_URL'];
  const missing: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && IS_PROD) {
    console.error('Missing required environment variables:', missing.join(', '));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (missing.length > 0 && IS_DEV) {
    console.warn('Missing environment variables (using defaults):', missing.join(', '));
  }
}

// Validate on import in development
if (typeof window === 'undefined' && IS_DEV) {
  validateEnv();
}

