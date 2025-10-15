import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Spin, SpinDocument } from '../schemas/spin.schema';
import { DailyMilestoneService } from '../daily-milestone/daily-milestone.service';
import { CreateSpinDto } from './dto/spin.dto';
import { AuthService } from '../auth/auth.service';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class SpinsService {
  private logger = new LoggerUtil();

  constructor(
    @InjectModel(Spin.name) private spinModel: Model<SpinDocument>,
    private dailyMilestoneService: DailyMilestoneService,
    private authService: AuthService,
  ) {}

  async create(createSpinDto: CreateSpinDto): Promise<Spin> {
    // Nếu chưa có external_id, lấy từ external API
    if (!createSpinDto.external_id) {
      try {
        const userData = await this.authService.getUserById(
          createSpinDto.user_id,
        );
        createSpinDto.external_id = userData.external_id || userData.id;
      } catch (error) {
        console.error('[SPINS] Failed to get user data for create:', error);
      }
    }

    const createdSpin = new this.spinModel(createSpinDto);
    return createdSpin.save();
  }

  async findByUserId(userId: string, username?: string): Promise<Spin> {
    // userId từ JWT đã là external_id (được xử lý trong validateUser)
    console.log('[SPINS] Using userId as user_id:', userId);

    let spin = await this.spinModel.findOne({ user_id: userId }).exec();

    // Nếu user chưa có record, tự động tạo mới với count = 0
    if (!spin) {
      console.log('[SPINS] Creating new spin record for user:', userId);
      spin = await this.spinModel.create({
        user_id: userId,
        username: username || 'Unknown',
        count: 0,
      });
    }

    return spin;
  }

  async updateCount(
    userId: string,
    count: number,
    username?: string,
  ): Promise<Spin> {
    // userId từ JWT đã là external_id
    const updateData: any = { count };
    if (username) {
      updateData.username = username;
    }

    return this.spinModel
      .findOneAndUpdate({ user_id: userId }, updateData, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  async updateUsername(userId: string, username: string): Promise<Spin | null> {
    // userId từ JWT đã là external_id
    return this.spinModel
      .findOneAndUpdate({ user_id: userId }, { username }, { new: true })
      .exec();
  }

  async incrementCount(
    userId: string,
    increment: number = 1,
    username?: string,
  ): Promise<Spin> {
    // userId từ JWT đã là external_id
    const updateData: any = { $inc: { count: increment } };
    if (username) {
      updateData.$set = { username };
    }

    return this.spinModel
      .findOneAndUpdate({ user_id: userId }, updateData, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  async findAll(): Promise<Spin[]> {
    return this.spinModel.find().exec();
  }

  // New method for daily milestone tracking
  async processDailyMilestone(
    userId: string,
    gameType: string,
    milestone: number,
  ): Promise<{ success: boolean; spinsEarned: number; message: string }> {
    // userId từ JWT đã là external_id

    // Check if milestone was already achieved today
    const alreadyAchieved =
      await this.dailyMilestoneService.isMilestoneAchievedToday(
        userId,
        gameType,
        milestone,
      );

    if (alreadyAchieved) {
      return {
        success: false,
        spinsEarned: 0,
        message: 'Milestone đã được đạt trong ngày hôm nay',
      };
    }

    // Get milestone mapping
    const milestoneMap = {
      '2048': { 256: 2, 512: 3, 1024: 4, 2048: 5 },
      flappy: { 25: 2, 50: 3, 80: 4, 100: 5 },
      'memory-card': { 5: 5 }, // Complete all 5 levels = +5 spins
      sudoku: { 1: 3 }, // Complete sudoku game = +3 spins
      pikachu: { 1: 5 }, // Complete pikachu matching game = +5 spins
    };

    const spinsEarned = milestoneMap[gameType]?.[milestone];
    if (!spinsEarned) {
      return {
        success: false,
        spinsEarned: 0,
        message: 'Milestone không hợp lệ',
      };
    }

    // Add milestone achievement for today
    await this.dailyMilestoneService.addMilestoneAchievement(
      userId,
      gameType,
      milestone,
      spinsEarned,
    );

    // Increment total spins
    await this.incrementCount(userId, spinsEarned);

    return {
      success: true,
      spinsEarned: spinsEarned,
      message: `Đạt milestone ${milestone}! Nhận được ${spinsEarned} spins`,
    };
  }

  // Get today's milestone status
  async getTodayMilestoneStatus(
    userId: string,
    gameType: string,
  ): Promise<{
    achievedMilestones: number[];
    totalSpinsEarned: number;
    allMilestonesAchieved: boolean;
  }> {
    let allMilestones: number[];
    if (gameType === '2048') {
      allMilestones = [256, 512, 1024, 2048];
    } else if (gameType === 'flappy') {
      allMilestones = [25, 50, 80, 100];
    } else if (gameType === 'memory-card') {
      allMilestones = [5]; // Only one milestone: complete all 5 levels
    } else if (gameType === 'sudoku') {
      allMilestones = [1]; // Only one milestone: complete sudoku game
    } else if (gameType === 'pikachu') {
      allMilestones = [1]; // Only one milestone: complete pikachu matching game
    } else {
      allMilestones = [];
    }

    const achievedMilestones =
      await this.dailyMilestoneService.getTodayAchievedMilestones(
        userId,
        gameType,
      );
    const totalSpinsEarned =
      await this.dailyMilestoneService.getTodaySpinsEarned(userId, gameType);
    const allMilestonesAchieved =
      await this.dailyMilestoneService.areAllMilestonesAchievedToday(
        userId,
        gameType,
        allMilestones,
      );

    return {
      achievedMilestones,
      totalSpinsEarned,
      allMilestonesAchieved,
    };
  }
}
