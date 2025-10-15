"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { authService } from "@/services/authService";
import { chatService } from "@/services/chatService";
import { UserRole } from "@/types/user";
import { ArrowBigDown, MoreVertical, Trash2, Shield, ShieldCheck, Ban, MicOff, UserX, Send } from "lucide-react";
import DeleteMessageModal from "@/components/ui/modals/DeleteMessageModal";
import AdminActionModal from "@/components/ui/modals/AdminActionModal";
import AdminUserList from "@/components/ui/AdminUserList";
import { getCookie } from "@/utils/cookies";
import { validateMessage, sanitizeMessage } from "@/utils/sanitization";
import { chatRateLimit } from "@/utils/security";
import LogoImg from "@/app/favicon.ico";

interface LiveChatBoxProps {
  matchId: string;
}

export default function LiveChatBox({ matchId }: LiveChatBoxProps) {
  const [newMessage, setNewMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{id: string, username: string, message: string} | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminAction, setAdminAction] = useState<{action: 'ban' | 'mute' | 'kick', userId: string, username: string} | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef<number>(0);
  
  const {
    messages,
    isConnected,
    isLoading,
    sendMessage,
    rateLimitInfo,
    muteInfo,
    banInfo,
    kickInfo,
    setMuteInfo,
    setBanInfo,
    setKickInfo,
    // setRateLimitInfo,
    startCountdown,
    startKickCountdown,
  } = useChat(matchId);

  // Check authentication status and admin role
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          const userCookie = getCookie('user');
          if (userCookie) {
            const user = JSON.parse(decodeURIComponent(userCookie));
            setIsAdmin(user.role === UserRole.ADMIN);
          }
        } catch (error) {
          console.error('Error parsing user cookie:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAuth();
    
    // Check auth status periodically in case user logs in/out in another tab
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, []);


  // Auto-scroll to bottom when messages are first loaded (only once)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current && !isLoading && !hasInitialScrolled) {
      // Only scroll on initial load, not on subsequent message updates
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'auto' // Use 'auto' for instant scroll on initial load
          });
          setHasInitialScrolled(true);
        }
      }, 100);
    }
  }, [messages.length, isLoading, hasInitialScrolled]);

  // Track unread messages when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      const newMessagesCount = messages.length - lastMessageCount;
      
      if (shouldAutoScroll) {
        // User is at bottom, auto-scroll and don't count as unread
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
          // Update lastScrollTop to prevent detecting this as user scroll
          setTimeout(() => {
            lastScrollTopRef.current = container.scrollTop;
          }, 100);
        }
        setUnreadCount(0);
      } else {
        // User is not at bottom, count as unread
        setUnreadCount(prev => prev + newMessagesCount);
      }
      
      setLastMessageCount(messages.length);
    }
  }, [messages, shouldAutoScroll, lastMessageCount]);

  // Check if user is at bottom of scroll
  const handleScroll = () => {
    if (messagesContainerRef.current && hasInitialScrolled) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold for better detection
      
      // Only disable auto-scroll if user intentionally scrolled UP
      // (scrollTop decreased compared to last position)
      if (scrollTop < lastScrollTopRef.current && !isAtBottom) {
        setShouldAutoScroll(false);
      } else if (isAtBottom) {
        // User is at bottom, enable auto-scroll
        setShouldAutoScroll(true);
        // Reset unread count when user scrolls to bottom
        if (unreadCount > 0) {
          setUnreadCount(0);
        }
      }
      
      // Update last scroll position
      lastScrollTopRef.current = scrollTop;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // For anonymous users, check if display name is provided
    if (!isAuthenticated && !displayName.trim()) {
      alert('Vui lòng nhập tên hiển thị để gửi tin nhắn');
      return;
    }
    
    // For authenticated users, they can send messages directly
    // For anonymous users, they need display name
    
    // Check if rate limited
    if (rateLimitInfo.isRateLimited) {
      return;
    }

    // Check client-side rate limit
    if (!chatRateLimit.canMakeRequest()) {
      const resetTime = chatRateLimit.getResetTime();
      
      // Start countdown for client-side rate limit
      startCountdown(resetTime);
      return;
    }

    // Check user status from server before sending message
    // Skip server check if already rate limited to avoid clearing rate limit state
    if (rateLimitInfo.isRateLimited) {
      return;
    }
    
    try {
      const userStatus = await chatService.getUserStatus(matchId);
      
      // Update kick info from server
      if (userStatus.isKicked) {
        // Update local state to show warning
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
        
        return;
      } else {
        // Clear kick info if not kicked (but don't clear if already kicked locally)
        if (!kickInfo.isKicked) {
          setKickInfo({
            isKicked: false,
            reason: '',
            expiresAt: null,
            remainingTime: 0,
            adminId: '',
            timestamp: '',
          });
        }
      }
      
      // Update mute info from server
      if (userStatus.isMuted) {
        // Update local state to show warning
        setMuteInfo({
          isMuted: true,
          reason: userStatus.muteInfo.reason,
          expiresAt: userStatus.muteInfo.expiresAt,
          remainingTime: userStatus.muteInfo.remainingTime,
        });
        return;
      } else {
        // Clear mute info if not muted (but don't clear if already muted locally)
        if (!muteInfo.isMuted) {
          setMuteInfo({
            isMuted: false,
            reason: '',
            expiresAt: null,
            remainingTime: 0,
          });
        }
      }
      
      // Update ban info from server
      if (userStatus.isBanned) {
        // Update local state to show warning
        setBanInfo({
          isBanned: true,
          reason: userStatus.banInfo.reason,
          expiresAt: userStatus.banInfo.expiresAt,
          remainingTime: userStatus.banInfo.remainingTime,
        });
        return;
      } else {
        // Clear ban info if not banned (but don't clear if already banned locally)
        if (!banInfo.isBanned) {
          setBanInfo({
            isBanned: false,
            reason: '',
            expiresAt: null,
            remainingTime: 0,
          });
        }
      }
    } catch (statusError) {
      console.warn('Failed to check user status from server:', statusError);
      // Continue with local checks if server check fails
      
      // Check if user is muted (local state)
      if (muteInfo.isMuted) {
        return;
      }

      // Check if user is banned (local state)
      if (banInfo.isBanned) {
        return;
      }
    }
    
    if (newMessage.trim() && isConnected) {
      // Validate and sanitize message
      const validation = validateMessage(newMessage);
      
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      
      try {
        // For anonymous users, send display name along with message
        const messageToSend = validation.sanitizedMessage || newMessage;
        if (!isAuthenticated && displayName.trim()) {
          await sendMessage(messageToSend, displayName.trim());
        } else {
          await sendMessage(messageToSend);
        }
        
        setNewMessage("");
        // Force scroll to bottom after sending message (user always wants to see their own message)
        setShouldAutoScroll(true);
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
            // Update lastScrollTop to prevent detecting this as user scroll
            lastScrollTopRef.current = container.scrollHeight;
          }
        }, 100);
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
          // Try to extract retry time from error message or use default
          const retryAfter = Date.now() + 60000; // Default 1 minute
          startCountdown(retryAfter);
        }
      }
    }
  };

  const scrollToBottom = () => {
    setShouldAutoScroll(true);
    setUnreadCount(0); // Reset unread count when user scrolls to bottom
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      // Update lastScrollTop to current max position
      lastScrollTopRef.current = container.scrollHeight;
    }
  };

  // Admin functions
  const handleModerateMessage = async (messageId: string, action: 'approve' | 'reject') => {
    try {
      await chatService.moderateMessage(messageId, action);
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Error moderating message:', error);
    }
  };

  const handleAdminAction = (action: 'ban' | 'mute' | 'kick', userId: string, username: string) => {
    setAdminAction({ action, userId, username });
    setShowAdminModal(true);
    setShowMessageMenu(null);
  };

  const handleAdminConfirm = async (reason: string, duration?: number) => {
    if (!adminAction) return;

    try {
      switch (adminAction.action) {
        case 'ban':
          await chatService.banUser(adminAction.userId, matchId, adminAction.username, reason, duration);
          break;
        case 'mute':
          await chatService.muteUser(adminAction.userId, matchId, adminAction.username, reason, duration);
          break;
        case 'kick':
          await chatService.kickUser(adminAction.userId, matchId, adminAction.username, reason, duration);
          break;
      }
    } catch (error) {
      console.error('Error performing admin action:', error);
    }
  };

  const handleDeleteMessage = (messageId: string, username: string, message: string) => {
    setSelectedMessage({ id: messageId, username, message });
    setShowDeleteModal(true);
    setShowMessageMenu(null);
  };

  const confirmDeleteMessage = async (reason: string) => {
    if (!selectedMessage) return;
    
    try {
      await chatService.deleteMessage(selectedMessage.id, reason);
      setShowDeleteModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error; // Re-throw to let modal handle the error display
    }
  };

  const toggleMessageMenu = (messageId: string) => {
    setShowMessageMenu(showMessageMenu === messageId ? null : messageId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMessageMenu && !(event.target as Element).closest('.admin-menu')) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMessageMenu]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDefaultAvatar = (username: string) => {
    // Generate a consistent avatar based on username
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = username.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  // Priority-based status display: Ban > Kick > Mute
  // 1. If user is banned, show ban message (highest priority)
  if (banInfo.isBanned) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-black/80 to-gray-800 rounded-xl shadow-2xl">
        {/* Chat Header */}
        <div className="flex-shrink-0 p-3 md:p-4 border-b-2 border-red-500/40 bg-gradient-to-r from-red-900 via-red-700 to-red-900 rounded-t-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-red-400 drop-shadow-lg tracking-wide">
              Live Chat
            </h3>
          </div>
        </div>

        {/* Ban Message */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Background Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="opacity-[0.05] transform scale-[3] sm:scale-[4] md:scale-[5]">
              <img
                src={LogoImg.src}
                alt="VAOLUOITV Logo"
                className="w-24 h-16 object-contain filter grayscale-[0.5]"
              />
            </div>
          </div>
          
          <div className="text-center relative z-10">
            <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Bạn đã bị cấm khỏi chat</h2>
            <p className="text-gray-300 mb-2">Lý do: {banInfo.reason}</p>
            {banInfo.expiresAt && (
              <p className="text-sm text-gray-400">
                Thời gian còn lại: {banInfo.remainingTime}s
              </p>
            )}
            {!banInfo.expiresAt && (
              <p className="text-sm text-gray-400">
                Cấm vĩnh viễn
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. If user is kicked, show kick message (second priority)
  if (kickInfo.isKicked) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-black/80 to-gray-800 rounded-xl shadow-2xl">
        {/* Chat Header */}
        <div className="flex-shrink-0 p-3 md:p-4 border-b-2 border-orange-500/40 bg-gradient-to-r from-orange-900 via-orange-700 to-orange-900 rounded-t-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-orange-400 drop-shadow-lg tracking-wide">
              Live Chat
            </h3>
          </div>
        </div>

        {/* Kick Message */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Background Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="opacity-[0.05] transform scale-[3] sm:scale-[4] md:scale-[5]">
              <img
                src={LogoImg.src}
                alt="VAOLUOITV Logo"
                className="w-24 h-16 object-contain filter grayscale-[0.5]"
              />
            </div>
          </div>
          
          <div className="text-center relative z-10">
            <Ban className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-orange-400 mb-2">Bạn đã bị kick khỏi chat</h2>
            <p className="text-gray-300 mb-2">Lý do: {kickInfo.reason}</p>
            {kickInfo.expiresAt && (
              <p className="text-sm text-gray-400">
                Thời gian còn lại: {kickInfo.remainingTime}s
              </p>
            )}
            {!kickInfo.expiresAt && (
              <p className="text-sm text-gray-400">
                Kick vĩnh viễn
              </p>
            )}
            <p className="text-xs text-gray-500 mt-4">
              Kick bởi admin: {kickInfo.adminId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. If user is muted, show mute warning but allow chat (lowest priority)
  // Note: Muted users can still see chat but cannot send messages

  return (
    <div className="h-full flex flex-col border-2 border-gray-700 bg-gradient-to-b from-gray-900 via-black/80 to-gray-800 rounded-none lg:rounded-xl shadow-2xl">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-2 py-1.5 md:p-4 border-b-2 border-yellow-500/40 bg-gradient-to-r from-red-900 via-red-700 to-red-900 rounded-none lg:rounded-t-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm md:text-lg lg:text-lg font-bold text-yellow-400 drop-shadow-lg tracking-wide">
            Trò chuyện trực tuyến
          </h3>
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Admin Panel */}
            <div className="relative">
              <AdminUserList matchId={matchId} isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative">
        {/* Background Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="opacity-[0.08] transform scale-[3] sm:scale-[4] md:scale-[5] lg:scale-[6]">
            <img
              src={LogoImg.src}
              alt="VAOLUOITV Logo"
              className="w-24 h-16 object-contain filter grayscale-[0.3]"
            />
          </div>
        </div>
        
        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto scrollbar-none z-10"
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 italic">
                Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start space-x-2 sm:space-x-3 p-1 sm:p-2 bg-gray-800/60 hover:bg-gray-800/80 transition-all duration-300 group relative"
                >
                  {/* Avatar */}
                  {msg.avatar ? (
                    <img
                      src={msg.avatar}
                      alt={msg.username}
                      className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-red-600 shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold border-2 border-yellow-500 shadow-inner flex-shrink-0 text-xs sm:text-sm ${getDefaultAvatar(
                        msg.display_name || msg.username
                      )}`}
                    >
                      {(msg.display_name || msg.username).charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-semibold text-yellow-400">
                        {msg.display_name || msg.username}
                      </span>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                        {/* Admin Controls */}
                        {isAdmin && (
                          <div className="relative admin-menu">
                            <button
                              onClick={() => toggleMessageMenu(msg.id)}
                              className="p-0.5 sm:p-1 hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            </button>
                            
                            {showMessageMenu === msg.id && (
                              <div className="absolute right-0 top-6 sm:top-8 bg-gray-900 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px] sm:min-w-[160px]">
                              {/* Message Actions */}
                              <div className="px-2 py-1 text-xs text-gray-400 border-b border-gray-700">
                                Message Actions
                              </div>
                                <button
                                  onClick={() => handleModerateMessage(msg.id, 'approve')}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-green-400 hover:bg-gray-800 flex items-center space-x-1 sm:space-x-2"
                                >
                                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4"/>
                                  <span>Duyệt</span>
                                </button>
                                <button
                                  onClick={() => handleModerateMessage(msg.id, 'reject')}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-yellow-400 hover:bg-gray-800 flex items-center space-x-1 sm:space-x-2"
                                >
                                  <Shield className="w-3 h-3 sm:w-4 sm:h-4"/>
                                  <span>Từ chối</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id, msg.username, msg.message)}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-red-400 hover:bg-gray-800 flex items-center space-x-1 sm:space-x-2"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4"/>
                                  <span>Xóa</span>
                                </button>
                                
                                {/* User Actions */}
                                <div className="px-2 py-1 text-xs text-gray-400 border-b border-gray-700 mt-1">
                                  User Actions
                                </div>
                                <button
                                  onClick={() => handleAdminAction('mute', msg.userId, msg.username)}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-yellow-400 hover:bg-gray-800 flex items-center space-x-1 sm:space-x-2"
                                >
                                  <MicOff className="w-3 h-3 sm:w-4 sm:h-4"/>
                                  <span>Mute</span>
                                </button>
                                <button
                                  onClick={() => handleAdminAction('ban', msg.userId, msg.username)}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-red-400 hover:bg-gray-800 flex items-center space-x-1 sm:space-x-2"
                                >
                                  <Ban className="w-3 h-3 sm:w-4 sm:h-4"/>
                                  <span>Ban</span>
                                </button>
                                <button
                                  onClick={() => handleAdminAction('kick', msg.userId, msg.username)}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-orange-400 hover:bg-gray-800 flex items-center space-x-1 sm:space-x-2"
                                >
                                  <UserX className="w-3 h-3 sm:w-4 sm:h-4"/>
                                  <span>Kick</span>
                                </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                    <div className="flex items-start justify-between">
                      <p 
                        className="text-xs sm:text-sm text-gray-100 leading-relaxed flex-1"
                        dangerouslySetInnerHTML={{ __html: sanitizeMessage(msg.message).sanitizedMessage }}
                      />
                      {msg.isModerated && (
                        <div className="ml-1 sm:ml-2 flex items-center text-green-400" title="Tin nhắn đã được kiểm duyệt">
                          <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {!shouldAutoScroll && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-2 sm:p-3 rounded-full shadow-lg animate-bounce border-2 border-yellow-400 hover:shadow-yellow-500/50 hover:scale-105 transition-all"
          >
            <ArrowBigDown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t-2 border-yellow-500/40 bg-black/80 lg:rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex flex-col">
                 {/* Rate limit warning */}
                 {rateLimitInfo.isRateLimited && (
                   <div className="bg-red-900/20 text-xs sm:text-sm text-red-300">
                     <div className="flex items-center space-x-1 sm:space-x-2">
                       <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                       <span>Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ {rateLimitInfo.remainingTime}s để gửi tin nhắn tiếp theo.</span>
                     </div>
                   </div>
                 )}
                 

                 {/* Mute warning */}
                 {muteInfo.isMuted && (
                   <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-yellow-300">
                     <div className="flex items-center space-x-1 sm:space-x-2">
                       <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                       <div>
                         <span>Bạn đã bị mute. Lý do: {muteInfo.reason}</span>
                         {muteInfo.expiresAt && (
                           <span className="block text-xs text-yellow-400">
                             Thời gian còn lại: {muteInfo.remainingTime}s
                           </span>
                         )}
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Ban warning */}
                 {banInfo.isBanned && (
                   <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-red-300">
                     <div className="flex items-center space-x-1 sm:space-x-2">
                       <Ban className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                       <div>
                         <span>Bạn đã bị ban. Lý do: {banInfo.reason}</span>
                         {banInfo.expiresAt && (
                           <span className="block text-xs text-red-400">
                             Thời gian còn lại: {banInfo.remainingTime}s
                           </span>
                         )}
                       </div>
                     </div>
                   </div>
                 )}

          {/* Chat Input Container */}
          <div className="">
            {/* Display name input for anonymous.users */}
            {!isAuthenticated && (
              <div className="bg-gray-800/50 backdrop-blur-sm">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="flex px-2 items-center space-x-1 sm:space-x-1.5">
                    <label className="text-xs font-medium text-blue-300 whitespace-nowrap">
                      Nickname
                    </label>
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập nickname..."
                    maxLength={20}
                    className="flex-1 h-10 bg-gray-900/80 text-white placeholder-gray-400 focus:outline-none text-xs transition-all duration-200"
                  />
                </div>
              </div>
            )}
            
            {/* Message input and send button */}
            <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 px-0.5 py-0.5 sm:px-1 sm:py-1 md:px-2 md:py-1.5 backdrop-blur-sm shadow-lg rounded-b-xl">
              <div className="flex items-center gap-0.5 sm:gap-0.5 md:gap-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    !isAuthenticated
                      ? "Nhập tin nhắn..."
                      : rateLimitInfo.isRateLimited
                        ? `Chờ ${rateLimitInfo.remainingTime}s...`
                        : kickInfo.isKicked
                          ? kickInfo.expiresAt 
                            ? `Bị kick còn ${kickInfo.remainingTime}s...`
                            : "Bạn đã bị kick..."
                          : muteInfo.isMuted
                            ? muteInfo.expiresAt 
                              ? `Bị mute còn ${muteInfo.remainingTime}s...`
                              : "Bạn đã bị mute..."
                              : banInfo.isBanned
                              ? banInfo.expiresAt 
                                ? `Bị ban còn ${banInfo.remainingTime}s...`
                                : "Bạn đã bị ban..."
                              : "Nhập tin nhắn..."
                  }
                  disabled={!isConnected || rateLimitInfo.isRateLimited || muteInfo.isMuted || banInfo.isBanned || kickInfo.isKicked}
                  className="flex-[6] h-7 sm:h-8 md:h-9 px-1 sm:px-1.5 md:px-2 py-1 bg-gray-900/80 text-white placeholder-gray-400 focus:outline-none text-xs sm:text-sm disabled:opacity-50 transition-all duration-200 rounded"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || (!isAuthenticated && !displayName.trim()) || rateLimitInfo.isRateLimited || muteInfo.isMuted || banInfo.isBanned || kickInfo.isKicked}
                  className="flex-[1] h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-2.5 bg-gradient-to-r from-red-500 via-red-600 to-yellow-500 text-white font-semibold shadow-lg hover:shadow-red-500/30 hover:from-red-400 hover:to-yellow-400 transition-all duration-200 disabled:opacity-40 text-xs sm:text-sm whitespace-nowrap flex items-center justify-center min-w-[35px] sm:min-w-[40px] md:min-w-[45px] relative overflow-hidden group rounded flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {rateLimitInfo.isRateLimited 
                    ? `${rateLimitInfo.remainingTime}s` 
                    : kickInfo.isKicked
                      ? kickInfo.expiresAt 
                        ? `${kickInfo.remainingTime}s`
                        : 'Kicked'
                      : muteInfo.isMuted 
                        ? muteInfo.expiresAt 
                          ? `${muteInfo.remainingTime}s`
                          : 'Muted'
                        : banInfo.isBanned
                          ? banInfo.expiresAt 
                            ? `${banInfo.remainingTime}s`
                            : 'Banned'
                          : <Send className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Message Modal */}
      {selectedMessage && (
        <DeleteMessageModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMessage(null);
          }}
          onConfirm={confirmDeleteMessage}
          username={selectedMessage.username}
          message={selectedMessage.message}
        />
      )}

      {/* Admin Action Modal */}
      {adminAction && (
        <AdminActionModal
          isOpen={showAdminModal}
          onClose={() => {
            setShowAdminModal(false);
            setAdminAction(null);
          }}
          onConfirm={handleAdminConfirm}
          action={adminAction.action}
          username={adminAction.username}
          userId={adminAction.userId}
        />
      )}
    </div>
  );
}