import { Controller, Post, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckInService } from './checkin.service';
import { CheckInResponseDto, CheckInStatsResponseDto } from './dto/checkin.dto';
import { LoggerUtil } from '../utils/logger.util';
import { JwtUser } from '../types/auth.types';

@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  private logger = new LoggerUtil();

  constructor(private readonly checkInService: CheckInService) {}

  /**
   * POST /checkin - Thực hiện điểm danh
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async performCheckIn(@Request() req: { user: JwtUser }): Promise<CheckInResponseDto> {
    try {
      const userId = req.user.userId;
      this.logger.log('[CHECKIN CONTROLLER] Check-in request from user:', userId);

      // Set current user context cho service
      this.checkInService.setCurrentUser(req.user);

      const result = await this.checkInService.performCheckIn(userId);
      
      this.logger.log('[CHECKIN CONTROLLER] Check-in successful for user:', userId);
      return result;

    } catch (error) {
      this.logger.error('[CHECKIN CONTROLLER] Error in check-in:', error);
      throw error;
    }
  }

  /**
   * GET /checkin - Lấy thống kê điểm danh
   */
  @Get()
  async getCheckInStats(@Request() req: { user: JwtUser }): Promise<CheckInStatsResponseDto> {
    try {
      const userId = req.user.userId;
      this.logger.log('[CHECKIN CONTROLLER] Get stats request from user:', userId);

      const stats = await this.checkInService.getCheckInStats(userId);
      
      this.logger.log('[CHECKIN CONTROLLER] Stats retrieved for user:', userId);
      return {
        success: true,
        message: 'Lấy dữ liệu điểm danh thành công',
        data: stats
      };

    } catch (error) {
      this.logger.error('[CHECKIN CONTROLLER] Error getting stats:', error);
      throw error;
    }
  }
}
