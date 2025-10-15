/**
 * LocalStorage Fallback Utility
 * 
 * Fallback mechanism để nhận token từ localStorage của luck8event.com
 * khi PostMessage không hoạt động hoặc không có sẵn
 */

// Types for localStorage fallback
export interface Luck8EventUserData {
  id: string;
  username: string;
  email: string;
  role: string;
  points: number;
  [key: string]: unknown;
}

export interface Luck8EventAuthData {
  userToken: string;
  userData: Luck8EventUserData;
}

/**
 * Check if we're running in iframe context
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // Cross-origin iframe
  }
};

/**
 * Check if we can access parent window's localStorage
 * This only works in same-origin iframes
 */
export const canAccessParentLocalStorage = (): boolean => {
  try {
    // Try to access parent window
    if (window.parent === window) {
      return false; // Not in iframe
    }
    
    // Try to access parent's localStorage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = window.parent.localStorage;
    return true;
  } catch {
    return false; // Cross-origin, cannot access
  }
};

/**
 * Get authentication data from parent window's localStorage
 * Only works for same-origin iframes
 */
export const getParentLocalStorageAuth = (): Luck8EventAuthData | null => {
  try {
    if (!canAccessParentLocalStorage()) {
      return null;
    }

    const userToken = window.parent.localStorage.getItem('userToken');
    const userDataStr = window.parent.localStorage.getItem('userData');

    if (!userToken || !userDataStr) {
      return null;
    }

    const userData = JSON.parse(userDataStr) as Luck8EventUserData;

    return {
      userToken,
      userData
    };
  } catch (error) {
    console.warn('[LocalStorage Fallback] Cannot access parent localStorage:', error);
    return null;
  }
};

/**
 * Listen for localStorage changes in parent window
 * Only works for same-origin iframes
 */
export const setupParentLocalStorageListener = (
  callback: (authData: Luck8EventAuthData | null) => void
): (() => void) => {
  if (!canAccessParentLocalStorage()) {
    return () => {}; // No-op cleanup function
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'userToken' || event.key === 'userData') {
      const authData = getParentLocalStorageAuth();
      callback(authData);
    }
  };

  // Listen for storage events from parent window
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Convert Luck8Event auth data to standard User format
 */
export const convertLuck8EventToUser = (luck8Data: Luck8EventUserData) => {
  return {
    id: luck8Data.id,
    email: luck8Data.email,
    username: luck8Data.username,
    role: luck8Data.role,
    points: luck8Data.points
  };
};

/**
 * Check if current domain is games.luck8event.com
 */
export const isLuck8EventDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'games.luck8event.com' || hostname.includes('luck8event');
};

/**
 * Get authentication strategy based on current context
 */
export const getAuthStrategy = (): 'postmessage' | 'localstorage' => {
  if (isInIframe()) {
    // In iframe - try localStorage fallback first, then PostMessage
    if (canAccessParentLocalStorage()) {
      return 'localstorage';
    }
    return 'postmessage';
  } else {
    // Not in iframe - use PostMessage (will be called from parent site)
    return 'postmessage';
  }
};
