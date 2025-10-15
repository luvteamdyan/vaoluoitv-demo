import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckIn, CheckInDocument } from '../schemas/checkin.schema';
import { CheckInResponseDto, CheckInStatsDto } from './dto/checkin.dto';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class CheckInService {
  private logger = new LoggerUtil();
  private currentUser: any = null;

  constructor(
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckInDocument>,
  ) {}

  /**
   * Set current user context (được gọi từ controller)
   */
  setCurrentUser(user: any) {
    this.currentUser = user;
  }

  /**
   * Get username from current context
   */
  private getUsernameFromContext(): string {
    return this.currentUser?.username || 'Unknown';
  }

  /**
   * Helper function để check xem 2 ngày có liên tiếp không
   */
  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  /**
   * Helper function để check xem đã điểm danh hôm nay chưa
   */
  private hasCheckedInToday(lastCheckinAt: Date): boolean {
    const lastCheckin = new Date(lastCheckinAt);
    const today = new Date();
    
    // Reset time to compare only dates
    lastCheckin.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return lastCheckin.getTime() === today.getTime();
  }

  /**
   * Helper function để tính rewards
   */
  private calculateRewards(currentStreak: number): { luckPoints: number; spinChances: number } {
    // Mỗi 4 ngày liên tiếp = 2 lượt quay + 10 luck points
    const cycles = Math.floor(currentStreak / 4);
    const spinChances = cycles * 2;
    const luckPoints = cycles * 10;
    
    return { luckPoints, spinChances };
  }

  /**
   * Thực hiện điểm danh cho user
   */
  async performCheckIn(userId: string): Promise<CheckInResponseDto> {
    try {
      this.logger.log('[CHECKIN] Performing check-in for user:', userId);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Tìm checkin record hiện tại
      let checkinRecord = await this.checkInModel.findOne({ user_id: userId }).exec();
      let isNewRecord = false;

      if (!checkinRecord) {
        // Tạo record mới cho user lần đầu
        isNewRecord = true;
        this.logger.log('[CHECKIN] Creating new record for user:', userId);
        
        // Lấy username từ JWT token hoặc request context
        const username = this.getUsernameFromContext();
        
        checkinRecord = new this.checkInModel({
          user_id: userId,
          username: username || 'Unknown',
          currentStreak: 1,
          lastCheckinAt: now,
          lastRewardedStreak: 0,
          totalCheckins: 1,
        });
      } else {
        // Check xem đã điểm danh hôm nay chưa
        if (this.hasCheckedInToday(checkinRecord.lastCheckinAt)) {
          this.logger.log('[CHECKIN] User already checked in today:', userId);
          throw new BadRequestException('Bạn đã điểm danh hôm nay rồi!');
        }

        const lastCheckinDate = new Date(checkinRecord.lastCheckinAt);
        
        // Kiểm tra xem có liên tiếp không
        if (this.isConsecutiveDay(lastCheckinDate, today)) {
          // Liên tiếp -> tăng streak
          checkinRecord.currentStreak += 1;
          this.logger.log('[CHECKIN] Consecutive day, streak increased to:', checkinRecord.currentStreak);
        } else {
          // Không liên tiếp -> reset streak về 1
          checkinRecord.currentStreak = 1;
          this.logger.log('[CHECKIN] Non-consecutive day, streak reset to 1');
        }

        // Cập nhật thông tin
        checkinRecord.lastCheckinAt = now;
        checkinRecord.totalCheckins += 1;
      }

      // Tính rewards
      const rewards = this.calculateRewards(checkinRecord.currentStreak);
      
      // Cập nhật lastRewardedStreak nếu đã nhận reward
      const cycles = Math.floor(checkinRecord.currentStreak / 4);
      if (cycles > checkinRecord.lastRewardedStreak) {
        checkinRecord.lastRewardedStreak = cycles;
        this.logger.log('[CHECKIN] New reward cycle reached:', cycles);
      }

      // Lưu vào database
      const savedRecord = await checkinRecord.save();
      this.logger.log('[CHECKIN] Record saved successfully:', savedRecord._id);

      return {
        success: true,
        message: `Điểm danh thành công! Chuỗi hiện tại: ${savedRecord.currentStreak} ngày`,
        data: {
          checkin: {
            user_id: savedRecord.user_id,
            username: savedRecord.username,
            currentStreak: savedRecord.currentStreak,
            lastCheckinAt: savedRecord.lastCheckinAt.toISOString(),
            lastRewardedStreak: savedRecord.lastRewardedStreak,
            totalCheckins: savedRecord.totalCheckins,
            createdAt: (savedRecord as any).createdAt?.toISOString(),
            updatedAt: (savedRecord as any).updatedAt?.toISOString(),
          },
          isNewRecord,
          streakUpdated: true,
          rewards
        }
      };

    } catch (error) {
      this.logger.error('[CHECKIN] Error performing check-in:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi điểm danh');
    }
  }

  /**
   * Lấy thống kê điểm danh của user
   */
  async getCheckInStats(userId: string): Promise<CheckInStatsDto> {
    try {
      this.logger.log('[CHECKIN] Getting stats for user:', userId);

      const checkinRecord = await this.checkInModel.findOne({ user_id: userId }).exec();

      if (!checkinRecord) {
        this.logger.log('[CHECKIN] No record found for user:', userId);
        return {
          currentStreak: 0,
          totalCheckins: 0,
          lastCheckinAt: null,
          canCheckInToday: true,
          nextRewardIn: 4
        };
      }

      const canCheckInToday = !this.hasCheckedInToday(checkinRecord.lastCheckinAt);
      const nextRewardIn = 4 - (checkinRecord.currentStreak % 4);

      this.logger.log('[CHECKIN] Stats retrieved:', {
        currentStreak: checkinRecord.currentStreak,
        canCheckInToday,
        nextRewardIn
      });

      return {
        currentStreak: checkinRecord.currentStreak,
        totalCheckins: checkinRecord.totalCheckins,
        lastCheckinAt: checkinRecord.lastCheckinAt.toISOString(),
        canCheckInToday,
        nextRewardIn
      };

    } catch (error) {
      this.logger.error('[CHECKIN] Error getting stats:', error);
      throw new BadRequestException('Có lỗi xảy ra khi lấy dữ liệu điểm danh');
    }
  }

  /**
   * Tính toán số ngày còn lại để nhận reward tiếp theo
   */
  calculateDaysToNextReward(currentStreak: number): number {
    return 4 - (currentStreak % 4);
  }

  /**
   * Tính toán rewards dựa trên streak (public method)
   */
  public calculateRewardsPublic(currentStreak: number): { luckPoints: number; spinChances: number } {
    return this.calculateRewards(currentStreak);
  }
}
