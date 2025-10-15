import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../schemas/match.schema';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  /**
   * Find match by MongoDB _id
   */
  async findById(id: string): Promise<MatchDocument | null> {
    try {
      return await this.matchModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  /**
   * Find match by either MongoDB _id or stream key ID
   */
  async findByIdOrStreamKey(streamId: string): Promise<MatchDocument | null> {
    try {
      // First try to find by MongoDB _id if it's a valid ObjectId
      if (this.isValidObjectId(streamId)) {
        const matchById = await this.matchModel.findById(streamId).exec();
        if (matchById) {
          return matchById;
        }
      }

      // If not found by _id or not a valid ObjectId, try to find by stream key ID
      const matchByStreamKey = await this.matchModel
        .findOne({ stream_keys: streamId })
        .exec();
      return matchByStreamKey;
    } catch {
      return null;
    }
  }

  /**
   * Validate if ObjectId format is correct
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
