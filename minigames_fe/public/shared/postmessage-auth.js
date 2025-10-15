/**
 * PostMessage Auth Listener
 * Receives auth data from parent window (nextjs) in development environment
 * This enables authentication to work across different ports on localhost
 */
(function() {
  // Only set up listener if we're in an iframe
  if (window.self === window.top) {
    return;
  }


  // Listen for auth data from parent
  window.addEventListener('message', function(event) {
    // In production, validate event.origin
    // For development, we accept from any localhost origin
    const isLocalhost = event.origin.includes('localhost') || event.origin.includes('127.0.0.1');
    const isVaoLuoi = event.origin.includes('vaoluoitv.com');
    const isLuck8Event = event.origin.includes('luck8event.com');
    
    if (!isLocalhost && !isVaoLuoi && !isLuck8Event) {
      console.warn('[PostMessage Auth] Rejected message from unknown origin:', event.origin);
      return;
    }

    const data = event.data;
    
    // Handle both AUTH_DATA and AUTH_TOKEN message types
    if (data && (data.type === 'AUTH_DATA' || data.type === 'AUTH_TOKEN')) {
      console.log('[PostMessage Auth] Received auth message:', data.type);
      
      // Store auth data in cookies (works for same-port pages)
      if (data.token && window.CookieUtils) {
        window.CookieUtils.setAuthToken(data.token);
      }
      
      if (data.user && window.CookieUtils) {
        window.CookieUtils.setUserData(data.user);
      }
      
      // Also store in window for immediate access
      window.__AUTH_DATA__ = {
        token: data.token,
        user: data.user,
        apiUrl: data.apiUrl
      };
      
      // Update config if provided
      if (data.apiUrl && window.MINIGAMES_CONFIG) {
        window.MINIGAMES_CONFIG.API_BASE_URL = data.apiUrl;
      }
      
      // Send acknowledgment back to parent window
      if (event.source && event.source !== window) {
        try {
          event.source.postMessage({
            type: 'AUTH_RECEIVED',
            success: true,
            message: 'Authentication data received successfully'
          }, event.origin);
          console.log('[PostMessage Auth] Sent acknowledgment to parent');
        } catch (error) {
          console.error('[PostMessage Auth] Failed to send acknowledgment:', error);
        }
      }
      
      // Trigger custom event for components that need to react to auth changes
      window.dispatchEvent(new CustomEvent('authDataReceived', { 
        detail: { token: data.token, user: data.user } 
      }));
      
    } else if (data && data.type === 'REQUEST_AUTH_DATA') {
      // Handle request for auth data (from parent window)
      console.log('[PostMessage Auth] Parent requested auth data');
      
      // Send current auth data if available
      if (window.CookieUtils) {
        const token = window.CookieUtils.getAuthToken();
        const user = window.CookieUtils.getUserData();
        
        if (token && user) {
          event.source.postMessage({
            type: 'AUTH_DATA',
            token: token,
            user: user,
            source: 'vaoluoitv'
          }, event.origin);
        }
      }
    }
  });

  // Request auth data from parent immediately if available
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'REQUEST_AUTH_DATA' }, '*');
  }
})();

