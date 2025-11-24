/**
 * JWT Implementation for Cloudflare Workers
 * Uses Web Crypto API instead of Node.js crypto module
 * 
 * This replaces jose library with native Workers-compatible implementation
 */

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: number;
  role: 'user' | 'admin';
  email?: string;
  name?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * Base64 URL encode (RFC 4648)
 */
function base64UrlEncode(data: ArrayBuffer): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): ArrayBuffer {
  // Add padding
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Create HMAC-SHA256 signature
 */
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return base64UrlEncode(signature);
}

/**
 * Verify HMAC-SHA256 signature
 */
async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await createSignature(data, secret);
  return signature === expectedSignature;
}

/**
 * Create JWT token
 * 
 * @param payload - JWT payload data
 * @param secret - Secret key for signing
 * @param expiresIn - Expiration time in seconds (default: 30 days)
 * @returns JWT token string
 * 
 * @example
 * ```ts
 * const token = await createJWT(
 *   { userId: 1, role: 'user', email: 'user@example.com' },
 *   'your-secret-key',
 *   30 * 24 * 60 * 60 // 30 days
 * );
 * ```
 */
export async function createJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: number = 30 * 24 * 60 * 60 // 30 days
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
  
  const dataToSign = `${headerB64}.${payloadB64}`;
  const signature = await createSignature(dataToSign, secret);
  
  return `${dataToSign}.${signature}`;
}

/**
 * Verify and decode JWT token
 * 
 * @param token - JWT token string
 * @param secret - Secret key for verification
 * @returns Decoded JWT payload
 * @throws Error if token is invalid, expired, or signature verification fails
 * 
 * @example
 * ```ts
 * try {
 *   const payload = await verifyJWT(token, 'your-secret-key');
 *   console.log('User ID:', payload.userId);
 * } catch (error) {
 *   console.error('Invalid token:', error.message);
 * }
 * ```
 */
export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload> {
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerB64, payloadB64, signature] = parts;
  
  // Verify signature
  const dataToVerify = `${headerB64}.${payloadB64}`;
  const isValid = await verifySignature(dataToVerify, signature, secret);
  
  if (!isValid) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  const payloadBuffer = base64UrlDecode(payloadB64);
  const decoder = new TextDecoder();
  const payloadJson = decoder.decode(payloadBuffer);
  const payload: JWTPayload = JSON.parse(payloadJson);

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

/**
 * Extract JWT token from Authorization header
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer token...")
 * @returns JWT token string or null if not found
 * 
 * @example
 * ```ts
 * const token = extractBearerToken(request.headers.get('authorization'));
 * if (token) {
 *   const payload = await verifyJWT(token, secret);
 * }
 * ```
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Create a JWT token from user data (convenience function)
 * 
 * @param user - User object with id, role, email, name
 * @param secret - Secret key for signing
 * @returns JWT token string
 */
export async function createUserToken(
  user: { id: number; role: 'user' | 'admin'; email?: string | null; name?: string | null },
  secret: string
): Promise<string> {
  return createJWT(
    {
      userId: user.id,
      role: user.role,
      email: user.email || undefined,
      name: user.name || undefined,
    },
    secret
  );
}
