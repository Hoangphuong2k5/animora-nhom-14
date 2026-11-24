export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Animora",
  // Dùng cho Server Components & Server Services gọi trực tiếp sang Backend Express
  API_BASE_URL:
    process.env.SERVER_API ||
    process.env.NEXT_PUBLIC_SERVER_API ||
    "http://localhost:5000/api/v1",
  // Dùng cho Client (Axios/Fetch) gọi qua Next.js rewrite (/api/v1 -> http://localhost:5000/api/v1) để đồng bộ HttpOnly Cookie
  PUBLIC_API_URL: process.env.NEXT_PUBLIC_SERVER_API || "/api/v1",
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
  ADMIN_FINANCE: "/admin/finance",
  ADMIN_VOUCHERS: "/admin/vouchers",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_USERS: "/admin/users",
  MANAGER: "/manager",
  MANAGER_BOOKINGS: "/manager/bookings",
  MANAGER_CUSTOMERS: "/manager/customers",
  MANAGER_PETS: "/manager/pets",
  MANAGER_STAFF: "/manager/staff",
  MANAGER_SCHEDULE: "/manager/schedule",
  MANAGER_SHOP: "/manager/shop",
  MANAGER_FINANCE: "/manager/finance",
  MANAGER_VOUCHERS: "/manager/vouchers",
  EXPERT: "/expert",
  EXPERT_APPOINTMENTS: "/expert/appointments",
  EXPERT_SCHEDULE: "/expert/schedule",
  EXPERT_CLIENTS: "/expert/clients",
  EXPERT_HEALTH_RECORDS: "/expert/health-records",
  EXPERT_HEALTH_RECORDS_NEW: "/expert/health-records/new",
  EXPERT_PRESCRIPTIONS: "/expert/prescriptions",
  EXPERT_PRESCRIPTIONS_NEW: "/expert/prescriptions/new",
  EXPERT_MEDICINE_BOX: "/expert/medicine-box",
  EXPERT_REVIEWS: "/expert/reviews",
  EXPERT_PROFILE: "/expert/profile",
  SUPPLIER: "/supplier",
  SUPPLIER_CATALOG: "/supplier/catalog",
  SUPPLIER_RECONCILIATION: "/supplier/reconciliation",
  SUPPLIER_PROFILE: "/supplier/profile",
  RECEPTIONIST: "/receptionist",
  RECEPTIONIST_BOOKING: "/receptionist/booking",
  RECEPTIONIST_CUSTOMERS: "/receptionist/customers",
  RECEPTIONIST_AUDIT: "/receptionist/audit",
  RECEPTIONIST_LEAVE: "/receptionist/leave",
  FORBIDDEN: "/403",
} as const;
