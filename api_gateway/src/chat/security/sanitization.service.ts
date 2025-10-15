import { Injectable, Logger } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';

export interface SanitizationResult {
  sanitizedMessage: string;
  isSuspicious: boolean;
  suspiciousPatterns: string[];
  originalLength: number;
  sanitizedLength: number;
}

@Injectable()
export class SanitizationService {
  private readonly logger = new Logger(SanitizationService.name);

  // Dangerous patterns to detect
  private readonly suspiciousPatterns = [
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
  private readonly maxMessageLength = 1000;

  // Maximum consecutive special characters
  private readonly maxConsecutiveSpecialChars = 5;

  /**
   * Sanitize message content with comprehensive security checks
   */
  sanitizeMessage(message: string): SanitizationResult {
    const originalLength = message.length;
    const suspiciousPatterns: string[] = [];

    // Check message length
    if (originalLength > this.maxMessageLength) {
      this.logger.warn(`Message too long: ${originalLength} characters`);
      return {
        sanitizedMessage: message.substring(0, this.maxMessageLength),
        isSuspicious: true,
        suspiciousPatterns: ['MESSAGE_TOO_LONG'],
        originalLength,
        sanitizedLength: this.maxMessageLength,
      };
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(message)) {
        suspiciousPatterns.push(pattern.source);
        this.logger.warn(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check for excessive special characters
    const specialCharPattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]{6,}/g;
    if (specialCharPattern.test(message)) {
      suspiciousPatterns.push('EXCESSIVE_SPECIAL_CHARS');
    }

    // Check for potential SQL injection patterns
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+set/gi,
      /or\s+1\s*=\s*1/gi,
      /'\s*or\s*'/gi,
      /"\s*or\s*"/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(message)) {
        suspiciousPatterns.push('SQL_INJECTION_PATTERN');
      }
    }

    // Sanitize HTML content
    let sanitizedMessage = DOMPurify.sanitize(message, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    });

    // Remove any remaining HTML tags
    sanitizedMessage = sanitizedMessage.replace(/<[^>]*>/g, '');

    // Escape remaining special characters
    sanitizedMessage = this.escapeHtml(sanitizedMessage);

    // Trim whitespace
    sanitizedMessage = sanitizedMessage.trim();

    const isSuspicious = suspiciousPatterns.length > 0;

    if (isSuspicious) {
      this.logger.warn(
        `Suspicious message detected: ${suspiciousPatterns.join(', ')}`,
      );
    }

    return {
      sanitizedMessage,
      isSuspicious,
      suspiciousPatterns,
      originalLength,
      sanitizedLength: sanitizedMessage.length,
    };
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (s) => map[s]);
  }

  /**
   * Validate username for security
   */
  sanitizeUsername(username: string): string {
    // Remove HTML tags
    let sanitized = username.replace(/<[^>]*>/g, '');

    // Remove special characters except basic ones
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

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
   * Check if message contains only safe content
   */
  isMessageSafe(message: string): boolean {
    const result = this.sanitizeMessage(message);
    return !result.isSuspicious && result.sanitizedMessage === message;
  }
}
