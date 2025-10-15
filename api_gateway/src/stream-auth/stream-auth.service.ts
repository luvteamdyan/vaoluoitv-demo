import { Injectable, Logger } from '@nestjs/common';
import { StreamKeysService } from '@/stream-keys/stream-keys.service';
import { SecureApiService } from '@/middleware/serure-middleware/secure-api.service';
import { MatchStatus } from '@/schemas/match.schema';

@Injectable()
export class StreamAuthService {
  private readonly logger = new Logger(StreamAuthService.name);

  constructor(
    private readonly streamKeysService: StreamKeysService,
    private readonly secureApiService: SecureApiService,
  ) {}

  /**
   * Validate stream for RTMP connect/publish (on_connect/on_publish callbacks)
   */
  async validateStream(body: any): Promise<{
    code: number;
    message: string;
    data?: { stream: string; app: string };
  }> {
    if (!body) {
      return { code: 1, message: 'Invalid body' };
    }

    this.logger.log(
      `Stream validation request: action=${body.action}, stream=${body.stream}, app=${body.app}, server_id=${body.server_id}`,
    );

    // For on_connect: Basic validation only - allow connection
    if (body.action === 'on_connect') {
      this.logger.log(`Connection allowed for stream: ${body.stream}`);
      return {
        code: 0,
        message: 'OK',
        data: {
          stream: body.stream,
          app: body.app || 'live',
        },
      };
    }

    // For on_publish: Full validation with stream key
    if (body.action === 'on_publish') {
      // Get stream key from body.param (format: "?key=stream_key_value")
      const paramString = body.param as string;
      let streamKeyValue: string | null = null;

      if (paramString) {
        // Extract key from param string (e.g., "?key=e0af12c60c16b42389ad0610a0025664")
        const keyMatch = paramString.match(/[?&]key=([^&]+)/);
        if (keyMatch && keyMatch[1]) {
          streamKeyValue = keyMatch[1];
        }
      }

      if (!streamKeyValue) {
        this.logger.warn('No stream key provided for on_publish');
        return { code: 1, message: 'Stream key required' };
      }

      // Log additional SRS information
      this.logger.log(
        `SRS publish request - Server: ${body.server_id}, Service: ${body.service_id}, Client: ${body.client_id}, IP: ${body.ip}`,
      );

      // Find stream key in database
      const streamKey =
        await this.streamKeysService.findByKeyValue(streamKeyValue);

      if (!streamKey) {
        this.logger.warn(`Invalid stream key: ${streamKeyValue}`);
        return { code: 1, message: 'Invalid stream key' };
      }

      // Extract match ID from stream URL (format: rtmp://server/app/matchId)
      const streamUrl = body.stream_url || '';
      const matchIdMatch = streamUrl.match(/\/([a-f0-9]{24})$/);

      if (!matchIdMatch) {
        this.logger.warn(
          `Cannot extract match ID from stream URL: ${streamUrl}`,
        );
        return { code: 1, message: 'Invalid stream URL format' };
      }

      const matchId = matchIdMatch[1];

      // Check if match exists and is active
      const match = await this.streamKeysService.matchModel.findById(matchId);
      if (!match || !match.is_active) {
        this.logger.warn(
          `Match not found or inactive for stream key: ${streamKeyValue}`,
        );
        return { code: 1, message: 'Match not found or inactive' };
      }

      // Check if stream key is assigned to this match
      const isValidAssignment = await this.streamKeysService.validateStreamKey(
        streamKeyValue,
        matchId,
        (streamKey.user_id as any)._id.toString(),
      );

      if (!isValidAssignment) {
        this.logger.warn(
          `Stream key ${streamKeyValue} is not assigned to match ${matchId}`,
        );
        return { code: 1, message: 'Stream key not assigned to this match' };
      }

      // Update match status to LIVE for on_publish
      await this.streamKeysService.matchModel
        .findByIdAndUpdate(matchId, {
          status: MatchStatus.LIVE,
        })
        .exec();

      this.logger.log(
        `Match ${matchId} status updated to LIVE for stream key: ${streamKeyValue}, stream_url: ${body.stream_url}`,
      );
      return {
        code: 0,
        message: 'OK',
        data: {
          stream: matchId,
          app: body.app || 'live',
        },
      };
    }

    return { code: 1, message: 'Unsupported action' };
  }

