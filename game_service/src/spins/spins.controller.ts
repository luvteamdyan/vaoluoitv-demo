import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SpinsService } from './spins.service';
import {
  CreateSpinDto,
  UpdateCountDto,
  IncrementSpinDto,
} from './dto/spin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoggerUtil } from '../utils/logger.util';
import type { AuthenticatedRequest } from '../types/request.types';

@Controller('spins')
@UseGuards(JwtAuthGuard)
export class SpinsController {
  private logger = new LoggerUtil();

  constructor(private readonly spinsService: SpinsService) {}

  @Post()
  create(@Body() createSpinDto: CreateSpinDto) {
    return this.spinsService.create(createSpinDto);
  }

  @Get()
  findAll() {
    return this.spinsService.findAll();
  }

  @Get(':userId')
  findByUserId(
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // Sử dụng userId từ JWT sub thay vì từ URL param để đảm bảo security
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;
    const username = req.user?.username || req.user?.email || undefined;

    this.logger.log('[SPINS] JWT User ID:', jwtUserId);
    this.logger.log('[SPINS] JWT External ID:', jwtExternalId);
    this.logger.log('[SPINS] JWT Sub:', jwtSub);
    this.logger.log('[SPINS] URL User ID:', userId);

    // Verify rằng user chỉ có thể truy cập data của chính mình
    // Chấp nhận cả MongoDB _id (sub) và external_id
    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;

    if (!isAuthorized) {
      this.logger.error('[SPINS] Authorization failed:', {
        jwtUserId,
        jwtExternalId,
        jwtSub,
        urlUserId: userId,
        authorizationCheck: {
          'jwtUserId === userId': jwtUserId === userId,
          'jwtExternalId === userId': jwtExternalId === userId,
          'jwtSub === userId': jwtSub === userId,
        },
      });
      throw new Error('Unauthorized: Cannot access other user data');
    }

    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.findByUserId(jwtUserId, username);
  }

  @Patch(':userId/count')
  updateCount(
    @Param('userId') userId: string,
    @Body() updateCountDto: UpdateCountDto,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot update other user data');
    }

