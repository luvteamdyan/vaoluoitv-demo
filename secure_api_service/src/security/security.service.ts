import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument, MatchStatus } from '../schemas/match.schema';
import { AppConfigService } from '../common/config/app-config.service';
import { MatchesService } from '../matches/matches.service';
import * as crypto from 'crypto';
import {
  UrlValidateRequestDto,
  UrlSignResponseDto,
  UrlValidateResponseDto,
  StreamInfoResponseDto,
  MultipleUrlsRequestDto,
  CdnUrlSignRequestDto,
  CdnUrlSignResponseDto,
} from './dto/security.dto';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectModel(Match.name)
    private matchModel: Model<MatchDocument>,
    private readonly configService: AppConfigService,
    private readonly matchesService: MatchesService,
  ) {}

  /**
   * Validate URL signature
   */
  async validateUrl(
    request: UrlValidateRequestDto,
  ): Promise<UrlValidateResponseDto> {
    this.logger.log(`Validating URL signature for path: ${request.path}`);

    try {
      // Extract stream ID from path
      const streamId = this.extractStreamIdFromPath(request.path);
      if (!streamId) {
        return {
          valid: false,
          message: 'Invalid stream path',
        };
      }

      // Check if stream exists and is active
      const match = await this.matchesService.findByIdOrStreamKey(streamId);
      if (!match || !match.is_active) {
        return {
          valid: false,
          message: 'Stream not found or inactive',
        };
      }

      // Validate URL signature
      const isValidSignature = this.validateUrlSignature(
        request.path,
        request.wsSecret,
        request.wsTime,
      );

      if (!isValidSignature) {
        return {
          valid: false,
          message: 'Invalid URL signature',
        };
      }

      // Check if URL is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (request.wsTime < currentTime) {
        return {
          valid: false,
          message: 'URL expired',
        };
      }

      this.logger.log(`URL validation successful for stream: ${streamId}`);
      return {
        valid: true,
        streamId,
        message: 'OK',
      };
    } catch (error) {
      this.logger.error(
        `Error validating URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        valid: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get stream info with signed URL
   */
  async getStreamInfo(streamId: string): Promise<StreamInfoResponseDto> {
    this.logger.log(`Getting stream info for: ${streamId}`);

    try {
      // Validate stream ID
      if (!streamId) {
        throw new Error('Stream ID is required');
      }

      const match = await this.matchesService.findByIdOrStreamKey(streamId);
      if (!match) {
        throw new NotFoundException('Stream not found');
      }

      const response: StreamInfoResponseDto = {
        streamId,
        title: `${match.home_team.name} vs ${match.away_team.name}`,
        status: match.status,
      };

      // Note: Signed URL generation has been removed from this service
      // The stream info will be returned without signed URL

      return response;
    } catch (error) {
      this.logger.error(
        `Error getting stream info: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Generate multiple signed URLs for different formats
   */
  async generateMultipleUrls(
    streamId: string,
    request: MultipleUrlsRequestDto,
  ): Promise<Record<string, UrlSignResponseDto>> {
    this.logger.log(`Generating multiple URLs for stream: ${streamId}`);

    try {
      // Validate stream ID
      if (!streamId) {
        throw new Error('Stream ID is required');
      }

      // Check if stream exists and is available
      const match = await this.matchesService.findByIdOrStreamKey(streamId);
      if (!match) {
        throw new NotFoundException('Stream not found');
      }

      if (!this.isStreamAvailable(match)) {
        throw new Error('Stream is not available for URL generation');
      }

      if (!match.stream_keys || match.stream_keys.length === 0) {
        throw new Error('No live available for this match');
      }

      const formatMap: Record<string, string> = {
        flv: 'flv',
        hls: 'm3u8',
      };

      const formats = request.formats
        ? request.formats.map((format) => formatMap[format] || 'm3u8')
        : ['m3u8'];
      const ttl = this.validateTtl(request.ttl);
      const urls: Record<string, UrlSignResponseDto> = {};

      for (const format of formats) {
        try {
          const path = `/live/${streamId}.${format}`;
          const wsTime = Math.floor(Date.now() / 1000) + ttl;

          const wsSecret = this.generateUrlSignature(path, wsTime);
          const signedUrl = `${this.configService.baseUrl}${path}?wsSecret=${wsSecret}&wsTime=${wsTime}`;

          urls[format] = {
            url: signedUrl,
            wsSecret,
            wsTime,
            expiresAt: new Date(wsTime * 1000),
          };
        } catch (error) {
          this.logger.error(
            `Error generating URL for format ${format}: ${error instanceof Error ? error.message : String(error)}`,
          );
          // Continue with other formats rather than failing entirely
        }
      }

      if (Object.keys(urls).length === 0) {
        throw new Error('Failed to generate any URLs');
      }

      return urls;
    } catch (error) {
      this.logger.error(
        `Error generating multiple URLs for stream ${streamId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Validate API key for security operations
   */
  validateApiKey(apiKey: string): boolean {
    return apiKey === this.configService.apiKey;
  }

  private extractStreamIdFromPath(path: string): string | null {
    // Extract stream ID from path
    // Format: /live/{streamId}.flv or /live/{streamId}.m3u8
    // streamId can be either MongoDB ObjectId (24 hex chars) or stream key ID
    // Support both with and without query parameters

    // Remove query parameters first
    const pathWithoutQuery = path.split('?')[0];

    const match = pathWithoutQuery.match(/^\/live\/([^/]+)\.(flv|m3u8)$/i);
    return match ? match[1] : null;
  }

  private validateUrlSignature(
    path: string,
    wsSecret: string,
    wsTime: number,
  ): boolean {
    // Remove query parameters from path to match the signature generation logic
    const pathWithoutQuery = path.split('?')[0];

    const expectedSecret = crypto
      .createHash('md5')
      .update(pathWithoutQuery + wsTime + this.configService.secretKey)
      .digest('hex');

    return wsSecret === expectedSecret;
  }

  /**
   * Check if stream is available for signing based on match status and conditions
   */
  private isStreamAvailable(match: MatchDocument): boolean {
    // Stream must be active
    if (!match.is_active) {
      return false;
    }

    // Check match status - only allow signing for live matches or scheduled matches near start time
    const now = new Date();
    const matchDateTime = new Date(match.match_date);
    const timeDiffMinutes =
      (matchDateTime.getTime() - now.getTime()) / (1000 * 60);

    switch (match.status) {
      case MatchStatus.LIVE:
        return true;
      case MatchStatus.SCHEDULED:
        // Allow signing 30 minutes before match starts
        return timeDiffMinutes <= 30 && timeDiffMinutes >= -180; // 3 hours after start
      case MatchStatus.NOT_STARTED:
        // Allow signing 15 minutes before match starts
        return timeDiffMinutes <= 15 && timeDiffMinutes >= -60; // 1 hour after start
      case MatchStatus.FINISHED:
      case MatchStatus.CANCELLED:
      default:
        return false;
    }
  }

  /**
   * Validate and normalize TTL parameter
   */
  private validateTtl(ttl?: number): number {
    if (!ttl) {
      return 60; // Default 1 minute
    }

    // Ensure TTL is within allowed range
    const minTtl = 1; // 1 minute
    const maxTtl = 900; // 15 minutes

    if (ttl < minTtl) {
      this.logger.warn(`TTL ${ttl}s is too short, using minimum ${minTtl}s`);
      return minTtl;
    }

    if (ttl > maxTtl) {
      this.logger.warn(`TTL ${ttl}s is too long, using maximum ${maxTtl}s`);
      return maxTtl;
    }

    return ttl;
  }

  /**
   * Generate multiple signed URLs for CDN (EVGCDN)
   */
  generateCdnUrls(
    cdnId: string,
    request: CdnUrlSignRequestDto,
  ): Record<string, CdnUrlSignResponseDto> {
    this.logger.log(`Generating CDN URLs for: ${cdnId}`);

    try {
      // Validate CDN ID
      if (!cdnId) {
        throw new Error('CDN ID is required');
      }

      // Map CDN ID to stream key
      const streamKey = this.getStreamKeyByCdnId(cdnId);
      if (!streamKey) {
        throw new Error(`Invalid CDN ID: ${cdnId}`);
      }

      // Validate TTL parameter
      const ttl = this.validateTtl(request.ttl);
      const expiryTimestamp = Math.floor(Date.now() / 1000) + ttl;

      // Default formats if not specified
      const formats = request.formats || ['m3u8', 'flv'];
      const urls: Record<string, CdnUrlSignResponseDto> = {};

      for (const format of formats) {
        try {
          const signedUrl = this.signCdnUrl(
            streamKey,
            format,
            expiryTimestamp,
            null, // userIP = null
          );

          urls[format] = {
            url: signedUrl,
            token: this.extractTokenFromUrl(signedUrl),
            time: expiryTimestamp,
            expiresAt: new Date(expiryTimestamp * 1000),
          };
        } catch (error) {
          this.logger.error(
            `Error generating CDN URL for format ${format}: ${error instanceof Error ? error.message : String(error)}`,
          );
          // Continue with other formats rather than failing entirely
        }
      }

      if (Object.keys(urls).length === 0) {
        throw new Error('Failed to generate any CDN URLs');
      }

      return urls;
    } catch (error) {
      this.logger.error(
        `Error generating CDN URLs for ${cdnId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Sign CDN URL according to EVGCDN documentation (Parameter method)
   * Based on getSignedUrlParam function from the documentation
   */
  private signCdnUrl(
    streamKey: string,
    format: string,
    expiryTimestamp: number,
    userIP: string | null = null,
  ): string {
    // Use appropriate CDN URL based on format
    const cdnResourceUrl =
      format === 'm3u8'
        ? this.configService.evgcdnHlsBaseUrl
        : this.configService.evgcdnFlvBaseUrl;
    const secureToken = this.configService.evgcdnSecretKey;

    // Format filePath according to requirements
    // For m3u8: /vaoluoitv/${streamKey}/index.m3u8
    // For flv: /vaoluoitv/${streamKey}.flv
    let filePath: string;
    if (format === 'm3u8') {
      filePath = `/vaoluoitv/${streamKey}/index.${format}`;
    } else {
      filePath = `/vaoluoitv/${streamKey}.${format}`;
    }

    // Generate hash string: secureToken + filePath + expiryTimestamp + userIP
    const hashStr = crypto
      .createHash('md5')
      .update(`${secureToken}${filePath}${expiryTimestamp}${userIP || ''}`)
      .digest('binary');

    // Encode to base64 and replace invalid characters
    const validStr = Buffer.from(hashStr, 'binary')
      .toString('base64')
      .replace(/[+]/g, '-')
      .replace(/\//g, '_');

    const hotkeyParams = validStr.replace(/=/g, '');

    // Construct final URL with token and time parameters
    const finalUrl = `${cdnResourceUrl}${filePath}?token=${hotkeyParams}&time=${expiryTimestamp}`;

    return finalUrl;
  }

  /**
   * Get stream key by CDN ID - Updated to use dynamic configuration
   */
  private getStreamKeyByCdnId(cdnId: string): string | null {
    // Sử dụng method mới để lấy stream key động từ environment variables
    const streamKey = this.configService.getStreamKeyById(cdnId);

    if (streamKey) {
      return streamKey;
    }

    // Fallback to legacy methods for backward compatibility
    const legacyStreamKeyMap: Record<string, string> = {
      '1': this.configService.evgcdnSk1,
      '2': this.configService.evgcdnSk2,
    };

    return legacyStreamKeyMap[cdnId] || null;
  }

  /**
   * Extract token from signed URL
   */
  private extractTokenFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('token') || '';
  }

  /**
   * Generate URL signature for security
   */
  private generateUrlSignature(path: string, wsTime: number): string {
    return crypto
      .createHash('md5')
      .update(path + wsTime + this.configService.secretKey)
      .digest('hex');
  }
}
