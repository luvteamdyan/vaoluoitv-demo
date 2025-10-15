import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://games-api.vaoluoitv.com';

export interface Spin {
  _id: string;
  user_id: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSpinRequest {
  count: number;
}

export interface FlappyMilestoneRequest {
  milestone: number;
}

class SpinService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getUserSpins(userId: string): Promise<Spin> {
    try {
      const response = await axios.get(`${this.baseURL}/spins/${userId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Get spins error:', error);
      throw new Error('Không thể lấy thông tin spins.');
    }
  }

  async updateSpinCount(userId: string, count: number): Promise<Spin> {
    try {
      const response = await axios.patch(`${this.baseURL}/spins/${userId}/count`, 
        { count },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Update spin count error:', error);
      throw new Error('Không thể cập nhật số lượng spins.');
    }
  }

  async incrementSpinCount(userId: string, increment: number = 1): Promise<Spin> {
    try {
      const response = await axios.post(`${this.baseURL}/spins/${userId}/increment`, 
        { increment },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Increment spin count error:', error);
      throw new Error('Không thể tăng số lượng spins.');
    }
  }

  async updateFlappyMilestone(userId: string, milestone: number): Promise<Spin> {
    try {
      const response = await axios.post(`${this.baseURL}/spins/${userId}/flappy-milestone`, 
        { milestone },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Update flappy milestone error:', error);
      throw new Error('Không thể cập nhật milestone Flappy Bird.');
    }
  }

  // Method để update milestone cho game 2048
  async update2048Milestone(userId: string, milestone: number): Promise<{
    success: boolean;
    spinsEarned: number;
    message: string;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/spins/${userId}/2048-milestone`, 
        { milestone },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Update 2048 milestone error:', error);
      throw new Error('Không thể cập nhật milestone game 2048.');
    }
  }

  // Method để lấy status milestone của game 2048 hôm nay
  async get2048MilestoneStatus(userId: string): Promise<{
    achievedMilestones: number[];
    totalSpinsEarned: number;
    allMilestonesAchieved: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/spins/${userId}/2048-milestone-status`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Get 2048 milestone status error:', error);
      throw new Error('Không thể lấy trạng thái milestone game 2048.');
    }
  }

  // Helper method để map milestone levels với count values cho Flappy Bird
  getMilestoneCount(milestone: number): number {
    const milestoneMap: { [key: number]: number } = {
      25: 2,
      50: 3,
      80: 4,
      100: 5
    };
    return milestoneMap[milestone] || 0;
  }

  // Helper method để map milestone levels với count values cho game 2048
  get2048MilestoneCount(milestone: number): number {
    const milestoneMap: { [key: number]: number } = {
      256: 2,
      512: 3,
      1024: 4,
      2048: 5
    };
    return milestoneMap[milestone] || 0;
  }
}

export const spinService = new SpinService();
