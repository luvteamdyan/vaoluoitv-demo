"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MicOff, UserX, Users, Ban, Clock } from "lucide-react";
import { chatService } from "@/services/chatService";

interface AdminUserListProps {
  matchId: string;
  isAdmin: boolean;
}

interface User {
  userId: string;
  username?: string;
  isBanned?: boolean;
  isMuted?: boolean;
  bannedAt?: string;
  mutedAt?: string;
  expiresAt?: string;
  reason?: string;
  bannedBy?: string;
  mutedBy?: string;
  timestamp?: string;
  duration?: number;
}

export default function AdminUserList({ matchId, isAdmin }: AdminUserListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [mutedUsers, setMutedUsers] = useState<User[]>([]);
  const [kickedUsers, setKickedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const [banned, muted, kicked] = await Promise.all([
        chatService.getBannedUsers(matchId),
        chatService.getMutedUsers(matchId),
        chatService.getKickedUsers(matchId),
      ]);
      setBannedUsers(banned);
      setMutedUsers(muted);
      setKickedUsers(kicked);
    } catch (error) {
      console.error('Error loading user lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (isAdmin && isOpen) {
      loadUserLists();
    }
  }, [isAdmin, isOpen, matchId, loadUserLists]);

  const handleUnban = async (userId: string) => {
    try {
      await chatService.unbanUser(userId, matchId);
      
      // Reload the banned users list to ensure it's up to date
      const updatedBannedUsers = await chatService.getBannedUsers(matchId);
      setBannedUsers(updatedBannedUsers);
      
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleUnmute = async (userId: string) => {
    try {
      await chatService.unmuteUser(userId, matchId);
      
      // Reload the muted users list to ensure it's up to date
      const updatedMutedUsers = await chatService.getMutedUsers(matchId);
      setMutedUsers(updatedMutedUsers);
      
    } catch (error) {
      console.error('Error unmuting user:', error);
    }
  };

  const handleUnkick = async (userId: string) => {
    try {
      // Validate userId before making the request
      if (!userId || userId.trim() === '') {
        console.error('Invalid userId for unkick operation');
        return;
      }
      
      await chatService.unkickUser(userId, matchId);
      
      // Reload the kicked users list to ensure it's up to date
      const updatedKickedUsers = await chatService.getKickedUsers(matchId);
      setKickedUsers(updatedKickedUsers);
      
    } catch (error) {
      console.error('Error unkicking user:', error);
    }
  };


  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">Quản trị</span>
      </button>

      {/* Admin Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Quản lý người dùng</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải...
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Banned Users */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Ban className="w-4 h-4 text-red-500" />
                    <h4 className="text-sm font-medium text-white">Người bị cấm ({bannedUsers.length})</h4>
                  </div>
                  
                  {bannedUsers.length === 0 ? (
                    <p className="text-xs text-gray-400">Không có người bị cấm</p>
                  ) : (
                    <div className="space-y-2">
                      {bannedUsers.map((user) => (
                        <div key={user.userId} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {(user.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.username || 'Người dùng không xác định'}</p>
                                <p className="text-xs text-gray-400">{user.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {user.expiresAt && (
                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{getTimeRemaining(user.expiresAt)}</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleUnban(user.userId)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Bỏ cấm
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Muted Users */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <MicOff className="w-4 h-4 text-yellow-500" />
                    <h4 className="text-sm font-medium text-white">Người bị tắt tiếng ({mutedUsers.length})</h4>
                  </div>
                  
                  {mutedUsers.length === 0 ? (
                    <p className="text-xs text-gray-400">Không có người bị tắt tiếng</p>
                  ) : (
                    <div className="space-y-2">
                      {mutedUsers.map((user) => (
                        <div key={user.userId} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {(user.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.username || 'Người dùng không xác định'}</p>
                                <p className="text-xs text-gray-400">{user.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {user.expiresAt && (
                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{getTimeRemaining(user.expiresAt)}</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleUnmute(user.userId)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Bỏ tắt tiếng
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kicked Users */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <UserX className="w-4 h-4 text-orange-500" />
                    <h4 className="text-sm font-medium text-white">Người bị đuổi ({kickedUsers.length})</h4>
                  </div>
                  
                  {kickedUsers.length === 0 ? (
                    <p className="text-xs text-gray-400">Không có người bị đuổi</p>
                  ) : (
                    <div className="space-y-2">
                      {kickedUsers.map((user) => (
                        <div key={user.userId} className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {(user.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.username || 'Người dùng không xác định'}</p>
                                <p className="text-xs text-gray-400">{user.reason}</p>
                                {user.duration && (
                                  <p className="text-xs text-orange-400">Thời gian: {user.duration}m</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {user.expiresAt && (
                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{getTimeRemaining(user.expiresAt)}</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleUnkick(user.userId)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Bỏ đuổi
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
