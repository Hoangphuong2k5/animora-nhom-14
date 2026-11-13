export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "NextBase",
  // Dùng cho Auth, Profile, Shopping Cart (Server & Client)
  API_BASE_URL:
    process.env.SERVER_API ||
    process.env.NEXT_PUBLIC_SERVER_API ||
    "https://shop-api.unicode.vn",
  PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_SERVER_API || "https://shop-api.unicode.vn",
  // Dùng cho trang mẫu Posts (Cache Components + Infinite Scroll)
  POSTS_API_URL:
    process.env.NEXT_PUBLIC_POSTS_API || "https://dummyjson.com",
} as const;

const DEFAULT_COOKIE_NAMES = ["accessToken", "refreshToken", "NEXT_LOCALE"] as const;

export const COOKIE_KEYS = {
  ACCESS_TOKEN: process.env.NEXT_PUBLIC_ACCESS_COOKIE_NAME || DEFAULT_COOKIE_NAMES[0],
  REFRESH_TOKEN: process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || DEFAULT_COOKIE_NAMES[1],
  LOCALE: DEFAULT_COOKIE_NAMES[2],
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/dang-nhap",
  PROFILE: "/profile",
  POSTS: "/posts",
  ADMIN: "/admin",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_PETS: "/admin/pets",
  ADMIN_STAFF: "/admin/staff",
  ADMIN_SCHEDULE: "/admin/schedule",
  ADMIN_SHOP: "/admin/shop",
  ADMIN_ADOPTIONS: "/admin/adoptions",
  ADMIN_FINANCE: "/admin/finance",
  ADMIN_VOUCHERS: "/admin/vouchers",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_USERS: "/admin/users",
  EXPERT: "/expert",
  EXPERT_APPOINTMENTS: "/expert/appointments",
  EXPERT_SCHEDULE: "/expert/schedule",
  EXPERT_CLIENTS: "/expert/clients",
  EXPERT_HEALTH_RECORDS: "/expert/health-records",
  EXPERT_HEALTH_RECORDS_NEW: "/expert/health-records/new",
  EXPERT_PRESCRIPTIONS: "/expert/prescriptions",
  EXPERT_PRESCRIPTIONS_NEW: "/expert/prescriptions/new",
  EXPERT_REVIEWS: "/expert/reviews",
  EXPERT_EARNINGS: "/expert/earnings",
  EXPERT_PROFILE: "/expert/profile",
  FORBIDDEN: "/403",
} as const;
