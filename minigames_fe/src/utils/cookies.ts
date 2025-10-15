// Cookie utility functions for managing authentication tokens and game data
// Same-origin cookies only (PostMessage API handles cross-site authentication)

// Type definitions
interface User {
  id: string;
  email: string;
  username?: string;
  [key: string]: unknown;
}

interface GameData {
  [key: string]: unknown;
}

/**
 * Set a cookie (same-origin only)
 */
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Simple cookie setting for same-origin only
  let secure = '';
  const sameSite = 'lax';
  
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    
    if (isHttps) {
      secure = `;secure`;
    }
  }
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;samesite=${sameSite}${secure}`;
};

/**
 * Get a cookie by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Delete a cookie
 */
export const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

// Auth specific cookie functions
export const setAuthToken = (token: string) => {
  setCookie('access_token', token, 7); // 7 days, same-origin
};

export const getAuthToken = (): string | null => {
  return getCookie('access_token');
};

export const removeAuthToken = () => {
  deleteCookie('access_token');
};

// User data cookie functions
export const setUserData = (user: User) => {
  setCookie('user', JSON.stringify(user), 7);
};

export const getUserData = (): User | null => {
  const userData = getCookie('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
};

export const removeUserData = () => {
  deleteCookie('user');
};

// Game data cookie functions
export const setGameData = (gameKey: string, data: GameData, days: number = 7) => {
  const key = `game_${gameKey}`;
  setCookie(key, JSON.stringify(data), days);
};

export const getGameData = (gameKey: string): GameData | null => {
  const key = `game_${gameKey}`;
  const gameData = getCookie(key);
  if (gameData) {
    try {
      return JSON.parse(gameData);
    } catch (e) {
      console.error(`Error parsing game data for ${gameKey}:`, e);
      return null;
    }
  }
  return null;
};

export const removeGameData = (gameKey: string) => {
  const key = `game_${gameKey}`;
  deleteCookie(key);
};

