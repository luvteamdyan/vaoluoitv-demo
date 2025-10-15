/**
 * Utility functions for formatting dates and times
 */

/**
 * Format match date and time for display
 * @param matchDate - Date string from API (format: DD/MM/YYYY)
 * @param matchTime - Time string from API (e.g., "15:00")
 * @returns Formatted string in format "HH:MM DD/MM/YYYY"
 */
export const formatMatchDateTime = (matchDate: string, matchTime: string): string => {
  if (!matchTime || matchTime === 'undefined' || matchTime === 'null') {
    return 'Chưa có giờ';
  }
  
  if (!matchDate || matchDate === 'undefined' || matchDate === 'null') {
    return 'Chưa có ngày';
  }
  
  try {
    // matchDate đã là string format DD/MM/YYYY từ API
    // Chỉ cần validate và trả về kết hợp với time
    const dateParts = matchDate.split('/');
    
    if (dateParts.length !== 3) {
      return 'Định dạng ngày không đúng';
    }
    
    const [day, month, year] = dateParts;
    
    if (!day || !month || !year) {
      return 'Định dạng ngày không đúng';
    }
    
    // Trả về format: "HH:MM DD/MM/YYYY"
    return `${matchTime} ${matchDate}`;
  } catch (error) {
    return 'Lỗi định dạng ngày';
  }
};

/**
 * Parse and validate date string
 * @param dateString - Date string to validate
 * @returns Valid Date object or null if invalid
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Format date string to Vietnamese locale
 * @param dateString - Date string in format DD/MM/YYYY from API
 * @returns Formatted date string in Vietnamese format DD/MM/YYYY
 */
export const formatDateStringToVietnamese = (dateString: string): string => {
  if (!dateString || dateString === 'undefined' || dateString === 'null') {
    return 'Chưa có ngày';
  }
  
  try {
    // dateString đã là format DD/MM/YYYY từ API
    // Chỉ cần validate và trả về
    const dateParts = dateString.split('/');
    
    if (dateParts.length !== 3) {
      return 'Định dạng ngày không đúng';
    }
    
    const [day, month, year] = dateParts;
    
    if (!day || !month || !year) {
      return 'Định dạng ngày không đúng';
    }
    
    // Trả về format DD/MM/YYYY
    return dateString;
  } catch (error) {
    return 'Lỗi định dạng ngày';
  }
};

/**
 * Format date to Vietnamese locale
 * @param date - Date string in format DD/MM/YYYY from API
 * @returns Formatted date string in Vietnamese format DD/MM/YYYY
 */
export const formatDateToVietnamese = (date: string): string => {
  if (!date || date === 'undefined' || date === 'null') {
    return 'Chưa có ngày';
  }
  
  try {
    // date đã là format DD/MM/YYYY từ API
    // Chỉ cần validate và trả về
    const dateParts = date.split('/');
    
    if (dateParts.length !== 3) {
      return 'Định dạng ngày không đúng';
    }
    
    const [day, month, year] = dateParts;
    
    if (!day || !month || !year) {
      return 'Định dạng ngày không đúng';
    }
    
    // Trả về format DD/MM/YYYY
    return date;
  } catch (error) {
    return 'Lỗi định dạng ngày';
  }
};

/**
 * Convert date from HTML input format (YYYY-MM-DD) to backend format (DD/MM/YYYY)
 * @param htmlDateString - Date string from HTML input type="date" (format: YYYY-MM-DD)
 * @returns Date string in backend format DD/MM/YYYY
 */
export const convertHtmlDateToBackendFormat = (htmlDateString: string): string => {
  if (!htmlDateString || htmlDateString === 'undefined' || htmlDateString === 'null') {
    return '';
  }
  
  try {
    // Parse YYYY-MM-DD format
    const dateParts = htmlDateString.split('-');
    
    if (dateParts.length !== 3) {
      return htmlDateString; // Return original if invalid
    }
    
    const [year, month, day] = dateParts;
    
    if (!year || !month || !day) {
      return htmlDateString; // Return original if invalid
    }
    
    // Convert to DD/MM/YYYY format
    return `${day}/${month}/${year}`;
  } catch (error) {
    return htmlDateString; // Return original if conversion fails
  }
};

/**
 * Convert date from backend format (DD/MM/YYYY) to HTML input format (YYYY-MM-DD)
 * @param backendDateString - Date string from backend (format: DD/MM/YYYY)
 * @returns Date string in HTML input format YYYY-MM-DD
 */
export const convertBackendDateToHtmlFormat = (backendDateString: string): string => {
  if (!backendDateString || backendDateString === 'undefined' || backendDateString === 'null') {
    return '';
  }
  
  try {
    // Parse DD/MM/YYYY format
    const dateParts = backendDateString.split('/');
    
    if (dateParts.length !== 3) {
      console.error('Invalid backend date format:', backendDateString);
      return backendDateString; // Return original if invalid
    }
    
    const [day, month, year] = dateParts;
    
    if (!day || !month || !year) {
      return backendDateString; // Return original if invalid
    }
    
    // Convert to YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  } catch (error) {
    return backendDateString; // Return original if conversion fails
  }
};
