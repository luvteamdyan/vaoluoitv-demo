/**
 * Global configuration for minigames
 * Can be configured via:
 * 1. window.__NEXT_DATA__ (from Next.js)
 * 2. URL parameters
 * 3. Auto-detection from hostname
 */
(function() {
  let apiBaseUrl = null;
  
  // Method 1: Check if config was injected by parent window
  if (window.__MINIGAMES_API_URL__) {
    apiBaseUrl = window.__MINIGAMES_API_URL__;
  }
  
  // Method 2: Check URL parameters
  if (!apiBaseUrl) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('apiUrl')) {
        apiBaseUrl = urlParams.get('apiUrl');
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // Method 3: Auto-detect from hostname
  if (!apiBaseUrl) {
    try {
      // If this is loaded in an iframe, try to get from parent
      if (window.parent && window.parent !== window && window.parent.location) {
        const parentUrl = new URL(window.parent.location.href);
        if (parentUrl.hostname.includes('vaoluoitv.com')) {
          apiBaseUrl = 'https://games-api.vaoluoitv.com';
        } else if (parentUrl.hostname.includes('luck8event.com')) {
          apiBaseUrl = 'https://games-api.vaoluoitv.com'; 
        }
      } else {
        // Not in iframe, check current hostname
        const currentUrl = new URL(window.location.href);
        if (currentUrl.hostname.includes('vaoluoitv.com')) {
          apiBaseUrl = 'https://games-api.vaoluoitv.com';
        } else if (currentUrl.hostname.includes('luck8event.com')) {
          apiBaseUrl = 'https://games-api.vaoluoitv.com';
        } else if (currentUrl.hostname === 'localhost' || currentUrl.hostname === '127.0.0.1') {
          apiBaseUrl = 'http://localhost:3009';
        }
      }
    } catch (e) {
      // Cross-origin restrictions or other errors
    }
  }
  
  // Fallback default
  if (!apiBaseUrl) {
    apiBaseUrl = 'https://games-api.vaoluoitv.com';
  }
  
  // Expose global config
  window.MINIGAMES_CONFIG = {
    API_BASE_URL: apiBaseUrl
  };
  
})();

