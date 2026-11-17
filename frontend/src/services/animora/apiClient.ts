const RAW_BASE_URL = (process.env.NEXT_PUBLIC_SERVER_API || '/api/v1').replace(/\/+$/, '') || '/api/v1';

export class ApiError extends Error {
  status: number;
  statusCode: number;
  errorCode: string;
  errors: unknown;
  isNetworkError: boolean;

  constructor(
    statusOrMessage: number | string,
    messageOrStatus?: string | number,
    errorCode = 'HTTP_ERROR',
    errors: unknown = null,
    isNetworkError = false
  ) {
    let status = 500;
    let message = 'API_ERROR';
    if (typeof statusOrMessage === 'number') {
      status = statusOrMessage;
      message = typeof messageOrStatus === 'string' ? messageOrStatus : 'API_ERROR';
    } else {
      message = statusOrMessage;
      status = typeof messageOrStatus === 'number' ? messageOrStatus : 500;
    }
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
  }
}

export { ApiError as ApiClientError };

let fetchRefreshPromise: Promise<boolean> | null = null;

async function refreshSessionCookie(): Promise<boolean> {
  if (!fetchRefreshPromise) {
    const refreshUrl = resolveApiUrl('/auth/refresh-token');
    fetchRefreshPromise = fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        fetchRefreshPromise = null;
      });
  }
  return fetchRefreshPromise;
}

function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (RAW_BASE_URL.endsWith('/api/v1') || cleanPath.startsWith('/api/v1')) {
    if (cleanPath.startsWith('/api/v1')) {
      const origin = RAW_BASE_URL.replace(/\/api\/v1$/, '');
      return `${origin}${cleanPath}`;
    }
    return `${RAW_BASE_URL}${cleanPath}`;
  }
  return `${RAW_BASE_URL}${cleanPath}`;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export async function apiRaw<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const url = resolveApiUrl(path);
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const requestInit: RequestInit = {
    credentials: init?.credentials ?? 'include',
    ...init,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (err) {
    throw new ApiError(
      0,
      err instanceof Error ? err.message : 'Không thể kết nối tới máy chủ',
      'NETWORK_ERROR',
      null,
      true
    );
  }

  const isRefreshEndpoint =
    path.includes('/auth/refresh-token') || path.includes('/auth/refresh');

  // 410 GONE: Access Token hết hạn -> Singleton Promise Lock refresh cookie -> Retry 1 lần
  if (response.status === 410 && !isRefreshEndpoint) {
    const refreshed = await refreshSessionCookie();
    if (refreshed) {
      try {
        response = await fetch(url, requestInit);
      } catch (err) {
        throw new ApiError(
          0,
          err instanceof Error ? err.message : 'Không thể kết nối tới máy chủ',
          'NETWORK_ERROR',
          null,
          true
        );
      }
    }
  }

  let parsedBody: Record<string, unknown> | null = null;
  try {
    parsedBody = (await response.json()) as Record<string, unknown>;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    const message =
      (parsedBody && typeof parsedBody.message === 'string' && parsedBody.message) ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    const errorCode =
      (parsedBody && typeof parsedBody.errorCode === 'string' && parsedBody.errorCode) ||
      'HTTP_ERROR';
    throw new ApiError(
      response.status,
      message,
      errorCode,
      parsedBody?.errors ?? null,
      false
    );
  }

  if (parsedBody && typeof parsedBody === 'object' && 'data' in parsedBody) {
    return parsedBody as unknown as ApiEnvelope<T>;
  }

  return {
    success: true,
    data: parsedBody as unknown as T,
  };
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const envelope = await apiRaw<T>(path, init);
  return envelope.data;
}

export function isBusinessConflictOrValidationError(err: unknown): err is ApiError {
  if (err instanceof ApiError) {
    return !err.isNetworkError && [400, 403, 404, 409, 422].includes(err.status);
  }
  return false;
}
