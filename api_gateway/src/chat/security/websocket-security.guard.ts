import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RateLimitService } from './rate-limit.service';
import { AuditLoggerService } from './audit-logger.service';
import { SanitizationService } from './sanitization.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class WebSocketSecurityGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketSecurityGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly auditLogger: AuditLoggerService,
    private readonly sanitizationService: SanitizationService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    try {
      // Extract connection info
      const userId = client.handshake.auth?.userId || 'anonymous';
      const socketId = client.id;
      const ipAddress = this.getClientIp(client);
      const userAgent = client.handshake.headers['user-agent'] || 'unknown';
      const isAnonymous = userId === 'anonymous';
      const displayName = data.displayName || data.username;

      // Debug logging
      this.logger.debug(`WebSocket auth data:`, {
        userId,
        auth: client.handshake.auth,
        socketId,
        ipAddress,
      });

      // Check rate limits based on user type
      let rateLimitPromises;
      if (isAnonymous && displayName) {
        // For anonymous users, check socket, IP, and anonymous rate limits
        rateLimitPromises = [
          this.rateLimitService.checkSocketRateLimit(socketId),
          this.rateLimitService.checkIpRateLimit(ipAddress),
          this.rateLimitService.checkAnonymousRateLimit(ipAddress, displayName),
        ];
      } else {
        // For authenticated users, check socket, user, and IP rate limits
        rateLimitPromises = [
          this.rateLimitService.checkSocketRateLimit(socketId),
          this.rateLimitService.checkUserRateLimit(userId),
          this.rateLimitService.checkIpRateLimit(ipAddress),
        ];
      }

      const rateLimitResults = await Promise.all(rateLimitPromises);
      const [socketRateLimit, secondRateLimit, thirdRateLimit] =
        rateLimitResults;

      // Debug logging for rate limits
      if (isAnonymous && displayName) {
        this.logger.debug(
          `Rate limit check (Anonymous) - Socket: ${socketRateLimit.allowed} (${socketRateLimit.remaining} remaining), IP: ${secondRateLimit.allowed} (${secondRateLimit.remaining} remaining), Anonymous: ${thirdRateLimit.allowed} (${thirdRateLimit.remaining} remaining)`,
        );
      } else {
        this.logger.debug(
          `Rate limit check (Authenticated) - Socket: ${socketRateLimit.allowed} (${socketRateLimit.remaining} remaining), User: ${secondRateLimit.allowed} (${secondRateLimit.remaining} remaining), IP: ${thirdRateLimit.allowed} (${thirdRateLimit.remaining} remaining)`,
        );
      }

      // If any rate limit is exceeded, block the request
      if (
        !socketRateLimit.allowed ||
        !secondRateLimit.allowed ||
        !thirdRateLimit.allowed
      ) {
        await this.auditLogger.logRateLimitViolation(
          userId,
          socketId,
          ipAddress,
          this.getRateLimitType(
            socketRateLimit,
            secondRateLimit,
            thirdRateLimit,
            isAnonymous,
          ),
          data.matchId,
        );

        // Emit rate limit event to client
        const retryAfter = Math.max(
          socketRateLimit.resetTime,
          secondRateLimit.resetTime,
          thirdRateLimit.resetTime,
        );

        this.logger.debug(
          `🔍 Rate limit exceeded - retryAfter: ${retryAfter}, current time: ${Date.now()}, reset in: ${retryAfter - Date.now()}ms`,
        );

        client.emit('rate_limit_exceeded', {
          type: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please slow down.',
          retryAfter: retryAfter,
          rateLimitType: this.getRateLimitType(
            socketRateLimit,
            secondRateLimit,
            thirdRateLimit,
            isAnonymous,
          ),
        });

        throw new WsException({
          type: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please slow down.',
          retryAfter: retryAfter,
        });
      }

      // Check if user is banned, kicked, or muted for send_message event
      // Priority: Ban > Kick > Mute
      if (context.getHandler().name === 'handleSendMessage' && data.message) {
        // Generate keys based on user type
        let banKey = `chat_ban:${data.matchId}:${userId}`;
        let kickKey = `chat_kick:${data.matchId}:${userId}`;
        let muteKey = `chat_mute:${data.matchId}:${userId}`;

        // For anonymous users, check by display name as well
        if (isAnonymous && displayName) {
          const anonymousKey = `anonymous:${displayName}`;
          banKey = `chat_ban:${data.matchId}:${anonymousKey}`;
          kickKey = `chat_kick:${data.matchId}:${anonymousKey}`;
          muteKey = `chat_mute:${data.matchId}:${anonymousKey}`;
        }

        // 1. Check if user is banned (highest priority)
        const banData = await this.redis.get(banKey);
        if (banData) {
          const parsed = JSON.parse(banData);
          // Check if ban is still active
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            client.emit('user_banned', {
              type: 'USER_BANNED',
              message: 'You are banned from this chat.',
              matchId: data.matchId,
              reason: parsed.reason || 'No reason provided',
              expiresAt: parsed.expiresAt,
            });

            throw new WsException({
              type: 'USER_BANNED',
              message: 'You are banned from this chat.',
              reason: parsed.reason || 'No reason provided',
              expiresAt: parsed.expiresAt,
            });
          } else {
            // Remove expired ban
            await this.redis.del(banKey);
          }
        }

        // 2. Check if user is kicked (second priority)
        const kickData = await this.redis.get(kickKey);
        if (kickData) {
          const parsed = JSON.parse(kickData);
          // Check if kick is still active
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            client.emit('user_kicked', {
              type: 'USER_KICKED',
              message: 'You have been kicked from this chat.',
              matchId: data.matchId,
              reason: parsed.reason || 'No reason provided',
              adminId: parsed.adminId,
              timestamp: parsed.timestamp,
            });

            throw new WsException({
              type: 'USER_KICKED',
              message: 'You have been kicked from this chat.',
              reason: parsed.reason || 'No reason provided',
              adminId: parsed.adminId,
              timestamp: parsed.timestamp,
            });
          } else {
            // Remove expired kick
            await this.redis.del(kickKey);
          }
        }

        // 3. Check if user is muted (lowest priority)
        const muteData = await this.redis.get(muteKey);
        if (muteData) {
          const parsed = JSON.parse(muteData);
          this.logger.debug(`🔍 User ${userId} mute data found:`, parsed);
          // Check if mute is still active
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            this.logger.debug(
              `🔍 Emitting user_muted event for user ${userId}`,
            );
            client.emit('user_muted', {
              type: 'USER_MUTED',
              message: 'You are muted in this chat.',
              matchId: data.matchId,
              reason: parsed.reason || 'No reason provided',
              expiresAt: parsed.expiresAt,
            });

            throw new WsException({
              type: 'USER_MUTED',
              message: 'You are muted in this chat.',
            });
          } else {
            // Remove expired mute
            await this.redis.del(muteKey);
          }
        }
        const sanitizationResult = this.sanitizationService.sanitizeMessage(
          data.message,
        );

        if (sanitizationResult.isSuspicious) {
          await this.auditLogger.logSuspiciousMessage(
            userId,
            socketId,
            ipAddress,
            data.matchId,
            data.message,
            sanitizationResult.sanitizedMessage,
            sanitizationResult.suspiciousPatterns,
          );

          // Block suspicious messages
          await this.auditLogger.logBlockedMessage(
            userId,
            socketId,
            ipAddress,
            data.matchId,
            data.message,
            `Suspicious patterns detected: ${sanitizationResult.suspiciousPatterns.join(', ')}`,
          );

          // Emit message blocked event to client
          client.emit('message_blocked', {
            type: 'MESSAGE_BLOCKED',
            message: 'Message blocked due to security policy.',
            reason: 'Suspicious content detected',
            suspiciousPatterns: sanitizationResult.suspiciousPatterns,
          });

          throw new WsException({
            type: 'MESSAGE_BLOCKED',
            message: 'Message blocked due to security policy.',
            reason: 'Suspicious content detected',
          });
        }

        // Replace original message with sanitized version
        data.message = sanitizationResult.sanitizedMessage;

        // Sanitize username if provided
        if (data.username) {
          data.username = this.sanitizationService.sanitizeUsername(
            data.username,
          );
        }
      }

      // Log successful message
      if (context.getHandler().name === 'handleSendMessage') {
        await this.auditLogger.logSecurityEvent({
          eventType: 'MESSAGE_SENT',
          userId,
          socketId,
          ipAddress,
          matchId: data.matchId,
          details: {
            message: data.message,
            username: data.username,
            userAgent,
            sanitized: true,
          },
          severity: 'LOW',
          riskScore: 0,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }

      this.logger.error(`WebSocket security check failed: ${error.message}`);
      throw new WsException({
        type: 'SECURITY_ERROR',
        message: 'Security check failed',
      });
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(client: Socket): string {
    return (
      (client.handshake.headers['x-forwarded-for'] as string) ||
      (client.handshake.headers['x-real-ip'] as string) ||
      client.handshake.address ||
      client.conn.remoteAddress ||
      'unknown'
    )
      .split(',')[0]
      .trim();
  }

  /**
   * Determine which rate limit was exceeded
   */
  private getRateLimitType(
    socketLimit: any,
    secondLimit: any,
    thirdLimit: any,
    isAnonymous: boolean = false,
  ): string {
    if (!socketLimit.allowed) return 'socket';
    if (!secondLimit.allowed) return isAnonymous ? 'ip' : 'user';
    if (!thirdLimit.allowed) return isAnonymous ? 'anonymous' : 'ip';
    return 'unknown';
  }
}
