import { useState, useEffect, useCallback } from 'react';
import { PageId } from '@/types/animora.type';
import {
  parseServiceBookingUrl,
  resolveServiceBySlugOrName,
} from '@/data/serviceBookingData';
import { parseMyBookingsUrl } from '@/utils/bookingHistoryUtils';

const PATH_TO_PAGE: Array<{ prefixes: string[]; page: PageId }> = [
  { prefixes: ['/gio-hang'], page: 'cart' },
  { prefixes: ['/don-hang'], page: 'my-orders' },
  { prefixes: ['/thanh-toan'], page: 'checkout' },
  { prefixes: ['/lich-hen'], page: 'my-bookings' },
  { prefixes: ['/dat-lich'], page: 'booking' },
  { prefixes: ['/dich-vu'], page: 'services' },
  { prefixes: ['/cua-hang'], page: 'shop' },
  { prefixes: ['/dang-nhap', '/login'], page: 'login' },
  { prefixes: ['/dang-ky', '/register'], page: 'register' },
  { prefixes: ['/tai-khoan', '/account'], page: 'account' },
  { prefixes: ['/ho-so-thu-cung', '/pet-profiles'], page: 'pet-profiles' },
  { prefixes: ['/ve-chung-toi', '/about'], page: 'about' },
];

function resolvePageFromPathname(path: string): PageId | null {
  for (const entry of PATH_TO_PAGE) {
    if (entry.prefixes.some((prefix) => path.startsWith(prefix))) {
      return entry.page;
    }
  }
  if (path === '/' || path === '') return 'home';
  return null;
}

const KNOWN_SUBPATH_PREFIXES = PATH_TO_PAGE.flatMap((entry) => entry.prefixes);

const PAGE_PUSH_CONFIG: Partial<
  Record<PageId, { path: string; checkExact?: boolean; aliases?: string[]; dispatchPopState?: boolean }>
> = {
  cart: { path: '/gio-hang', dispatchPopState: true },
  'my-orders': { path: '/don-hang', dispatchPopState: true },
  checkout: { path: '/thanh-toan', dispatchPopState: true },
  'my-bookings': { path: '/lich-hen', dispatchPopState: true },
  booking: { path: '/dat-lich', dispatchPopState: true },
  services: { path: '/dich-vu', checkExact: true, dispatchPopState: true },
  shop: { path: '/cua-hang', dispatchPopState: true },
  about: { path: '/ve-chung-toi', dispatchPopState: true },
  login: { path: '/dang-nhap', aliases: ['/login'] },
  register: { path: '/dang-ky', aliases: ['/register'] },
  account: { path: '/tai-khoan', aliases: ['/account'] },
  'pet-profiles': { path: '/ho-so-thu-cung', aliases: ['/pet-profiles'] },
};

/**
 * Manages client-side SPA page routing, URL synchronization (popstate/pushState),
 * and deep-link parsing for booking and adoption routes.
 */
export function useAnimoraRouter(initialPage: PageId) {
  const [activePage, setActivePage] = useState<PageId>(initialPage);
  const [returnPageAfterAuth, setReturnPageAfterAuth] = useState<PageId | null>(null);
  const scrollSpyPage = activePage;

  const [bookingUrlState, setBookingUrlState] = useState<
    ReturnType<typeof parseServiceBookingUrl>
  >({
    isBookingRoute: false,
    preselectedServiceSlug: null,
    isSuccessRoute: false,
  });

  const [myBookingsUrlState, setMyBookingsUrlState] = useState<
    ReturnType<typeof parseMyBookingsUrl>
  >({
    isMyBookingsRoute: false,
    detailCode: null,
    queryCode: null,
    action: 'list',
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setBookingUrlState(
        parseServiceBookingUrl(window.location.pathname, window.location.search)
      );
      setMyBookingsUrlState(
        parseMyBookingsUrl(window.location.pathname, window.location.search)
      );
      const matchedPage = resolvePageFromPathname(path);
      if (matchedPage) {
        setActivePage(matchedPage);
      }
    };

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) handlePopState();
    });
    window.addEventListener('popstate', handlePopState);
    return () => {
      cancelled = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigate = useCallback(
    (page: PageId) => {
      if (page === 'login' || page === 'register') {
        if (
          activePage === 'my-bookings' ||
          activePage === 'cart' ||
          activePage === 'checkout'
        ) {
          setReturnPageAfterAuth(activePage);
        }
      }

      const config = PAGE_PUSH_CONFIG[page];
      const currentPath = window.location.pathname;

      if (config) {
        const alreadyOnPath = config.checkExact
          ? currentPath === config.path
          : currentPath.startsWith(config.path) ||
            Boolean(config.aliases?.some((a) => currentPath.startsWith(a)));

        if (!alreadyOnPath) {
          window.history.pushState({}, '', config.path);
          if (config.dispatchPopState) {
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }
      } else if (KNOWN_SUBPATH_PREFIXES.some((prefix) => currentPath.startsWith(prefix))) {
        window.history.pushState({}, '', '/');
      }

      setActivePage(page);
      window.scrollTo({ top: 0, left: 0 });
    },
    [activePage]
  );

  const handleNavigateCustomUrl = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    const matched = resolvePageFromPathname(path);
    if (matched && !['login', 'register', 'account', 'pet-profiles', 'about'].includes(matched)) {
      setActivePage(matched);
    } else if (path === '/' || path === '') {
      setActivePage('home');
    }
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleOpenBookingPage = useCallback((serviceSlugOrName?: string) => {
    let targetUrl = '/dat-lich';
    if (serviceSlugOrName && serviceSlugOrName.trim()) {
      const resolved = resolveServiceBySlugOrName(serviceSlugOrName);
      targetUrl = `/dat-lich?service=${encodeURIComponent(resolved.slug)}`;
    }
    window.history.pushState({}, '', targetUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setActivePage('booking');
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return {
    activePage,
    returnPageAfterAuth,
    setReturnPageAfterAuth,
    bookingUrlState,
    myBookingsUrlState,
    scrollSpyPage,
    handleNavigate,
    handleNavigateCustomUrl,
    handleOpenBookingPage,
  };
}