    const username =
      req.user?.username || req.user?.email || updateCountDto.username;
    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.updateCount(
      jwtUserId,
      updateCountDto.count,
      username,
    );
  }

  @Post(':userId/increment')
  incrementCount(
    @Param('userId') userId: string,
    @Body() incrementDto: IncrementSpinDto,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot increment other user data');
    }

    const username =
      req.user?.username || req.user?.email || incrementDto.username;
    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.incrementCount(
      jwtUserId,
      incrementDto.increment,
      username,
    );
  }

  // Endpoint đặc biệt cho game 2048 milestones với daily tracking
  @Post(':userId/2048-milestone')
  async update2048Milestone(
    @Param('userId') userId: string,
    @Body('milestone') milestone: number,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot update other user milestone');
    }

    this.logger.log('[2048 Milestone] User from JWT:', req.user);
    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.processDailyMilestone(
      jwtUserId,
      '2048',
      milestone,
    );
  }

  // Endpoint để lấy trạng thái milestone hôm nay
  @Get(':userId/2048-milestone-status')
  async get2048MilestoneStatus(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error(
        'Unauthorized: Cannot access other user milestone status',
      );
    }

    this.logger.log('[2048 Status] User from JWT:', req.user);
    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.getTodayMilestoneStatus(jwtUserId, '2048');
  }

  // Endpoint đặc biệt cho game Flappy Bird milestones với daily tracking
  @Post(':userId/flappy-milestone')
  async updateFlappyMilestone(
    @Param('userId') userId: string,
    @Body('milestone') milestone: number,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot update other user milestone');
    }

    this.logger.log('[Flappy Milestone] User from JWT:', req.user);
    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.processDailyMilestone(
      jwtUserId,
      'flappy',
      milestone,
    );
  }

  // Endpoint để lấy trạng thái milestone Flappy Bird hôm nay
  @Get(':userId/flappy-milestone-status')
  async getFlappyMilestoneStatus(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error(
        'Unauthorized: Cannot access other user milestone status',
      );
    }

    this.logger.log('[Flappy Status] User from JWT:', req.user);
    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    return this.spinsService.getTodayMilestoneStatus(jwtUserId, 'flappy');
  }

  // Endpoint đặc biệt cho Memory Card game - hoàn thành tất cả 5 levels
  @Post(':userId/memory-card-complete')
  async updateMemoryCardComplete(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    this.logger.log('[Memory Card] User from JWT:', req.user);
    // Memory Card: Complete all 5 levels = milestone 5
    return this.spinsService.processDailyMilestone(userId, 'memory-card', 5);
  }

  // Endpoint để lấy trạng thái Memory Card hôm nay
  @Get(':userId/memory-card-status')
  async getMemoryCardStatus(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    this.logger.log('[Memory Card Status] User from JWT:', req.user);
    const status = await this.spinsService.getTodayMilestoneStatus(
      userId,
      'memory-card',
    );
    return {
      ...status,
      completedToday: status.achievedMilestones.includes(5),
    };
  }

  // Endpoint đặc biệt cho Sudoku game - hoàn thành game
  @Post(':userId/sudoku-milestone')
  async updateSudokuMilestone(
    @Param('userId') userId: string,
    @Body('completed') completed: boolean,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot update other user milestone');
    }

    this.logger.log('[Sudoku Milestone] User from JWT:', req.user);
    // Sudoku: Complete game = milestone 1 (dùng 1 để đại diện cho completion)
    return this.spinsService.processDailyMilestone(jwtUserId, 'sudoku', 1);
  }

  // Endpoint để lấy trạng thái Sudoku hôm nay
  @Get(':userId/sudoku-milestone-status')
  async getSudokuMilestoneStatus(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error(
        'Unauthorized: Cannot access other user milestone status',
      );
    }

    this.logger.log('[Sudoku Status] User from JWT:', req.user);
    const status = await this.spinsService.getTodayMilestoneStatus(
      jwtUserId,
      'sudoku',
    );
    return {
      ...status,
      completedToday: status.achievedMilestones.includes(1),
    };
  }

  // Endpoint đặc biệt cho Pikachu Matching game - hoàn thành game
  @Post(':userId/pikachu-milestone')
  async updatePikachuMilestone(
    @Param('userId') userId: string,
    @Body('milestone') milestone: number,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot update other user milestone');
    }

    this.logger.log('[Pikachu Milestone] User from JWT:', req.user);
    // Pikachu: Complete game = milestone 1
    return this.spinsService.processDailyMilestone(
      jwtUserId,
      'pikachu',
      milestone,
    );
  }

  // Endpoint để lấy trạng thái Pikachu Matching hôm nay
  @Get(':userId/pikachu-milestone-status')
  async getPikachuMilestoneStatus(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error(
        'Unauthorized: Cannot access other user milestone status',
      );
    }

    this.logger.log('[Pikachu Status] User from JWT:', req.user);
    const status = await this.spinsService.getTodayMilestoneStatus(
      jwtUserId,
      'pikachu',
    );
    return {
      ...status,
      completedToday: status.achievedMilestones.includes(1),
    };
  }

  // Endpoint để fix username cho record cũ
  @Patch(':userId/fix-username')
  async fixUsername(@Param('userId') userId: string, @Request() req: any) {
    // Verify user authorization
    const jwtUserId = req.user?.userId;
    const jwtExternalId = req.user?.external_id;
    const jwtSub = req.user?.sub;

    const isAuthorized =
      jwtUserId === userId || jwtExternalId === userId || jwtSub === userId;
    if (!isAuthorized) {
      throw new Error('Unauthorized: Cannot fix other user username');
    }

    const username = req.user?.username || req.user?.email;
    if (!username) {
      return { success: false, message: 'Cannot get username from JWT' };
    }

    // Sử dụng jwtUserId (từ JWT sub) thay vì userId từ URL param
    const updated = await this.spinsService.updateUsername(jwtUserId, username);
    return {
      success: true,
      message: 'Username updated successfully',
      username: updated?.username || 'Not found',
    };
  }
}
