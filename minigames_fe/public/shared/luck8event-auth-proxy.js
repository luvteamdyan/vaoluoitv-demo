/**
 * Luck8Event Authentication Proxy Script
 * 
 * Script này được thêm vào luck8event.com để gửi authentication data
 * từ localStorage đến minigames_fe iframe qua PostMessage API
 * 
 * Usage: Thêm script này vào luck8event.com sau khi user đăng nhập
 */

(function(window) {
  'use strict';

  // Configuration
  const CONFIG = {
    minigamesOrigin: 'https://games.luck8event.com', // Domain mới cho minigames
    iframeSelector: '#minigames-iframe', // CSS selector cho iframe
    localStorageKeys: {
      token: 'userToken',
      userData: 'userData'
    },
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 5000
  };

  /**
   * Get authentication data from localStorage
   */
  function getAuthData() {
    try {
      const userToken = localStorage.getItem(CONFIG.localStorageKeys.userToken);
      const userDataStr = localStorage.getItem(CONFIG.localStorageKeys.userData);
      
      if (!userToken || !userDataStr) {
        console.warn('[Luck8Event Auth] No authentication data found in localStorage');
        return null;
      }

      const userData = JSON.parse(userDataStr);
      
      return {
        type: 'AUTH_TOKEN',
        source: 'luck8event',
        token: userToken,
        userData: userData
      };
    } catch (error) {
      console.error('[Luck8Event Auth] Error getting auth data:', error);
      return null;
    }
  }

  /**
   * Send authentication data to minigames iframe
   */
  function sendAuthToMinigames(iframe, authData) {
    try {
      iframe.contentWindow.postMessage(authData, CONFIG.minigamesOrigin);
      console.log('[Luck8Event Auth] Authentication data sent to minigames');
    } catch (error) {
      console.error('[Luck8Event Auth] Error sending auth data:', error);
    }
  }

  /**
   * Wait for iframe to be ready and send auth data
   */
  function waitForIframeAndSendAuth(iframe, authData, attempt = 1) {
    if (attempt > CONFIG.retryAttempts) {
      console.error('[Luck8Event Auth] Max retry attempts reached');
      return;
    }

    // Check if iframe is loaded
    if (iframe.contentWindow && iframe.contentDocument) {
      sendAuthToMinigames(iframe, authData);
      return;
    }

    // Retry after delay
    setTimeout(() => {
      waitForIframeAndSendAuth(iframe, authData, attempt + 1);
    }, CONFIG.retryDelay);
  }

  /**
   * Setup authentication for minigames iframe
   */
  function setupMinigamesAuth() {
    const iframe = document.querySelector(CONFIG.iframeSelector);
    
    if (!iframe) {
      console.warn('[Luck8Event Auth] Minigames iframe not found');
      return;
    }

    const authData = getAuthData();
    if (!authData) {
      console.warn('[Luck8Event Auth] No authentication data available');
      return;
    }

    // Send auth data when iframe loads
    iframe.addEventListener('load', () => {
      waitForIframeAndSendAuth(iframe, authData);
    });

    // If iframe is already loaded, send immediately
    if (iframe.contentWindow) {
      waitForIframeAndSendAuth(iframe, authData);
    }
  }

  /**
   * Listen for authentication responses from minigames
   */
  function setupResponseListener() {
    window.addEventListener('message', (event) => {
      // Validate origin
      if (event.origin !== CONFIG.minigamesOrigin) {
        return;
      }

      const data = event.data;
      
      if (data && data.type === 'AUTH_RECEIVED') {
        console.log('[Luck8Event Auth] Authentication successful in minigames');
        
        // Dispatch custom event for luck8event to listen
        window.dispatchEvent(new CustomEvent('minigamesAuthSuccess', {
          detail: { success: true }
        }));
      } else if (data && data.type === 'AUTH_ERROR') {
        console.error('[Luck8Event Auth] Authentication failed in minigames:', data.message);
        
        // Dispatch custom event for luck8event to listen
        window.dispatchEvent(new CustomEvent('minigamesAuthError', {
          detail: { error: data.message }
        }));
      }
    });
  }

  /**
   * Initialize the authentication proxy
   */
  function init() {
    console.log('[Luck8Event Auth] Initializing authentication proxy...');
    
    // Setup response listener
    setupResponseListener();
    
    // Setup minigames auth
    setupMinigamesAuth();
    
    // Listen for localStorage changes (in case user logs in after page load)
    window.addEventListener('storage', (event) => {
      if (event.key === CONFIG.localStorageKeys.userToken || 
          event.key === CONFIG.localStorageKeys.userData) {
        console.log('[Luck8Event Auth] Auth data changed, reinitializing...');
        setupMinigamesAuth();
      }
    });
  }

  /**
   * Public API for luck8event to use
   */
  window.Luck8EventAuthProxy = {
    init: init,
    sendAuth: setupMinigamesAuth,
    getAuthData: getAuthData,
    config: CONFIG
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
