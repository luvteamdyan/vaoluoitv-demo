export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  display_name?: string;
  message: string;
  avatar?: string;
  userType?: 'user' | 'moderator' | 'admin';
  isModerated?: boolean;
  isDeleted?: boolean;
  timestamp: string;
  type: 'message' | 'user_joined' | 'user_left' | 'message_deleted' | 'message_moderated' | 'USER_KICKED' | 'USER_UNKICKED';
}

export interface ChatEvent {
  type: 'message' | 'user_joined' | 'user_left' | 'message_deleted' | 'message_moderated' | 'USER_KICKED' | 'USER_UNKICKED';
  matchId: string;
  userId: string;
  username: string;
  display_name?: string;
  message?: string;
  messageId?: string;
  avatar?: string;
  userType?: 'user' | 'moderator' | 'admin';
  reason?: string;
  adminId?: string;
  timestamp: string;
}

export interface JoinRoomData {
  matchId: string;
  username?: string;
}

export interface SendMessageData {
  matchId: string;
  message: string;
  username?: string;
  avatar?: string;
  isAnonymous?: boolean;
  display_name?: string;
}

export interface ChatConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectedUsers: number;
}
