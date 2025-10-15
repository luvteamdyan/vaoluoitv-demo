export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: unknown;
  timestamp: Date;
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    statusCode?: number,
    details?: unknown
  ): ApiError {
    return {
      type,
      message,
      statusCode,
      details,
      timestamp: new Date(),
    };
  }

  static handleFetchError(error: unknown): ApiError {
    // Network error (server down, no internet)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
        0
      );
    }

    // Timeout error
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      return this.createError(
        ErrorType.TIMEOUT_ERROR,
        'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
        408
      );
    }

    // HTTP error responses
    if (error && typeof error === 'object' && ('status' in error || 'statusCode' in error)) {
      const status = (error as { status?: number; statusCode?: number }).status || (error as { status?: number; statusCode?: number }).statusCode;
      
      switch (status) {
        case 401:
          return this.createError(
            ErrorType.AUTHENTICATION_ERROR,
            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            401
          );
        case 403:
          return this.createError(
            ErrorType.AUTHORIZATION_ERROR,
            'Bạn không có quyền thực hiện hành động này.',
            403
          );
        case 404:
          return this.createError(
            ErrorType.NOT_FOUND_ERROR,
            'Không tìm thấy dữ liệu yêu cầu.',
            404
          );
        case 422:
          return this.createError(
            ErrorType.VALIDATION_ERROR,
            (error as { message?: string }).message || 'Dữ liệu không hợp lệ.',
            422,
            (error as { details?: unknown }).details
          );
        case 500:
        case 502:
        case 503:
        case 504:
          return this.createError(
            ErrorType.SERVER_ERROR,
            'Server đang gặp sự cố. Vui lòng thử lại sau.',
            status
          );
        default:
          return this.createError(
            ErrorType.SERVER_ERROR,
            (error as { message?: string }).message || `Lỗi server (${status})`,
            status
          );
      }
    }

    // Generic error
    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      (error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.'),
      undefined,
      error
    );
  }

  static getErrorMessage(error: ApiError): string {
    return error.message;
  }

  static getErrorType(error: ApiError): ErrorType {
    return error.type;
  }

  static isRetryableError(error: ApiError): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.SERVER_ERROR,
      ErrorType.TIMEOUT_ERROR,
    ].includes(error.type);
  }

  static shouldShowErrorToast(error: ApiError): boolean {
    // Don't show toast for authentication errors (will redirect to login)
    return error.type !== ErrorType.AUTHENTICATION_ERROR;
  }

  static getErrorIcon(error: ApiError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return '🌐';
      case ErrorType.SERVER_ERROR:
        return '🔧';
      case ErrorType.AUTHENTICATION_ERROR:
        return '🔐';
      case ErrorType.AUTHORIZATION_ERROR:
        return '🚫';
      case ErrorType.VALIDATION_ERROR:
        return '⚠️';
      case ErrorType.NOT_FOUND_ERROR:
        return '🔍';
      case ErrorType.TIMEOUT_ERROR:
        return '⏰';
      default:
        return '❌';
    }
  }

  static getErrorColor(error: ApiError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.SERVER_ERROR:
        return 'text-red-800 bg-red-50 border-red-300 dark:text-red-200 dark:bg-red-900/30 dark:border-red-600';
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.AUTHORIZATION_ERROR:
        return 'text-orange-800 bg-orange-50 border-orange-300 dark:text-orange-200 dark:bg-orange-900/30 dark:border-orange-600';
      case ErrorType.VALIDATION_ERROR:
        return 'text-yellow-800 bg-yellow-50 border-yellow-300 dark:text-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-600';
      case ErrorType.NOT_FOUND_ERROR:
        return 'text-blue-800 bg-blue-50 border-blue-300 dark:text-blue-200 dark:bg-blue-900/30 dark:border-blue-600';
      case ErrorType.TIMEOUT_ERROR:
        return 'text-purple-800 bg-purple-50 border-purple-300 dark:text-purple-200 dark:bg-purple-900/30 dark:border-purple-600';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-300 dark:text-gray-200 dark:bg-gray-900/30 dark:border-gray-600';
    }
  }

  static logError(error: ApiError, context?: string): void {
    const logData = {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      context,
      details: error.details,
    };

    if (process.env.NODE_ENV === 'development') {
      // Silently log error in production
    }

    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }
}

// Utility function to wrap async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const apiError = ErrorHandler.handleFetchError(error);
    ErrorHandler.logError(apiError, context);
    throw apiError;
  }
}

// Utility function for retry mechanism
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: ApiError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = ErrorHandler.handleFetchError(error);
      
      // Don't retry if error is not retryable
      if (!ErrorHandler.isRetryableError(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}
