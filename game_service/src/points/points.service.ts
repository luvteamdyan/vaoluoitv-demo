import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { UpdatePointsDto, UpdatePointsResponseDto } from './dto/points.dto';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class PointsService {
  private logger = new LoggerUtil();
  private readonly LUCK8_API_URL = process.env.NEXT_PUBLIC_API_URL;
  private readonly LUCK8_API_KEY = process.env.LUCK8_POINT_API_KEY;

  async updateUserPoints(
    updatePointsDto: UpdatePointsDto,
  ): Promise<UpdatePointsResponseDto> {
    try {
      const response = await axios.post(
        `${this.LUCK8_API_URL}/api-key-endpoints/update-points`,
        {
          action_type: updatePointsDto.action_type,
          points: updatePointsDto.points,
          source: updatePointsDto.source,
          user_id: updatePointsDto.user_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.LUCK8_API_KEY,
          },
          timeout: 10000, // 10 seconds timeout
        },
      );

      return {
        success: true,
        message: 'Điểm đã được cập nhật thành công',
        data: response.data as {
          user_id: string;
          new_points: number;
          previous_points: number;
        },
      };
    } catch (error) {
      this.logger.error('Update points API error:', error);

      if (axios.isAxiosError(error)) {
        const status =
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
          error.response?.data?.message || 'Lỗi khi cập nhật điểm';

        throw new HttpException(`Không thể cập nhật điểm: ${message}`, status);
      }

      throw new HttpException(
        'Lỗi không xác định khi cập nhật điểm',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper method để kiểm tra xem segment có phải special gift không
  isSpecialGift(rewardType: string, rewardValue: number): boolean {
    // Card 50k: special_gift với reward_value = 50000
    if (rewardType === 'special_gift' && rewardValue === 50000) {
      return true;
    }

    // Áo Thun: special_gift với reward_value = 1
    if (rewardType === 'special_gift' && rewardValue === 1) {
      return true;
    }

    return false;
  }

  // Helper method để lấy điểm tương ứng với segment
  getPointsFromSegment(rewardType: string, rewardValue: number): number {
    // Nếu là special gift thì không cộng điểm
    if (this.isSpecialGift(rewardType, rewardValue)) {
      return 0;
    }

    // Các segment khác thì điểm = reward_value
    if (rewardType === 'points') {
      return rewardValue;
    }

    // Mặc định trả về 0 nếu không xác định được
    return 0;
  }
}
