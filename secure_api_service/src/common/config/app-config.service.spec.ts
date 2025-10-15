import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService, EvgCdnStreamKey } from './app-config.service';
import { ConfigService } from '@nestjs/config';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mongodbUri', () => {
    it('should return configured MongoDB URI', () => {
      mockConfigService.get.mockReturnValue('mongodb://test:27017/test');
      expect(service.mongodbUri).toBe('mongodb://test:27017/test');
    });

    it('should return default MongoDB URI when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.mongodbUri).toBe(
        'mongodb://localhost:27017/vaoluoi-security',
      );
    });
  });

  describe('port', () => {
    it('should return configured port', () => {
      mockConfigService.get.mockReturnValue(3001);
      expect(service.port).toBe(3001);
    });

    it('should return default port when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.port).toBe(3001);
    });
  });

  describe('secretKey', () => {
    it('should return configured secret key', () => {
      mockConfigService.get.mockReturnValue('test-secret-key');
      expect(service.secretKey).toBe('test-secret-key');
    });

    it('should return default secret key when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.secretKey).toBe('default-stream-secret');
    });
  });

  describe('baseUrl', () => {
    it('should return configured base URL', () => {
      mockConfigService.get.mockReturnValue('https://test.example.com');
      expect(service.baseUrl).toBe('https://test.example.com');
    });

    it('should return default base URL when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.baseUrl).toBe('https://live.vaoluoitv.com');
    });
  });

  describe('apiKey', () => {
    it('should return configured API key', () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      expect(service.apiKey).toBe('test-api-key');
    });

    it('should return default API key when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.apiKey).toBe('default-api-key');
    });
  });

  describe('evgcdnSk1', () => {
    it('should return vaoluoitv1 enum value', () => {
      expect(service.evgcdnSk1).toBe(EvgCdnStreamKey.VAOLUOITV1);
    });
  });

  describe('evgcdnSk2', () => {
    it('should return vaoluoitv2 enum value', () => {
      expect(service.evgcdnSk2).toBe(EvgCdnStreamKey.VAOLUOITV2);
    });
  });

  describe('evgcdnHlsBaseUrl', () => {
    it('should return configured HLS base URL', () => {
      mockConfigService.get.mockReturnValue('https://custom-hls.cdn.com');
      expect(service.evgcdnHlsBaseUrl).toBe('https://custom-hls.cdn.com');
    });

    it('should return default HLS base URL when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.evgcdnHlsBaseUrl).toBe(
        'https://3014759347.global.cdnfastest.com',
      );
    });
  });

  describe('evgcdnFlvBaseUrl', () => {
    it('should return configured FLV base URL', () => {
      mockConfigService.get.mockReturnValue('https://custom-flv.cdn.com');
      expect(service.evgcdnFlvBaseUrl).toBe('https://custom-flv.cdn.com');
    });

    it('should return default FLV base URL when not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.evgcdnFlvBaseUrl).toBe(
        'https://3014973486.global.cdnfastest.com',
      );
    });
  });

  describe('evgcdnBaseUrl (backward compatibility)', () => {
    it('should return HLS base URL for backward compatibility', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.evgcdnBaseUrl).toBe(
        'https://3014759347.global.cdnfastest.com',
      );
    });
  });

  describe('validateApiKey', () => {
    it('should validate API key correctly', () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      expect(service.validateApiKey('test-api-key')).toBe(true);
      expect(service.validateApiKey('wrong-key')).toBe(false);
    });
  });
});
