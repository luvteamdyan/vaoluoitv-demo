/**
 * JWT Utility Functions
 * 
 * Helper functions để decode và validate JWT tokens
 */

export interface JWTPayload {
  sub: string; // user id
  username: string;
  email: string;
  role: string;
  iat: number; // issued at
  exp: number; // expiry time
  [key: string]: unknown;
}

export interface DecodedJWT {
  header: Record<string, unknown>;
  payload: JWTPayload;
  signature: string;
}

/**
 * Decode JWT token để lấy payload
 * @param token - JWT token string
 * @returns Decoded JWT object hoặc null nếu invalid
 */
export const decodeJWT = (token: string): DecodedJWT | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format: expected 3 parts');
      return null;
    }

    // Decode header
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    return {
      header,
      payload,
      signature: parts[2]
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Kiểm tra token có expired không
 * @param payload - JWT payload object
 * @returns true nếu token đã expired
 */
export const isTokenExpired = (payload: JWTPayload): boolean => {
  if (!payload.exp) {
    return true; // No expiry time = expired
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Extract user info từ JWT payload
 * @param payload - JWT payload object
 * @returns User object hoặc null nếu invalid
 */
export const extractUserFromPayload = (payload: JWTPayload) => {
  try {
    if (!payload.sub || !payload.email) {
      console.warn('Invalid payload: missing required fields');
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username || payload.email.split('@')[0],
      role: payload.role || 'user'
    };
  } catch (error) {
    console.error('Error extracting user from payload:', error);
    return null;
  }
};

/**
 * Validate JWT token (format, expiry, required fields)
 * @param token - JWT token string
 * @returns true nếu token valid
 */
export const validateJWT = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return false;
  }

  // Check if expired
  if (isTokenExpired(decoded.payload)) {
    console.warn('JWT token is expired');
    return false;
  }

  // Check required fields
  if (!decoded.payload.sub || !decoded.payload.email) {
    console.warn('JWT token missing required fields');
    return false;
  }

  return true;
};

/**
 * Get token expiry time as readable string
 * @param payload - JWT payload object
 * @returns Formatted expiry time string
 */
export const getTokenExpiryString = (payload: JWTPayload): string => {
  if (!payload.exp) {
    return 'No expiry';
  }

  const expiryDate = new Date(payload.exp * 1000);
  return expiryDate.toLocaleString('vi-VN');
};
