// Cookie utility functions for managing authentication tokens

import { User } from '@/types/user';

export const setCookie = (name: string, value: string, days: number = 7, crossSubdomain: boolean = true) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Determine domain and secure flag based on environment
  let domain = '';
  let secure = '';
  let sameSite = 'lax';
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProduction = hostname.includes('vaoluoitv.com');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';
    
    if (crossSubdomain && isProduction) {
      // Set domain to .vaoluoitv.com for production to share across subdomains
      domain = `;domain=.vaoluoitv.com`;
      // Only set secure flag if using HTTPS
      if (isHttps) {
        secure = `;secure`;
      }
      sameSite = 'lax';
    } else if (isLocalhost) {
      // For localhost, don't set domain or secure flag
      domain = '';
      secure = '';
      sameSite = 'lax';
    } else {
      // Default for other environments
      domain = '';
      if (isHttps) {
        secure = `;secure`;
      }
      sameSite = 'lax';
    }
  }
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;${sameSite ? `samesite=${sameSite}` : ''}${domain}${secure}`;
};

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

export const deleteCookie = (name: string, crossSubdomain: boolean = true) => {
  if (typeof window === 'undefined') return;
  
  let domain = '';
  if (crossSubdomain) {
    const hostname = window.location.hostname;
    if (hostname.includes('vaoluoitv.com')) {
      domain = `;domain=.vaoluoitv.com`;
    }
  }
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;${domain ? domain : ''}`;
};

// Auth specific cookie functions
export const setAuthToken = (token: string) => {
  setCookie('access_token', token, 7, true); // 7 days, cross-subdomain
};

export const getAuthToken = (): string | null => {
  return getCookie('access_token');
};

export const removeAuthToken = () => {
  deleteCookie('access_token', true);
};

// User data cookie functions
export const setUserData = (user: User) => {
  setCookie('user', JSON.stringify(user), 7, true);
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
  deleteCookie('user', true);
};
