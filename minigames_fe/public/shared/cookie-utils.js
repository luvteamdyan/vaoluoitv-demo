/**
 * Cookie Utility Functions for Static Games
 * Provides cookie-based storage for cross-subdomain authentication and game data
 */

(function(window) {
  'use strict';

  /**
   * Set a cookie with optional domain for cross-subdomain sharing
   */
  function setCookie(name, value, days, crossSubdomain) {
    days = days || 7;
    crossSubdomain = crossSubdomain !== false;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Determine domain and secure flag based on environment
    let domain = '';
    let secure = '';
    
    const hostname = window.location.hostname;
    const isVaoLuoi = hostname.includes('vaoluoitv.com');
    const isLuck8Event = hostname.includes('luck8event.com');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // Exclude members.vaoluoitv.com from cross-subdomain cookie sharing
    const isMembersSubdomain = hostname === 'members.vaoluoitv.com';
    
    if (crossSubdomain && isVaoLuoi && !isMembersSubdomain) {
      // Set domain to .vaoluoitv.com for production to share across subdomains
      // Except for members.vaoluoitv.com (admin dashboard)
      domain = ';domain=.vaoluoitv.com';
      secure = 'secure;';
    } else if (crossSubdomain && isLuck8Event) {
      // Set domain to .luck8event.com for production to share across subdomains
      domain = ';domain=.luck8event.com';
      secure = 'secure;';
    } else if (isLocalhost) {
      // For localhost, don't set domain or secure flag
      // This allows cookies to work on localhost
      domain = '';
      secure = '';
    } else if (isMembersSubdomain) {
      // For members subdomain, use secure but no cross-subdomain
      secure = 'secure;';
    }
    
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;' + domain + secure + 'samesite=lax';
  }

  /**
   * Get a cookie by name
   */
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Delete a cookie
   */
  function deleteCookie(name, crossSubdomain) {
    crossSubdomain = crossSubdomain !== false;
    
    let domain = '';
    if (crossSubdomain) {
      const hostname = window.location.hostname;
      const isMembersSubdomain = hostname === 'members.vaoluoitv.com';
      
      if (hostname.includes('vaoluoitv.com') && !isMembersSubdomain) {
        domain = ';domain=.vaoluoitv.com';
      } else if (hostname.includes('luck8event.com')) {
        domain = ';domain=.luck8event.com';
      }
    }
    
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;' + domain;
  }

  // Helper to check if we're on luck8event domain
  function isLuck8EventDomain() {
    return window.location.hostname.includes('luck8event.com');
  }

  // Auth specific cookie functions with localStorage sync for luck8event
  function getAuthToken() {
    if (isLuck8EventDomain()) {
      // For luck8event, check localStorage first
      const localToken = localStorage.getItem('userToken');
      if (localToken) {
        return localToken;
      }
    }
    return getCookie('access_token');
  }

  function setAuthToken(token) {
    setCookie('access_token', token, 7, true);
    
    // For luck8event, also sync to localStorage
    if (isLuck8EventDomain()) {
      localStorage.setItem('userToken', token);
    }
  }

  function removeAuthToken() {
    deleteCookie('access_token', true);
    
    // For luck8event, also remove from localStorage
    if (isLuck8EventDomain()) {
      localStorage.removeItem('userToken');
    }
  }

  // User data cookie functions with localStorage sync for luck8event
  function getUserData() {
    if (isLuck8EventDomain()) {
      // For luck8event, check localStorage first
      const localUserData = localStorage.getItem('userData');
      if (localUserData) {
        try {
          return JSON.parse(localUserData);
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
    }
    
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
  }

  function setUserData(user) {
    setCookie('user', JSON.stringify(user), 7, true);
    
    // For luck8event, also sync to localStorage
    if (isLuck8EventDomain()) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }

  function removeUserData() {
    deleteCookie('user', true);
    
    // For luck8event, also remove from localStorage
    if (isLuck8EventDomain()) {
      localStorage.removeItem('userData');
    }
  }

  // Game data cookie functions
  function setGameData(gameKey, data, days) {
    days = days || 7;
    const key = 'game_' + gameKey;
    setCookie(key, JSON.stringify(data), days, true);
  }

  function getGameData(gameKey) {
    const key = 'game_' + gameKey;
    const gameData = getCookie(key);
    if (gameData) {
      try {
        return JSON.parse(gameData);
      } catch (e) {
        console.error('Error parsing game data for ' + gameKey + ':', e);
        return null;
      }
    }
    return null;
  }

  function removeGameData(gameKey) {
    const key = 'game_' + gameKey;
    deleteCookie(key, true);
  }

  // Expose functions to window
  window.CookieUtils = {
    setCookie: setCookie,
    getCookie: getCookie,
    deleteCookie: deleteCookie,
    getAuthToken: getAuthToken,
    setAuthToken: setAuthToken,
    removeAuthToken: removeAuthToken,
    getUserData: getUserData,
    setUserData: setUserData,
    removeUserData: removeUserData,
    setGameData: setGameData,
    getGameData: getGameData,
    removeGameData: removeGameData
  };

})(window);

