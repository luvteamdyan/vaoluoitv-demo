import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Match, MatchDocument, MatchStatus } from '@/schemas/match.schema';
import { CreateMatchDto } from '@/matches/dto/create-match.dto';
import { UpdateMatchDto } from '@/matches/dto/update-match.dto';
import { DeleteMatchesFilterDto } from '@/matches/dto/delete-matches-filter.dto';
import { StreamKeysService } from '@/stream-keys/stream-keys.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private streamKeysService: StreamKeysService,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    // Create the match
    const match = new this.matchModel(createMatchDto);
    return await match.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: MatchStatus,
    league_id?: string,
    team_id?: string,
    search?: string,
    date?: string,
    featured?: string,
    type?: string,
    is_active?: string,
    sort?: string,
    sort_by?: string,
    has_commentator?: string,
  ): Promise<{
    matches: Match[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: FilterQuery<MatchDocument> = {};

    // Base filtering
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    } else {
      query.is_active = true; // Default to active matches
    }

    // Status filtering
    if (status) {
      query.status = status;
    }

    // League filtering
    if (league_id) {
      query['league.id'] = league_id;
    }

    // Team filtering (home or away)
    if (team_id) {
      query.$or = [{ 'home_team.id': team_id }, { 'away_team.id': team_id }];
    }

    // Featured filtering
    if (featured !== undefined) {
      query.is_featured = featured === 'true';
    }

    // Type filtering
    if (type) {
      query.type = type as any;
    }

    // Date filtering - exact string match
    if (date) {
      // Check if date is already in DD/MM/YYYY format or needs conversion
      let matchDateString = '';

      if (date.includes('/')) {
        // Already in DD/MM/YYYY format
        matchDateString = date;
      } else if (date.includes('-')) {
        // Convert YYYY-MM-DD to DD/MM/YYYY format
        matchDateString = this.convertDateFormat(date);
      }

      if (matchDateString) {
        query.match_date = matchDateString;
      }
    }

    // Has commentator filter (has stream_key_id)
    if (has_commentator !== undefined) {
      if (has_commentator === 'true') {
        query.stream_key_id = { $exists: true, $ne: null };
      } else if (has_commentator === 'false') {
        query.$or = [
          { stream_key_id: null },
          { stream_key_id: { $exists: false } },
        ];
      }
    }

    // Search functionality
    if (search) {
      const searchConditions = [
        { 'home_team.name': { $regex: search, $options: 'i' } },
        { 'away_team.name': { $regex: search, $options: 'i' } },
        { 'league.name': { $regex: search, $options: 'i' } },
        { 'home_team.coach': { $regex: search, $options: 'i' } },
        { 'away_team.coach': { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];

      if (query.$or) {
        // If team_id filter exists, combine with search
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Determine sort field and direction
    const sortField = sort_by || 'match_date'; // Default to match_date
    const sortDirection = sort === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [matches, total] = await Promise.all([
      // Use aggregation để custom sort theo priority
      this.matchModel.aggregate([
        { $match: query },
        {
          $addFields: {
            has_commentator_priority: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$stream_key_id', null] },
                    { $ne: ['$stream_key_id', {}] },
                    { $ne: [{ $type: '$stream_key_id' }, 'missing'] },
                  ],
                },
                1, // Có bình luận viên - ưu tiên cao nhất
                0, // Không có bình luận viên - ưu tiên thấp
              ],
            },
            status_priority: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'live'] }, then: 4 }, // LIVE - cao nhất
                  { case: { $eq: ['$status', 'scheduled'] }, then: 3 }, // SCHEDULED
                  { case: { $eq: ['$status', 'not_started'] }, then: 2 }, // NOT_STARTED
                  { case: { $eq: ['$status', 'finished'] }, then: 1 }, // FINISHED - thấp nhất
                ],
                default: 0, // Các status khác
              },
            },
            // Convert match_date (DD/MM/YYYY) and match_time (HH:MM) to sortable datetime
            match_datetime_sort: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ['$match_date', null] },
                    { $ne: ['$match_date', ''] },
                    { $ne: [{ $type: '$match_date' }, 'missing'] },
                    { $ne: ['$match_time', null] },
                    { $ne: ['$match_time', ''] },
                    { $ne: [{ $type: '$match_time' }, 'missing'] },
                  ],
                },
                then: {
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        // Extract year from match_date (DD/MM/YYYY -> YYYY)
                        {
                          $arrayElemAt: [
                            { $split: [{ $toString: '$match_date' }, '/'] },
                            2,
                          ],
                        },
                        '-',
                        // Extract month from match_date (DD/MM/YYYY -> MM)
                        {
                          $arrayElemAt: [
                            { $split: [{ $toString: '$match_date' }, '/'] },
                            1,
                          ],
                        },
                        '-',
                        // Extract day from match_date (DD/MM/YYYY -> DD)
                        {
                          $arrayElemAt: [
                            { $split: [{ $toString: '$match_date' }, '/'] },
                            0,
                          ],
                        },
                        'T',
                        { $toString: '$match_time' },
                        ':00.000Z',
                      ],
                    },
                    onError: new Date('1970-01-01T00:00:00.000Z'), // Fallback for invalid dates
                  },
                },
                else: new Date('1970-01-01T00:00:00.000Z'), // Fallback for null/undefined
              },
            },
          },
        },
        {
          $sort: {
            has_commentator_priority: -1, // Trận có bình luận viên trước
            status_priority: -1, // Sau đó sort theo status priority
            // Use computed datetime for proper chronological sorting
            ...(sortField === 'match_date' || sortField === 'match_time'
              ? { match_datetime_sort: sortDirection }
              : { [sortField]: sortDirection }),
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'streamkeys',
            localField: 'stream_key_id',
            foreignField: '_id',
            as: 'stream_key_id',
            pipeline: [{ $limit: 1 }], // Chỉ lấy 1 stream key
          },
        },
        {
          $unwind: { path: '$stream_key_id', preserveNullAndEmptyArrays: true },
        },
        {
          $unset: [
            'has_commentator_priority',
            'status_priority',
            'match_datetime_sort',
          ],
        }, // Remove virtual fields
      ]),
      this.matchModel.countDocuments(query),
    ]);

    // Nếu có stream_key_id, lấy thông tin đầy đủ từ StreamKeysService
    const matchesWithStreamKeys = await Promise.all(
      matches.map(async (match) => {
        if (match.stream_key_id && typeof match.stream_key_id === 'object') {
          try {
            const streamKeyId =
              match.stream_key_id._id?.toString() || match.stream_key_id.id;
            const fullStreamKey = await this.streamKeysService.findOne(
              streamKeyId as string,
            );
            match.stream_key_id = fullStreamKey;
          } catch (_error) {
            // Ignore error, stream_key will be null
          }
        }
        return match;
      }),
    );

    return {
      matches: matchesWithStreamKeys,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchModel
      .findById(id)
      .populate('stream_key_id')
      .lean()
      .exec();

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Nếu có stream_key_id, lấy thông tin đầy đủ từ StreamKeysService
    if (match.stream_key_id && typeof match.stream_key_id === 'object') {
      try {
        const streamKeyId =
          match.stream_key_id._id?.toString() || match.stream_key_id.id;
        const fullStreamKey = await this.streamKeysService.findOne(
          streamKeyId as string,
        );
        (match as any).stream_key_id = fullStreamKey;
      } catch (_error) {
        // Ignore error, stream_key will be null
      }
    }

    return match as any;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    // Nếu có cập nhật status, tự động cập nhật status_code tương ứng
    if (updateMatchDto.status && !updateMatchDto.status_code) {
      updateMatchDto.status_code = this.mapStatusToStatusCode(
        updateMatchDto.status,
      );
    }

    const match = await this.matchModel
      .findByIdAndUpdate(id, updateMatchDto, { new: true })
      .exec();
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    return match;
  }

  /**
   * Map MatchStatus enum to corresponding status_code
   */
  private mapStatusToStatusCode(status: MatchStatus): string {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return 'SCHEDULED';
      case MatchStatus.LIVE:
        return 'LIVE';
      case MatchStatus.FINISHED:
        return 'FT';
      case MatchStatus.CANCELLED:
        return 'CANCELLED';
      case MatchStatus.NOT_STARTED:
        return 'NS';
      default:
        return 'SCHEDULED';
    }
  }

  async remove(id: string): Promise<{
    deletedMatch: boolean;
    message: string;
  }> {
    // Check if match exists
    const match = await this.matchModel.findById(id).exec();
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    try {
      // Hard delete the match only
      await this.matchModel.findByIdAndDelete(id).exec();

      return {
        deletedMatch: true,
        message: 'Successfully deleted match',
      };
    } catch (error) {
      throw new Error(`Failed to delete match: ${error.message}`);
    }
  }

  /**
   * Hard delete matches theo filter (Admin only)
   */
  async deleteHardMatchesByFilter(filter: DeleteMatchesFilterDto): Promise<{
    deletedCount: number;
    message: string;
    duration: number;
  }> {
    const startTime = Date.now();

    // Kiểm tra confirmation
    if (!filter.confirm) {
      throw new BadRequestException(
        'Confirmation is required for hard delete operation',
      );
    }

    // Xây dựng query filter
    const query: FilterQuery<MatchDocument> = {};

    // Filter theo status
    if (filter.status) {
      query.status = filter.status;
    }

    // Filter theo type
    if (filter.type) {
      query.type = filter.type;
    }

    // Filter theo league_id
    if (filter.league_id) {
      query['league.id'] = filter.league_id;
    }

    // Filter theo team_id (home hoặc away)
    if (filter.team_id) {
      query.$or = [
        { 'home_team.id': filter.team_id },
        { 'away_team.id': filter.team_id },
      ];
    }

    // Filter theo inactive_only
    if (filter.inactive_only) {
      query.is_active = false;
    }

    // Filter theo non_featured_only
    if (filter.non_featured_only) {
      query.is_featured = false;
    }

    // Filter theo specific match IDs
    if (filter.match_ids && filter.match_ids.length > 0) {
      query._id = { $in: filter.match_ids };
    }

    // Thực hiện hard delete
    const result = await this.matchModel.deleteMany(query).exec();

    const duration = Date.now() - startTime;

    return {
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} matches`,
      duration,
    };
  }

  /**
   * Kiểm tra xem match có streamkey active không
   */
  private async hasActiveStreamKey(matchId: string): Promise<boolean> {
    try {
      const activeStreamKey =
        await this.streamKeysService.findActiveByMatchId(matchId);
      return !!activeStreamKey;
    } catch (_error) {
      // Nếu có lỗi khi kiểm tra streamkey, coi như không có streamkey active
      return false;
    }
  }

  /**
   * Cập nhật trạng thái matches dựa trên thời gian hiện tại
   * Bỏ qua các matches đã có streamkey hoặc is_featured = true
   */
  async updateMatchStatusByTime(): Promise<{
    updatedCount: number;
    message: string;
    duration: number;
  }> {
    const startTime = Date.now();
    const now = new Date();

    // Buffer time để tránh update quá sớm (5 phút)
    const bufferMinutes = 5;
    const bufferTime = new Date(now.getTime() - bufferMinutes * 60 * 1000);

    // Buffer time để coi trận đấu là finished (90 phút sau giờ bắt đầu)
    const finishedBufferMinutes = 90;
    const finishedBufferTime = new Date(
      now.getTime() - finishedBufferMinutes * 60 * 1000,
    );

    let updatedCount = 0;
    const skippedMatches = 0;
    let skippedFeaturedMatches = 0;
    let skippedStreamKeyMatches = 0;

    try {
      // 1. Lấy tất cả matches SCHEDULED/NOT_STARTED để kiểm tra từng cái
      const allMatchesToCheck = await this.matchModel
        .find({
          status: { $in: [MatchStatus.SCHEDULED, MatchStatus.NOT_STARTED] },
          is_active: true,
          is_featured: { $ne: true }, // Bỏ qua featured matches
        })
        .exec();

      // 2. Kiểm tra từng match có streamkey active và thời gian
      for (const match of allMatchesToCheck) {
        // Kiểm tra lại is_featured để đảm bảo
        if (match.is_featured) {
          skippedFeaturedMatches++;
          continue;
        }

        // Kiểm tra lại streamkey để đảm bảo
        const hasStreamKey = await this.hasActiveStreamKey(
          (match._id as any).toString(),
        );

        if (hasStreamKey) {
          skippedStreamKeyMatches++;
          continue;
        }

        // Kiểm tra thời gian match với buffer time
        const matchDateTime = this.parseMatchDate(match.match_date);
        const matchTimeWithBuffer = new Date(
          matchDateTime.getTime() + bufferMinutes * 60 * 1000,
        );

        if (now >= matchTimeWithBuffer) {
          // Cập nhật thành LIVE
          await this.matchModel.findByIdAndUpdate(match._id, {
            $set: {
              status: MatchStatus.LIVE,
              status_code: 'LIVE',
            },
          });
          updatedCount++;
        }
      }

      // 3. Cập nhật matches từ LIVE thành FINISHED
      const liveMatches = await this.matchModel
        .find({
          status: MatchStatus.LIVE,
          is_active: true,
          is_featured: { $ne: true },
        })
        .exec();

      for (const match of liveMatches) {
        // Kiểm tra lại streamkey để đảm bảo
        const hasStreamKey = await this.hasActiveStreamKey(
          (match._id as any).toString(),
        );

        if (hasStreamKey) {
          continue;
        }

        // Kiểm tra thời gian match với finished buffer time
        const matchDateTime = this.parseMatchDate(match.match_date);
        const matchTimeWithFinishedBuffer = new Date(
          matchDateTime.getTime() + finishedBufferMinutes * 60 * 1000,
        );

        if (now >= matchTimeWithFinishedBuffer) {
          await this.matchModel.findByIdAndUpdate(match._id, {
            $set: {
              status: MatchStatus.FINISHED,
              status_code: 'FT',
            },
          });
          updatedCount++;
        }
      }

      // 4. Cập nhật matches từ SCHEDULED/NOT_STARTED thành FINISHED (những match không có streamkey và đã qua thời gian finished)
      for (const match of allMatchesToCheck) {
        // Kiểm tra lại is_featured và streamkey
        if (match.is_featured) {
          continue;
        }

        const hasStreamKey = await this.hasActiveStreamKey(
          (match._id as any).toString(),
        );

        if (hasStreamKey) {
          continue;
        }

        // Kiểm tra thời gian match với finished buffer time
        const matchDateTime = this.parseMatchDate(match.match_date);
        const matchTimeWithFinishedBuffer = new Date(
          matchDateTime.getTime() + finishedBufferMinutes * 60 * 1000,
        );

        if (now >= matchTimeWithFinishedBuffer) {
          await this.matchModel.findByIdAndUpdate(match._id, {
            $set: {
              status: MatchStatus.FINISHED,
              status_code: 'FT',
            },
          });
          updatedCount++;
        }
      }

      const duration = Date.now() - startTime;

      return {
        updatedCount,
        message: `Successfully updated ${updatedCount} matches status (${skippedMatches} matches skipped due to no active streamkey, ${skippedFeaturedMatches} featured matches, ${skippedStreamKeyMatches} matches with streamkey)`,
        duration,
      };
    } catch (error) {
      throw new Error(`Failed to update match status: ${error.message}`);
    }
  }

  async findByStreamKey(streamKeyId: string): Promise<{
    matches: Match[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Get the stream key to find its assigned matches
    const streamKey = await this.streamKeysService.findOne(streamKeyId);

    if (!streamKey || !streamKey.matches || streamKey.matches.length === 0) {
      return {
        matches: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }

    // Get all matches assigned to this stream key
    const matches = await this.matchModel
      .find({ _id: { $in: streamKey.matches } })
      .lean()
      .exec();

    return {
      matches,
      total: matches.length,
      page: 1,
      limit: matches.length,
      totalPages: 1,
    };
  }

  /**
   * Find active stream key for a specific match
   */
  async findActiveStreamKeyForMatch(matchId: string): Promise<any> {
    return await this.streamKeysService.findActiveByMatchId(matchId);
  }

  /**
   * Convert YYYY-MM-DD to DD/MM/YYYY
   */
  private convertDateFormat(dateString: string): string {
    if (!dateString || typeof dateString !== 'string') {
      return '';
    }

    const parts = dateString.split('-');
    if (parts.length !== 3) {
      return '';
    }

    const [year, month, day] = parts;
    if (!year || !month || !day) {
      return '';
    }

    return `${day}/${month}/${year}`;
  }

  /**
   * Parse DD/MM/YYYY string to Date for comparison
   */
  private parseMatchDate(matchDateString: string): Date {
    const [day, month, year] = matchDateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Compare match date string with current date
   */
  private isMatchDatePast(
    matchDateString: string,
    bufferMinutes: number = 0,
  ): boolean {
    const matchDate = this.parseMatchDate(matchDateString);
    const now = new Date();
    const buffer = bufferMinutes * 60 * 1000;
    return now.getTime() - matchDate.getTime() > buffer;
  }

  /**
   * Create sortable datetime from match_date and match_time strings
   */
  private createSortableDateTime(matchDate: string, matchTime: string): Date {
    try {
      const [day, month, year] = matchDate.split('/').map(Number);
      const [hours, minutes] = matchTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, 0);
    } catch (error) {
      return new Date('1970-01-01T00:00:00.000Z');
    }
  }
}
