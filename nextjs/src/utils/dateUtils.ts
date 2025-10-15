/**
 * Utility functions for date handling in Vietnam timezone (GMT+7)
 */

/**
 * Get current date in Vietnam timezone
 */
export const getVietnamDate = (): Date => {
  const now = new Date();
  // Create a date object that represents the current time in Vietnam timezone
  const vietnamTimeString = now.toLocaleString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the string back to a Date object
  return new Date(vietnamTimeString.replace(',', ''));
};

export const formatMatchDateTime = (matchTime: string, matchDate: string) => {
  try {
    // Check if matchDate is already in DD/MM/YYYY format (from new API)
    if (matchDate.includes('/') && matchDate.length === 10) {
      // Already in DD/MM/YYYY format, use directly
      return `${matchTime} ${matchDate}`;
    }
    
    // Legacy format: Parse the date (ISO string or other formats)
    const date = new Date(matchDate);
    
    // Format date as dd/MM/yyyy
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
    
    // Combine time and date: "18:00 01/10/2025"
    return `${matchTime} ${formattedDate}`;
  } catch {
    // Fallback if date parsing fails
    return `${matchTime}`;
  }
};

/**
 * Convert a date to Vietnam timezone and return as YYYY-MM-DD string
 * This ensures the date string represents the correct day in Vietnam timezone
 */
export const toVietnamDateString = (date: Date): string => {
  // Use toLocaleDateString with Vietnam timezone to get the correct date
  const vietnamDateString = date.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return vietnamDateString; // Returns YYYY-MM-DD format
};

/**
 * Create a date object for a specific date in Vietnam timezone
 * @param year - Full year (e.g., 2024)
 * @param month - Month (0-11, where 0 = January)
 * @param day - Day of month (1-31)
 */
export const createVietnamDate = (year: number, month: number, day: number): Date => {
  // Create date in local timezone first
  const localDate = new Date(year, month, day);
  
  // Adjust to Vietnam timezone
  const vietnamOffset = 7 * 60; // 7 hours in minutes
  const localOffset = localDate.getTimezoneOffset();
  const totalOffset = vietnamOffset + localOffset;
  
  return new Date(localDate.getTime() + (totalOffset * 60 * 1000));
};

/**
 * Get yesterday's date in Vietnam timezone
 */
export const getVietnamYesterday = (): Date => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Convert to Vietnam timezone
  const vietnamTimeString = yesterday.toLocaleString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return new Date(vietnamTimeString.replace(',', ''));
};

/**
 * Get today's date in Vietnam timezone
 */
export const getVietnamToday = (): Date => {
  const now = new Date();
  
  // Convert to Vietnam timezone
  const vietnamTimeString = now.toLocaleString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return new Date(vietnamTimeString.replace(',', ''));
};

/**
 * Format date for display in Vietnamese format
 */
export const formatVietnamDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
