/**
 * Deterministic reference date used identically during SSR and initial client hydration
 * to satisfy Next.js cacheComponents prerendering without hydration mismatches.
 * Real-time client dates must be resolved inside useEffect or event handlers via `new Date()`.
 */
export const SSR_REFERENCE_DATE = new Date(2026, 10, 3, 9, 0, 0);

export function getSafeNow(provided?: Date): Date {
  return provided ? new Date(provided.getTime()) : new Date(SSR_REFERENCE_DATE.getTime());
}

