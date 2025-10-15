import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { WheelService } from './wheel.service';
import {
  CreateWheelSegmentDto,
  UpdateWheelSegmentDto,
  SpinWheelDto,
} from './dto/wheel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wheel')
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  // Admin endpoints - Quản lý segments
  @UseGuards(JwtAuthGuard)
  @Post('segments')
  async createSegment(@Body() createWheelSegmentDto: CreateWheelSegmentDto) {
    try {
      return await this.wheelService.createSegment(createWheelSegmentDto);
    } catch (error) {
      throw new HttpException(
        `Không thể tạo segment: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('segments')
  async getActiveSegments() {
    try {
      return await this.wheelService.getActiveSegments();
    } catch (error) {
      throw new HttpException(
        `Không thể lấy danh sách segments: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('segments/all')
  async getAllSegments() {
    try {
      return await this.wheelService.getAllSegments();
    } catch (error) {
      throw new HttpException(
        `Không thể lấy tất cả segments: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('segments/:segmentId')
  async updateSegment(
    @Param('segmentId') segmentId: string,
    @Body() updateWheelSegmentDto: UpdateWheelSegmentDto,
  ) {
    try {
      const result = await this.wheelService.updateSegment(
        segmentId,
        updateWheelSegmentDto,
      );
      if (!result) {
        throw new HttpException('Segment không tồn tại', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      throw new HttpException(
        `Không thể cập nhật segment: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('segments/:segmentId')
  async deleteSegment(@Param('segmentId') segmentId: string) {
    try {
      const result = await this.wheelService.deleteSegment(segmentId);
      if (!result) {
        throw new HttpException('Segment không tồn tại', HttpStatus.NOT_FOUND);
      }
      return { message: 'Segment đã được xóa thành công' };
    } catch (error) {
      throw new HttpException(
        `Không thể xóa segment: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // User endpoints - Quay wheel
  @UseGuards(JwtAuthGuard)
  @Post('spin')
  async spinWheel(@Body() spinWheelDto: SpinWheelDto, @Request() req) {
    try {
      // Lấy external_id từ JWT token (ưu tiên) hoặc từ body
      const externalId = req.user.external_id || spinWheelDto.user_id;
      const mongoId = req.user.sub;

      if (!externalId) {
        throw new HttpException(
          'Không tìm thấy external_id trong token',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.wheelService.spinWheel({
        ...spinWheelDto,
        user_id: externalId, // Truyền external_id để call auth API
        mongo_id: mongoId, // Truyền MongoDB ID để lưu vào DB
      });
    } catch (error) {
      throw new HttpException(
        `Không thể quay wheel: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:userId')
  async getUserSpinHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      return await this.wheelService.getUserSpinHistory(userId, limitNumber);
    } catch (error) {
      throw new HttpException(
        `Không thể lấy lịch sử spin: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('claim/:userId/:spinResultId')
  async claimReward(
    @Param('userId') userId: string,
    @Param('spinResultId') spinResultId: string,
  ) {
    try {
      const result = await this.wheelService.claimReward(userId, spinResultId);
      if (!result) {
        throw new HttpException(
          'Không thể claim reward hoặc reward đã được claim',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Reward đã được claim thành công', reward: result };
    } catch (error) {
      throw new HttpException(
        `Không thể claim reward: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Admin endpoints - Thống kê
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getSegmentStats() {
    try {
      return await this.wheelService.getSegmentStats();
    } catch (error) {
      throw new HttpException(
        `Không thể lấy thống kê: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
