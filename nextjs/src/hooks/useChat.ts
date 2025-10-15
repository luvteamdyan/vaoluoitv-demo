import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';
import { ChatMessage, ChatEvent, SendMessageData } from '@/types/chat';
import { getCookie } from '@/utils/cookies';

interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, display_name?: string) => Promise<void>;
  clearError: () => void;
  connectedUsers: number;
  reloadMessages: () => Promise<void>;
  rateLimitInfo: {
    isRateLimited: boolean;
    retryAfter: number | null;
    remainingTime: number;
  };
  muteInfo: {
    isMuted: boolean;
    reason: string;
    expiresAt: string | null;
    remainingTime: number;
  };
  banInfo: {
    isBanned: boolean;
    reason: string;
    expiresAt: string | null;
    remainingTime: number;
  };
  kickInfo: {
    isKicked: boolean;
    reason: string;
    expiresAt: string | null;
    remainingTime: number;
    adminId: string;
    timestamp: string;
  };
  setMuteInfo: (info: {
    isMuted: boolean;
    reason: string;
    expiresAt: string | null;
    remainingTime: number;
  }) => void;
  setBanInfo: (info: {
    isBanned: boolean;
    reason: string;
    expiresAt: string | null;
    remainingTime: number;
  }) => void;
  setKickInfo: (info: {
    isKicked: boolean;
    reason: string;
    expiresAt: string | null;
    remainingTime: number;
    adminId: string;
    timestamp: string;
  }) => void;
  setRateLimitInfo: (info: {
    isRateLimited: boolean;
    retryAfter: number | null;
    remainingTime: number;
  }) => void;
  startCountdown: (retryAfter: number) => void;
  startKickCountdown: (expiresAt: string, reason: string, adminId: string, timestamp: string) => void;
}

