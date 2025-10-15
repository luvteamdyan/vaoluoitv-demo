import { Test, TestingModule } from '@nestjs/testing';
import { StreamKeysController } from './stream-keys.controller';
import { StreamKeysService } from './stream-keys.service';
import {
  CreateStreamKeyDto,
  UpdateStreamKeyDto,
  StopStreamDto,
} from './dto/create-stream-key.dto';
import { StreamKeyQueryDto } from './dto/stream-key-query.dto';
import {
  StreamKeyResponseDto,
  StreamKeyListResponseDto,
} from './dto/stream-key-response.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StreamKeysController', () => {
  let controller: StreamKeysController;
  let service: StreamKeysService;

  const mockStreamKey = {
    _id: '68cb874cf3f5b57a7b6c3365',
    key_value: 'hashed_key_value',
    user_id: 'user_object_id',
    match_id: 'match_object_id',
    created_at: new Date('2025-09-18T04:15:08.270Z'),
    revoked_at: null,
  };

  const mockStreamKeysService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByMatchId: jest.fn(),
    findActiveByMatchId: jest.fn(),
    update: jest.fn(),
    revoke: jest.fn(),
    regenerateKey: jest.fn(),
    remove: jest.fn(),
    validateStreamKey: jest.fn(),
    stopStream: jest.fn(),
    updateMatchStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamKeysController],
      providers: [
        {
          provide: StreamKeysService,
          useValue: mockStreamKeysService,
        },
      ],
    }).compile();

    controller = module.get<StreamKeysController>(StreamKeysController);
    service = module.get<StreamKeysService>(StreamKeysService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a stream key successfully', async () => {
      const createDto: CreateStreamKeyDto = {
        key_value: 'sk_live_abc123def456',
        user_id: 'user_object_id',
        match_id: 'match_object_id',
      };

      mockStreamKeysService.create.mockResolvedValue(mockStreamKey);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeInstanceOf(StreamKeyResponseDto);
      expect(result.id).toBe(mockStreamKey._id);
    });

    it('should throw BadRequestException when user not found', async () => {
      const createDto: CreateStreamKeyDto = {
        key_value: 'sk_live_abc123def456',
        user_id: 'invalid_user_id',
        match_id: 'match_object_id',
      };

      mockStreamKeysService.create.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when stream key already exists', async () => {
      const createDto: CreateStreamKeyDto = {
        key_value: 'sk_live_abc123def456',
        user_id: 'user_object_id',
        match_id: 'match_object_id',
      };

      mockStreamKeysService.create.mockRejectedValue(
        new BadRequestException('Stream key value already exists'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated stream keys', async () => {
      const query: StreamKeyQueryDto = {
        page: 1,
        limit: 10,
        match_id: 'match_object_id',
        status: 'active',
      };

      const mockResult = {
        streamKeys: [mockStreamKey],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      mockStreamKeysService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        match_id: 'match_object_id',
        status: 'active',
      });
      expect(result).toBeInstanceOf(StreamKeyListResponseDto);
      expect(result.streamKeys).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default pagination values', async () => {
      const query: StreamKeyQueryDto = {};

      const mockResult = {
        streamKeys: [mockStreamKey],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      mockStreamKeysService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        match_id: undefined,
        status: undefined,
      });
    });
  });

  describe('findByMatchId', () => {
    it('should return stream keys for a specific match', async () => {
      const matchId = 'match_object_id';
      const mockStreamKeys = [mockStreamKey];

      mockStreamKeysService.findByMatchId.mockResolvedValue(mockStreamKeys);

      const result = await controller.findByMatchId(matchId);

      expect(service.findByMatchId).toHaveBeenCalledWith(matchId);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(StreamKeyResponseDto);
    });
  });

  describe('findActiveByMatchId', () => {
    it('should return active stream key for a specific match', async () => {
      const matchId = 'match_object_id';

      mockStreamKeysService.findActiveByMatchId.mockResolvedValue(
        mockStreamKey,
      );

      const result = await controller.findActiveByMatchId(matchId);

      expect(service.findActiveByMatchId).toHaveBeenCalledWith(matchId);
      expect(result).toBeInstanceOf(StreamKeyResponseDto);
    });

    it('should return null when no active stream key found', async () => {
      const matchId = 'match_object_id';

      mockStreamKeysService.findActiveByMatchId.mockResolvedValue(null);

      const result = await controller.findActiveByMatchId(matchId);

      expect(service.findActiveByMatchId).toHaveBeenCalledWith(matchId);
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a stream key by id', async () => {
      const id = 'stream_key_id';

      mockStreamKeysService.findOne.mockResolvedValue(mockStreamKey);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(StreamKeyResponseDto);
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';

      mockStreamKeysService.findOne.mockRejectedValue(
        new NotFoundException('Stream key not found'),
      );

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a stream key successfully', async () => {
      const id = 'stream_key_id';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'new_key_value',
        user_id: 'new_user_id',
        match_id: 'new_match_id',
      };

      const updatedStreamKey = { ...mockStreamKey, key_value: 'new_key_value' };
      mockStreamKeysService.update.mockResolvedValue(updatedStreamKey);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toBeInstanceOf(StreamKeyResponseDto);
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'new_key_value',
        user_id: 'new_user_id',
        match_id: 'new_match_id',
      };

      mockStreamKeysService.update.mockRejectedValue(
        new NotFoundException('Stream key not found'),
      );

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revoke', () => {
    it('should revoke a stream key successfully', async () => {
      const id = 'stream_key_id';
      const revokedStreamKey = {
        ...mockStreamKey,
        revoked_at: new Date(),
      };

      mockStreamKeysService.revoke.mockResolvedValue(revokedStreamKey);

      const result = await controller.revoke(id);

      expect(service.revoke).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(StreamKeyResponseDto);
      expect(result.revoked_at).toBeDefined();
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';

      mockStreamKeysService.revoke.mockRejectedValue(
        new NotFoundException('Stream key not found'),
      );

      await expect(controller.revoke(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('regenerateKey', () => {
    it('should regenerate a stream key successfully', async () => {
      const id = 'stream_key_id';
      const regeneratedStreamKey = {
        ...mockStreamKey,
        key_value: 'new_generated_key',
      };

      mockStreamKeysService.regenerateKey.mockResolvedValue(
        regeneratedStreamKey,
      );

      const result = await controller.regenerateKey(id);

      expect(service.regenerateKey).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(StreamKeyResponseDto);
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';

      mockStreamKeysService.regenerateKey.mockRejectedValue(
        new NotFoundException('Stream key not found'),
      );

      await expect(controller.regenerateKey(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a stream key successfully', async () => {
      const id = 'stream_key_id';

      mockStreamKeysService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'Stream key deleted successfully' });
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';

      mockStreamKeysService.remove.mockRejectedValue(
        new NotFoundException('Stream key not found'),
      );

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('stopStream', () => {
    it('should stop stream successfully', async () => {
      const stopDto: StopStreamDto = {
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      mockStreamKeysService.stopStream.mockResolvedValue({
        message: 'Stream stopped successfully',
      });

      const result = await controller.stopStream(stopDto);

      expect(service.stopStream).toHaveBeenCalledWith(stopDto);
      expect(result).toEqual({ message: 'Stream stopped successfully' });
    });

    it('should throw NotFoundException when match not found', async () => {
      const stopDto: StopStreamDto = {
        match_id: 'invalid_match_id',
      };

      mockStreamKeysService.stopStream.mockRejectedValue(
        new NotFoundException('Match not found'),
      );

      await expect(controller.stopStream(stopDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
