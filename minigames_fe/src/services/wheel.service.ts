import axios from 'axios';
import { getAuthToken } from '../utils/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://games-api.vaoluoitv.com';

export interface WheelSegment {
  segment_id: string;
  label: string;
  color: string;
  weight: number;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
  order: number;
}

export interface WheelSpinResponse {
  segment_id: string;
  segment_label: string;
  segment_index: number;
  reward_type: string;
  reward_value: number;
  stop_angle: number;
  points_updated: boolean;
  points_added: number;
}

export interface WheelSpinResult {
  _id: string;
  user_id: string;
  segment_id: string;
  segment_label: string;
  reward_type: string;
  reward_value: number;
  reward_claimed: boolean;
  spun_at: string;
}

export interface SegmentStats {
  segment_id: string;
  segment_label: string;
  count: number;
  totalRewardValue: number;
  weight: number;
}

export interface UserSpinInfo {
  user_id: string;
  count: number;
  created_at: string;
  updated_at: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  message: string;
  reward_type?: string;
  reward_value?: number;
}

class WheelService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Lấy danh sách segments đang hoạt động
  async getActiveSegments(): Promise<WheelSegment[]> {
    try {
      const response = await axios.get(`${this.baseURL}/wheel/segments`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Get active segments error:', error);
      throw new Error('Không thể lấy danh sách segments.');
    }
  }

  // Lấy thông tin spin count của user
  async getUserSpinInfo(userId: string): Promise<UserSpinInfo> {
    try {
      const response = await axios.get(`${this.baseURL}/spins/${userId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Get user spin info error:', error);
      throw new Error('Không thể lấy thông tin spin count.');
    }
  }

  // Quay wheel
  async spinWheel(userId: string): Promise<WheelSpinResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/wheel/spin`, 
        { user_id: userId },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Spin wheel error:', error);
      throw new Error('Không thể quay wheel.');
    }
  }

  // Giảm spin count của user sau khi quay
  async decrementSpinCount(userId: string): Promise<UserSpinInfo> {
    try {
      const response = await axios.post(`${this.baseURL}/spins/${userId}/increment`, 
        { increment: -1 },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Decrement spin count error:', error);
      throw new Error('Không thể giảm spin count.');
    }
  }

  // Lấy lịch sử spin của user
  async getUserSpinHistory(userId: string, limit: number = 10): Promise<WheelSpinResult[]> {
    try {
      const response = await axios.get(`${this.baseURL}/wheel/history/${userId}?limit=${limit}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Get spin history error:', error);
      throw new Error('Không thể lấy lịch sử spin.');
    }
  }

  // Claim reward
  async claimReward(userId: string, spinResultId: string): Promise<ClaimRewardResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/wheel/claim/${userId}/${spinResultId}`, 
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Claim reward error:', error);
      throw new Error('Không thể claim reward.');
    }
  }

  // Lấy thống kê segments (admin only)
  async getSegmentStats(): Promise<SegmentStats[]> {
    try {
      const response = await axios.get(`${this.baseURL}/wheel/stats`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Get segment stats error:', error);
      throw new Error('Không thể lấy thống kê segments.');
    }
  }

  // Helper method để format reward text
  formatRewardText(rewardType: string, rewardValue: number): string {
    switch (rewardType) {
      case 'points':
        return `${rewardValue} điểm`;
      case 'special_gift':
        if (rewardValue === 50000) {
          return 'Card 50k';
        } else if (rewardValue === 1) {
          return 'Áo Thun';
        }
        return `Quà đặc biệt ${rewardValue}`;
      default:
        return `${rewardValue} ${rewardType}`;
    }
  }

  // Helper method để get color cho segment
  getSegmentColor(index: number): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[index % colors.length];
  }
}

export const wheelService = new WheelService();