  /**
   * Handle stream events (on_unpublish, on_stop)
   */
  async handleStreamEvent(
    body: any,
  ): Promise<{ code: number; message: string }> {
    this.logger.log(
      `Stream event: action=${body.action}, stream=${body.stream}, server_id=${body.server_id}`,
    );

    // Get stream key from body.param (format: "?key=stream_key_value")
    const paramString = body.param as string;
    let streamKeyValue: string | null = null;

    if (paramString) {
      // Extract key from param string (e.g., "?key=e0af12c60c16b42389ad0610a0025664")
      const keyMatch = paramString.match(/[?&]key=([^&]+)/);
      if (keyMatch && keyMatch[1]) {
        streamKeyValue = keyMatch[1];
      }
    }

    if (!streamKeyValue) {
      this.logger.warn('No stream key provided for stream event');
      return { code: 1, message: 'Stream key required' };
    }

    // Find stream key in database
    const streamKey =
      await this.streamKeysService.findByKeyValue(streamKeyValue);

    if (!streamKey) {
      this.logger.warn(`Invalid stream key for event: ${streamKeyValue}`);
      return { code: 1, message: 'Invalid stream key' };
    }

    // Extract match ID from stream URL (format: rtmp://server/app/matchId)
    const streamUrl = body.stream_url || '';
    const matchIdMatch = streamUrl.match(/\/([a-f0-9]{24})$/);

    if (!matchIdMatch) {
      this.logger.warn(`Cannot extract match ID from stream URL: ${streamUrl}`);
      return { code: 1, message: 'Invalid stream URL format' };
    }

    const matchId = matchIdMatch[1];

    if (body.action === 'on_unpublish') {
      // Update match status to FINISHED
      await this.streamKeysService.matchModel
        .findByIdAndUpdate(matchId, {
          status: MatchStatus.FINISHED,
        })
        .exec();
      this.logger.log(
        `Match ${matchId} status updated to FINISHED for stream key: ${streamKeyValue}, stream_url: ${body.stream_url}`,
      );
    }

    // For on_stop, just log the event (no status change needed)
    this.logger.log(
      `Stream event ${body.action} for match ${matchId} with stream key: ${streamKeyValue}, server_id: ${body.server_id}`,
    );

    return { code: 0, message: 'OK' };
  }

  /**
   * Validate signed URL for playback (Traefik forward-auth)
   */
  async validateSecureUrl(
    body: any,
  ): Promise<{ code: number; message: string }> {
    try {
      // Use existing secure API service to validate URL signature
      const result = await this.secureApiService.validateUrl({
        path: body.path,
        wsSecret: body.wsSecret,
        wsTime: body.wsTime,
      });

      if (result.valid) {
        return { code: 0, message: 'OK' };
      } else {
        return { code: 1, message: 'Invalid signature' };
      }
    } catch (error) {
      this.logger.error(`Secure URL validation failed: ${error.message}`);
      return { code: 1, message: 'Validation failed' };
    }
  }

  /**
   * Validate play permission for SRS on_play callback
   */
  async validatePlay(body: any): Promise<{ code: number; message: string }> {
    if (!body) {
      return { code: 1, message: 'Invalid body' };
    }

    this.logger.log(
      `Play validation request: stream=${body.stream}, server_id=${body.server_id}, param=${body.param}`,
    );

    // Get match ID from body.stream (SRS sends match ID in 'stream' field for on_play)
    const matchId = body.stream;

    if (!matchId) {
      this.logger.warn('No match ID provided for play validation');
      return { code: 1, message: 'Match ID required' };
    }

    // Validate match ID format
    if (!this.isValidObjectId(matchId)) {
      this.logger.warn(`Invalid match ID format: ${matchId}`);
      return { code: 1, message: 'Invalid match ID format' };
    }

    // Find match by ObjectId
    const match = await this.streamKeysService.matchModel
      .findOne({ _id: matchId })
      .exec();

    if (!match) {
      this.logger.warn(`Match not found for play validation: ${matchId}`);
      return { code: 1, message: 'Match not found' };
    }

    if (!match.is_active) {
      this.logger.warn(`Match is inactive for match id: ${String(match._id)}`);
      return { code: 1, message: 'Match is not active' };
    }

    // Extract URL signature parameters from param
    const paramString = body.param as string;
    let wsSecret: string | null = null;
    let wsTime: number | null = null;

    if (paramString) {
      // Extract wsSecret and wsTime from param string (e.g., "?wsSecret=184f3a2ca92cc972bfa3dc166c0e608b&wsTime=1758874661")
      const secretMatch = paramString.match(/[?&]wsSecret=([^&]+)/);
      const timeMatch = paramString.match(/[?&]wsTime=([^&]+)/);

      if (secretMatch && secretMatch[1]) {
        wsSecret = secretMatch[1];
      }
      if (timeMatch && timeMatch[1]) {
        wsTime = parseInt(timeMatch[1], 10);
      }
    }

    // URL signature is REQUIRED for playback - return 403 if not provided
    if (!wsSecret || !wsTime) {
      this.logger.warn(
        `URL signature required but not provided for match id: ${String(match._id)}`,
      );
      return { code: 1, message: 'URL signature required' };
    }

    // Validate URL signature
    try {
      const result = await this.secureApiService.validateUrl({
        path: `/live/${String(match._id)}.flv`,
        wsSecret: wsSecret,
        wsTime: wsTime,
      });

      if (!result.valid) {
        this.logger.warn(
          `Invalid URL signature for match id: ${String(match._id)}`,
        );
        return { code: 1, message: 'Invalid URL signature' };
      }
    } catch (error) {
      this.logger.error(`URL signature validation failed: ${error.message}`);
      return { code: 1, message: 'Signature validation failed' };
    }

    this.logger.log(
      `Play validation successful for match id: ${String(match._id)}, stream_url: ${String(body.stream_url)}`,
    );
    return { code: 0, message: 'OK' };
  }

  /**
   * Validate if ObjectId format is correct
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
