/**
 * Client-side message sanitization utilities
 * This provides an additional layer of security on the frontend
 */

export interface SanitizationResult {
  sanitizedMessage: string;
  isSuspicious: boolean;
  suspiciousPatterns: string[];
}

// Dangerous patterns to detect
const SUSPICIOUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /eval\s*\(/gi,
  /decodeURIComponent/gi,
  /atob\s*\(/gi,
  /btoa\s*\(/gi,
  /document\./gi,
  /window\./gi,
  /location\./gi,
  /alert\s*\(/gi,
  /confirm\s*\(/gi,
  /prompt\s*\(/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi,
  /<style/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
  /@import/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /mocha:/gi,
  /livescript:/gi,
];

// Maximum message length
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Sanitize message content on client-side
 */
export function sanitizeMessage(message: string): SanitizationResult {
  const suspiciousPatterns: string[] = [];
  
  // Check message length
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      sanitizedMessage: message.substring(0, MAX_MESSAGE_LENGTH),
      isSuspicious: true,
      suspiciousPatterns: ['MESSAGE_TOO_LONG'],
    };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(message)) {
      suspiciousPatterns.push(pattern.source);
    }
  }

  // Check for excessive special characters
  const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]{6,}/g;
  if (specialCharPattern.test(message)) {
    suspiciousPatterns.push('EXCESSIVE_SPECIAL_CHARS');
  }

  // Sanitize HTML content
  const sanitizedMessage = message
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
    .trim();

  const isSuspicious = suspiciousPatterns.length > 0;

  return {
    sanitizedMessage,
    isSuspicious,
    suspiciousPatterns,
  };
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username: string): string {
  // Remove HTML tags
  let sanitized = username.replace(/<[^>]*>/g, '');
  
  // Remove special characters except basic ones
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 50);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Default if empty
  if (!sanitized) {
    sanitized = 'Anonymous';
  }
  
  return sanitized;
}

/**
 * Check if message is safe to send
 */
export function isMessageSafe(message: string): boolean {
  const result = sanitizeMessage(message);
  return !result.isSuspicious && result.sanitizedMessage === message;
}

/**
 * Immediate XSS mitigation - convert all messages to text
 */
export function mitigateXSS(): void {
  const chatMessages = document.querySelectorAll('.chat-message');
  chatMessages.forEach((element) => {
    const textContent = element.textContent || '';
    element.textContent = textContent;
  });
}

/**
 * Remove suspicious messages from DOM
 */
export function removeSuspiciousMessages(): void {
  const chatMessages = document.querySelectorAll('.chat-message');
  chatMessages.forEach((element) => {
    const textContent = element.textContent || '';
    if (/eval\s*\(|decodeURIComponent|atob|<script/i.test(textContent)) {
      element.remove();
    }
  });
}

/**
 * Validate message before sending
 */
export function validateMessage(message: string): {
  isValid: boolean;
  sanitizedMessage?: string;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`,
    };
  }

  const sanitizationResult = sanitizeMessage(message);
  
  if (sanitizationResult.isSuspicious) {
    return {
      isValid: false,
      error: 'Message contains suspicious content',
    };
  }

  return {
    isValid: true,
    sanitizedMessage: sanitizationResult.sanitizedMessage,
  };
}
