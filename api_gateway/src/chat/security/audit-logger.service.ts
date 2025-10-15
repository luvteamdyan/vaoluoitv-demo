import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'MESSAGE_SENT'
    | 'MESSAGE_BLOCKED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'SUSPICIOUS_PATTERN'
    | 'ADMIN_ACTION'
    | 'CONNECTION_ATTEMPT';
  userId?: string;
  socketId?: string;
  ipAddress?: string;
  matchId?: string;
  messageId?: string;
  details: {
    message?: string;
    sanitizedMessage?: string;
    suspiciousPatterns?: string[];
    rateLimitType?: string;
    adminAction?: string;
    reason?: string;
    userAgent?: string;
    [key: string]: any;
  };
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);
  private readonly auditLogKey = 'audit_logs';
  private readonly maxLogEntries = 10000; // Keep last 10k entries

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Log a security event
   */
  async logSecurityEvent(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Store in Redis with TTL
      const logKey = `${this.auditLogKey}:${auditEntry.id}`;
      await this.redis.setex(
        logKey,
        7 * 24 * 60 * 60,
        JSON.stringify(auditEntry),
      ); // 7 days TTL

      // Add to sorted set for time-based queries
      await this.redis.zadd(
        `${this.auditLogKey}:by_time`,
        Date.now(),
        auditEntry.id,
      );

      // Add to severity-based sets
      await this.redis.zadd(
        `${this.auditLogKey}:severity:${auditEntry.severity.toLowerCase()}`,
        Date.now(),
        auditEntry.id,
      );

      // Add to event type sets
      await this.redis.zadd(
        `${this.auditLogKey}:event:${auditEntry.eventType.toLowerCase()}`,
        Date.now(),
        auditEntry.id,
      );

      // Cleanup old entries
      await this.cleanupOldEntries();

      // Log to console for immediate visibility
      this.logToConsole(auditEntry);
    } catch (error) {
      this.logger.error(`Error logging security event: ${error.message}`);
    }
  }

  /**
   * Log suspicious message
   */
  async logSuspiciousMessage(
    userId: string,
    socketId: string,
    ipAddress: string,
    matchId: string,
    originalMessage: string,
    sanitizedMessage: string,
    suspiciousPatterns: string[],
  ): Promise<void> {
    const riskScore = this.calculateRiskScore(
      suspiciousPatterns,
      originalMessage,
    );
    const severity = this.getSeverityFromRiskScore(riskScore);

    await this.logSecurityEvent({
      eventType: 'SUSPICIOUS_PATTERN',
      userId,
      socketId,
      ipAddress,
      matchId,
      details: {
        message: originalMessage,
        sanitizedMessage,
        suspiciousPatterns,
        originalLength: originalMessage.length,
        sanitizedLength: sanitizedMessage.length,
      },
      severity,
      riskScore,
    });
  }

  /**
   * Log rate limit violation
   */
  async logRateLimitViolation(
    userId: string,
    socketId: string,
    ipAddress: string,
    rateLimitType: string,
    matchId?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      userId,
      socketId,
      ipAddress,
      matchId,
      details: {
        rateLimitType,
        violationTime: new Date().toISOString(),
      },
      severity: 'MEDIUM',
      riskScore: 60,
    });
  }

  /**
   * Log blocked message
   */
  async logBlockedMessage(
    userId: string,
    socketId: string,
    ipAddress: string,
    matchId: string,
    message: string,
    reason: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'MESSAGE_BLOCKED',
      userId,
      socketId,
      ipAddress,
      matchId,
      details: {
        message,
        reason,
        blockTime: new Date().toISOString(),
      },
      severity: 'HIGH',
      riskScore: 80,
    });
  }

  /**
   * Log admin action
   */
  async logAdminAction(
    adminId: string,
    action: string,
    targetId: string,
    details: any,
  ): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'ADMIN_ACTION',
      userId: adminId,
      details: {
        adminAction: action,
        targetId,
        ...details,
      },
      severity: 'LOW',
      riskScore: 10,
    });
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(
    filters: {
      severity?: string;
      eventType?: string;
      userId?: string;
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {},
  ): Promise<AuditLogEntry[]> {
    try {
      let key = this.auditLogKey;

      if (filters.severity) {
        key = `${this.auditLogKey}:severity:${filters.severity.toLowerCase()}`;
      } else if (filters.eventType) {
        key = `${this.auditLogKey}:event:${filters.eventType.toLowerCase()}`;
      } else {
        key = `${this.auditLogKey}:by_time`;
      }

      const start = filters.startTime || 0;
      const end = filters.endTime || '+inf';
      const limit = filters.limit || 100;

      const logIds = await this.redis.zrevrangebyscore(
        key,
        end,
        start,
        'LIMIT',
        0,
        limit,
      );

      const logs: AuditLogEntry[] = [];
      for (const logId of logIds) {
        const logData = await this.redis.get(`${this.auditLogKey}:${logId}`);
        if (logData) {
          const log = JSON.parse(logData) as AuditLogEntry;

          // Apply additional filters
          if (filters.userId && log.userId !== filters.userId) {
            continue;
          }

          logs.push(log);
        }
      }

      return logs;
    } catch (error) {
      this.logger.error(`Error getting audit logs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalEvents: number;
    bySeverity: { [key: string]: number };
    byEventType: { [key: string]: number };
    topSuspiciousUsers: { userId: string; count: number }[];
    averageRiskScore: number;
  }> {
    try {
      const now = Date.now();
      const timeframeMs = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
      }[timeframe];

      const startTime = now - timeframeMs;
      const logIds = await this.redis.zrevrangebyscore(
        `${this.auditLogKey}:by_time`,
        now,
        startTime,
      );

      const stats = {
        totalEvents: logIds.length,
        bySeverity: {} as { [key: string]: number },
        byEventType: {} as { [key: string]: number },
        topSuspiciousUsers: [] as { userId: string; count: number }[],
        averageRiskScore: 0,
      };

      const userCounts: { [key: string]: number } = {};
      let totalRiskScore = 0;

      for (const logId of logIds) {
        const logData = await this.redis.get(`${this.auditLogKey}:${logId}`);
        if (logData) {
          const log = JSON.parse(logData) as AuditLogEntry;

          // Count by severity
          stats.bySeverity[log.severity] =
            (stats.bySeverity[log.severity] || 0) + 1;

          // Count by event type
          stats.byEventType[log.eventType] =
            (stats.byEventType[log.eventType] || 0) + 1;

          // Count suspicious users
          if (log.userId && log.eventType === 'SUSPICIOUS_PATTERN') {
            userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
          }

          totalRiskScore += log.riskScore;
        }
      }

      // Calculate top suspicious users
      stats.topSuspiciousUsers = Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      stats.averageRiskScore =
        stats.totalEvents > 0 ? totalRiskScore / stats.totalEvents : 0;

      return stats;
    } catch (error) {
      this.logger.error(`Error getting security stats: ${error.message}`);
      return {
        totalEvents: 0,
        bySeverity: {},
        byEventType: {},
        topSuspiciousUsers: [],
        averageRiskScore: 0,
      };
    }
  }

  /**
   * Calculate risk score based on suspicious patterns
   */
  private calculateRiskScore(patterns: string[], message: string): number {
    let score = 0;

    // Base score for having suspicious patterns
    score += patterns.length * 10;

    // Higher score for script-related patterns
    const scriptPatterns = patterns.filter(
      (p) =>
        p.includes('script') || p.includes('eval') || p.includes('javascript'),
    );
    score += scriptPatterns.length * 20;

    // Higher score for longer messages with patterns
    if (message.length > 500) {
      score += 10;
    }

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Get severity from risk score
   */
  private getSeverityFromRiskScore(
    riskScore: number,
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log to console for immediate visibility
   */
  private logToConsole(entry: AuditLogEntry): void {
    const logMessage = `[${entry.severity}] ${entry.eventType}: ${JSON.stringify(entry.details)}`;

    switch (entry.severity) {
      case 'CRITICAL':
        this.logger.error(logMessage);
        break;
      case 'HIGH':
        this.logger.warn(logMessage);
        break;
      case 'MEDIUM':
        this.logger.log(logMessage);
        break;
      case 'LOW':
        this.logger.debug(logMessage);
        break;
    }
  }

  /**
   * Cleanup old entries
   */
  private async cleanupOldEntries(): Promise<void> {
    try {
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      const cutoffTime = Date.now() - maxAge;

      // Remove old entries from time-based index
      await this.redis.zremrangebyscore(
        `${this.auditLogKey}:by_time`,
        0,
        cutoffTime,
      );

      // Clean up individual log entries
      const oldLogIds = await this.redis.zrangebyscore(
        `${this.auditLogKey}:by_time`,
        0,
        cutoffTime,
      );

      for (const logId of oldLogIds) {
        await this.redis.del(`${this.auditLogKey}:${logId}`);
      }
    } catch (error) {
      this.logger.error(`Error during audit log cleanup: ${error.message}`);
    }
  }
}