export function useChat(matchId: string): UseChatReturn {
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers] = useState(0);
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isRateLimited: false,
    retryAfter: null as number | null,
    remainingTime: 0,
  });


  const [muteInfo, setMuteInfo] = useState({
    isMuted: false,
    reason: '',
    expiresAt: null as string | null,
    remainingTime: 0,
  });

  const [banInfo, setBanInfo] = useState({
    isBanned: false,
    reason: '',
    expiresAt: null as string | null,
    remainingTime: 0,
  });

  const [kickInfo, setKickInfo] = useState({
    isKicked: false,
    reason: '',
    expiresAt: null as string | null,
    remainingTime: 0,
    adminId: '',
    timestamp: '',
  });

  
  const chatEventCallbackRef = useRef<((event: ChatEvent) => void) | null>(null);
  const hasJoinedRoom = useRef(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getUserFromCookie = useCallback(() => {
    try {
      const userCookie = getCookie('user');
      if (userCookie) {
        return JSON.parse(decodeURIComponent(userCookie));
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
    return null;
  }, []);

  // Handle rate limit countdown
  const startCountdown = useCallback((retryAfter: number) => {
    // Check if retryAfter is a valid timestamp (not too far in the future)
    const currentTime = Date.now();
    const maxFutureTime = currentTime + (24 * 60 * 60 * 1000); // 24 hours from now
    
    if (retryAfter > maxFutureTime) {
      console.warn('Invalid retryAfter timestamp, using fallback of 60 seconds');
      retryAfter = currentTime + (60 * 1000); // 60 seconds from now
    }
    
    const remainingTime = Math.ceil((retryAfter - Date.now()) / 1000);
    
    setRateLimitInfo({
      isRateLimited: true,
      retryAfter,
      remainingTime,
    });


    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.ceil((retryAfter - Date.now()) / 1000);

      if (remaining <= 0) {
        setRateLimitInfo({
          isRateLimited: false,
          retryAfter: null,
          remainingTime: 0,
        });
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      } else {
        setRateLimitInfo(prev => ({
          ...prev,
          remainingTime: remaining,
        }));
      }
    }, 1000);
  }, []);

  // Handle mute countdown
  const startMuteCountdown = useCallback((expiresAt: string, reason: string) => {
    const remainingTime = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);
    
    setMuteInfo({
      isMuted: true,
      reason,
      expiresAt,
      remainingTime,
    });
    

    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);

      if (remaining <= 0) {
        setMuteInfo({
          isMuted: false,
          reason: '',
          expiresAt: null,
          remainingTime: 0,
        });
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      } else {
        setMuteInfo(prev => ({
          ...prev,
          remainingTime: remaining,
        }));
      }
    }, 1000);
  }, []);

  // Handle ban countdown
  const startBanCountdown = useCallback((expiresAt: string, reason: string) => {
    setBanInfo({
      isBanned: true,
      reason,
      expiresAt,
      remainingTime: Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
    });

    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);

      if (remaining <= 0) {
        setBanInfo({
          isBanned: false,
          reason: '',
          expiresAt: null,
          remainingTime: 0,
        });
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      } else {
        setBanInfo(prev => ({
          ...prev,
          remainingTime: remaining,
        }));
      }
    }, 1000);
  }, []);

  // Handle kick countdown
  const startKickCountdown = useCallback((expiresAt: string, reason: string, adminId: string, timestamp: string) => {
    setKickInfo({
      isKicked: true,
      reason,
      expiresAt,
      remainingTime: Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
      adminId,
      timestamp,
    });

    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);

      if (remaining <= 0) {
        setKickInfo({
          isKicked: false,
          reason: '',
          expiresAt: null,
          remainingTime: 0,
          adminId: '',
          timestamp: '',
        });
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      } else {
        setKickInfo(prev => ({
          ...prev,
          remainingTime: remaining,
        }));
      }
    }, 1000);
  }, []);

  // Handle rate limit events
  const handleRateLimitEvent = useCallback((data: { type: string; retryAfter?: number }) => {
    // Handle different types of rate limit events
    if (data.type === 'RATE_LIMIT_EXCEEDED' && data.retryAfter) {
      startCountdown(data.retryAfter);
    } else if (data.retryAfter) {
      startCountdown(data.retryAfter);
    } else if (data.type === 'MESSAGE_BLOCKED') {
      // For blocked messages, we might want to show a different message
      console.warn('Message blocked:', data);
    } else {
      console.warn('Unknown rate limit event:', data);
    }
  }, [startCountdown]);

  // Handle mute and ban events
  const handleMuteEvent = useCallback((data: { type: string; reason?: string; expiresAt?: string }) => {

    if (data.type === 'USER_MUTED') {
      // User was muted
      if (data.expiresAt) {
        startMuteCountdown(data.expiresAt, data.reason || 'No reason provided');
      } else {
        // Permanent mute
        setMuteInfo({
          isMuted: true,
          reason: data.reason || 'No reason provided',
          expiresAt: null,
          remainingTime: 0,
        });
      }
    } else if (data.type === 'USER_UNMUTED') {
      // User was unmuted
      setMuteInfo({
        isMuted: false,
        reason: '',
        expiresAt: null,
        remainingTime: 0,
      });
    } else if (data.type === 'USER_BANNED') {
      // User was banned
      if (data.expiresAt) {
        startBanCountdown(data.expiresAt, data.reason || 'No reason provided');
      } else {
        // Permanent ban
        setBanInfo({
          isBanned: true,
          reason: data.reason || 'No reason provided',
          expiresAt: null,
          remainingTime: 0,
        });
      }
    } else if (data.type === 'USER_UNBANNED') {
      // User was unbanned
      setBanInfo({
        isBanned: false,
        reason: '',
        expiresAt: null,
        remainingTime: 0,
      });
    }
  }, [startMuteCountdown, startBanCountdown]);

  const disconnectFromChat = useCallback(async () => {
    try {
      if (hasJoinedRoom.current) {
        await chatService.leaveRoom(matchId);
        hasJoinedRoom.current = false;
      }
      
      if (chatEventCallbackRef.current) {
        chatService.offChatEvent(chatEventCallbackRef.current);
        chatEventCallbackRef.current = null;
      }
      
      chatService.disconnect();
      setIsConnected(false);
      setMessages([]);
      
      // Clear countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
    } catch (err) {
      console.error('Error disconnecting from chat:', err);
    }
  }, [matchId]);

  // Handle kick events
  const handleKickEvent = useCallback((data: { type: string; reason?: string; expiresAt?: string; adminId?: string; timestamp?: string }) => {
    if (data.type === 'USER_KICKED') {
      // User was kicked
      setKickInfo({
        isKicked: true,
        reason: data.reason || 'No reason provided',
        expiresAt: data.expiresAt || null,
        remainingTime: data.expiresAt ? Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 1000) : 0,
        adminId: data.adminId || '',
        timestamp: data.timestamp || '',
      });
      
      // Start countdown if there's an expiration time
      if (data.expiresAt) {
        startKickCountdown(
          data.expiresAt,
          data.reason || 'No reason provided',
          data.adminId || '',
          data.timestamp || ''
        );
      }
      
      // Disconnect from chat
      disconnectFromChat();
    }
  }, [disconnectFromChat, startKickCountdown]);

  const handleChatEvent = useCallback((event: ChatEvent) => {
    switch (event.type) {
      case 'message':
        if (event.message && event.messageId) {
          const newMessage: ChatMessage = {
            id: event.messageId,
            userId: event.userId,
            username: event.username,
            display_name: event.display_name,
            message: event.message,
            avatar: event.avatar,
            userType: event.userType,
            timestamp: event.timestamp,
            type: 'message',
          };
          
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => msg.id === event.messageId);
            if (messageExists) {
              return prev;
            }
            
            // Add new message and sort by timestamp
            const updatedMessages = [...prev, newMessage];
            return updatedMessages.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
        }
        break;
        
      case 'user_joined':
        // You can add logic here to show user joined notifications
        break;
        
      case 'user_left':
        // You can add logic here to show user left notifications
        break;
        
      case 'message_deleted':
        if (event.messageId) {
          setMessages(prev => prev.filter(msg => msg.id !== event.messageId));
        }
        break;
        
      case 'USER_KICKED':
        // User was kicked
        break;
        
      case 'USER_UNKICKED':
        // User was unkicked
        break;
        
      case 'message_moderated':
        if (event.messageId) {
          setMessages(prev => prev.map(msg => 
            msg.id === event.messageId 
              ? { ...msg, isModerated: true }
              : msg
          ));
        }
        break;
    }
  }, []);

  const connectToChat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check user status (mute/ban) first
      try {
        const user = getUserFromCookie();
        const token = authService.getToken();
        const isAnonymous = !user || !token;
        const userStatus = await chatService.getUserStatus(matchId, isAnonymous ? 'Anonymous' : undefined);
        
        // Set mute info
        if (userStatus.isMuted) {
          setMuteInfo({
            isMuted: true,
            reason: userStatus.muteInfo.reason,
            expiresAt: userStatus.muteInfo.expiresAt,
            remainingTime: userStatus.muteInfo.remainingTime,
          });
          
          // Start countdown if there's an expiration time
          if (userStatus.muteInfo.expiresAt) {
            startMuteCountdown(userStatus.muteInfo.expiresAt, userStatus.muteInfo.reason);
          }
        }
        
        // Set ban info
        if (userStatus.isBanned) {
          setBanInfo({
            isBanned: true,
            reason: userStatus.banInfo.reason,
            expiresAt: userStatus.banInfo.expiresAt,
            remainingTime: userStatus.banInfo.remainingTime,
          });
          
          // Start countdown if there's an expiration time
          if (userStatus.banInfo.expiresAt) {
            startBanCountdown(userStatus.banInfo.expiresAt, userStatus.banInfo.reason);
          }
        }
        
        // Set kick info
        if (userStatus.isKicked) {
          setKickInfo({
            isKicked: true,
            reason: userStatus.kickInfo.reason,
            expiresAt: userStatus.kickInfo.expiresAt,
            remainingTime: userStatus.kickInfo.remainingTime,
            adminId: userStatus.kickInfo.adminId,
            timestamp: userStatus.kickInfo.timestamp,
          });
          
          // Start countdown if there's an expiration time
          if (userStatus.kickInfo.expiresAt) {
            startKickCountdown(
              userStatus.kickInfo.expiresAt, 
              userStatus.kickInfo.reason,
              userStatus.kickInfo.adminId,
              userStatus.kickInfo.timestamp
            );
          }
          
          // Don't connect to chat if kicked
          setIsLoading(false);
          return;
        }
      } catch (statusError) {
        console.warn('Failed to get user status:', statusError);
        // Continue with chat initialization even if status check fails
      }
      
      // Load previous messages first (isolated from WebSocket) - API works independently
      try {
        const previousMessages = await chatService.loadMessages(matchId, 50);
        
        // Sort messages by timestamp
        const sortedMessages = previousMessages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(sortedMessages);
      } catch (loadError) {
        console.warn('Failed to load previous messages:', loadError);
        // Continue operation even if loading messages fails - API error doesn't break interface
        setMessages([]);
      }
      
      // Try WebSocket connection with error isolation
      try {
        await chatService.connect();
        setIsConnected(true);
        
        // Set up event listener
        chatEventCallbackRef.current = handleChatEvent;
        chatService.onChatEvent(handleChatEvent);
        
        // Set up rate limit event listeners
        chatService.onRateLimitExceeded(handleRateLimitEvent);
        chatService.onMessageBlocked(handleRateLimitEvent);
        chatService.onError(handleRateLimitEvent);

        // Set up mute event listeners
        chatService.onMuteEvent(handleMuteEvent);
        
        // Set up kick event listeners
        chatService.onKickEvent(handleKickEvent);
        
        // Join the match room
        const user = getUserFromCookie();
        const joinData = {
          matchId,
          username: user?.username || 'Anonymous',
        };
        
        const joinResult = await chatService.joinRoom(joinData);
        
        // Check if user was kicked during join
        const joinResultTyped = joinResult as { kicked?: boolean; reason?: string; expiresAt?: string; adminId?: string; timestamp?: string; message?: string };
        if (joinResult && joinResultTyped.kicked) {
          setKickInfo({
            isKicked: true,
            reason: joinResultTyped.reason || joinResultTyped.message || 'You have been kicked from this chat',
            expiresAt: joinResultTyped.expiresAt || null,
            remainingTime: joinResultTyped.expiresAt ? Math.ceil((new Date(joinResultTyped.expiresAt).getTime() - Date.now()) / 1000) : 0,
            adminId: joinResultTyped.adminId || '',
            timestamp: joinResultTyped.timestamp || '',
          });
          setIsConnected(false);
          setError('You have been kicked from this chat');
          return;
        }

        // Check if user was banned during join
        const joinResultBanTyped = joinResult as { banned?: boolean; reason?: string; expiresAt?: string; message?: string };
        if (joinResult && joinResultBanTyped.banned) {
          setBanInfo({
            isBanned: true,
            reason: joinResultBanTyped.reason || joinResultBanTyped.message || 'You are banned from this chat',
            expiresAt: joinResultBanTyped.expiresAt || null,
            remainingTime: joinResultBanTyped.expiresAt ? Math.ceil((new Date(joinResultBanTyped.expiresAt).getTime() - Date.now()) / 1000) : 0,
          });
          setIsConnected(false);
          setError('You are banned from this chat');
          return;
        }
        
        hasJoinedRoom.current = true;
      } catch (wsError) {
        // WebSocket connection failed - graceful degradation
        console.warn('WebSocket connection failed:', wsError);
        setIsConnected(false);
        setError('Không thể kết nối chat, nhưng vẫn có thể xem tin nhắn cũ');
        
        // Still allow view mode - messages already loaded via API
        // No need to throw or disrupt user experience
      }
    } catch (err) {
      // Only log critical errors that break the entire flow
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to chat';
      console.warn('Critical chat error:', err);
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, handleChatEvent, getUserFromCookie, startMuteCountdown, startBanCountdown, handleKickEvent, handleMuteEvent, handleRateLimitEvent, startKickCountdown]);

  const sendMessage = useCallback(async (message: string, display_name?: string) => {
    if (!isConnected || !message.trim()) {
      return;
    }

    try {
      const user = getUserFromCookie();
      const token = authService.getToken();
      
      // For authenticated users, use their username
      // For anonymous users, use the provided display name
      let username: string;
      let avatar: string | undefined;
      
      let userDisplayName: string | undefined;
      
      if (user && token) {
        // Authenticated user
        username = user.username || 'Anonymous';
        avatar = user.avatar;
        userDisplayName = user.display_name; // Get display_name from user profile
      } else if (display_name && display_name.trim()) {
        // Anonymous user with display name
        username = display_name.trim();
        avatar = undefined;
        userDisplayName = display_name.trim();
      } else {
        setError('Vui lòng nhập tên hiển thị để gửi tin nhắn');
        return;
      }

      const messageData: SendMessageData = {
        matchId,
        message: message.trim(),
        username,
        avatar,
        isAnonymous: !user || !token,
        display_name: userDisplayName,
      };

      await chatService.sendMessage(messageData);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [isConnected, matchId, getUserFromCookie]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reloadMessages = useCallback(async () => {
    try {
      const previousMessages = await chatService.loadMessages(matchId, 50);
      
      setMessages(prev => {
        // Merge with existing messages and remove duplicates
        const allMessages = [...prev, ...previousMessages];
        const uniqueMessages = allMessages.filter((message, index, self) => 
          index === self.findIndex(m => m.id === message.id)
        );
        
        // Sort by timestamp
        return uniqueMessages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      
    } catch (loadError) {
      console.warn('Failed to reload messages:', loadError);
    }
  }, [matchId]);

  // Connect on mount and when matchId changes
  useEffect(() => {
    if (matchId) {
      connectToChat();
    }

    // Cleanup on unmount or matchId change
    return () => {
      disconnectFromChat();
    };
  }, [matchId, connectToChat, disconnectFromChat]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = chatService.isSocketConnected();
      setIsConnected(connected);
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    clearError,
    connectedUsers,
    reloadMessages,
    rateLimitInfo,
    muteInfo,
    banInfo,
    kickInfo,
    setMuteInfo,
    setBanInfo,
    setKickInfo,
    setRateLimitInfo,
    startCountdown,
    startKickCountdown,
  };
}
