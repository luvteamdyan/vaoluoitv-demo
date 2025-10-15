import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MatchSyncService } from './match-sync.service';
import { AppConfigService } from '../../config/app-config.service';
import { TimezoneUtil } from '../../utils/timezone.util';

@Injectable()
export class ScheduledSyncService {
  private readonly logger = new Logger(ScheduledSyncService.name);

  constructor(
    private readonly matchSyncService: MatchSyncService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Cron job chạy mỗi ngày lúc 6:00 sáng giờ Việt Nam
   * - Sync lịch thi đấu cho ngày hôm sau
   * - Cập nhật kết quả cho ngày hôm qua và ngày hôm nay
   */
  @Cron('0 6 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleDailySync(): Promise<void> {
    if (!this.configService.scheduledSyncEnabled) {
      this.logger.debug('Scheduled sync is disabled, skipping...');
      return;
    }

    const startTime = Date.now();
    this.logger.log('🚀 Bắt đầu scheduled sync hàng ngày');

    try {
      // Lấy thời gian hiện tại theo giờ Việt Nam
      const currentVietnamTime = TimezoneUtil.getCurrentVietnamTime();
      const currentDateString = TimezoneUtil.formatVietnamTime(
        currentVietnamTime,
        'dd-MM-yyyy',
      );

      // Tính ngày mai (để sync lịch thi đấu)
      const tomorrow = new Date(currentVietnamTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = TimezoneUtil.formatVietnamTime(
        tomorrow,
        'dd-MM-yyyy',
      );

      // Tính ngày hôm qua (để cập nhật kết quả)
      const yesterday = new Date(currentVietnamTime);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = TimezoneUtil.formatVietnamTime(
        yesterday,
        'dd-MM-yyyy',
      );

      this.logger.log(
        `📅 Scheduled sync - Hôm nay: ${currentDateString}, Ngày mai: ${tomorrowDateString}, Hôm qua: ${yesterdayDateString}`,
      );

      // 1. Sync lịch thi đấu cho ngày mai
      this.logger.log(
        `🔄 Bắt đầu sync lịch thi đấu cho ngày mai: ${tomorrowDateString}`,
      );
      try {
        await this.matchSyncService.syncMatchesFromAPI(tomorrowDateString);
        this.logger.log(
          `✅ Hoàn thành sync lịch thi đấu cho ngày mai: ${tomorrowDateString}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Lỗi khi sync lịch thi đấu cho ngày mai ${tomorrowDateString}:`,
          error.message,
        );
      }

      // 2. Cập nhật kết quả cho ngày hôm qua
      this.logger.log(
        `🔄 Bắt đầu cập nhật kết quả cho ngày hôm qua: ${yesterdayDateString}`,
      );
      try {
        await this.matchSyncService.syncResultData(yesterdayDateString);
        this.logger.log(
          `✅ Hoàn thành cập nhật kết quả cho ngày hôm qua: ${yesterdayDateString}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Lỗi khi cập nhật kết quả cho ngày hôm qua ${yesterdayDateString}:`,
          error.message,
        );
      }

      // 3. Cập nhật kết quả cho ngày hôm nay
      this.logger.log(
        `🔄 Bắt đầu cập nhật kết quả cho ngày hôm nay: ${currentDateString}`,
      );
      try {
        await this.matchSyncService.syncResultData(currentDateString);
        this.logger.log(
          `✅ Hoàn thành cập nhật kết quả cho ngày hôm nay: ${currentDateString}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Lỗi khi cập nhật kết quả cho ngày hôm nay ${currentDateString}:`,
          error.message,
        );
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `🎉 Hoàn thành scheduled sync hàng ngày trong ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `💥 Lỗi nghiêm trọng trong scheduled sync hàng ngày (${duration}ms):`,
        error,
      );
    }
  }

  /**
   * Cron job chạy mỗi giờ để cập nhật kết quả trận đấu cho ngày hiện tại
   */
  @Cron('0 * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleHourlyResultUpdate(): Promise<void> {
    if (!this.configService.scheduledSyncEnabled) {
      this.logger.debug(
        'Scheduled sync is disabled, skipping hourly result update...',
      );
      return;
    }

    const startTime = Date.now();
    this.logger.log('🔄 Bắt đầu cron job cập nhật kết quả theo giờ');

    try {
      // 1. Cập nhật kết quả trận đấu cho ngày hiện tại
      this.logger.log('📊 Bước 1: Cập nhật kết quả trận đấu từ API');
      await this.matchSyncService.updateMatchResultForCurrentDay();
      this.logger.log('✅ Hoàn thành cập nhật kết quả trận đấu từ API');

      // 2. Cập nhật status CANCELLED cho các trận đấu đã qua giờ nhưng không có trong API
      this.logger.log(
        '❌ Bước 2: Cập nhật status CANCELLED cho các trận đấu không có trong API',
      );
      await this.matchSyncService.cancelMatchesNotInAPI();
      this.logger.log('✅ Hoàn thành cập nhật status CANCELLED');

      const duration = Date.now() - startTime;
      this.logger.log(
        `🎉 Hoàn thành cron job cập nhật kết quả theo giờ trong ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `💥 Lỗi khi chạy cron job cập nhật kết quả theo giờ (${duration}ms):`,
        error,
      );
    }
  }

  /**
   * Phương thức để test cron job (có thể gọi thủ công)
   */
  async runScheduledSyncManually(): Promise<void> {
    this.logger.log('🔧 Chạy scheduled sync thủ công...');
    await this.handleDailySync();
  }

  /**
   * Cron job chạy mỗi 1 phút để cập nhật tỉ số live từ API
   * Có retry logic và xử lý lỗi tốt hơn
   */
  @Cron('* * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleLiveScoresUpdate(): Promise<void> {
    if (!this.configService.scheduledSyncEnabled) {
      this.logger.debug(
        'Scheduled sync is disabled, skipping live scores update...',
      );
      return;
    }

    const startTime = Date.now();
    this.logger.debug('⚡ Bắt đầu cron job cập nhật tỉ số live mỗi phút');

    let retryCount = 0;
    const maxRetries = 2;
    let lastError: any = null;

    while (retryCount <= maxRetries) {
      try {
        // Cập nhật tỉ số real-time từ live.json API
        const result = await this.matchSyncService.updateLiveScores();

        if (result.success) {
          const duration = Date.now() - startTime;

          // Chỉ log chi tiết nếu có cập nhật hoặc lần đầu chạy
          if (result.data.updatedMatches > 0 || retryCount === 0) {
            this.logger.log(
              `🎉 Hoàn thành cập nhật tỉ số live trong ${duration}ms - ${result.message}`,
            );
          }

          return; // Thành công, thoát khỏi retry loop
        } else {
          lastError = new Error(result.message);
          this.logger.warn(
            `⚠️ Cập nhật tỉ số live không thành công (lần thử ${retryCount + 1}/${maxRetries + 1}): ${result.message}`,
          );
        }
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `⚠️ Lỗi khi chạy cron job cập nhật tỉ số live (lần thử ${retryCount + 1}/${maxRetries + 1}):`,
          error.message,
        );
      }

      retryCount++;

      // Nếu còn retry, đợi một chút trước khi thử lại
      if (retryCount <= maxRetries) {
        const waitTime = retryCount * 1000; // 1s, 2s
        this.logger.debug(`⏳ Đợi ${waitTime}ms trước khi retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Nếu tất cả retry đều thất bại
    const duration = Date.now() - startTime;
    this.logger.error(
      `💥 Tất cả ${maxRetries + 1} lần thử cập nhật tỉ số live đều thất bại (${duration}ms):`,
      lastError?.message || 'Unknown error',
    );
  }

  /**
   * Phương thức để test cron job cập nhật kết quả theo giờ (có thể gọi thủ công)
   */
  async runHourlyResultUpdateManually(): Promise<void> {
    this.logger.log('🔧 Chạy cập nhật kết quả theo giờ thủ công...');
    await this.handleHourlyResultUpdate();
  }

  /**
   * Phương thức để test cron job cập nhật tỉ số live (có thể gọi thủ công)
   */
  async runLiveScoresUpdateManually(): Promise<void> {
    this.logger.log('🔧 Chạy cập nhật tỉ số live thủ công...');
    await this.handleLiveScoresUpdate();
  }
}
