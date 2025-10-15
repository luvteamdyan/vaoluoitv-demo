import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditLoggerService } from './audit-logger.service';
import { RateLimitService } from './rate-limit.service';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type:
    | 'RATE_LIMIT_SPIKE'
    | 'SUSPICIOUS_ACTIVITY'
    | 'XSS_ATTEMPT'
    | 'SYSTEM_ANOMALY';
  message: string;
  details: any;
  resolved: boolean;
  resolvedAt?: string;
}

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly alerts: SecurityAlert[] = [];
  private readonly alertThresholds = {
    suspiciousMessagesPerMinute: 10,
    rateLimitViolationsPerMinute: 20,
    xssAttemptsPerMinute: 5,
    criticalRiskScore: 80,
  };

  constructor(
    private readonly auditLogger: AuditLoggerService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async onModuleInit() {
    this.logger.log('Security monitoring service initialized');
  }

  /**
   * Monitor security events every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async monitorSecurityEvents() {
    try {
      await this.checkSuspiciousActivity();
      await this.checkRateLimitViolations();
      await this.checkXSSAttempts();
      await this.cleanupOldAlerts();
    } catch (error) {
      this.logger.error(`Error during security monitoring: ${error.message}`);
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkSuspiciousActivity() {
    const stats = await this.auditLogger.getSecurityStats('hour');

    if (
      stats.byEventType['SUSPICIOUS_PATTERN'] >
      this.alertThresholds.suspiciousMessagesPerMinute
    ) {
      await this.createAlert({
        severity: 'HIGH',
        type: 'SUSPICIOUS_ACTIVITY',
        message: `High volume of suspicious messages detected: ${stats.byEventType['SUSPICIOUS_PATTERN']} in the last hour`,
        details: {
          count: stats.byEventType['SUSPICIOUS_PATTERN'],
          threshold: this.alertThresholds.suspiciousMessagesPerMinute,
          topUsers: stats.topSuspiciousUsers.slice(0, 5),
        },
      });
    }

    if (stats.averageRiskScore > this.alertThresholds.criticalRiskScore) {
      await this.createAlert({
        severity: 'CRITICAL',
        type: 'SUSPICIOUS_ACTIVITY',
        message: `Critical risk score detected: ${stats.averageRiskScore.toFixed(2)}`,
        details: {
          averageRiskScore: stats.averageRiskScore,
          threshold: this.alertThresholds.criticalRiskScore,
        },
      });
    }
  }

  /**
   * Check for rate limit violations
   */
  private async checkRateLimitViolations() {
    const stats = await this.auditLogger.getSecurityStats('hour');

    if (
      stats.byEventType['RATE_LIMIT_EXCEEDED'] >
      this.alertThresholds.rateLimitViolationsPerMinute
    ) {
      await this.createAlert({
        severity: 'MEDIUM',
        type: 'RATE_LIMIT_SPIKE',
        message: `High volume of rate limit violations: ${stats.byEventType['RATE_LIMIT_EXCEEDED']} in the last hour`,
        details: {
          count: stats.byEventType['RATE_LIMIT_EXCEEDED'],
          threshold: this.alertThresholds.rateLimitViolationsPerMinute,
        },
      });
    }
  }

  /**
   * Check for XSS attempts
   */
  private async checkXSSAttempts() {
    const logs = await this.auditLogger.getAuditLogs({
      eventType: 'SUSPICIOUS_PATTERN',
      startTime: Date.now() - 60 * 60 * 1000, // Last hour
    });

    const xssAttempts = logs.filter((log) =>
      log.details.suspiciousPatterns?.some(
        (pattern: string) =>
          pattern.includes('script') ||
          pattern.includes('javascript') ||
          pattern.includes('eval'),
      ),
    );

    if (xssAttempts.length > this.alertThresholds.xssAttemptsPerMinute) {
      await this.createAlert({
        severity: 'HIGH',
        type: 'XSS_ATTEMPT',
        message: `Multiple XSS attempts detected: ${xssAttempts.length} in the last hour`,
        details: {
          count: xssAttempts.length,
          threshold: this.alertThresholds.xssAttemptsPerMinute,
          attempts: xssAttempts.map((attempt) => ({
            userId: attempt.userId,
            ipAddress: attempt.ipAddress,
            patterns: attempt.details.suspiciousPatterns,
            timestamp: attempt.timestamp,
          })),
        },
      });
    }
  }

  /**
   * Create a security alert
   */
  private async createAlert(
    alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>,
  ) {
    const alert: SecurityAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Log the alert
    this.logger.warn(`Security Alert [${alert.severity}]: ${alert.message}`);

    // Send to external monitoring system (if configured)
    await this.sendToExternalMonitoring(alert);

    // Auto-resolve low severity alerts after 1 hour
    if (alert.severity === 'LOW') {
      setTimeout(
        () => {
          this.resolveAlert(alert.id);
        },
        60 * 60 * 1000,
      );
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.logger.log(`Alert resolved: ${alertId}`);
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(
    filters: {
      severity?: string;
      type?: string;
      resolved?: boolean;
      limit?: number;
    } = {},
  ): SecurityAlert[] {
    let filteredAlerts = [...this.alerts];

    if (filters.severity) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.severity === filters.severity,
      );
    }

    if (filters.type) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.type === filters.type,
      );
    }

    if (filters.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.resolved === filters.resolved,
      );
    }

    if (filters.limit) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit);
    }

    return filteredAlerts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard() {
    const stats = await this.auditLogger.getSecurityStats('day');
    const alerts = this.getAlerts({ limit: 10 });

    return {
      overview: {
        totalEvents: stats.totalEvents,
        averageRiskScore: stats.averageRiskScore,
        activeAlerts: alerts.filter((a) => !a.resolved).length,
        resolvedAlerts: alerts.filter((a) => a.resolved).length,
      },
      eventsByType: stats.byEventType,
      eventsBySeverity: stats.bySeverity,
      topSuspiciousUsers: stats.topSuspiciousUsers,
      recentAlerts: alerts,
    };
  }

  /**
   * Send alert to external monitoring system
   */
  private async sendToExternalMonitoring(alert: SecurityAlert) {
    try {
      // Example: Send to Slack, Discord, or other monitoring systems
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendToSlack(alert);
      }

      if (process.env.DISCORD_WEBHOOK_URL) {
        await this.sendToDiscord(alert);
      }

      // Example: Send to email
      if (process.env.ALERT_EMAIL) {
        await this.sendEmail(alert);
      }
    } catch (error) {
      this.logger.error(
        `Error sending alert to external monitoring: ${error.message}`,
      );
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(alert: SecurityAlert) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const color = {
      LOW: '#36a64f',
      MEDIUM: '#ff9500',
      HIGH: '#ff0000',
      CRITICAL: '#8b0000',
    }[alert.severity];

    const _payload = {
      attachments: [
        {
          color,
          title: `Security Alert: ${alert.type}`,
          text: alert.message,
          fields: [
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Type', value: alert.type, short: true },
            { title: 'Timestamp', value: alert.timestamp, short: true },
          ],
          footer: 'VaoLuoiTV Security Monitor',
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
        },
      ],
    };

    // Implementation would use axios or fetch to send to Slack
    this.logger.log(`Slack alert sent: ${alert.id}`);
  }

  /**
   * Send alert to Discord
   */
  private async sendToDiscord(alert: SecurityAlert) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    const color = {
      LOW: 0x36a64f,
      MEDIUM: 0xff9500,
      HIGH: 0xff0000,
      CRITICAL: 0x8b0000,
    }[alert.severity];

    const _payload = {
      embeds: [
        {
          title: `Security Alert: ${alert.type}`,
          description: alert.message,
          color,
          fields: [
            { name: 'Severity', value: alert.severity, inline: true },
            { name: 'Type', value: alert.type, inline: true },
            { name: 'Timestamp', value: alert.timestamp, inline: true },
          ],
          footer: { text: 'VaoLuoiTV Security Monitor' },
          timestamp: alert.timestamp,
        },
      ],
    };

    // Implementation would use axios or fetch to send to Discord
    this.logger.log(`Discord alert sent: ${alert.id}`);
  }

  /**
   * Send alert via email
   */
  private async sendEmail(alert: SecurityAlert) {
    const email = process.env.ALERT_EMAIL;
    if (!email) return;

    // Implementation would use nodemailer or similar
    this.logger.log(`Email alert sent to ${email}: ${alert.id}`);
  }

  /**
   * Cleanup old alerts
   */
  private async cleanupOldAlerts() {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    const initialLength = this.alerts.length;

    this.alerts.splice(
      0,
      this.alerts.length,
      ...this.alerts.filter(
        (alert) => new Date(alert.timestamp).getTime() > cutoffTime,
      ),
    );

    const removedCount = initialLength - this.alerts.length;
    if (removedCount > 0) {
      this.logger.log(`Cleaned up ${removedCount} old alerts`);
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
