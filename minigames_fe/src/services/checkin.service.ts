import { CheckInResponse, CheckInStats } from '@/types/checkin.types';
import { authService } from './auth.service';

class CheckInService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';
  }

  /**
   * Thực hiện điểm danh cho ngày hiện tại
   */
  async performCheckIn(): Promise<CheckInResponse> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch(`${this.apiBaseUrl}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: CheckInResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi điểm danh');
      }

      return data;
    } catch (error) {
      console.error('CheckIn service error:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê điểm danh của user
   */
  async getCheckInStats(): Promise<CheckInStats> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch(`${this.apiBaseUrl}/checkin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi lấy dữ liệu điểm danh');
      }

      return data.data;
    } catch (error) {
      console.error('Get CheckIn stats error:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem user có thể điểm danh hôm nay không
   */
  async canCheckInToday(): Promise<boolean> {
    try {
      const stats = await this.getCheckInStats();
      return stats.canCheckInToday;
    } catch (error) {
      console.error('Check can check in today error:', error);
      return false;
    }
  }

  /**
   * Tính toán số ngày còn lại để nhận reward tiếp theo
   */
  calculateDaysToNextReward(currentStreak: number): number {
    return 4 - (currentStreak % 4);
  }

  /**
   * Tính toán rewards dựa trên streak
   */
  calculateRewards(currentStreak: number): { luckPoints: number; spinChances: number } {
    const cycles = Math.floor(currentStreak / 4);
    const spinChances = cycles * 2;
    const luckPoints = cycles * 10;
    
    return { luckPoints, spinChances };
  }
}

export const checkInService = new CheckInService();
