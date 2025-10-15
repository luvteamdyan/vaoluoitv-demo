import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StreamKeysService } from './stream-keys.service';
import { StreamKey, StreamKeyDocument } from '@/schemas/stream-key.schema';
import { Match } from '@/schemas/match.schema';
import { User } from '@/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CreateStreamKeyDto,
  UpdateStreamKeyDto,
  StopStreamDto,
} from './dto/create-stream-key.dto';
import { StreamKeyQueryDto } from './dto/stream-key-query.dto';

describe('StreamKeysService', () => {
  let service: StreamKeysService;
  let _model: Model<StreamKeyDocument>;

  const mockStreamKey = {
    _id: new Types.ObjectId('68cb874cf3f5b57a7b6c3365'),
    key_value: 'hashed_key_value',
    user_id: new Types.ObjectId('68cb874cf3f5b57a7b6c3367'),
    match_id: new Types.ObjectId('68cb874cf3f5b57a7b6c3366'),
    created_at: new Date('2025-09-18T04:15:08.270Z'),
    revoked_at: null,
  };

  const mockStreamKeyDocument = {
    ...mockStreamKey,
    save: jest.fn().mockResolvedValue(mockStreamKey),
    toJSON: jest.fn().mockReturnValue(mockStreamKey),
  };

  const mockModel = {
    new: jest.fn().mockReturnValue(mockStreamKeyDocument),
    constructor: jest.fn().mockReturnValue(mockStreamKeyDocument),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    countDocuments: jest.fn(),
    db: {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamKeysService,
        {
          provide: getModelToken(StreamKey.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Match.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<StreamKeysService>(StreamKeysService);
    _model = module.get<Model<StreamKeyDocument>>(
      getModelToken(StreamKey.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a stream key successfully', async () => {
      const createDto: CreateStreamKeyDto = {
        key_value: 'sk_live_abc123def456',
        user_id: '68cb874cf3f5b57a7b6c3367',
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      const mockMatch = { _id: new Types.ObjectId(createDto.match_id) };
      const mockUser = { _id: new Types.ObjectId(createDto.user_id) };

      mockModel.findOne.mockResolvedValue(null); // No existing stream key
      mockModel.findById.mockResolvedValue(mockUser);
      mockModel.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockMatch);

      // Mock constructor properly
      const mockConstructor = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockStreamKey),
      }));
      (service as any).streamKeyModel = mockConstructor;

      const result = await service.create(createDto);

      expect(mockModel.findById).toHaveBeenCalledWith(createDto.user_id);
      expect(mockModel.findById).toHaveBeenCalledWith(createDto.match_id);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        key_value: createDto.key_value,
      });
      expect(mockConstructor).toHaveBeenCalledWith({
        key_value: createDto.key_value,
        user_id: new Types.ObjectId(createDto.user_id),
        match_id: new Types.ObjectId(createDto.match_id),
        description: undefined,
        created_at: expect.any(Date),
        revoked_at: null,
      });
      expect(result).toEqual(mockStreamKey);
    });

    it('should throw NotFoundException when user not found', async () => {
      const createDto: CreateStreamKeyDto = {
        key_value: 'sk_live_abc123def456',
        user_id: '68cb874cf3f5b57a7b6c3367',
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      mockModel.findById.mockResolvedValue(null); // User not found

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when stream key already exists', async () => {
      const createDto: CreateStreamKeyDto = {
        key_value: 'sk_live_abc123def456',
        user_id: '68cb874cf3f5b57a7b6c3367',
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      const mockMatch = { _id: new Types.ObjectId(createDto.match_id) };
      const mockUser = { _id: new Types.ObjectId(createDto.user_id) };

      mockModel.findById.mockResolvedValue(mockUser);
      mockModel.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockMatch);
      mockModel.findOne.mockResolvedValue(mockStreamKey); // Existing stream key

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated stream keys', async () => {
      const query: StreamKeyQueryDto = {
        page: 1,
        limit: 10,
        match_id: '68cb874cf3f5b57a7b6c3366',
        status: 'active',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockStreamKey]),
      };

      mockModel.find.mockReturnValue(mockQuery);
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockModel.find).toHaveBeenCalledWith({
        user_id: new Types.ObjectId(query.user_id),
        match_id: new Types.ObjectId(query.match_id),
        revoked_at: null,
      });
      expect(result.streamKeys).toEqual([mockStreamKey]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle revoked status filter', async () => {
      const query: StreamKeyQueryDto = {
        page: 1,
        limit: 10,
        status: 'revoked',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockModel.find.mockReturnValue(mockQuery);
      mockModel.countDocuments.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockModel.find).toHaveBeenCalledWith({
        revoked_at: { $ne: null },
      });
    });
  });

  describe('findOne', () => {
    it('should return a stream key by id', async () => {
      const id = 'stream_key_id';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStreamKey),
      };

      mockModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne(id);

      expect(mockModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockStreamKey);
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByMatchId', () => {
    it('should return stream keys for a specific match', async () => {
      const matchId = '68cb874cf3f5b57a7b6c3366';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockStreamKey]),
      };

      mockModel.find.mockReturnValue(mockQuery);

      const result = await service.findByMatchId(matchId);

      expect(mockModel.find).toHaveBeenCalledWith({
        match_id: new Types.ObjectId(matchId),
        revoked_at: null,
      });
      expect(result).toEqual([mockStreamKey]);
    });
  });

  describe('findActiveByMatchId', () => {
    it('should return active stream key for a specific match', async () => {
      const matchId = '68cb874cf3f5b57a7b6c3366';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStreamKey),
      };

      mockModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findActiveByMatchId(matchId);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        match_id: new Types.ObjectId(matchId),
        revoked_at: null,
      });
      expect(result).toEqual(mockStreamKey);
    });

    it('should return null when no active stream key found', async () => {
      const matchId = '68cb874cf3f5b57a7b6c3366';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findActiveByMatchId(matchId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a stream key successfully', async () => {
      const id = '68cb874cf3f5b57a7b6c3365';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'new_key_value',
        user_id: '68cb874cf3f5b57a7b6c3367',
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      const updatedStreamKey = {
        ...mockStreamKey,
        key_value: 'new_key_value',
      };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedStreamKey),
      };

      mockModel.findById.mockResolvedValue(mockStreamKey);
      mockModel.findByIdAndUpdate.mockReturnValue(mockQuery);
      mockModel.findOne.mockResolvedValue(null); // No existing key value

      const result = await service.update(id, updateDto);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        {
          key_value: updateDto.key_value,
          user_id: new Types.ObjectId(updateDto.user_id),
          match_id: new Types.ObjectId(updateDto.match_id),
        },
        { new: true },
      );
      expect(result).toEqual(updatedStreamKey);
    });

    it('should update key_value successfully', async () => {
      const id = '68cb874cf3f5b57a7b6c3365';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'a1b2c3d4e5f6789012345678901234ab',
      };

      const updatedStreamKey = {
        ...mockStreamKey,
        key_value: 'a1b2c3d4e5f6789012345678901234ab',
      };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedStreamKey),
      };

      mockModel.findById.mockResolvedValue(mockStreamKey);
      mockModel.findByIdAndUpdate.mockReturnValue(mockQuery);
      mockModel.findOne.mockResolvedValue(null); // No existing key value

      const result = await service.update(id, updateDto);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { key_value: updateDto.key_value },
        { new: true },
      );
      expect(result).toEqual(updatedStreamKey);
    });

    it('should throw BadRequestException for invalid key_value format', async () => {
      const id = '68cb874cf3f5b57a7b6c3365';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'invalid-key',
      };

      mockModel.findById.mockResolvedValue(mockStreamKey);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when key_value already exists', async () => {
      const id = '68cb874cf3f5b57a7b6c3365';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'a1b2c3d4e5f6789012345678901234ab',
      };

      mockModel.findById.mockResolvedValue(mockStreamKey);
      mockModel.findOne.mockResolvedValue(mockStreamKey); // Existing key value

      await expect(service.update(id, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = '68cb874cf3f5b57a7b6c3365';
      const updateDto: UpdateStreamKeyDto = {
        key_value: 'new_key_value',
        user_id: '68cb874cf3f5b57a7b6c3367',
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      mockModel.findById.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
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

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(revokedStreamKey),
      };

      mockModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.revoke(id);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { revoked_at: expect.any(Date) },
        { new: true },
      );
      expect(result).toEqual(revokedStreamKey);
    });
  });

  describe('remove', () => {
    it('should delete a stream key successfully', async () => {
      const id = '68cb874cf3f5b57a7b6c3365';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockStreamKey),
      };

      mockModel.findById.mockReturnValue(mockQuery);
      mockModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await service.remove(id);

      expect(mockModel.findById).toHaveBeenCalledWith(id);
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when stream key not found', async () => {
      const id = 'invalid_id';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockModel.findById.mockReturnValue(mockQuery);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('stopStream', () => {
    it('should stop stream successfully', async () => {
      const stopDto: StopStreamDto = {
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      const mockMatch = { _id: new Types.ObjectId(stopDto.match_id) };

      mockModel.findById.mockResolvedValue(mockMatch);
      mockModel.findByIdAndUpdate.mockResolvedValue(mockMatch);

      const result = await service.stopStream(stopDto);

      expect(mockModel.findById).toHaveBeenCalledWith(stopDto.match_id);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        stopDto.match_id,
        { status: 'finished', status_code: 'FT' },
        { new: true },
      );
      expect(result).toEqual({ message: 'Stream stopped successfully' });
    });

    it('should throw NotFoundException when match not found', async () => {
      const stopDto: StopStreamDto = {
        match_id: '68cb874cf3f5b57a7b6c3366',
      };

      mockModel.findById.mockResolvedValue(null);

      await expect(service.stopStream(stopDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateStreamKey', () => {
    it('should return true for valid stream key and update match status to LIVE', async () => {
      const keyValue = 'test-key';
      const matchId = '68cb874cf3f5b57a7b6c3366';
      const userId = '68cb874cf3f5b57a7b6c3367';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockStreamKey),
      };

      const mockMatch = { _id: new Types.ObjectId(matchId) };

      mockModel.findOne.mockReturnValue(mockQuery);
      mockModel.findById.mockResolvedValue(mockMatch);
      mockModel.findByIdAndUpdate.mockResolvedValue(mockMatch);

      const result = await service.validateStreamKey(keyValue, matchId, userId);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        key_value: keyValue,
        user_id: new Types.ObjectId(userId),
        match_id: new Types.ObjectId(matchId),
        revoked_at: null,
      });
      expect(mockModel.findById).toHaveBeenCalledWith(matchId);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        matchId,
        { status: 'live', status_code: 'LIVE' },
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid stream key and not update match', async () => {
      const keyValue = 'invalid-key';
      const matchId = '68cb874cf3f5b57a7b6c3366';
      const userId = '68cb874cf3f5b57a7b6c3367';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockModel.findOne.mockReturnValue(mockQuery);

      const result = await service.validateStreamKey(keyValue, matchId, userId);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        key_value: keyValue,
        user_id: new Types.ObjectId(userId),
        match_id: new Types.ObjectId(matchId),
        revoked_at: null,
      });
      expect(result).toBe(false);
    });
  });
});
