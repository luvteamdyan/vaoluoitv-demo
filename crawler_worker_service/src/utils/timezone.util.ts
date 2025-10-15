import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

export class TimezoneUtil {
  private static readonly VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
  private static readonly UTC_OFFSET = 7; // UTC+7

  /**
   * Lấy thời gian hiện tại theo timezone Việt Nam
   */
  static getCurrentVietnamTime(): Date {
    return toZonedTime(new Date(), this.VIETNAM_TIMEZONE);
  }

  /**
   * Chuyển đổi thời gian từ UTC sang timezone Việt Nam
   */
  static toVietnamTime(utcDate: Date): Date {
    return toZonedTime(utcDate, this.VIETNAM_TIMEZONE);
  }

  /**
   * Chuyển đổi thời gian từ timezone Việt Nam sang UTC
   */
  static toUtcTime(vietnamDate: Date): Date {
    return fromZonedTime(vietnamDate, this.VIETNAM_TIMEZONE);
  }

  /**
   * Tạo thời gian trận đấu theo timezone Việt Nam
   */
  static createMatchDateTime(matchDate: Date, matchTime: string): Date {
    // Parse thời gian từ string (format: "HH:MM")
    const [hours, minutes] = matchTime.split(':').map(Number);

    // Tạo thời gian theo timezone Việt Nam
    const vietnamDateTime = new Date(matchDate);
    vietnamDateTime.setHours(hours, minutes, 0, 0);

    // Chuyển về UTC để lưu vào database
    return this.toUtcTime(vietnamDateTime);
  }

  /**
   * So sánh thời gian trận đấu với thời gian hiện tại (theo timezone Việt Nam)
   */
  static compareWithCurrentTime(
    matchDate: Date,
    matchTime: string,
  ): {
    timeDiff: number; // milliseconds
    minutesDiff: number; // minutes
    isBefore: boolean;
    isAfter: boolean;
  } {
    const currentVietnamTime = this.getCurrentVietnamTime();
    const matchVietnamTime = this.toVietnamTime(
      this.createMatchDateTime(matchDate, matchTime),
    );

    const timeDiff = currentVietnamTime.getTime() - matchVietnamTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return {
      timeDiff,
      minutesDiff,
      isBefore: minutesDiff < 0,
      isAfter: minutesDiff > 0,
    };
  }

  /**
   * Format thời gian theo timezone Việt Nam
   */
  static formatVietnamTime(
    date: Date,
    formatStr: string = 'dd/MM/yyyy HH:mm:ss',
  ): string {
    return format(date, formatStr, { timeZone: this.VIETNAM_TIMEZONE });
  }

  /**
   * Lấy thời gian bắt đầu và kết thúc của ngày theo timezone Việt Nam
   */
  static getVietnamDayRange(date: Date): { startOfDay: Date; endOfDay: Date } {
    const vietnamDate = this.toVietnamTime(date);

    const startOfDay = new Date(vietnamDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(vietnamDate);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      startOfDay: this.toUtcTime(startOfDay),
      endOfDay: this.toUtcTime(endOfDay),
    };
  }

  /**
   * Kiểm tra xem thời gian có trong khoảng thời gian cụ thể không (theo timezone Việt Nam)
   */
  static isTimeInRange(
    checkTime: Date,
    startTime: Date,
    endTime: Date,
  ): boolean {
    const checkVietnamTime = this.toVietnamTime(checkTime);
    const startVietnamTime = this.toVietnamTime(startTime);
    const endVietnamTime = this.toVietnamTime(endTime);

    return (
      checkVietnamTime >= startVietnamTime && checkVietnamTime <= endVietnamTime
    );
  }

  /**
   * Lấy thời gian hiện tại theo format cho logging
   */
  static getCurrentVietnamTimeString(): string {
    return this.formatVietnamTime(new Date(), 'dd/MM/yyyy HH:mm:ss');
  }

  /**
   * Debug: Log thời gian với timezone
   */
  static debugTime(message: string, date: Date): void {
    const utcTime = date.toISOString();
    const vietnamTime = this.formatVietnamTime(date);
    console.log(`[${message}] UTC: ${utcTime}, Vietnam: ${vietnamTime}`);
  }

  /**
   * Parse match_date string (format: "DD/MM/YYYY") thành Date object
   */
  static parseMatchDateString(matchDateString: string): Date {
    const [day, month, year] = matchDateString.split('/').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }

  /**
   * Tạo thời gian trận đấu từ match_date string và match_time string
   */
  static createMatchDateTimeFromString(
    matchDateString: string,
    matchTime: string,
  ): Date {
    const matchDate = this.parseMatchDateString(matchDateString);
    return this.createMatchDateTime(matchDate, matchTime);
  }

  /**
   * So sánh thời gian trận đấu với thời gian hiện tại từ string inputs
   */
  static compareWithCurrentTimeFromString(
    matchDateString: string,
    matchTime: string,
  ): {
    timeDiff: number; // milliseconds
    minutesDiff: number; // minutes
    isBefore: boolean;
    isAfter: boolean;
  } {
    const matchDate = this.parseMatchDateString(matchDateString);
    return this.compareWithCurrentTime(matchDate, matchTime);
  }

  /**
   * Kiểm tra xem match_date string có phải ngày hiện tại không
   */
  static isMatchDateCurrentDay(matchDateString: string): boolean {
    const currentVietnamDate = this.getCurrentVietnamTime();
    const currentVietnamDateString = this.formatVietnamTime(
      currentVietnamDate,
      'dd/MM/yyyy',
    );
    return matchDateString === currentVietnamDateString;
  }

  /**
   * Convert DD-MM-YYYY format thành DD/MM/YYYY format
   */
  static convertDateFormat(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
}
