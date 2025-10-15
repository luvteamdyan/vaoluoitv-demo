import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../common/config/app-config.service';

describe('SecurityController', () => {
  let controller: SecurityController;

  const mockSecurityService = {
    validateUrl: jest.fn(),
    getStreamInfo: jest.fn(),
    generateMultipleUrls: jest.fn(),
    generateCdnUrls: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAppConfigService = {
    apiKey: 'test-api-key',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validateUrl', () => {
    it('should validate URL successfully', async () => {
      const request = {
        path: '/live/507f1f77bcf86cd799439011.flv',
        wsSecret: 'test-secret',
        wsTime: Math.floor(Date.now() / 1000) + 300,
      };

      const expectedResult = {
        valid: true,
        streamId: '507f1f77bcf86cd799439011',
        message: 'OK',
      };

      mockSecurityService.validateUrl.mockResolvedValue(expectedResult);

      const result = await controller.validateUrl(request);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockSecurityService.validateUrl).toHaveBeenCalledWith(request);
    });
  });

  describe('getStreamInfo', () => {
    it('should get stream info successfully', async () => {
      const streamId = '507f1f77bcf86cd799439011';
      const expectedResult = {
        streamId,
        title: 'Team A vs Team B',
        status: 'live',
        signedUrl: 'https://ingest.test.com/live/507f1f77bcf86cd799439011.flv',
        expiresAt: new Date(),
      };

      mockSecurityService.getStreamInfo.mockResolvedValue(expectedResult);

      const result = await controller.getStreamInfo(streamId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockSecurityService.getStreamInfo).toHaveBeenCalledWith(streamId);
    });
  });

  describe('generateMultipleUrls', () => {
    it('should generate multiple URLs successfully', async () => {
      const streamId = '507f1f77bcf86cd799439011';
      const request = {
        formats: ['flv', 'm3u8'],
        ttl: 300,
      };

      const expectedResult = {
        flv: {
          url: 'https://ingest.test.com/live/507f1f77bcf86cd799439011.flv',
          wsSecret: 'test',
          wsTime: 123,
          expiresAt: new Date(),
        },
        m3u8: {
          url: 'https://ingest.test.com/live/507f1f77bcf86cd799439011.m3u8',
          wsSecret: 'test',
          wsTime: 123,
          expiresAt: new Date(),
        },
      };

      mockSecurityService.generateMultipleUrls.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.generateMultipleUrls(streamId, request);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockSecurityService.generateMultipleUrls).toHaveBeenCalledWith(
        streamId,
        request,
      );
    });
  });

  describe('generateCdnUrls', () => {
    it('should generate CDN URLs successfully', () => {
      const cdnId = '1';
      const request = {
        formats: ['m3u8', 'flv'],
        ttl: 300,
      };

      const expectedResult = {
        m3u8: {
          url: 'https://3014759347.global.cdnfastest.com/vaoluoitv/vaoluoitv1/index.m3u8?token=test&time=123',
          token: 'test',
          time: 123,
          expiresAt: new Date(),
        },
        flv: {
          url: 'https://3014973486.global.cdnfastest.com/vaoluoitv/vaoluoitv1.flv?token=test&time=123',
          token: 'test',
          time: 123,
          expiresAt: new Date(),
        },
      };

      mockSecurityService.generateCdnUrls.mockReturnValue(expectedResult);

      const result = controller.generateCdnUrls(cdnId, request);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockSecurityService.generateCdnUrls).toHaveBeenCalledWith(
        cdnId,
        request,
      );
    });

    it('should handle CDN URL generation errors', () => {
      const cdnId = 'invalid';
      const request = {
        formats: ['m3u8'],
        ttl: 300,
      };

      mockSecurityService.generateCdnUrls.mockImplementation(() => {
        throw new Error('Invalid CDN ID');
      });

      expect(() => controller.generateCdnUrls(cdnId, request)).toThrow(
        HttpException,
      );
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = controller.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.service).toBe('security-api');
      expect(result.timestamp).toBeDefined();
    });
  });
});
