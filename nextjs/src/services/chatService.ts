import { io, Socket } from 'socket.io-client';
import { authService } from './authService';
import { getCookie } from '@/utils/cookies';
import { ChatMessage, ChatEvent, JoinRoomData, SendMessageData } from '@/types/chat';

class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private getWsUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
    
    // In production, ensure WSS is used
    if (process.env.NODE_ENV === 'production' && baseUrl.startsWith('http://')) {
      return baseUrl.replace('http://', 'wss://');
    }
    
    // In development, use WS
    if (process.env.NODE_ENV === 'development' && baseUrl.startsWith('https://')) {
      return baseUrl.replace('https://', 'ws://');
    }
    
    return baseUrl;
  }

  private getUserFromCookie() {
    try {
      const userCookie = getCookie('user');
      if (userCookie) {
        return JSON.parse(decodeURIComponent(userCookie));
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
    return null;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWsUrl();
        const user = this.getUserFromCookie();
        const token = authService.getToken();

        // Check if running locally - don't attempt WebSocket connection for local dev
        if (process.env.NODE_ENV === 'development' && wsUrl.includes('localhost')) {
          console.warn('WebSocket disabled for local development - falling back to API-only mode');
          reject(new Error('WebSocket disabled in development'));
          return;
        }

        this.socket = io(`${wsUrl}/api/v1/chat`, {
          auth: {
            userId: user?.id || 'anonymous',
            userRole: user?.role || 'user',
            token: token || null,
          },
          transports: ['websocket', 'polling'],
          timeout: 5000, // Shorter timeout for faster fallback
          reconnection: false, // Disable auto-reconnect to fail fast
          secure: process.env.NODE_ENV === 'production', // Use secure connection in production
          rejectUnauthorized: process.env.NODE_ENV === 'production', // Validate SSL in production
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          // Suppress common connection errors in development
          if (process.env.NODE_ENV !== 'development') {
            console.error('WebSocket connection error:', error);
          }
          this.isConnected = false;
          reject(new Error('WebSocket connection failed'));
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          
          // Auto-reconnect for certain disconnect reasons
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, don't auto-reconnect
            return;
          }
          
          this.attemptReconnect();
        });

        // Handle reconnection
        this.socket.on('reconnect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          // Suppress common reconnection errors
          const errorMessage = error?.message || '';
          if (!errorMessage.includes('Invalid namespace')) {
            console.error('Reconnection error:', error);
          }
        });

        this.socket.on('reconnect_failed', () => {
          // Suppress reconnection failed messages
          this.isConnected = false;
        });

        // Note: Rate limit and message blocked events are handled by onRateLimitExceeded() and onMessageBlocked() methods
        // Don't add listeners here to avoid conflicts

      } catch (error) {
        console.error('Error connecting to chat server:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      
      setTimeout(() => {
        if (this.socket && !this.isConnected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(data: JoinRoomData): Promise<{ success: boolean; message?: string; banned?: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('join_room', data, (response: { success: boolean; message?: string; banned?: boolean }) => {
        if (response.success) {
          resolve(response);
        } else {
          // If user is banned, resolve with banned flag instead of rejecting
          if (response.banned) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Failed to join room'));
          }
        }
      });
    });
  }

  leaveRoom(matchId: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('leave_room', { matchId }, (response: { success: boolean; message?: string }) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message || 'Failed to leave room'));
        }
      });
    });
  }

  sendMessage(data: SendMessageData): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('send_message', data, (response: { success: boolean; message?: string }) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message || 'Failed to send message'));
        }
      });
    });
  }

  onChatEvent(callback: (event: ChatEvent) => void): void {
    if (this.socket) {
      this.socket.on('chat_event', callback);
    }
  }

  onRateLimitExceeded(callback: (data: { type: string; retryAfter?: number }) => void): void {
    if (this.socket) {
      // Remove existing listener to avoid duplicates
      this.socket.off('rate_limit_exceeded');
      this.socket.on('rate_limit_exceeded', (data) => {
        callback(data);
      });
    }
  }

  onMessageBlocked(callback: (data: { type: string; retryAfter?: number }) => void): void {
    if (this.socket) {
      this.socket.on('message_blocked', callback);
    }
  }

  onError(callback: (error: { type: string; retryAfter?: number }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  onMuteEvent(callback: (data: { type: string; reason?: string; expiresAt?: string }) => void): void {
    if (this.socket) {
      this.socket.on('user_muted', (data) => {
        callback(data);
      });
      this.socket.on('user_unmuted', (data) => {
        callback(data);
      });
      this.socket.on('user_banned', (data) => {
        callback(data);
      });
      this.socket.on('user_unbanned', (data) => {
        callback(data);
      });
    }
  }

  onKickEvent(callback: (data: { type: string; reason?: string; expiresAt?: string; adminId?: string; timestamp?: string }) => void): void {
    if (this.socket) {
      this.socket.on('user_kicked', (data) => {
        callback(data);
      });
    }
  }

  offChatEvent(callback?: (event: ChatEvent) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('chat_event', callback);
      } else {
        this.socket.removeAllListeners('chat_event');
      }
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  async loadMessages(matchId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      
      // Use a very quick timeout for API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${apiUrl}/chat/messages/${matchId}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const messages = await response.json();
      
      // Convert backend message format to frontend format
      return messages.map((msg: Record<string, unknown>) => ({
        id: msg._id || msg.id,
        userId: msg.userId,
        username: msg.username || 'Anonymous',
        display_name: msg.display_name,
        message: msg.message,
        avatar: msg.avatar,
        userType: msg.userType,
        isModerated: msg.isModerated || false,
        isDeleted: msg.isDeleted || false,
        timestamp: msg.timestamp,
        type: 'message' as const,
      }));
    } catch (error) {
      // Silent error handling - don't break UI
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load messages (non-critical):', error);
      }
      // Return empty array instead of throwing to allow chat to work without messages
      return [];
    }
  }

  async moderateMessage(messageId: string, action: 'approve' | 'reject' | 'delete', reason?: string): Promise<void> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/messages/${messageId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to moderate message: ${response.status}`);
      }
    } catch (error) {
      console.error('Error moderating message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string, reason?: string): Promise<void> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete message: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Admin User Management Methods
  async banUser(userId: string, matchId: string, username?: string, reason?: string, duration?: number): Promise<{ success: boolean; message: string }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, matchId, username, reason, duration }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ban user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  async unbanUser(userId: string, matchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, matchId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to unban user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  async muteUser(userId: string, matchId: string, username?: string, reason?: string, duration?: number): Promise<{ success: boolean; message: string }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, matchId, username, reason, duration }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to mute user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error muting user:', error);
      throw error;
    }
  }

  async unmuteUser(userId: string, matchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/unmute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, matchId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to unmute user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error unmuting user:', error);
      throw error;
    }
  }

  async kickUser(userId: string, matchId: string, username?: string, reason?: string, duration?: number): Promise<{ success: boolean; message: string }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/kick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, matchId, username, reason, duration }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to kick user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error kicking user:', error);
      throw error;
    }
  }

  async getBannedUsers(matchId: string): Promise<{ userId: string; username?: string; reason: string; bannedBy: string; timestamp: string; expiresAt?: string }[]> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/banned-users/${matchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get banned users: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting banned users:', error);
      throw error;
    }
  }

  async getMutedUsers(matchId: string): Promise<{ userId: string; username?: string; reason: string; mutedBy: string; timestamp: string; expiresAt?: string }[]> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/muted-users/${matchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get muted users: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting muted users:', error);
      throw error;
    }
  }

  async getKickedUsers(matchId: string): Promise<{ userId: string; reason: string; adminId: string; timestamp: string; duration?: number; expiresAt?: string }[]> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/kicked-users/${matchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get kicked users: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting kicked users:', error);
      throw error;
    }
  }

  async unkickUser(userId: string, matchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/chat/admin/unkick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, matchId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to unkick user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error unkicking user:', error);
      throw error;
    }
  }

  // Get current user's mute/ban/kick status
  async getUserStatus(matchId: string, displayName?: string): Promise<{
    isMuted: boolean;
    isBanned: boolean;
    isKicked: boolean;
    muteInfo: {
      reason: string;
      expiresAt: string | null;
      remainingTime: number;
    };
    banInfo: {
      reason: string;
      expiresAt: string | null;
      remainingTime: number;
    };
    kickInfo: {
      reason: string;
      expiresAt: string | null;
      remainingTime: number;
      adminId: string;
      timestamp: string;
    };
  }> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const token = authService.getToken();
      
      // For anonymous users, we'll use a different endpoint or pass display name
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = displayName 
        ? `${apiUrl}/chat/user-status/${matchId}?displayName=${encodeURIComponent(displayName)}`
        : `${apiUrl}/chat/user-status/${matchId}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get user status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user status:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
