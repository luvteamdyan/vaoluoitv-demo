export interface CheckInRecord {
  user_id: string;
  currentStreak: number;
  lastCheckinAt: string; // ISO date string
  lastRewardedStreak: number;
  totalCheckins: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data?: {
    checkin: CheckInRecord;
    isNewRecord: boolean;
    streakUpdated: boolean;
    rewards?: {
      luckPoints: number;
      spinChances: number;
    };
  };
  error?: string;
}

export interface CheckInStats {
  currentStreak: number;
  totalCheckins: number;
  lastCheckinAt: string | null;
  canCheckInToday: boolean;
  nextRewardIn: number; // days until next reward
}
