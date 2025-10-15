import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { StreamKey, StreamKeyDocument } from '@/schemas/stream-key.schema';
import { Match, MatchDocument, MatchStatus } from '@/schemas/match.schema';
import { User, UserDocument } from '@/schemas/user.schema';
import {
  CreateStreamKeyDto,
  UpdateStreamKeyDto,
  StopStreamDto,
} from '@/stream-keys/dto/create-stream-key.dto';
import { StreamKeyQueryDto } from '@/stream-keys/dto/stream-key-query.dto';

@Injectable()
export class StreamKeysService {
  constructor(
    @InjectModel(StreamKey.name)
    private streamKeyModel: Model<StreamKeyDocument>,
    @InjectModel(Match.name)
    public matchModel: Model<MatchDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(createStreamKeyDto: CreateStreamKeyDto): Promise<StreamKey> {
    // Check if user exists
    const userExists = await this.userModel.findById(
      createStreamKeyDto.user_id,
    );
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a stream key (1 user - 1 stream key)
    const existingUserStreamKey = await this.streamKeyModel.findOne({
      user_id: new Types.ObjectId(createStreamKeyDto.user_id),
    });

    if (existingUserStreamKey) {
      throw new BadRequestException('User already has a stream key');
    }

    // Check if key_value already exists
    const existingStreamKey = await this.streamKeyModel.findOne({
      key_value: createStreamKeyDto.key_value,
    });

    if (existingStreamKey) {
      throw new BadRequestException('Stream key value already exists');
    }

    // Validate matches (if provided)
    const matchIds: Types.ObjectId[] = [];
    if (createStreamKeyDto.matches && createStreamKeyDto.matches.length > 0) {
      for (const matchId of createStreamKeyDto.matches) {
        // Check if match exists
        const matchExists = await this.matchModel.findById(matchId);
        if (!matchExists) {
          throw new NotFoundException(`Match ${matchId} not found`);
        }

        // Check if match is already assigned to another active stream key
        const matchAlreadyAssigned = await this.streamKeyModel.findOne({
          matches: new Types.ObjectId(matchId),
          revoked_at: null,
        });

        if (matchAlreadyAssigned) {
          throw new BadRequestException(
            `Match ${matchId} is already assigned to another active stream key (${matchAlreadyAssigned.key_value})`,
          );
        }

        matchIds.push(new Types.ObjectId(matchId));
      }
    }

    const streamKey = new this.streamKeyModel({
      key_value: createStreamKeyDto.key_value,
      user_id: new Types.ObjectId(createStreamKeyDto.user_id),
      matches: matchIds,
      description: createStreamKeyDto.description,
      created_at: new Date(),
      revoked_at: null,
    });

    const savedStreamKey = await streamKey.save();

    // Update stream_key_id in all assigned matches
    if (matchIds.length > 0) {
      await this.matchModel.updateMany(
        { _id: { $in: matchIds } },
        { $set: { stream_key_id: savedStreamKey._id } },
      );
    }

    return savedStreamKey;
  }

  async findAll(query: StreamKeyQueryDto): Promise<{
    streamKeys: StreamKey[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, match_id, user_id, status } = query;

    const filter: FilterQuery<StreamKeyDocument> = {};

    if (user_id) {
      filter.user_id = new Types.ObjectId(user_id);
    }

    if (match_id) {
      filter.matches = new Types.ObjectId(match_id);
    }

    if (status === 'active') {
      filter.revoked_at = null;
    } else if (status === 'revoked') {
      filter.revoked_at = { $ne: null };
    }

    const skip = (page - 1) * limit;
    const [streamKeys, total] = await Promise.all([
      this.streamKeyModel
        .find(filter)
        .populate('user_id', 'username display_name email role')
        .populate(
          'matches',
          'home_team away_team match_date match_time status status_code',
        )
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.streamKeyModel.countDocuments(filter),
    ]);

    return {
      streamKeys,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<StreamKey> {
    const streamKey = await this.streamKeyModel
      .findById(id)
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .lean()
      .exec();

    if (!streamKey) {
      throw new NotFoundException('Stream key not found');
    }

    return streamKey as StreamKey;
  }

  async findByMatchId(matchId: string): Promise<StreamKey[]> {
    const streamKeys = await this.streamKeyModel
      .find({
        matches: new Types.ObjectId(matchId),
        revoked_at: null,
      })
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .sort({ created_at: -1 })
      .lean()
      .exec();

    return streamKeys as StreamKey[];
  }

  async findActiveByMatchId(matchId: string): Promise<StreamKey | null> {
    const streamKey = await this.streamKeyModel
      .findOne({
        matches: new Types.ObjectId(matchId),
        revoked_at: null,
      })
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .lean()
      .exec();

    return streamKey as StreamKey | null;
  }

  async update(
    id: string,
    updateStreamKeyDto: UpdateStreamKeyDto,
  ): Promise<StreamKey> {
    // Check if stream key exists
    const existingStreamKey = await this.streamKeyModel.findById(id).exec();
    if (!existingStreamKey) {
      throw new NotFoundException('Stream key not found');
    }

    const updateData: UpdateQuery<StreamKeyDocument> = {};

    if (updateStreamKeyDto.key_value) {
      // Check if key_value already exists
      const duplicateKey = await this.streamKeyModel.findOne({
        key_value: updateStreamKeyDto.key_value,
        _id: { $ne: id },
      });

      if (duplicateKey) {
        throw new BadRequestException('Stream key value already exists');
      }

      updateData.key_value = updateStreamKeyDto.key_value;
    }

    if (updateStreamKeyDto.description !== undefined) {
      updateData.description = updateStreamKeyDto.description;
    }

    const streamKey = await this.streamKeyModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .exec();

    if (!streamKey) {
      throw new NotFoundException('Stream key not found');
    }

    return streamKey;
  }

  async revoke(id: string): Promise<StreamKey> {
    // Get stream key first to access matches
    const existingStreamKey = await this.streamKeyModel.findById(id).exec();
    if (!existingStreamKey) {
      throw new NotFoundException('Stream key not found');
    }

    // Remove stream_key_id from all associated matches since key is being revoked
    if (existingStreamKey.matches && existingStreamKey.matches.length > 0) {
      await this.matchModel.updateMany(
        { _id: { $in: existingStreamKey.matches } },
        { $set: { stream_key_id: null } },
      );
    }

    const streamKey = await this.streamKeyModel
      .findByIdAndUpdate(id, { revoked_at: new Date() }, { new: true })
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .exec();

    if (!streamKey) {
      throw new NotFoundException('Stream key not found');
    }

    return streamKey;
  }

  async remove(id: string): Promise<void> {
    const streamKey = await this.streamKeyModel.findById(id).exec();
    if (!streamKey) {
      throw new NotFoundException('Stream key not found');
    }

    // Remove stream_key_id from all associated matches
    if (streamKey.matches && streamKey.matches.length > 0) {
      await this.matchModel.updateMany(
        { _id: { $in: streamKey.matches } },
        { $set: { stream_key_id: null } },
      );
    }

    // Remove stream key from database
    await this.streamKeyModel.findByIdAndDelete(id).exec();
  }

  async validateStreamKey(
    keyValue: string,
    matchId: string,
    userId: string,
  ): Promise<boolean> {
    // Check if stream key exists and is not revoked
    const streamKey = await this.streamKeyModel
      .findOne({
        key_value: keyValue,
        user_id: new Types.ObjectId(userId),
        matches: new Types.ObjectId(matchId),
        revoked_at: null,
      })
      .exec();

    if (!streamKey) {
      return false;
    }

    // Check if match exists and update status to LIVE
    const matchExists = await this.matchModel.findById(matchId);

    if (matchExists) {
      // Update match status to LIVE
      await this.matchModel.findByIdAndUpdate(
        matchId,
        { status: MatchStatus.LIVE, status_code: 'LIVE' },
        { new: true },
      );
    }

    return true;
  }

  async stopStream(stopStreamDto: StopStreamDto): Promise<{ message: string }> {
    // Check if match exists
    const matchExists = await this.matchModel.findById(stopStreamDto.match_id);

    if (!matchExists) {
      throw new NotFoundException('Match not found');
    }

    // Update match status to FINISHED
    await this.matchModel.findByIdAndUpdate(
      stopStreamDto.match_id,
      { status: MatchStatus.FINISHED, status_code: 'FT' },
      { new: true },
    );

    return { message: 'Stream stopped successfully' };
  }

  /**
   * Update match status and status_code
   */
  async updateMatchStatus(
    matchId: string,
    status: MatchStatus,
    statusCode: string,
  ): Promise<{ message: string }> {
    // Check if match exists
    const matchExists = await this.matchModel.findById(matchId);

    if (!matchExists) {
      throw new NotFoundException('Match not found');
    }

    // Update match status and status_code
    await this.matchModel.findByIdAndUpdate(
      matchId,
      { status, status_code: statusCode },
      { new: true },
    );

    return { message: `Match status updated to ${status} (${statusCode})` };
  }

  /**
   * Find stream key by key value for authentication
   */
  async findByKeyValue(keyValue: string): Promise<StreamKey | null> {
    const streamKey = await this.streamKeyModel
      .findOne({
        key_value: keyValue,
        revoked_at: null,
      })
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .lean()
      .exec();

    return streamKey as StreamKey | null;
  }

  /**
   * Delete all stream keys associated with a specific match
   */
  async deleteByMatchId(matchId: string): Promise<{ deletedCount: number }> {
    // Remove stream_key_id from the match first
    await this.matchModel.updateOne(
      { _id: new Types.ObjectId(matchId) },
      { $set: { stream_key_id: null } },
    );

    const result = await this.streamKeyModel
      .deleteMany({
        matches: new Types.ObjectId(matchId),
      })
      .exec();

    return {
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Add matches to stream key
   */
  async addMatches(id: string, matchIds: string[]): Promise<StreamKey> {
    const streamKey = await this.streamKeyModel.findById(id).exec();
    if (!streamKey) {
      throw new NotFoundException('Stream key not found');
    }

    if (streamKey.revoked_at) {
      throw new BadRequestException('Cannot add matches to revoked stream key');
    }

    // Validate and add new matches
    const newMatchIds: Types.ObjectId[] = [];
    for (const matchId of matchIds) {
      // Check if match exists
      const matchExists = await this.matchModel.findById(matchId);
      if (!matchExists) {
        throw new NotFoundException(`Match ${matchId} not found`);
      }

      // Check if match is already in this stream key
      const alreadyInStreamKey = streamKey.matches.some(
        (m) => m.toString() === matchId,
      );
      if (alreadyInStreamKey) {
        throw new BadRequestException(
          `Match ${matchId} is already in this stream key`,
        );
      }

      // Check if match is already assigned to another active stream key
      const matchAlreadyAssigned = await this.streamKeyModel.findOne({
        matches: new Types.ObjectId(matchId),
        revoked_at: null,
        _id: { $ne: id },
      });

      if (matchAlreadyAssigned) {
        throw new BadRequestException(
          `Match ${matchId} is already assigned to another active stream key (${matchAlreadyAssigned.key_value})`,
        );
      }

      newMatchIds.push(new Types.ObjectId(matchId));
    }

    // Add matches to stream key
    const updatedStreamKey = await this.streamKeyModel
      .findByIdAndUpdate(
        id,
        { $push: { matches: { $each: newMatchIds } } },
        { new: true },
      )
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .exec();

    if (!updatedStreamKey) {
      throw new NotFoundException('Stream key not found after update');
    }

    // Update stream_key_id in all newly added matches
    await this.matchModel.updateMany(
      { _id: { $in: newMatchIds } },
      { $set: { stream_key_id: new Types.ObjectId(id) } },
    );

    return updatedStreamKey;
  }

  /**
   * Remove matches from stream key
   */
  async removeMatches(id: string, matchIds: string[]): Promise<StreamKey> {
    const streamKey = await this.streamKeyModel.findById(id).exec();
    if (!streamKey) {
      throw new NotFoundException('Stream key not found');
    }

    // Remove matches from stream key
    const matchObjectIds = matchIds.map((id) => new Types.ObjectId(id));
    const updatedStreamKey = await this.streamKeyModel
      .findByIdAndUpdate(
        id,
        { $pull: { matches: { $in: matchObjectIds } } },
        { new: true },
      )
      .populate('user_id', 'username display_name email role')
      .populate(
        'matches',
        'home_team away_team match_date match_time status status_code',
      )
      .exec();

    if (!updatedStreamKey) {
      throw new NotFoundException('Stream key not found after update');
    }

    // Remove stream_key_id from the removed matches
    await this.matchModel.updateMany(
      { _id: { $in: matchObjectIds } },
      { $set: { stream_key_id: null } },
    );

    return updatedStreamKey;
  }
}
