import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Match, MatchDocument, MatchStatus } from '../../schemas/match.schema';
import { TimezoneUtil } from '../../utils/timezone.util';
import { LiveScoreUpdateResponseDto } from '../dto/live-score.dto';

@Injectable()
export class MatchSyncService {
  private readonly logger = new Logger(MatchSyncService.name);
  private syncStats = {
    lastSync: null as Date | null,
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    lastError: null as string | null,
    apiCalls: {
      schedulerApi: 0,
      resultApi: 0,
      totalApiCalls: 0,
      lastApiCall: null as Date | null,
    },
  };

  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private httpService: HttpService,
  ) {}

  async syncMatchesFromAPI(date: string = '23-09-2025'): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.log(`🚀 Bắt đầu sync matches cho ngày ${date}`);
      this.syncStats.totalSyncs++;

      // Sync cả lịch thi đấu và kết quả - xử lý lỗi riêng biệt
      this.logger.log(`🔄 Đang sync song song cả scheduler và result API...`);
      const syncResults = await Promise.allSettled([
        this.syncSchedulerData(date),
        this.syncResultData(date),
      ]);

      // Kiểm tra kết quả sync
      let hasSuccess = false;
      const errors: string[] = [];

      syncResults.forEach((result, index) => {
        const apiName = index === 0 ? 'Scheduler' : 'Result';
        if (result.status === 'fulfilled') {
          hasSuccess = true;
          this.logger.log(`✅ ${apiName} API sync thành công cho ngày ${date}`);
        } else {
          const errorMessage = result.reason?.message || 'Unknown error';
          errors.push(`${apiName} API: ${errorMessage}`);
          this.logger.warn(
            `❌ ${apiName} API sync thất bại cho ngày ${date}: ${errorMessage}`,
          );
        }
      });

      // Nếu cả hai API đều fail thì throw error
      if (!hasSuccess) {
        throw new Error(`Cả hai API đều thất bại: ${errors.join(', ')}`);
      }

      // Nếu có ít nhất một API thành công thì tiếp tục
      if (errors.length > 0) {
        this.logger.warn(
          `⚠️ Một số API thất bại nhưng vẫn tiếp tục sync: ${errors.join(', ')}`,
        );
      }

      // Cập nhật status cho các trận đấu không có kết quả từ API
      this.logger.log(
        `🔄 Cập nhật status cho các trận đấu không có kết quả...`,
      );
      await this.updateMatchesWithoutResults(date);

      // Sync hoàn tất

      this.syncStats.lastSync = new Date();
      this.syncStats.successfulSyncs++;
      this.syncStats.lastError = null;

      const duration = Date.now() - startTime;
      this.logger.log(
        `🎉 Hoàn thành sync matches cho ngày ${date} trong ${duration}ms`,
      );
    } catch (error) {
      this.syncStats.failedSyncs++;
      this.syncStats.lastError = error.message;
      const duration = Date.now() - startTime;
      this.logger.error(
        `💥 Lỗi khi sync matches từ API cho ngày ${date} (${duration}ms):`,
        error,
      );
      throw error;
    }
  }

  /**
   * Cập nhật status thành FINISHED cho các trận đấu không có kết quả từ API
   * và không phải ngày hiện tại theo timezone Việt Nam
   */
  private async updateMatchesWithoutResults(date: string): Promise<void> {
    try {
      // Convert DD-MM-YYYY to DD/MM/YYYY format để match với match_date string
      const syncDateString = TimezoneUtil.convertDateFormat(date); // Format: "23/09/2025"

      // Lấy ngày hiện tại theo timezone Việt Nam
      const currentVietnamDate = TimezoneUtil.getCurrentVietnamTime();
      const currentVietnamDateString = TimezoneUtil.formatVietnamTime(
        currentVietnamDate,
        'dd/MM/yyyy',
      );

      // Debug: Log thông tin ngày để kiểm tra
      this.logger.debug(
        `🔍 Debug ngày: Sync=${syncDateString}, Current=${currentVietnamDateString}, Input=${date}`,
      );

      // Chỉ xử lý nếu ngày sync không phải ngày hiện tại
      if (TimezoneUtil.isMatchDateCurrentDay(syncDateString)) {
        this.logger.debug(
          `⏭️ Bỏ qua cập nhật status cho ngày hiện tại: ${date} (${syncDateString} === ${currentVietnamDateString})`,
        );
        return;
      }

      this.logger.debug(
        `Cập nhật status cho các trận đấu không có kết quả ngày ${date} (${syncDateString})`,
      );

      // Tìm các trận đấu trong ngày sync có status không phải FINISHED và không có stream_key_id
      const matches = await this.matchModel.find({
        match_date: syncDateString,
        is_active: true,
        status: { $ne: MatchStatus.FINISHED },
        $or: [{ stream_key_id: { $exists: false } }],
      });

      let updatedCount = 0;

      for (const match of matches) {
        // Cập nhật status thành FINISHED
        await this.matchModel.findByIdAndUpdate(match._id, {
          status: MatchStatus.FINISHED,
          status_code: 'FT',
        });
        updatedCount++;

        this.logger.debug(
          `✅ Cập nhật status match ${String(match._id)}: ${match.status} -> FINISHED (${match.home_team.name} vs ${match.away_team.name})`,
        );
      }

      if (updatedCount > 0) {
        this.logger.log(
          `Đã cập nhật ${updatedCount} trận đấu thành FINISHED cho ngày ${date} (không có kết quả từ API)`,
        );
      } else {
        this.logger.debug(
          `Không có trận đấu nào cần cập nhật cho ngày ${date}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Lỗi khi cập nhật status cho các trận đấu không có kết quả ngày ${date}:`,
        error,
      );
    }
  }

  /**
   * Cập nhật kết quả trận đấu cho ngày hiện tại từ API result
   */
  async updateMatchResultForCurrentDay(): Promise<void> {
    const startTime = Date.now();
    try {
      // Lấy ngày hiện tại theo timezone Việt Nam
      const currentVietnamDate = TimezoneUtil.getCurrentVietnamTime();
      const currentDateString = TimezoneUtil.formatVietnamTime(
        currentVietnamDate,
        'dd-MM-yyyy',
      );

      this.logger.log(
        `🔄 Bắt đầu cập nhật kết quả trận đấu cho ngày hiện tại: ${currentDateString}`,
      );

      // Chỉ sync từ Result API cho ngày hiện tại
      await this.syncResultData(currentDateString);

      const duration = Date.now() - startTime;
      this.logger.log(
        `🎉 Hoàn thành cập nhật kết quả trận đấu cho ngày hiện tại trong ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `💥 Lỗi khi cập nhật kết quả trận đấu cho ngày hiện tại (${duration}ms):`,
        error,
      );
      throw error;
    }
  }

  private async syncSchedulerData(date: string): Promise<void> {
    try {
      const url = `https://api.keovip.cc/storage/scheduler/${date}.json`;

      this.logger.log(`🔄 Bắt đầu sync lịch thi đấu cho ngày ${date}`);
      this.logger.log(`📡 Gọi API: ${url}`);

      // Track API call
      this.syncStats.apiCalls.schedulerApi++;
      this.syncStats.apiCalls.totalApiCalls++;
      this.syncStats.apiCalls.lastApiCall = new Date();

      const response = await firstValueFrom(this.httpService.get(url));

      // Kiểm tra nếu response rỗng hoặc không có data
      if (
        !response.data ||
        !Array.isArray(response.data) ||
        response.data.length === 0
      ) {
        this.logger.warn(`⚠️ Không có dữ liệu lịch thi đấu cho ngày ${date}`);
        return;
      }

      this.logger.log(
        `📊 Nhận được ${response.data.length} giải đấu từ API scheduler`,
      );

      let totalMatches = 0;
      let syncedMatches = 0;
      let filteredLeagues = 0;
      let errorMatches = 0;

      for (const league of response.data) {
        if (!this.isValidLeague(league)) {
          filteredLeagues++;
          this.logger.debug(
            `🚫 Bỏ qua giải đấu không hợp lệ: ${league.name || 'Unknown'}`,
          );
          continue;
        }

        this.logger.log(
          `🏆 Xử lý giải đấu: ${league.name} (${league.items.length} ngày)`,
        );

        for (const dateGroup of league.items) {
          this.logger.debug(
            `📅 Xử lý ngày: ${dateGroup.title} (${dateGroup.items.length} trận)`,
          );

          for (const match of dateGroup.items) {
            totalMatches++;
            try {
              await this.upsertMatch(match, league, dateGroup);
              syncedMatches++;

              if (syncedMatches % 50 === 0) {
                this.logger.log(
                  `✅ Đã sync ${syncedMatches}/${totalMatches} matches...`,
                );
              }
            } catch (error) {
              errorMatches++;
              this.logger.warn(
                `❌ Lỗi sync match ${match.id}: ${error.message}`,
              );
            }
          }
        }
      }

      // Log kết quả tổng hợp
      this.logger.log(`🎯 Kết quả sync lịch thi đấu ${date}:`);
      this.logger.log(
        `   ✅ Thành công: ${syncedMatches}/${totalMatches} matches`,
      );
      this.logger.log(`   🚫 Bỏ qua: ${filteredLeagues} giải đấu không hợp lệ`);
      this.logger.log(`   ❌ Lỗi: ${errorMatches} matches`);
    } catch (error) {
      this.logger.error(
        `💥 Lỗi khi sync lịch thi đấu cho ngày ${date}:`,
        error,
      );
      throw error;
    }
  }

  async syncResultData(date: string): Promise<void> {
    try {
      const url = `https://api.keovip.cc/storage/result/${date}.json`;

      this.logger.log(`🔄 Bắt đầu sync kết quả trận đấu cho ngày ${date}`);
      this.logger.log(`📡 Gọi API: ${url}`);

      // Track API call
      this.syncStats.apiCalls.resultApi++;
      this.syncStats.apiCalls.totalApiCalls++;
      this.syncStats.apiCalls.lastApiCall = new Date();

      const response = await firstValueFrom(this.httpService.get(url));

      // Kiểm tra nếu response rỗng hoặc không có data
      if (
        !response.data ||
        !Array.isArray(response.data) ||
        response.data.length === 0
      ) {
        this.logger.warn(`⚠️ Không có dữ liệu kết quả cho ngày ${date}`);
        return;
      }

      this.logger.log(
        `📊 Nhận được ${response.data.length} giải đấu từ API result`,
      );

      let totalMatches = 0;
      let updatedMatches = 0;
      let filteredLeagues = 0;
      let errorMatches = 0;

      for (const league of response.data) {
        if (!this.isValidLeague(league)) {
          filteredLeagues++;
          this.logger.debug(
            `🚫 Bỏ qua giải đấu không hợp lệ: ${league.name || 'Unknown'}`,
          );
          continue;
        }

        this.logger.log(
          `🏆 Xử lý kết quả giải đấu: ${league.name} (${league.items.length} ngày)`,
        );

        for (const dateGroup of league.items) {
          this.logger.debug(
            `📅 Xử lý kết quả ngày: ${dateGroup.title} (${dateGroup.items.length} trận)`,
          );

          for (const match of dateGroup.items) {
            totalMatches++;
            try {
              await this.updateMatchResult(match, league, dateGroup);
              updatedMatches++;

              if (updatedMatches % 50 === 0) {
                this.logger.log(
                  `✅ Đã cập nhật ${updatedMatches}/${totalMatches} kết quả...`,
                );
              }
            } catch (error) {
              errorMatches++;
              this.logger.warn(
                `❌ Lỗi update kết quả match ${match.id}: ${error.message}`,
              );
            }
          }
        }
      }

      // Log kết quả tổng hợp
      this.logger.log(`🎯 Kết quả sync kết quả trận đấu ${date}:`);
      this.logger.log(
        `   ✅ Cập nhật thành công: ${updatedMatches}/${totalMatches} matches`,
      );
      this.logger.log(`   🚫 Bỏ qua: ${filteredLeagues} giải đấu không hợp lệ`);
      this.logger.log(`   ❌ Lỗi: ${errorMatches} matches`);
    } catch (error) {
      this.logger.error(
        `💥 Lỗi khi sync kết quả trận đấu cho ngày ${date}:`,
        error,
      );
      throw error;
    }
  }

  private isValidLeague(league: any): boolean {
    return (
      league.name &&
      league.name !== 'Không xác định' &&
      league.name.trim() !== ''
    );
  }

  private async upsertMatch(
    match: any,
    league: any,
    dateGroup: any,
  ): Promise<void> {
    // Lưu trực tiếp dateGroup.title vào match_date (format: "11/10/2025")
    const matchDateString = dateGroup.title; // "11/10/2025"

    const homeTeam = {
      id: match.teams.home.id.toString(),
      name: match.teams.home.name,
      logo: match.teams.home.logo || '',
      link: match.teams.home.link,
      coach: match.teams.home.coach || '',
      slug: match.teams.home.slug || '',
    };

    const awayTeam = {
      id: match.teams.away.id.toString(),
      name: match.teams.away.name,
      logo: match.teams.away.logo || '',
      link: match.teams.away.link,
      coach: match.teams.away.coach || '',
      slug: match.teams.away.slug || '',
    };

    const leagueData = {
      id: league.id,
      name: league.name,
      logo: league.logo || '',
      color: league.color,
      code: league.code,
    };

    // Xác định status dựa trên API
    const apiStatus = this.mapStatus(match.status_code || match.status);

    const matchData = {
      home_team: homeTeam,
      away_team: awayTeam,
      league: leagueData,
      match_time: match.time,
      match_date: matchDateString,
      status: apiStatus,
      status_code: match.status_code || match.status,
      home_score: 0, // Scheduler API không có score
      away_score: 0, // Scheduler API không có score
      is_active: true,
      is_featured: false,
      description: '',
      tags: [],
    };

    this.logger.debug(
      `⚽ Upsert match: ${homeTeam.name} vs ${awayTeam.name} (${matchDateString})`,
    );

    await this.matchModel.findOneAndUpdate(
      {
        'home_team.id': homeTeam.id,
        'away_team.id': awayTeam.id,
        match_date: matchDateString,
      },
      matchData,
      { upsert: true, new: true },
    );
  }

  private async updateMatchResult(
    match: any,
    league: any,
    dateGroup: any,
  ): Promise<void> {
    // Lưu trực tiếp dateGroup.title vào match_date (format: "07/10/2025")
    const matchDateString = dateGroup.title; // "07/10/2025"

    // Tìm match hiện tại trong database
    const existingMatch = await this.matchModel.findOne({
      'home_team.id': match.teams.home.id.toString(),
      'away_team.id': match.teams.away.id.toString(),
      match_date: matchDateString,
    });

    if (!existingMatch) {
      this.logger.warn(
        `⚠️ Không tìm thấy match để cập nhật kết quả, tạo match mới từ API result: ${match.teams.home.name} vs ${match.teams.away.name} (${matchDateString})`,
      );

      // Tạo match mới từ API result data
      await this.createMatchFromResultData(match, league, dateGroup);
      return;
    }

    // Xác định status dựa trên API
    const apiStatus = this.mapStatus(match.status_code || match.status);

    // Lấy score từ API result
    const homeScore = match.score?.fulltime?.home
      ? parseInt(match.score.fulltime.home)
      : 0;
    const awayScore = match.score?.fulltime?.away
      ? parseInt(match.score.fulltime.away)
      : 0;

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {
      home_score: homeScore,
      away_score: awayScore,
    };

    // Điều kiện 1: Không ghi lại status, status_code nếu match có stream_key_id
    if (existingMatch.stream_key_id) {
      this.logger.debug(
        `🔒 Match có stream_key_id, không cập nhật status: ${match.teams.home.name} vs ${match.teams.away.name}`,
      );
    } else if (apiStatus === MatchStatus.LIVE) {
      // Điều kiện 2: Không ghi lại status, status_code nếu API trả về LIVE
      this.logger.debug(
        `🔴 API trả về LIVE, không cập nhật status: ${match.teams.home.name} vs ${match.teams.away.name}`,
      );
    } else {
      // Chỉ cập nhật status khi không có stream_key_id và không phải LIVE
      updateData.status = apiStatus;
      updateData.status_code = match.status_code || match.status;
    }

    this.logger.debug(
      `🏆 Update result: ${match.teams.home.name} ${homeScore}-${awayScore} ${match.teams.away.name} (${matchDateString})`,
    );

    await this.matchModel.findByIdAndUpdate(existingMatch._id, updateData, {
      new: true,
    });
  }

  /**
   * Tạo match mới từ API result data khi không tìm thấy match trong database
   */
  private async createMatchFromResultData(
    match: any,
    league: any,
    dateGroup: any,
  ): Promise<void> {
    // Lưu trực tiếp dateGroup.title vào match_date (format: "07/10/2025")
    const matchDateString = dateGroup.title; // "07/10/2025"

    const homeTeam = {
      id: match.teams.home.id.toString(),
      name: match.teams.home.name,
      logo: match.teams.home.logo || '',
      link: match.teams.home.link,
      coach: match.teams.home.coach || '',
      slug: match.teams.home.slug || '',
    };

    const awayTeam = {
      id: match.teams.away.id.toString(),
      name: match.teams.away.name,
      logo: match.teams.away.logo || '',
      link: match.teams.away.link,
      coach: match.teams.away.coach || '',
      slug: match.teams.away.slug || '',
    };

    const leagueData = {
      id: league.id,
      name: league.name,
      logo: league.logo || '',
      color: league.color,
      code: league.code,
    };

    // Xác định status dựa trên API
    const apiStatus = this.mapStatus(match.status_code || match.status);

    // Lấy score từ API result
    const homeScore = match.score?.fulltime?.home
      ? parseInt(match.score.fulltime.home)
      : 0;
    const awayScore = match.score?.fulltime?.away
      ? parseInt(match.score.fulltime.away)
      : 0;

    const matchData = {
      home_team: homeTeam,
      away_team: awayTeam,
      league: leagueData,
      match_time: match.time,
      match_date: matchDateString,
      status: apiStatus,
      status_code: match.status_code || match.status,
      home_score: homeScore,
      away_score: awayScore,
      is_active: true,
      is_featured: false,
      description: '',
      tags: [],
    };

    this.logger.debug(
      `⚽ Tạo match mới từ API result: ${homeTeam.name} ${homeScore}-${awayScore} ${awayTeam.name} (${matchDateString})`,
    );

    await this.matchModel.findOneAndUpdate(
      {
        'home_team.id': homeTeam.id,
        'away_team.id': awayTeam.id,
        match_date: matchDateString,
      },
      matchData,
      { upsert: true, new: true },
    );
  }

  private mapStatus(status: string): MatchStatus {
    switch (status?.toLowerCase()) {
      case 'ns':
      case 'not_started':
        return MatchStatus.NOT_STARTED;
      case 'live':
      case '1h':
      case '2h':
      case 'ht': // Half time
      case 'et': // Extra time
        return MatchStatus.LIVE;
      case 'ft':
      case 'finished':
      case 'aet': // After extra time
      case 'pen': // Penalties
      case 'kết thúc': // Vietnamese "finished"
        return MatchStatus.FINISHED;
      case 'cancelled':
      case 'canceled':
      case 'postponed':
      case 'canc': // Status code cho trận đấu bị hủy bỏ
      case 'hủy bỏ': // Vietnamese "cancelled"
      case 'pst': // Status code cho trận đấu bị hoãn
      case 'hoãn': // Vietnamese "postponed"
        return MatchStatus.CANCELLED;
      default:
        return MatchStatus.SCHEDULED;
    }
  }

  /**
   * Chuyển đổi MatchStatus thành status code
   */
  private getStatusCode(status: MatchStatus): string {
    switch (status) {
      case MatchStatus.NOT_STARTED:
        return 'NS';
      case MatchStatus.LIVE:
        return 'LIVE';
      case MatchStatus.FINISHED:
        return 'FT';
      case MatchStatus.CANCELLED:
        return 'CANCELLED';
      default:
        return 'SCHEDULED';
    }
  }

  /**
   * Cập nhật status thành CANCELLED cho các trận đấu đã qua giờ hiện tại
   * nhưng không tìm thấy trong API result
   */
  async cancelMatchesNotInAPI(): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.log(
        '🔄 Bắt đầu cập nhật status CANCELLED cho các trận đấu không có trong API',
      );

      // Lấy ngày hiện tại theo timezone Việt Nam
      const currentVietnamTime = TimezoneUtil.getCurrentVietnamTime();
      const currentDateString = TimezoneUtil.formatVietnamTime(
        currentVietnamTime,
        'dd/MM/yyyy',
      );

      // Lấy thời gian hiện tại (chỉ giờ:phút)
      const currentTimeString = TimezoneUtil.formatVietnamTime(
        currentVietnamTime,
        'HH:mm',
      );

      this.logger.log(
        `📅 Kiểm tra các trận đấu ngày ${currentDateString} đã qua giờ ${currentTimeString}`,
      );

      // Tìm các trận đấu trong ngày hiện tại có:
      // 1. Status không phải FINISHED, CANCELLED
      // 2. Match time đã qua giờ hiện tại
      // 3. Không có stream_key_id (trận đấu thường)
      const matches = await this.matchModel.find({
        match_date: currentDateString,
        is_active: true,
        status: { $nin: [MatchStatus.FINISHED, MatchStatus.CANCELLED] },
      });

      let cancelledCount = 0;
      const currentTimeMinutes = this.timeToMinutes(currentTimeString);

      for (const match of matches) {
        const matchTimeMinutes = this.timeToMinutes(match.match_time);

        // Nếu trận đấu đã qua giờ hiện tại (quá 3h)
        if (matchTimeMinutes < currentTimeMinutes - 180) {
          // Cập nhật status thành CANCELLED
          await this.matchModel.findByIdAndUpdate(match._id, {
            status: MatchStatus.CANCELLED,
            status_code: 'CANCELLED',
          });
          cancelledCount++;

          this.logger.log(
            `❌ Cập nhật status CANCELLED cho match ${String(match._id)}: ${match.home_team.name} vs ${match.away_team.name} (${match.match_time})`,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Hoàn thành cập nhật status CANCELLED: ${cancelledCount} trận đấu trong ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `💥 Lỗi khi cập nhật status CANCELLED (${duration}ms):`,
        error,
      );
    }
  }

  /**
   * Chuyển đổi thời gian từ format "HH:mm" thành số phút
   */
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Cập nhật tỉ số real-time từ live.json API
   * Tối ưu hóa cho việc gọi liên tục mỗi phút
   */
  async updateLiveScores(): Promise<LiveScoreUpdateResponseDto> {
    const startTime = Date.now();
    let totalMatches = 0;
    let updatedMatches = 0;
    let skippedMatches = 0;
    let apiErrors = 0;

    try {
      this.logger.debug('🚀 Bắt đầu cập nhật tỉ số real-time từ live.json API');

      // Fetch data từ live.json API với timeout ngắn hơn
      const liveApiUrl = 'https://api.keovip.cc/storage/live.json';
      const timestamp = Date.now();

      // Track API call
      this.syncStats.apiCalls.totalApiCalls++;
      this.syncStats.apiCalls.lastApiCall = new Date();

      const response = await firstValueFrom(
        this.httpService.get(`${liveApiUrl}?t=${timestamp}`, {
          timeout: 10000, // 10 giây timeout
        }),
      );

      const leaguesData = response.data;

      // Kiểm tra nếu không có dữ liệu
      if (
        !leaguesData ||
        !Array.isArray(leaguesData) ||
        leaguesData.length === 0
      ) {
        this.logger.debug('⚠️ Không có dữ liệu live từ API');
        return {
          success: true,
          message: 'Không có dữ liệu live để cập nhật',
          data: {
            totalMatches: 0,
            updatedMatches: 0,
            skippedMatches: 0,
          },
        };
      }

      this.logger.debug(`📊 Nhận được ${leaguesData.length} leagues từ API`);

      // Chỉ xử lý các trận đấu LIVE trong ngày hiện tại để tối ưu performance
      const currentVietnamTime = TimezoneUtil.getCurrentVietnamTime();
      const currentDateString = TimezoneUtil.formatVietnamTime(
        currentVietnamTime,
        'dd/MM/yyyy',
      );

      // Loop qua tất cả leagues và matches
      for (const league of leaguesData) {
        if (!this.isValidLeague(league)) {
          continue;
        }

        for (const dateGroup of league.items) {
          const matchDate = dateGroup.title; // Format: "13/10/2025"

          // Chỉ xử lý ngày hiện tại để tối ưu performance
          if (matchDate !== currentDateString) {
            continue;
          }

          for (const apiMatch of dateGroup.items) {
            totalMatches++;

            try {
              // Tìm match trong database với điều kiện matching
              const existingMatch = await this.matchModel
                .findOne({
                  'home_team.id': apiMatch.teams.home.id.toString(),
                  'away_team.id': apiMatch.teams.away.id.toString(),
                  match_time: apiMatch.time,
                  match_date: matchDate,
                  status_code: { $regex: /^live$/i }, // Case insensitive match với 'live'
                })
                .exec();

              if (existingMatch) {
                // Parse score từ API
                const homeScore = parseInt(apiMatch.score?.fulltime?.home) || 0;
                const awayScore = parseInt(apiMatch.score?.fulltime?.away) || 0;

                // Chỉ cập nhật nếu tỉ số thay đổi
                if (
                  existingMatch.home_score !== homeScore ||
                  existingMatch.away_score !== awayScore
                ) {
                  await this.matchModel.findByIdAndUpdate(existingMatch._id, {
                    $set: {
                      home_score: homeScore,
                      away_score: awayScore,
                    },
                  });

                  updatedMatches++;
                  this.logger.debug(
                    `✅ Cập nhật tỉ số: ${apiMatch.teams.home.name} ${homeScore}-${awayScore} ${apiMatch.teams.away.name} (${matchDate} ${apiMatch.time})`,
                  );
                } else {
                  skippedMatches++;
                }
              } else {
                skippedMatches++;
                this.logger.debug(
                  `⏭️ Bỏ qua match: ${apiMatch.teams.home.name} vs ${apiMatch.teams.away.name} (${matchDate} ${apiMatch.time}) - Không tìm thấy trong DB hoặc không phải LIVE`,
                );
              }
            } catch (matchError) {
              apiErrors++;
              this.logger.warn(
                `⚠️ Lỗi khi xử lý match ${apiMatch.teams.home.name} vs ${apiMatch.teams.away.name}:`,
                matchError.message,
              );
            }
          }
        }
      }

      const duration = Date.now() - startTime;

      // Chỉ log chi tiết nếu có cập nhật hoặc lỗi
      if (updatedMatches > 0 || apiErrors > 0) {
        this.logger.log(
          `🎉 Hoàn thành cập nhật tỉ số real-time trong ${duration}ms - Tổng: ${totalMatches}, Cập nhật: ${updatedMatches}, Bỏ qua: ${skippedMatches}, Lỗi: ${apiErrors}`,
        );
      } else {
        this.logger.debug(
          `✅ Cập nhật tỉ số real-time hoàn thành trong ${duration}ms - Không có thay đổi`,
        );
      }

      return {
        success: true,
        message: `Cập nhật tỉ số thành công - ${updatedMatches}/${totalMatches} trận đấu`,
        data: {
          totalMatches,
          updatedMatches,
          skippedMatches,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `💥 Lỗi khi cập nhật tỉ số real-time (${duration}ms):`,
        error.message,
      );

      return {
        success: false,
        message: `Lỗi khi cập nhật tỉ số: ${error.message}`,
        data: {
          totalMatches,
          updatedMatches,
          skippedMatches,
        },
      };
    }
  }
}
