export const QUERY_KEYS = {
  auth: {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
  },
  cart: {
    all: ["cart"] as const,
    count: ["cart", "count"] as const,
  },
  posts: {
    all: ["posts"] as const,
    infinite: ["posts", "infinite"] as const,
    list: (params?: { q?: string; page?: number }) =>
      ["posts", "list", params ?? {}] as const,
    detail: (id: number | string) => ["posts", "detail", String(id)] as const,
  },
} as const;
