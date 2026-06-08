export const ROUTES = {
  home: '/dashboard',
  login: '/login',
  dashboard: '/dashboard',
  users: '/users',
  products: '/products',
  orders: '/orders',
  categories: '/categories',
  subcategories: '/categories/subcategories',
  stores: '/stores',
  storeReview: '/stores/review',
  queries: '/queries',
  settings: '/settings',
  settingsProductConfig: '/settings/product-config',
  settingsLanding: '/settings/landing',
  settingsEscrow: '/settings/escrow',
  adminRegister: '/admin/register',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const PUBLIC_PATHS = [ROUTES.login, ROUTES.adminRegister] as const;

export const AUTH_ONLY_PATHS = [ROUTES.login] as const;

export const API_PUBLIC_PREFIXES = ['/api/auth', '/api/admin/register'] as const;

export const API_ROUTES = {
  dashboardStats: '/api/admin/dashboard/stats',
  stores: '/api/admin/stores',
  storeDocument: '/api/admin/stores/document',
  productsReview: '/api/admin/products/review',
  users: '/api/users/get',
  usersUpdate: '/api/users/update',
  userById: '/api/get-user-by-id',
  orders: '/api/get-all-orders',
  orderDetails: '/api/get-order-details',
  orderStatus: '/api/update-order-status',
  categories: '/api/categories',
  subcategories: '/api/subcategories',
  customerQueries: '/api/customer-queries',
  escrow: '/api/escrow/get',
  escrowRelease: '/api/escrow/release',
} as const;

/** Legacy paths kept for permanent redirects during migration. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/': ROUTES.dashboard,
  '/signin': ROUTES.login,
  '/user-management': ROUTES.users,
  '/product-approval': ROUTES.products,
  '/order-disputes': ROUTES.orders,
  '/category-management': ROUTES.categories,
  '/category-management/subcategories': ROUTES.subcategories,
  '/product-settings-management': ROUTES.settingsProductConfig,
  '/store-approval': ROUTES.stores,
  '/store-registration': ROUTES.storeReview,
  '/landing-page-management': ROUTES.settingsLanding,
  '/escrow-management': ROUTES.settingsEscrow,
  '/customer-queries': ROUTES.queries,
  '/settings/stores': ROUTES.stores,
  '/settings/stores/review': ROUTES.storeReview,
  '/settings/queries': ROUTES.queries,
};
