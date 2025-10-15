import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WheelSegment,
  WheelSegmentDocument,
} from '../schemas/wheel-segment.schema';
import {
  WheelSpinResult,
  WheelSpinResultDocument,
} from '../schemas/wheel-spin-result.schema';
import {
  CreateWheelSegmentDto,
  UpdateWheelSegmentDto,
  SpinWheelDto,
  WheelSpinResponseDto,
} from './dto/wheel.dto';
import { PointsService } from '../points/points.service';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class WheelService {
  private logger = new LoggerUtil();

  constructor(
    @InjectModel(WheelSegment.name)
    private wheelSegmentModel: Model<WheelSegmentDocument>,
    @InjectModel(WheelSpinResult.name)
    private wheelSpinResultModel: Model<WheelSpinResultDocument>,
    private readonly pointsService: PointsService,
  ) {}

  // Tạo segment mới
  async createSegment(
    createWheelSegmentDto: CreateWheelSegmentDto,
  ): Promise<WheelSegment> {
    const createdSegment = new this.wheelSegmentModel(createWheelSegmentDto);
    return createdSegment.save();
  }

  // Lấy tất cả segments đang hoạt động
  async getActiveSegments(): Promise<WheelSegment[]> {
    return this.wheelSegmentModel
      .find({ is_active: true })
      .sort({ order: 1 }) // Sắp xếp bình thường
      .exec();
  }

  // Lấy tất cả segments (bao gồm cả inactive)
  async getAllSegments(): Promise<WheelSegment[]> {
    return this.wheelSegmentModel.find().sort({ order: 1 }).exec();
  }

  // Cập nhật segment
  async updateSegment(
    segmentId: string,
    updateWheelSegmentDto: UpdateWheelSegmentDto,
  ): Promise<WheelSegment | null> {
    return this.wheelSegmentModel
      .findOneAndUpdate({ segment_id: segmentId }, updateWheelSegmentDto, {
        new: true,
      })
      .exec();
  }

  // Xóa segment
  async deleteSegment(segmentId: string): Promise<WheelSegment | null> {
    return this.wheelSegmentModel
      .findOneAndDelete({ segment_id: segmentId })
      .exec();
  }

  // Logic chính: Chọn segment dựa trên xác suất
  async pickSegment(): Promise<WheelSegment> {
    const segments = await this.getActiveSegments();

    if (segments.length === 0) {
      throw new Error('Không có segment nào đang hoạt động');
    }

    // Tính tổng weight
    const totalWeight = segments.reduce(
      (sum, segment) => sum + segment.weight,
      0,
    );

    if (totalWeight === 0) {
      throw new Error('Tổng weight của các segments phải lớn hơn 0');
    }

    // Random số từ 0 đến totalWeight
    const randomValue = Math.random() * totalWeight;

    // Tìm segment tương ứng
    let currentWeight = 0;
    for (const segment of segments) {
      currentWeight += segment.weight;
      if (randomValue <= currentWeight) {
        return segment;
      }
    }

    // Fallback: trả về segment cuối cùng
    return segments[segments.length - 1];
  }

  // Quay wheel và lưu kết quả
  async spinWheel(spinWheelDto: SpinWheelDto): Promise<WheelSpinResponseDto> {
    const { user_id, mongo_id } = spinWheelDto;

    // user_id là external_id (UUID) để gọi auth API
    // mongo_id là MongoDB ObjectId để lưu vào DB
    const userIdForDb = mongo_id || user_id; // Fallback về user_id nếu không có mongo_id
    const externalIdForApi = user_id;

    // Chọn segment thắng
    const winningSegment = await this.pickSegment();

    // Tính góc dừng cho Winwheel.js
    const segments = await this.getActiveSegments();
    const segmentIndex = segments.findIndex(
      (s) => s.segment_id === winningSegment.segment_id,
    );
    const segmentAngle = 360 / segments.length;

    // Winwheel segments bắt đầu từ 12h (0°) và quay theo chiều kim đồng hồ
    // Pointer ở 12h, cần wheel quay để segment ở 6h (180°)
    // Segment 0 ở 0°, segment 1 ở 45°, v.v.
    // Nhưng cần tính ngược lại vì wheel quay ngược chiều
    const baseAngle = segmentIndex * segmentAngle;
    const stopAngle = 360 - baseAngle; // Ngược chiều để pointer chỉ đúng

    // Nếu góc >= 360, trừ đi 360
    const finalStopAngle = stopAngle >= 360 ? stopAngle - 360 : stopAngle;

    // Backend đã tính toán góc dừng chính xác

    // Lưu kết quả spin (sử dụng MongoDB ID)
    const spinResult = new this.wheelSpinResultModel({
      user_id: userIdForDb,
      segment_id: winningSegment.segment_id,
      segment_label: winningSegment.label,
      reward_type: winningSegment.reward_type,
      reward_value: winningSegment.reward_value,
      spun_at: new Date(),
    });

    await spinResult.save();

    // Cập nhật điểm cho user (trừ special gifts)
    // Sử dụng external_id để gọi auth API
    let pointsUpdated = false;
    const pointsToAdd = this.pointsService.getPointsFromSegment(
      winningSegment.reward_type,
      winningSegment.reward_value,
    );

    if (pointsToAdd > 0 && externalIdForApi) {
      try {
        await this.pointsService.updateUserPoints({
          user_id: externalIdForApi, // Sử dụng external_id (UUID)
          points: pointsToAdd,
          action_type: 'plus',
          source: 'luck-wheel',
        });
        pointsUpdated = true;
        this.logger.log(
          `Đã cập nhật ${pointsToAdd} điểm cho user ${externalIdForApi}`,
        );
      } catch (error) {
        this.logger.error('Lỗi khi cập nhật điểm:', error);
        // Không throw error để không ảnh hưởng đến kết quả spin
      }
    } else if (pointsToAdd > 0 && !externalIdForApi) {
      this.logger.log('Không thể cập nhật điểm: Thiếu external_id');
    } else {
      this.logger.log(
        `Segment ${winningSegment.segment_id} là special gift, không cập nhật điểm`,
      );
    }

    return {
      segment_id: winningSegment.segment_id,
      segment_label: winningSegment.label,
      segment_index: segmentIndex,
      reward_type: winningSegment.reward_type,
      reward_value: winningSegment.reward_value,
      stop_angle: finalStopAngle,
      points_updated: pointsUpdated,
      points_added: pointsToAdd,
    };
  }

  // Lấy lịch sử spin của user
  async getUserSpinHistory(
    userId: string,
    limit: number = 10,
  ): Promise<WheelSpinResult[]> {
    return this.wheelSpinResultModel
      .find({ user_id: userId })
      .sort({ spun_at: -1 })
      .limit(limit)
      .exec();
  }

  // Claim reward
  async claimReward(
    userId: string,
    spinResultId: string,
  ): Promise<WheelSpinResult | null> {
    return this.wheelSpinResultModel
      .findOneAndUpdate(
        {
          _id: spinResultId,
          user_id: userId,
          reward_claimed: false,
        },
        { reward_claimed: true },
        { new: true },
      )
      .exec();
  }

  // Lấy thống kê segments
  async getSegmentStats(): Promise<any[]> {
    const pipeline = [
      {
        $group: {
          _id: '$segment_id',
          count: { $sum: 1 },
          totalRewardValue: { $sum: '$reward_value' },
        },
      },
      {
        $lookup: {
          from: 'wheelsegments',
          localField: '_id',
          foreignField: 'segment_id',
          as: 'segment',
        },
      },
      {
        $unwind: '$segment',
      },
      {
        $project: {
          segment_id: '$_id',
          segment_label: '$segment.label',
          count: 1,
          totalRewardValue: 1,
          weight: '$segment.weight',
        },
      },
    ];

    return this.wheelSpinResultModel.aggregate(pipeline).exec();
  }
}
