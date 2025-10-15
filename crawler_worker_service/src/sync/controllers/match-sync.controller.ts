import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchSyncService } from '../services/match-sync.service';
import { ScheduledSyncService } from '../services/scheduled-sync.service';
import { Logger } from '@nestjs/common';
import { SyncRequestDto, SyncResponseDto } from '../dto/sync.dto';
import { LiveScoreUpdateResponseDto } from '../dto/live-score.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Match Sync')
@Controller('api/v1/sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MatchSyncController {
  private readonly logger = new Logger(MatchSyncController.name);

  constructor(
    private readonly matchSyncService: MatchSyncService,
    private readonly scheduledSyncService: ScheduledSyncService,
  ) {}

  @Post('manual')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Sync matches thủ công' })
  @ApiResponse({
    status: 200,
    description: 'Sync thành công',
    type: SyncResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async manualSync(
    @Body() syncRequest: SyncRequestDto,
    @Request() req: any,
  ): Promise<SyncResponseDto> {
    try {
      const { date, force = false, retry = 3 } = syncRequest;

      if (!date) {
        throw new HttpException('Date is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(
        `Bắt đầu manual sync cho ngày ${date}, force: ${force}, retry: ${retry} bởi user: ${req.user.email}`,
      );

      let attempts = 0;
      let lastError: Error | null = null;

      while (attempts < retry) {
        try {
          await this.matchSyncService.syncMatchesFromAPI(date);

          return {
            success: true,
            message: `Sync thành công cho ngày ${date}`,
            data: {
              date,
              attempts: attempts + 1,
              force,
            },
          };
        } catch (error: any) {
          attempts++;
          lastError = error;
          this.logger.warn(`Lần thử ${attempts} thất bại:`, error.message);

          if (attempts < retry) {
            // Đợi 2 giây trước khi thử lại
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }

      throw new HttpException(
        `Sync thất bại sau ${retry} lần thử. Lỗi cuối: ${lastError?.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      this.logger.error('Lỗi trong manual sync:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Lỗi không xác định khi sync',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update-result-current-day')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Cập nhật kết quả trận đấu cho ngày hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật kết quả thành công',
    type: SyncResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async updateResultForCurrentDay(
    @Request() req: any,
  ): Promise<SyncResponseDto> {
    try {
      this.logger.log(
        `Bắt đầu cập nhật kết quả trận đấu cho ngày hiện tại bởi user: ${req.user.email}`,
      );

      await this.matchSyncService.updateMatchResultForCurrentDay();

      return {
        success: true,
        message: 'Cập nhật kết quả trận đấu cho ngày hiện tại thành công',
        data: {
          date: 'current-day',
          attempts: 1,
          force: false,
        },
      };
    } catch (error) {
      this.logger.error('Lỗi trong update result current day:', error);

      throw new HttpException(
        'Lỗi không xác định khi cập nhật kết quả',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update-live-scores')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Cập nhật tỉ số real-time từ live.json API' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tỉ số thành công',
    type: LiveScoreUpdateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async updateLiveScores(
    @Request() req: any,
  ): Promise<LiveScoreUpdateResponseDto> {
    try {
      this.logger.log(
        `Bắt đầu cập nhật tỉ số real-time bởi user: ${req.user.email}`,
      );

      const result = await this.matchSyncService.updateLiveScores();

      this.logger.log(
        `Hoàn thành cập nhật tỉ số real-time: ${result.data.updatedMatches}/${result.data.totalMatches} trận đấu`,
      );

      return result;
    } catch (error: any) {
      this.logger.error('Lỗi trong update live scores:', error);

      return {
        success: false,
        message: `Lỗi không xác định khi cập nhật tỉ số: ${error.message}`,
        data: {
          totalMatches: 0,
          updatedMatches: 0,
          skippedMatches: 0,
        },
      };
    }
  }

  @Post('cronjob1')
  @Roles('admin', 'moderator')
  @ApiOperation({
    summary: 'Chạy cron job hàng ngày thủ công (sync lịch thi đấu và kết quả)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cron job hàng ngày chạy thành công',
    type: SyncResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async runCronJob1(@Request() req: any): Promise<SyncResponseDto> {
    try {
      this.logger.log(
        `Bắt đầu chạy cron job hàng ngày thủ công bởi user: ${req.user.email}`,
      );

      await this.scheduledSyncService.runScheduledSyncManually();

      return {
        success: true,
        message: 'Cron job hàng ngày chạy thành công',
        data: {
          type: 'daily_sync',
          executedBy: req.user.email,
          executedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi khi chạy cron job hàng ngày:', error);

      throw new HttpException(
        'Lỗi không xác định khi chạy cron job hàng ngày',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cronjob2')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Chạy cron job cập nhật kết quả theo giờ thủ công' })
  @ApiResponse({
    status: 200,
    description: 'Cron job cập nhật kết quả theo giờ chạy thành công',
    type: SyncResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async runCronJob2(@Request() req: any): Promise<SyncResponseDto> {
    try {
      this.logger.log(
        `Bắt đầu chạy cron job cập nhật kết quả theo giờ thủ công bởi user: ${req.user.email}`,
      );

      await this.scheduledSyncService.runHourlyResultUpdateManually();

      return {
        success: true,
        message: 'Cron job cập nhật kết quả theo giờ chạy thành công',
        data: {
          type: 'hourly_result_update',
          executedBy: req.user.email,
          executedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        'Lỗi khi chạy cron job cập nhật kết quả theo giờ:',
        error,
      );

      throw new HttpException(
        'Lỗi không xác định khi chạy cron job cập nhật kết quả theo giờ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint để test cron job cập nhật tỉ số live thủ công
   */
  @Post('test-live-scores-update')
  @ApiOperation({ summary: 'Test cron job cập nhật tỉ số live thủ công' })
  @ApiResponse({
    status: 200,
    description: 'Cron job cập nhật tỉ số live đã được chạy thành công',
  })
  async testLiveScoresUpdate(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log('🔧 Chạy test cron job cập nhật tỉ số live thủ công...');

      await this.scheduledSyncService.runLiveScoresUpdateManually();

      return {
        success: true,
        message: 'Cron job cập nhật tỉ số live đã được chạy thành công',
      };
    } catch (error) {
      this.logger.error('Lỗi khi chạy cron job cập nhật tỉ số live:', error);

      throw new HttpException(
        'Lỗi không xác định khi chạy cron job cập nhật tỉ số live',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
