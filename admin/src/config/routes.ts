/**
 * Centralized route configuration
 * Use these constants instead of hardcoding route strings throughout the app
 */

export const ROUTES = {
  HOME: '/',
  
  // Authentication routes
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    RESET_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/', // Main dashboard (home page)
  
  // Profile routes
  PROFILE: '/admin/profile',
  
  // Calendar
  CALENDAR: '/admin/calendar',
  
  // Forms
  FORMS: {
    ELEMENTS: '/admin/form-elements',
  },
  
  // Tables
  TABLES: {
    BASIC: '/admin/basic-tables',
  },
  
  // Pages
  PAGES: {
    BLANK: '/admin/blank',
    ERROR_404: '/error-404',
  },
  
  // Charts
  CHARTS: {
    LINE: '/admin/line-chart',
    BAR: '/admin/bar-chart',
  },
  
  // UI Elements
  UI: {
    ALERTS: '/admin/alerts',
    AVATARS: '/admin/avatars',
    BADGE: '/admin/badge',
    BUTTONS: '/admin/buttons',
    IMAGES: '/images',
    VIDEOS: '/admin/videos',
    MODALS: '/admin/modals',
  },
  
  // Roles
  ROLES: '/admin/roles',
  ROLE_PERMISSIONS: (roleId: string) => `/admin/roles/${roleId}/permissions`,
  
  // Users
  USERS: '/admin/users',
  USERS_ADD: '/admin/users/add',
  USERS_VIEW: (id: string) => `/admin/users/${id}`,
  USERS_EDIT: (id: string) => `/admin/users/${id}/edit`,
  
  // Menus
  MENUS: '/admin/menus',

  // Categories
  CATEGORIES: '/admin/categories',
  //SubCategories
  SUB_CATEGORIES: '/admin/sub-categories',
  // Events (admin)
  EVENTS: '/admin/events',
  EVENTS_ADD: '/admin/events/add',
  EVENTS_EDIT: (id: string) => `/admin/events/${id}`,
  // Event Types (admin)
  EVENT_TYPES: '/admin/event-types',
  
  // Menu Routes
  MENU_ROUTES: '/admin/menu-routes',

  // Game Type (admin)
  GAME_TYPES: '/admin/game-type',

  // Eligibility (admin)
  ELIGIBILITY: '/admin/eligibility',

  // Public page showing Grid Sizes (dynamic)
  GRID_SIZES: '/admin/grid-sizes',

  // Card Generation Type (admin)
  CARD_GENERATION: '/admin/card-generation-type',

  // Assets (admin)
  ASSETS: '/admin/assets',
  ASSETS_ADD: '/admin/assets/add',
  ASSETS_EDIT: (id: string) => `/admin/assets/${id}`,

  // Games (admin)
  GAMES: '/admin/games',
  GAMES_ADD: '/admin/games/add',
  GAMES_EDIT: (id: string) => `/admin/games/${id}/edit`,
  GAMES_JOIN_ACCESS: (id: string) => `/admin/games/${id}/join-access`,
  GAMES_PREVIEW: (id: string) => `/admin/games/${id}/preview`,
  GAMES_CREATE_DYNAMIC: (id: string) => `/admin/games/${id}/create-dynamic-game`,

  // Winning Pattern (admin)
  WINNING_PATTERN: '/admin/winning-pattern',
  WINNING_PATTERN_ADD: '/admin/winning-pattern/add',
  WINNING_PATTERN_EDIT: (id: string) => `/admin/winning-pattern/${id}`,

  // Winning Pattern Types (admin)
  WINNING_PATTERN_TYPES: '/admin/winning-pattern-types',
  WINNING_PATTERN_TYPES_ADD: '/admin/winning-pattern-types/add',
  WINNING_PATTERN_TYPES_EDIT: (id: string) => `/admin/winning-pattern-types/${id}`,

  // Rewards (admin)
  REWARDS: '/admin/rewards',
  REWARDS_ADD: '/admin/rewards/add',
  REWARDS_EDIT: (id: string) => `/admin/rewards/${id}`,

  // Achievement Criteria (admin)
  ACHIEVEMENT_CRITERIA: '/admin/achievement-criteria',
  ACHIEVEMENT_CRITERIA_ADD: '/admin/achievement-criteria/add',
  ACHIEVEMENT_CRITERIA_EDIT: (id: string) => `/admin/achievement-criteria/${id}`,
} as const;

/**
 * Helper function to check if a route is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth');
}

/**
 * Helper function to check if a route is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.CALENDAR,
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Get redirect URL after login based on user role or previous page
 */
export function getPostLoginRedirect(returnUrl?: string): string {
  if (returnUrl && !isAuthRoute(returnUrl)) {
    return returnUrl;
  }
  return ROUTES.DASHBOARD_HOME;
}

/**
 * Check if a route is a dashboard route
 */
export function isDashboardRoute(pathname: string): boolean {
  return pathname === ROUTES.DASHBOARD || pathname === ROUTES.DASHBOARD_HOME;
}

