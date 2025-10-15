import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '@/config/app-config.service';

export interface ExternalUserRequest {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  address?: string;
  invited_by?: string;
}

export interface ExternalUserResponse {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  address?: string;
  sms_verified: boolean;
  points: number;
  referral_code: string;
  invited_by?: string;
  role: string;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ExternalUserService {
  private readonly logger = new Logger(ExternalUserService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {}

  async createUser(
    userData: ExternalUserRequest,
  ): Promise<ExternalUserResponse> {
    try {
      this.logger.log(`Creating user in external service: ${userData.email}`);

      const externalApiUrl = this.configService.externalUserApiUrl;
      const apiKey = this.configService.externalUserApiKey;

      if (!externalApiUrl || !apiKey) {
        throw new HttpException(
          'External user service configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey, // Alternative header format
      };

      const response = await firstValueFrom(
        this.httpService.post(`${externalApiUrl}/users`, userData, { headers }),
      );

      if (response.status === 201 || response.status === 200) {
        this.logger.log(
          `User created successfully in external service: ${userData.email}`,
        );
        return response.data;
      } else {
        throw new HttpException(
          `External service returned status ${response.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to create user in external service: ${error.message}`,
      );

      if (error.response) {
        // External service returned an error
        const statusCode = error.response.status || HttpStatus.BAD_REQUEST;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          'External service error';

        throw new HttpException(
          `External service error: ${errorMessage}`,
          statusCode,
        );
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        // Connection error
        throw new HttpException(
          'Cannot connect to external user service',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Other errors
        throw new HttpException(
          `Failed to create user in external service: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async updateUser(
    userId: string,
    userData: Partial<ExternalUserRequest>,
  ): Promise<ExternalUserResponse> {
    try {
      this.logger.log(`Updating user in external service: ${userId}`);

      const externalApiUrl = this.configService.externalUserApiUrl;
      const apiKey = this.configService.externalUserApiKey;

      if (!externalApiUrl || !apiKey) {
        throw new HttpException(
          'External user service configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      };

      const response = await firstValueFrom(
        this.httpService.patch(`${externalApiUrl}/users/${userId}`, userData, {
          headers,
        }),
      );

      if (response.status === 200) {
        this.logger.log(
          `User updated successfully in external service: ${userId}`,
        );
        return response.data;
      } else {
        throw new HttpException(
          `External service returned status ${response.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to update user in external service: ${error.message}`,
      );

      if (error.response) {
        const statusCode = error.response.status || HttpStatus.BAD_REQUEST;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          'External service error';

        throw new HttpException(
          `External service error: ${errorMessage}`,
          statusCode,
        );
      } else {
        throw new HttpException(
          `Failed to update user in external service: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      this.logger.log(`Deleting user in external service: ${userId}`);

      const externalApiUrl = this.configService.externalUserApiUrl;
      const apiKey = this.configService.externalUserApiKey;

      if (!externalApiUrl || !apiKey) {
        throw new HttpException(
          'External user service configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      };

      const response = await firstValueFrom(
        this.httpService.delete(`${externalApiUrl}/users/${userId}`, {
          headers,
        }),
      );

      if (response.status === 200 || response.status === 204) {
        this.logger.log(
          `User deleted successfully in external service: ${userId}`,
        );
      } else {
        throw new HttpException(
          `External service returned status ${response.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete user in external service: ${error.message}`,
      );

      if (error.response) {
        const statusCode = error.response.status || HttpStatus.BAD_REQUEST;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          'External service error';

        throw new HttpException(
          `External service error: ${errorMessage}`,
          statusCode,
        );
      } else {
        throw new HttpException(
          `Failed to delete user in external service: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const externalApiUrl = this.configService.externalUserApiUrl;
      const apiKey = this.configService.externalUserApiKey;

      if (!externalApiUrl || !apiKey) {
        return false;
      }

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      };

      const response = await firstValueFrom(
        this.httpService.get(`${externalApiUrl}/health`, { headers }),
      );

      return response.status === 200;
    } catch (error) {
      this.logger.warn(
        `External user service health check failed: ${error.message}`,
      );
      return false;
    }
  }
}
