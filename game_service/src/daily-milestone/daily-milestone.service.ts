import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DailyMilestone,
  DailyMilestoneDocument,
} from '../schemas/daily-milestone.schema';

@Injectable()
export class DailyMilestoneService {
  constructor(
    @InjectModel(DailyMilestone.name)
    private dailyMilestoneModel: Model<DailyMilestoneDocument>,
  ) {}

  // Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get or create today's milestone record for a user and game
  async getTodayMilestone(
    userId: string,
    gameType: string,
  ): Promise<DailyMilestone> {
    const today = this.getTodayDate();

    let milestone = await this.dailyMilestoneModel
      .findOne({
        user_id: userId,
        game_type: gameType,
        date: today,
      })
      .exec();

    // If no record exists for today, create a new one
    if (!milestone) {
      milestone = await this.dailyMilestoneModel.create({
        user_id: userId,
        game_type: gameType,
        date: today,
        achieved_milestones: [],
        total_spins_earned: 0,
      });
    }

    return milestone;
  }

  // Check if a milestone was already achieved today
  async isMilestoneAchievedToday(
    userId: string,
    gameType: string,
    milestone: number,
  ): Promise<boolean> {
    const todayMilestone = await this.getTodayMilestone(userId, gameType);
    return todayMilestone.achieved_milestones.includes(milestone);
  }

  // Add a new milestone achievement for today
  async addMilestoneAchievement(
    userId: string,
    gameType: string,
    milestone: number,
    spinsEarned: number,
  ): Promise<DailyMilestone> {
    const today = this.getTodayDate();

    return this.dailyMilestoneModel
      .findOneAndUpdate(
        {
          user_id: userId,
          game_type: gameType,
          date: today,
        },
        {
          $addToSet: { achieved_milestones: milestone },
          $inc: { total_spins_earned: spinsEarned },
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  // Get all milestones achieved today
  async getTodayAchievedMilestones(
    userId: string,
    gameType: string,
  ): Promise<number[]> {
    const todayMilestone = await this.getTodayMilestone(userId, gameType);
    return todayMilestone.achieved_milestones;
  }

  // Check if all milestones are achieved today
  async areAllMilestonesAchievedToday(
    userId: string,
    gameType: string,
    allMilestones: number[],
  ): Promise<boolean> {
    const achievedMilestones = await this.getTodayAchievedMilestones(
      userId,
      gameType,
    );
    return allMilestones.every((milestone) =>
      achievedMilestones.includes(milestone),
    );
  }

  // Get total spins earned today
  async getTodaySpinsEarned(userId: string, gameType: string): Promise<number> {
    const todayMilestone = await this.getTodayMilestone(userId, gameType);
    return todayMilestone.total_spins_earned;
  }

  // Clean up old records (optional - for maintenance)
  async cleanupOldRecords(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    await this.dailyMilestoneModel
      .deleteMany({
        date: { $lt: cutoffDateString },
      })
      .exec();
  }
}
