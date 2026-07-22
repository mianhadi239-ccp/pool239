export interface JWTPayload {
  sub: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
  iss: string;
  deviceFp: string; // Device fingerprint bound to originating hardware/browser
}

const SECRET_KEY = 'ccp_pool_secret_jwt_key_2026';
const STORAGE_ADMIN_KEY = 'ccp_admin_jwt';
const STORAGE_USER_KEY = 'ccp_user_jwt';
const DEVICE_ID_KEY = 'ccp_device_bound_id';

// Helper to convert string to ArrayBuffer
const stringToArrayBuffer = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Helper for Base64URL encoding
const base64UrlEncode = (str: string): string => {
  const base64 = btoa(str);
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
};

/* =========================================================================
   PURE JAVASCRIPT SHA-256 & HMAC FALLBACK ENGINE
   (Works on HTTP non-localhost network IPs, mobile devices, and HTTPS)
   ========================================================================= */

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef4a394, 0x4708d1bc
];

const pureJsSha256Bytes = (data: Uint8Array): Uint8Array => {
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const l = data.length;
  const bitLen = l * 8;

  const k = (448 - (l * 8 + 8) % 512 + 512) % 512;
  const paddingLen = (8 + k + 64) / 8;
  const padded = new Uint8Array(l + paddingLen);
  padded.set(data);
  padded[l] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen & 0xffffffff, false);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);

  const w = new Int32Array(64);

  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getInt32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = (w[j - 15] >>> 7 | w[j - 15] << 25) ^ (w[j - 15] >>> 18 | w[j - 15] << 14) ^ (w[j - 15] >>> 3);
      const s1 = (w[j - 2] >>> 17 | w[j - 2] << 15) ^ (w[j - 2] >>> 19 | w[j - 2] << 13) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let j = 0; j < 64; j++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outView.setInt32(i * 4, H[i], false);
  }
  return out;
};

const pureJsHmacSha256 = (keyStr: string, messageStr: string): Uint8Array => {
  let key = stringToArrayBuffer(keyStr);
  const message = stringToArrayBuffer(messageStr);

  const blockSize = 64;
  if (key.length > blockSize) {
    key = pureJsSha256Bytes(key);
  }
  if (key.length < blockSize) {
    const tmp = new Uint8Array(blockSize);
    tmp.set(key);
    key = tmp;
  }

  const oPad = new Uint8Array(blockSize);
  const iPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oPad[i] = key[i] ^ 0x5c;
    iPad[i] = key[i] ^ 0x36;
  }

  const inner = new Uint8Array(blockSize + message.length);
  inner.set(iPad, 0);
  inner.set(message, blockSize);
  const innerHash = pureJsSha256Bytes(inner);

  const outer = new Uint8Array(blockSize + innerHash.length);
  outer.set(oPad, 0);
  outer.set(innerHash, blockSize);
  return pureJsSha256Bytes(outer);
};

/**
 * Universal HMAC-SHA256 Signer
 * Uses window.crypto.subtle when available (HTTPS / localhost),
 * and automatically falls back to pureJsHmacSha256 on HTTP IP addresses!
 */
const computeHmacSignature = async (keyStr: string, dataStr: string): Promise<Uint8Array> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const keyData = stringToArrayBuffer(keyStr);
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        stringToArrayBuffer(dataStr)
      );
      return new Uint8Array(signatureBuffer);
    } catch {
      return pureJsHmacSha256(keyStr, dataStr);
    }
  }
  return pureJsHmacSha256(keyStr, dataStr);
};

/**
 * Gets or creates a persistent device ID unique to this device/browser
 */
const getPersistentDeviceId = (): string => {
  try {
    let devId = localStorage.getItem(DEVICE_ID_KEY);
    if (!devId) {
      devId = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(DEVICE_ID_KEY, devId);
    }
    return devId;
  } catch {
    return 'dev-fallback';
  }
};

/**
 * Generates SHA-256 fingerprint hash of device environment
 */
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    const devId = getPersistentDeviceId();
    const ua = navigator.userAgent || '';
    const lang = navigator.language || '';
    const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`;
    const hardware = `${navigator.hardwareConcurrency || 0}_${(navigator as any).deviceMemory || 0}`;

    const rawFingerprint = `${devId}::${ua}::${lang}::${screenRes}::${hardware}`;
    const hashBytes = pureJsSha256Bytes(stringToArrayBuffer(rawFingerprint));
    return Array.from(hashBytes).map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  } catch {
    return getPersistentDeviceId().substring(0, 16);
  }
};

/**
 * Generates a signed, device-bound JWT token (works on ALL devices)
 */
export const generateJWT = async (
  username: string,
  role: 'admin' | 'user',
  expiresInHours: number = 24
): Promise<string> => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expInSeconds = nowInSeconds + expiresInHours * 3600;
  const deviceFp = await getDeviceFingerprint();

  const payload: JWTPayload = {
    sub: username,
    role,
    iat: nowInSeconds,
    exp: expInSeconds,
    iss: 'ccp-pool-booking-app',
    deviceFp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signatureBytes = await computeHmacSignature(SECRET_KEY, dataToSign);

  // Convert ArrayBuffer signature to base64url
  const signatureArray = Array.from(signatureBytes);
  const signatureString = String.fromCharCode(...signatureArray);
  const encodedSignature = base64UrlEncode(signatureString);

  return `${dataToSign}.${encodedSignature}`;
};

/**
 * Verifies a JWT token's signature, expiration, and strict device binding
 */
export const verifyJWT = async (token: string): Promise<JWTPayload | null> => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const expectedSignatureBytes = await computeHmacSignature(SECRET_KEY, dataToVerify);
    const expectedSignatureString = String.fromCharCode(...Array.from(expectedSignatureBytes));
    const expectedEncodedSignature = base64UrlEncode(expectedSignatureString);

    if (encodedSignature !== expectedEncodedSignature) {
      console.warn('JWT Signature Verification Failed');
      return null;
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const nowInSeconds = Math.floor(Date.now() / 1000);

    // 1. Check expiration
    if (payload.exp < nowInSeconds) {
      console.warn('JWT Token has expired');
      return null;
    }

    // 2. Strict Device Binding Check
    const currentDeviceFp = await getDeviceFingerprint();
    if (payload.deviceFp !== currentDeviceFp) {
      console.error('JWT Security Alert: Device Mismatch! Token restricted to originating device only.');
      return null;
    }

    return payload;
  } catch (e) {
    console.error('JWT Verification error:', e);
    return null;
  }
};

/**
 * Synchronous payload decoder (without verification check)
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
};

// Storage Utilities
export const setAdminJWT = (token: string) => {
  sessionStorage.setItem(STORAGE_ADMIN_KEY, token);
};

export const getAdminJWT = (): string | null => {
  return sessionStorage.getItem(STORAGE_ADMIN_KEY);
};

export const removeAdminJWT = () => {
  sessionStorage.removeItem(STORAGE_ADMIN_KEY);
};

export const setUserJWT = (token: string) => {
  sessionStorage.setItem(STORAGE_USER_KEY, token);
};

export const getUserJWT = (): string | null => {
  return sessionStorage.getItem(STORAGE_USER_KEY);
};

export const removeUserJWT = () => {
  sessionStorage.removeItem(STORAGE_USER_KEY);
};
