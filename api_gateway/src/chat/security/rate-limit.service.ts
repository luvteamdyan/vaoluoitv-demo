import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after exceeding limit
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry?: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  // Default rate limit configurations
  private readonly defaultConfigs = {
    // Per socket connection
    socket: {
      windowMs: 60 * 1000,
      maxRequests: 10, // 10m/phút
      blockDurationMs: 2 * 60 * 1000,
    },
    // Per user ID
    user: {
      windowMs: 60 * 1000,
      maxRequests: 8, // 8m/phút
      blockDurationMs: 3 * 60 * 1000,
    },
    // Per IP address
    ip: {
      windowMs: 60 * 1000,
      maxRequests: 15, // 15m/phút
      blockDurationMs: 5 * 60 * 1000,
    },
    // For anonymous users (IP + display name combination)
    anonymous: {
      windowMs: 60 * 1000,
      maxRequests: 5, // 5m/phút (thấp hơn user đã đăng nhập)
      blockDurationMs: 5 * 60 * 1000,
    },
  };

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Check rate limit for socket connection
   */
  async checkSocketRateLimit(
    socketId: string,
    config?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const rateLimitConfig = { ...this.defaultConfigs.socket, ...config };
    return this.checkRateLimit('socket', socketId, rateLimitConfig);
  }

  /**
   * Check rate limit for user
   */
  async checkUserRateLimit(
    userId: string,
    config?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const rateLimitConfig = { ...this.defaultConfigs.user, ...config };
    return this.checkRateLimit('user', userId, rateLimitConfig);
  }

  /**
   * Check rate limit for IP address
   */
  async checkIpRateLimit(
    ip: string,
    config?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const rateLimitConfig = { ...this.defaultConfigs.ip, ...config };
    return this.checkRateLimit('ip', ip, rateLimitConfig);
  }

  /**
   * Check rate limit for anonymous user (IP + display name combination)
   */
  async checkAnonymousRateLimit(
    ip: string,
    displayName: string,
    config?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const rateLimitConfig = { ...this.defaultConfigs.anonymous, ...config };
    const key = `${ip}:${displayName}`;
    return this.checkRateLimit('anonymous', key, rateLimitConfig);
  }

  /**
   * Check rate limit for a specific key
   */
  private async checkRateLimit(
    type: string,
    key: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const redisKey = `rate_limit:${type}:${key}`;
    const blockKey = `rate_limit_block:${type}:${key}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Check if currently blocked
      const blockExpiry = await this.redis.get(blockKey);
      if (blockExpiry && parseInt(blockExpiry) > now) {
        this.logger.warn(
          `Rate limit blocked: ${type}:${key} until ${new Date(parseInt(blockExpiry)).toString()}`,
        );
        return {
          allowed: false,
          remaining: 0,
          resetTime: parseInt(blockExpiry),
          blocked: true,
          blockExpiry: parseInt(blockExpiry),
        };
      }

      // Remove expired entries
      await this.redis.zremrangebyscore(redisKey, 0, windowStart);

      // Count current requests in window
      const currentCount = await this.redis.zcard(redisKey);

      if (currentCount >= config.maxRequests) {
        // Rate limit exceeded, block the key
        const blockDurationMs = config.blockDurationMs || 0;
        const blockUntil = now + blockDurationMs;
        await this.redis.setex(
          blockKey,
          Math.ceil(blockDurationMs / 1000),
          blockUntil.toString(),
        );

        this.logger.warn(
          `Rate limit exceeded for ${type}:${key}, blocked until ${new Date(blockUntil).toString()}`,
        );

        return {
          allowed: false,
          remaining: 0,
          resetTime: blockUntil,
          blocked: true,
          blockExpiry: blockUntil,
        };
      }

      // Add current request
      await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(redisKey, Math.ceil(config.windowMs / 1000));

      const remaining = config.maxRequests - currentCount - 1;
      const resetTime = now + config.windowMs;

      return {
        allowed: true,
        remaining,
        resetTime,
        blocked: false,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit: ${error.message}`);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }
  }

  /**
   * Reset rate limit for a key (admin function)
   */
  async resetRateLimit(type: string, key: string): Promise<void> {
    const redisKey = `rate_limit:${type}:${key}`;
    const blockKey = `rate_limit_block:${type}:${key}`;

    try {
      await this.redis.del(redisKey);
      await this.redis.del(blockKey);
      this.logger.log(`Rate limit reset for ${type}:${key}`);
    } catch (error) {
      this.logger.error(`Error resetting rate limit: ${error.message}`);
    }
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(
    type: string,
    key: string,
  ): Promise<{
    current: number;
    limit: number;
    resetTime: number;
    blocked: boolean;
    blockExpiry?: number;
  }> {
    const redisKey = `rate_limit:${type}:${key}`;
    const blockKey = `rate_limit_block:${type}:${key}`;
    const now = Date.now();
    const config =
      this.defaultConfigs[type as keyof typeof this.defaultConfigs];

    try {
      // Check if blocked
      const blockExpiry = await this.redis.get(blockKey);
      const blocked = blockExpiry && parseInt(blockExpiry) > now;

      // Get current count
      const windowStart = now - config.windowMs;
      await this.redis.zremrangebyscore(redisKey, 0, windowStart);
      const current = await this.redis.zcard(redisKey);

      return {
        current,
        limit: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: !!blocked,
        blockExpiry: blocked ? parseInt(blockExpiry) : undefined,
      };
    } catch (error) {
      this.logger.error(`Error getting rate limit status: ${error.message}`);
      return {
        current: 0,
        limit: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }
  }

  /**
   * Clean up expired rate limit data
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      const now = Date.now();
      const pattern = 'rate_limit:*';
      const blockPattern = 'rate_limit_block:*';

      // Clean up expired rate limit entries
      const keys = await this.redis.keys(pattern);
      for (const key of keys) {
        const config =
          this.defaultConfigs[
            key.split(':')[1] as keyof typeof this.defaultConfigs
          ];
        const windowStart = now - config.windowMs;
        await this.redis.zremrangebyscore(key, 0, windowStart);
      }

      // Clean up expired block entries
      const blockKeys = await this.redis.keys(blockPattern);
      for (const blockKey of blockKeys) {
        const expiry = await this.redis.get(blockKey);
        if (expiry && parseInt(expiry) <= now) {
          await this.redis.del(blockKey);
        }
      }

      this.logger.log('Rate limit cleanup completed');
    } catch (error) {
      this.logger.error(`Error during rate limit cleanup: ${error.message}`);
    }
  }
}
