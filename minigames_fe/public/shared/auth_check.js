/**
 * Reusable Authentication Check Script for Static HTML Games
 * 
 * This script provides authentication checking functionality for static HTML games.
 * It checks if user is authenticated via localStorage and redirects if not.
 * 
 * Usage:
 * 1. Include this script BEFORE any game scripts in your HTML:
 *    <script src="/shared/auth_check.js"></script>
 * 
 * 2. Configure the script by setting global variable BEFORE including the script:
 *    <script>
 *      window.GAME_AUTH_CONFIG = {
 *        gameName: '2048',
 *        redirectDelay: 2000,
 *        showWarning: true,
 *        onAuthFail: function() { console.log('Auth failed'); }
 *      };
 *    </script>
 *    <script src="/shared/auth_check.js"></script>
 * 
 * @version 1.0.0
 * @author VaoLuoi Games Team
 */

(function(window) {
  'use strict';

  // Default configuration
  var defaultConfig = {
    gameName: 'Game',
    redirectDelay: 2000,
    showWarning: true,
    redirectUrl: '/',
    onAuthSuccess: null,
    onAuthFail: null,
    validateToken: true
  };

  // Merge user config with defaults
  var config = Object.assign({}, defaultConfig, window.GAME_AUTH_CONFIG || {});

  /**
   * Get auth token from cookies (with localStorage fallback)
   * @returns {string|null} - Auth token or null
   */
  function getAuthToken() {
    try {
      // Try to get from cookies first (cross-subdomain support)
      if (window.CookieUtils) {
        var token = window.CookieUtils.getAuthToken();
        if (token) return token;
      }
      
      // Fallback to localStorage
      return localStorage.getItem('access_token');
    } catch (e) {
      console.error('Error accessing token:', e);
      return null;
    }
  }

  /**
   * Get user info from cookies (with localStorage fallback)
   * @returns {Object|null} - User object or null
   */
  function getUserInfo() {
    try {
      // Try to get from cookies first (cross-subdomain support)
      if (window.CookieUtils) {
        var user = window.CookieUtils.getUserData();
        if (user) return user;
      }
      
      // Fallback to localStorage
      var userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user info:', e);
      return null;
    }
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {boolean} - Whether token is valid
   */
  function isTokenValid(token) {
    if (!token) return false;
    
    // Basic validation - check if token exists and has minimum length
    if (typeof token !== 'string' || token.length < 10) {
      return false;
    }
    
    // Additional validation can be added here (JWT expiration check, etc.)
    return true;
  }

  /**
   * Show authentication warning overlay
   */
  function showAuthWarning() {
    if (!config.showWarning) return;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'auth-warning-overlay';
    overlay.style.cssText = 
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'background: rgba(0, 0, 0, 0.85);' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'z-index: 999999;' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';

    // Create warning box
    var warningBox = document.createElement('div');
    warningBox.style.cssText = 
      'background: white;' +
      'padding: 40px;' +
      'border-radius: 12px;' +
      'text-align: center;' +
      'max-width: 400px;' +
      'margin: 20px;' +
      'box-shadow: 0 10px 40px rgba(0,0,0,0.3);' +
      'animation: slideUp 0.3s ease-out;';

    // Lock icon SVG
    var lockIcon = 
      '<svg style="width: 64px; height: 64px; margin: 0 auto 20px; color: #f44336;" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />' +
      '</svg>';

    warningBox.innerHTML = 
      lockIcon +
      '<h2 style="color: #f44336; margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">⚠️ Chưa đăng nhập</h2>' +
      '<p style="color: #666; margin: 0 0 10px 0; font-size: 16px; line-height: 1.5;">' +
        'Bạn cần đăng nhập để chơi <strong>' + config.gameName + '</strong>' +
      '</p>' +
      '<p style="color: #999; margin: 0 0 20px 0; font-size: 14px;">' +
        'Đăng nhập để nhận thưởng và theo dõi tiến độ' +
      '</p>' +
      '<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">' +
        '<p style="color: #666; margin: 0; font-size: 14px;">Đang chuyển về trang chủ trong <span id="countdown">' + Math.ceil(config.redirectDelay / 1000) + '</span>s...</p>' +
      '</div>' +
      '<a href="' + config.redirectUrl + '" style="display: inline-block; background: #f44336; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background 0.3s;">Về trang chủ ngay</a>';

    // Add animation styles
    var style = document.createElement('style');
    style.textContent = 
      '@keyframes slideUp {' +
        'from { transform: translateY(30px); opacity: 0; }' +
        'to { transform: translateY(0); opacity: 1; }' +
      '}';
    document.head.appendChild(style);

    overlay.appendChild(warningBox);
    document.body.appendChild(overlay);

    // Countdown
    var countdownEl = document.getElementById('countdown');
    var seconds = Math.ceil(config.redirectDelay / 1000);
    var countdownInterval = setInterval(function() {
      seconds--;
      if (countdownEl && seconds > 0) {
        countdownEl.textContent = seconds;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  /**
   * Hide authentication warning overlay
   */
  function hideAuthWarning() {
    var overlay = document.getElementById('auth-warning-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  /**
   * Perform redirect to home
   */
  function redirectToHome() {
    setTimeout(function() {
      window.location.href = config.redirectUrl;
    }, config.redirectDelay);
  }

  /**
   * Main authentication check function
   * @returns {boolean} - Whether user is authenticated
   */
  function checkAuth() {
    var token = getAuthToken();
    var user = getUserInfo();

    // Check if token and user exist
    if (!token || !user) {
      console.warn('[Auth Check] User not authenticated - Missing token or user info');
      handleAuthFailure();
      return false;
    }

    // Validate token if required
    if (config.validateToken && !isTokenValid(token)) {
      console.warn('[Auth Check] User not authenticated - Invalid token format');
      handleAuthFailure();
      return false;
    }

    // Authentication successful
    handleAuthSuccess(user);
    return true;
  }

  /**
   * Handle authentication failure
   */
  function handleAuthFailure() {
    // Show warning overlay
    showAuthWarning();
    
    // Redirect to home
    redirectToHome();
    
    // Call custom callback if provided
    if (typeof config.onAuthFail === 'function') {
      config.onAuthFail();
    }
  }

  /**
   * Handle authentication success
   * @param {Object} user - User info
   */
  function handleAuthSuccess(user) {
    // Call custom callback if provided
    if (typeof config.onAuthSuccess === 'function') {
      config.onAuthSuccess(user);
    }
  }

  /**
   * Check if running in iframe
   * @returns {boolean}
   */
  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  /**
   * Listen for auth data from parent window (for iframe mode)
   */
  function listenForAuthData() {
    window.addEventListener('message', function(event) {
      // In production, validate event.origin
      if (event.data && event.data.type === 'AUTH_DATA') {
        
        try {
          // Save auth data to both cookies and localStorage for maximum compatibility
          if (event.data.token) {
            // Save to cookies (cross-subdomain)
            if (window.CookieUtils) {
              window.CookieUtils.setAuthToken(event.data.token);
            }
            // Also save to localStorage as backup
            localStorage.setItem('access_token', event.data.token);
          }
          if (event.data.user) {
            var userStr = typeof event.data.user === 'string' 
              ? event.data.user 
              : JSON.stringify(event.data.user);
            
            // Save to cookies (cross-subdomain)
            if (window.CookieUtils) {
              window.CookieUtils.setUserData(typeof event.data.user === 'string' ? JSON.parse(event.data.user) : event.data.user);
            }
            // Also save to localStorage as backup
            localStorage.setItem('user', userStr);
          }
          
          
          // Hide warning if it's showing
          hideAuthWarning();
          
        } catch (e) {
          console.error('[Auth Check] Error saving auth data:', e);
        }
      }
    });
  }

  /**
   * Initialize authentication check
   */
  function init() {
    
    // If in iframe, listen for auth data from parent
    if (isInIframe()) {
      listenForAuthData();
      
      // Give parent window some time to send auth data
      setTimeout(function() {
        var isAuthenticated = checkAuth();
        if (!isAuthenticated) {
          console.warn('[Auth Check] No auth data received after 2 seconds');
        }
      }, 2000);
    } else {
      // Not in iframe, check auth immediately
      var isAuthenticated = checkAuth();
      
      if (isAuthenticated) {
      } else {
        console.warn('[Auth Check] ✗ Authentication check failed - Redirecting to home');
      }
    }
  }

  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.GameAuth = {
    check: checkAuth,
    getToken: getAuthToken,
    getUser: getUserInfo,
    isTokenValid: isTokenValid,
    hideWarning: hideAuthWarning,
    showWarning: showAuthWarning
  };

})(window);

