/**
 * Security utilities for client-side protection
 */

/**
 * Generate CSP nonce for inline scripts
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSP nonce on script elements
 */
export function setCSPNonce(nonce: string): void {
  const scripts = document.querySelectorAll('script[nonce]');
  scripts.forEach(script => {
    script.setAttribute('nonce', nonce);
  });
}

/**
 * Validate and sanitize user input
 */
export function validateInput(input: string, type: 'message' | 'username' | 'email'): {
  isValid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      error: 'Input cannot be empty',
    };
  }

  let sanitized = input.trim();

  switch (type) {
    case 'message':
      if (sanitized.length > 1000) {
        return {
          isValid: false,
          error: 'Message too long (max 1000 characters)',
        };
      }
      // Remove HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      break;

    case 'username':
      if (sanitized.length > 50) {
        return {
          isValid: false,
          error: 'Username too long (max 50 characters)',
        };
      }
      // Only allow alphanumeric, spaces, hyphens, underscores, and dots
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
        return {
          isValid: false,
          error: 'Invalid email format',
        };
      }
      break;
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Check for suspicious patterns in text
 */
export function detectSuspiciousPatterns(text: string): string[] {
  const patterns = [
    { name: 'Script Tag', regex: /<script[^>]*>.*?<\/script>/gi },
    { name: 'JavaScript URL', regex: /javascript:/gi },
    { name: 'Event Handler', regex: /on\w+\s*=/gi },
    { name: 'Eval Function', regex: /eval\s*\(/gi },
    { name: 'Document Access', regex: /document\./gi },
    { name: 'Window Access', regex: /window\./gi },
    { name: 'Location Access', regex: /location\./gi },
    { name: 'Alert Function', regex: /alert\s*\(/gi },
    { name: 'Iframe Tag', regex: /<iframe/gi },
    { name: 'Object Tag', regex: /<object/gi },
    { name: 'Embed Tag', regex: /<embed/gi },
    { name: 'Style Tag', regex: /<style/gi },
    { name: 'CSS Expression', regex: /expression\s*\(/gi },
    { name: 'Data URL', regex: /data:text\/html/gi },
  ];

  const detected: string[] = [];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      detected.push(pattern.name);
    }
  }

  return detected;
}

/**
 * Rate limiting on client side (basic implementation)
 */
class ClientRateLimit {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if we can make a new request
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    return this.requests[0] + this.windowMs;
  }
}

// Global rate limiter for chat messages
export const chatRateLimit = new ClientRateLimit(30, 60000); // 30 messages per minute

/**
 * Secure cookie utilities
 */
export function setSecureCookie(name: string, value: string, options: {
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
} = {}): void {
  const {
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    secure = true,
    sameSite = 'strict',
    httpOnly = true,
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  if (maxAge) {
    cookieString += `; Max-Age=${Math.floor(maxAge / 1000)}`;
  }
  
  if (secure && location.protocol === 'https:') {
    cookieString += '; Secure';
  }
  
  cookieString += `; SameSite=${sameSite}`;
  
  if (httpOnly) {
    // Note: httpOnly cookies can only be set by the server
    console.warn('httpOnly cookies must be set by the server');
  }
  
  document.cookie = cookieString;
}

/**
 * Get secure cookie value
 */
export function getSecureCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  
  return null;
}

/**
 * Remove secure cookie
 */
export function removeSecureCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=strict`;
}

/**
 * Content Security Policy utilities
 */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'nonce-{NONCE}'", "'unsafe-eval'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://static.cloudflareinsights.com", "https://www.google.com", "https://www.gstatic.com"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', "https://cdn.vaoluoitv.com"],
  'connect-src': [
    "'self'", 
    'wss:', 
    'ws:', 
    'https:',
    'http://localhost:3000',
    'https://cdn.vaoluoitv.com',
    'http://localhost:3005',
    'https://cloudflareinsights.com',
    'https://www.google.com'
  ],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'object-src': ["'none'"],
  'media-src': ["'self'", "https://cdn.vaoluoitv.com"],
  'frame-src': ["'self'", "http://localhost:3005", "http://localhost:*", "https://*.vaoluoitv.com", "https://www.google.com"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate CSP header value
 */
export function generateCSPHeader(nonce?: string): string {
  const policy = { ...CSP_POLICY };
  
  if (nonce) {
    policy['script-src'] = policy['script-src'].map(src => 
      src.replace('{NONCE}', nonce)
    );
  }
  
  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}
