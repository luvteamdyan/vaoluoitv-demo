import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SecurityService } from './security.service';
import { AppConfigService } from '../common/config/app-config.service';
import { MatchesService } from '../matches/matches.service';
import {
  Match,
  MatchDocument,
  MatchStatus,
  MatchType,
} from '../schemas/match.schema';

describe('SecurityService', () => {
  let service: SecurityService;
  let matchesService: MatchesService;

  const mockMatch = {
    _id: '507f1f77bcf86cd799439011',
    home_team: {
      id: 'team_1',
      name: 'Team A',
      logo: 'https://example.com/team-a-logo.png',
    },
    away_team: {
      id: 'team_2',
      name: 'Team B',
      logo: 'https://example.com/team-b-logo.png',
    },
    league: {
      id: 'league_1',
      name: 'Premier League',
      logo: 'https://example.com/premier-league-logo.png',
    },
    match_time: '15:00',
    match_date: new Date(),
    status: MatchStatus.LIVE,
    status_code: 'LIVE',
    type: MatchType.LEAGUE,
    home_score: 0,
    away_score: 0,
    venue: 'Stadium A',
    is_active: true,
    is_featured: false,
    description: 'Test match',
    tags: [],
    stream_keys: ['507f1f77bcf86cd799439012'], // Add mock stream key
  };

  const mockConfigService: Partial<AppConfigService> = {
    secretKey: 'test-secret-key',
    baseUrl: 'https://ingest.test.com',
    apiKey: 'test-api-key',
    evgcdnSk1: 'vaoluoitv1',
    evgcdnSk2: 'vaoluoitv2',
    evgcdnSecretKey: 's3cret',
    evgcdnHlsBaseUrl: 'https://3014759347.global.cdnfastest.com',
    evgcdnFlvBaseUrl: 'https://3014973486.global.cdnfastest.com',
    evgcdnBaseUrl: 'https://3014759347.global.cdnfastest.com',
  };

  const mockMatchesService: Partial<MatchesService> = {
    findByIdOrStreamKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: getModelToken(Match.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
    matchesService = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUrl', () => {
    it('should validate URL signature successfully', async () => {
      jest
        .spyOn(matchesService, 'findByIdOrStreamKey')
        .mockResolvedValue(mockMatch as unknown as MatchDocument);

      const request = {
        path: '/live/507f1f77bcf86cd799439011.flv',
        wsSecret: 'test-secret',
        wsTime: Math.floor(Date.now() / 1000) + 300,
      };

      // Mock the validateUrlSignature method
      jest
        .spyOn(
          service as unknown as { validateUrlSignature: jest.Mock },
          'validateUrlSignature',
        )
        .mockReturnValue(true);

      const result = await service.validateUrl(request);

      expect(result.valid).toBe(true);
      expect(result.streamId).toBe('507f1f77bcf86cd799439011');
    });

    it('should return invalid for expired URL', async () => {
      jest
        .spyOn(matchesService, 'findByIdOrStreamKey')
        .mockResolvedValue(mockMatch as unknown as MatchDocument);

      const request = {
        path: '/live/507f1f77bcf86cd799439011.flv',
        wsSecret: 'test-secret',
        wsTime: Math.floor(Date.now() / 1000) - 300, // Expired
      };

      // Mock the validateUrlSignature method
      jest
        .spyOn(
          service as unknown as { validateUrlSignature: jest.Mock },
          'validateUrlSignature',
        )
        .mockReturnValue(true);

      const result = await service.validateUrl(request);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('URL expired');
    });
  });

  describe('getStreamInfo', () => {
    it('should return stream info without signed URL for live stream', async () => {
      jest
        .spyOn(matchesService, 'findByIdOrStreamKey')
        .mockResolvedValue(mockMatch as unknown as MatchDocument);

      const result = await service.getStreamInfo('507f1f77bcf86cd799439011');

      expect(result.streamId).toBe('507f1f77bcf86cd799439011');
      expect(result.title).toBe('Team A vs Team B');
      expect(result.status).toBe(MatchStatus.LIVE);
      expect(result.signedUrl).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
    });
  });

  describe('generateMultipleUrls', () => {
    it('should generate multiple URLs successfully', async () => {
      jest
        .spyOn(matchesService, 'findByIdOrStreamKey')
        .mockResolvedValue(mockMatch as unknown as MatchDocument);

      const streamId = '507f1f77bcf86cd799439011';
      const request = {
        formats: ['flv', 'm3u8'],
        ttl: 300,
      };

      const result = await service.generateMultipleUrls(streamId, request);

      expect(result).toHaveProperty('flv');
      expect(result).toHaveProperty('m3u8');
      expect(result.flv.url).toContain('.flv');
      expect(result.m3u8.url).toContain('.m3u8');
    });

    it('should throw error when stream ID is not found', async () => {
      jest.spyOn(matchesService, 'findByIdOrStreamKey').mockResolvedValue(null);

      const streamId = 'non-existent-id';
      const request = {
        formats: ['flv'],
        ttl: 300,
      };

      await expect(
        service.generateMultipleUrls(streamId, request),
      ).rejects.toThrow('Stream not found');
    });

    it('should throw error for match without stream keys', async () => {
      const matchWithoutKeys = { ...mockMatch, stream_keys: [] };
      jest
        .spyOn(matchesService, 'findByIdOrStreamKey')
        .mockResolvedValue(matchWithoutKeys as unknown as MatchDocument);

      const streamId = '507f1f77bcf86cd799439011';
      const request = {
        formats: ['flv'],
        ttl: 300,
      };

      await expect(
        service.generateMultipleUrls(streamId, request),
      ).rejects.toThrow('No live available for this match');
    });
  });

  describe('generateCdnUrls', () => {
    it('should generate CDN URLs successfully for valid CDN ID', () => {
      const cdnId = '1';
      const request = {
        formats: ['m3u8', 'flv'],
        ttl: 300,
      };

      const result = service.generateCdnUrls(cdnId, request);

      expect(result).toHaveProperty('m3u8');
      expect(result).toHaveProperty('flv');
      expect(result.m3u8.url).toContain(
        'https://3014759347.global.cdnfastest.com',
      );
      expect(result.m3u8.url).toContain('vaoluoitv/vaoluoitv1');
      expect(result.m3u8.url).toContain('index.m3u8');
      expect(result.m3u8.url).toContain('token=');
      expect(result.m3u8.url).toContain('time=');
      expect(result.flv.url).toContain(
        'https://3014973486.global.cdnfastest.com',
      );
      expect(result.flv.url).toContain('vaoluoitv/vaoluoitv1');
      expect(result.flv.url).toContain('.flv');
      expect(result.m3u8).toHaveProperty('token');
      expect(result.m3u8).toHaveProperty('time');
      expect(result.m3u8).toHaveProperty('expiresAt');
    });

    it('should generate CDN URLs successfully for CDN ID 2', () => {
      const cdnId = '2';
      const request = {
        formats: ['m3u8'],
        ttl: 300,
      };

      const result = service.generateCdnUrls(cdnId, request);

      expect(result).toHaveProperty('m3u8');
      expect(result.m3u8.url).toContain(
        'https://3014759347.global.cdnfastest.com',
      );
      expect(result.m3u8.url).toContain('vaoluoitv/vaoluoitv2');
      expect(result.m3u8.url).toContain('index.m3u8');
    });

    it('should throw error for invalid CDN ID', () => {
      const cdnId = 'invalid';
      const request = {
        formats: ['m3u8'],
        ttl: 300,
      };

      expect(() => service.generateCdnUrls(cdnId, request)).toThrow(
        'Invalid CDN ID: invalid',
      );
    });

    it('should throw error when CDN ID is not provided', () => {
      const cdnId = '';
      const request = {
        formats: ['m3u8'],
        ttl: 300,
      };

      expect(() => service.generateCdnUrls(cdnId, request)).toThrow(
        'CDN ID is required',
      );
    });

    it('should use default formats when not specified', () => {
      const cdnId = '1';
      const request = {
        ttl: 300,
      };

      const result = service.generateCdnUrls(cdnId, request);

      expect(result).toHaveProperty('m3u8');
      expect(result).toHaveProperty('flv');
    });
  });

  describe('validateApiKey', () => {
    it('should validate API key correctly', () => {
      expect(service.validateApiKey('test-api-key')).toBe(true);
      expect(service.validateApiKey('wrong-key')).toBe(false);
    });
  });
});
