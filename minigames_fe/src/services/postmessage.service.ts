/**
 * PostMessage Service for Authentication
 * 
 * Handles PostMessage communication with parent sites to receive authentication tokens
 * Supports two parent sites:
 * - Site A (vaoluoitv.com): Token from cookie
 * - Site B (luck8event.com): Token from localStorage
 */

// Types for PostMessage communication
export interface PostMessageAuthData {
  type: 'AUTH_TOKEN';
  source: 'luck8event';
  token: string;
  userData: {
    id: string;
    username: string;
    email: string;
    role: string;
    points: number;
  };
}

export interface PostMessageResponse {
  type: 'AUTH_RECEIVED' | 'AUTH_ERROR';
  success: boolean;
  message?: string;
}

export interface PostMessageServiceConfig {
  allowedOrigins: string[];
  timeout: number; // milliseconds
}

class PostMessageService {
  private config: PostMessageServiceConfig;
  private messageHandler: ((data: PostMessageAuthData) => void) | null = null;
  private isListening: boolean = false;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor() {
    // Get allowed origins from environment or use defaults
    const allowedOriginsEnv = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
    const defaultOrigins = [
      'https://luck8event.com',
      'https://games.luck8event.com',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    this.config = {
      allowedOrigins: allowedOriginsEnv 
        ? allowedOriginsEnv.split(',').map(origin => origin.trim())
        : defaultOrigins,
      timeout: 0 // No timeout - wait indefinitely
    };
  }

  /**
   * Start listening for PostMessage events
   */
  startListening(onMessage: (data: PostMessageAuthData) => void): void {
    if (this.isListening) {
      console.warn('PostMessage service is already listening');
      return;
    }

    this.messageHandler = onMessage;
    this.isListening = true;

    // Add event listener
    window.addEventListener('message', this.handleMessage.bind(this));

    // No timeout - wait indefinitely for PostMessage
    // Only set timeout if explicitly configured
    if (this.config.timeout > 0) {
      this.timeoutId = setTimeout(() => {
        this.stopListening();
        console.warn('PostMessage timeout: No authentication message received');
      }, this.config.timeout);
    }

  }

  /**
   * Stop listening for PostMessage events
   */
  stopListening(): void {
    if (!this.isListening) return;

    window.removeEventListener('message', this.handleMessage.bind(this));
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isListening = false;
    this.messageHandler = null;

  }

  /**
   * Handle incoming PostMessage
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // Validate origin
      if (!this.isValidOrigin(event.origin)) {
        console.warn(`PostMessage from invalid origin: ${event.origin}`);
        return;
      }

      // Parse message data
      const data = event.data as PostMessageAuthData;
      
      if (!this.isValidAuthMessage(data)) {
        console.warn('Invalid authentication message format:', data);
        return;
      }

      // Validate JWT token format (basic check)
      if (!this.isValidJWTFormat(data.token)) {
        console.warn('Invalid JWT token format');
        return;
      }

      // Send acknowledgment back to parent
      this.sendAcknowledgment(event.source as Window, true);

      // Process the authentication data
      if (this.messageHandler) {
        this.messageHandler(data);
      }

      // Stop listening after successful authentication
      this.stopListening();

    } catch (error) {
      console.error('Error handling PostMessage:', error);
      this.sendAcknowledgment(event.source as Window, false, 'Error processing authentication message');
    }
  }

  /**
   * Validate message origin against whitelist
   */
  private isValidOrigin(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Validate authentication message format
   */
  private isValidAuthMessage(data: unknown): data is PostMessageAuthData {
    if (!data || typeof data !== 'object') return false;
    
    const message = data as Record<string, unknown>;
    
    // Check required fields
    if (message.type !== 'AUTH_TOKEN') return false;
    if (message.source !== 'luck8event') return false;
    if (typeof message.token !== 'string' || !message.token) return false;

    // Validate luck8event userData
    const userData = message.userData as Record<string, unknown>;
    return userData && 
           typeof userData.id === 'string' && 
           typeof userData.email === 'string' &&
           typeof userData.username === 'string' &&
           typeof userData.role === 'string' &&
           typeof userData.points === 'number';
  }

  /**
   * Basic JWT token format validation
   */
  private isValidJWTFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if each part is base64 encoded
    try {
      parts.forEach(part => {
        if (!part) throw new Error('Empty part');
        // Basic base64 check
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send acknowledgment back to parent window
   */
  private sendAcknowledgment(targetWindow: Window, success: boolean, message?: string): void {
    try {
      const response: PostMessageResponse = {
        type: success ? 'AUTH_RECEIVED' : 'AUTH_ERROR',
        success,
        message
      };

      targetWindow.postMessage(response, '*');
    } catch (error) {
      console.error('Error sending acknowledgment:', error);
    }
  }

  /**
   * Get current listening status
   */
  getListeningStatus(): boolean {
    return this.isListening;
  }

  /**
   * Get allowed origins for debugging
   */
  getAllowedOrigins(): string[] {
    return [...this.config.allowedOrigins];
  }
}

// Export singleton instance
export const postMessageService = new PostMessageService();
