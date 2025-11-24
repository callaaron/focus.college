/**
 * Cookie handling utilities for Cloudflare Workers
 * Replaces Express cookie methods with Response header manipulation
 */

export interface CookieOptions {
  maxAge?: number; // milliseconds
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

/**
 * Serialize cookie options to Set-Cookie header format
 * 
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 * @returns Set-Cookie header value
 * 
 * @example
 * ```ts
 * const setCookie = serializeCookie('session', 'token123', {
 *   httpOnly: true,
 *   secure: true,
 *   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
 *   sameSite: 'lax',
 *   path: '/'
 * });
 * // Returns: "session=token123; HttpOnly; Secure; Max-Age=2592000; SameSite=Lax; Path=/"
 * ```
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    // Convert milliseconds to seconds for Max-Age
    const maxAgeSeconds = Math.floor(options.maxAge / 1000);
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  return parts.join('; ');
}

/**
 * Create a cookie that expires immediately (for logout)
 * 
 * @param name - Cookie name to clear
 * @param options - Cookie options (path and domain should match original cookie)
 * @returns Set-Cookie header value
 * 
 * @example
 * ```ts
 * const clearCookie = createExpiredCookie('session', { path: '/' });
 * // Returns: "session=; Max-Age=0; Path=/"
 * ```
 */
export function createExpiredCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): string {
  return serializeCookie(name, '', {
    maxAge: 0,
    path: options.path || '/',
    domain: options.domain,
  });
}

/**
 * Parse cookies from Cookie header
 * 
 * @param cookieHeader - Cookie header value
 * @returns Object with cookie name-value pairs
 * 
 * @example
 * ```ts
 * const cookies = parseCookies('session=abc123; user_id=456');
 * // Returns: { session: 'abc123', user_id: '456' }
 * ```
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=');
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value.trim());
    }
  });

  return cookies;
}

/**
 * Get cookie value from request
 * 
 * @param request - Request object
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 * 
 * @example
 * ```ts
 * const sessionToken = getCookie(request, 'session');
 * if (sessionToken) {
 *   // Process session
 * }
 * ```
 */
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  return cookies[name] || null;
}

/**
 * Default cookie options for session cookies
 */
export function getDefaultCookieOptions(isSecure: boolean = true): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  };
}

/**
 * Create Response with Set-Cookie header
 * 
 * @param data - Response data (will be JSON stringified)
 * @param cookieName - Cookie name
 * @param cookieValue - Cookie value
 * @param options - Cookie options
 * @returns Response object with Set-Cookie header
 * 
 * @example
 * ```ts
 * return createResponseWithCookie(
 *   { success: true, user: { id: 1 } },
 *   'session',
 *   'token123',
 *   { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }
 * );
 * ```
 */
export function createResponseWithCookie(
  data: any,
  cookieName: string,
  cookieValue: string,
  options: CookieOptions = {}
): Response {
  const setCookie = serializeCookie(cookieName, cookieValue, options);
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': setCookie,
    },
  });
}

/**
 * Create Response that clears a cookie
 * 
 * @param data - Response data (will be JSON stringified)
 * @param cookieName - Cookie name to clear
 * @param options - Cookie options (path and domain should match original)
 * @returns Response object with expired cookie
 * 
 * @example
 * ```ts
 * return createResponseClearingCookie(
 *   { success: true },
 *   'session',
 *   { path: '/' }
 * );
 * ```
 */
export function createResponseClearingCookie(
  data: any,
  cookieName: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): Response {
  const clearCookie = createExpiredCookie(cookieName, options);
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearCookie,
    },
  });
}

/**
 * Constants for cookie names
 */
export const COOKIE_NAMES = {
  SESSION: 'session',
  REFRESH_TOKEN: 'refresh_token',
} as const;
