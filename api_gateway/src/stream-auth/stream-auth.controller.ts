import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { StreamAuthService } from './stream-auth.service';

@ApiTags('Stream Auth')
@Controller('api/v1/stream')
export class StreamAuthController {
  private readonly logger = new Logger(StreamAuthController.name);

  constructor(private readonly streamAuthService: StreamAuthService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Xác thực stream',
    description: 'Xác thực stream cho RTMP connect/publish (SRS callbacks)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', example: 'vid-s3697v4' },
        service_id: { type: 'string', example: 'gfi83o74' },
        action: {
          type: 'string',
          enum: ['on_connect', 'on_publish'],
          example: 'on_publish',
        },
        client_id: { type: 'string', example: '5ozd10h8' },
        ip: { type: 'string', example: '172.65.32.248' },
        vhost: { type: 'string', example: '__defaultVhost__' },
        app: { type: 'string', example: 'live' },
        tcUrl: { type: 'string', example: 'rtmp://localhost:1935/live' },
        stream: {
          type: 'string',
          example: 'c3c057cfe37caf60911014924bec22dd',
          description: 'Stream key (for SRS, this is the actual stream key)',
        },
        param: { type: 'string', example: '' },
        stream_url: {
          type: 'string',
          example: '/live/c3c057cfe37caf60911014924bec22dd',
        },
        stream_id: { type: 'string', example: 'vid-lw44796' },
      },
      required: ['action', 'stream'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xác thực stream',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 0,
          description: '0 = success, 1 = error',
        },
        message: { type: 'string', example: 'OK' },
        data: {
          type: 'object',
          properties: {
            stream: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
              description: 'Match ID',
            },
            app: {
              type: 'string',
              example: 'live',
              description: 'Application name',
            },
          },
        },
      },
    },
  })
  async validateStream(@Body() body: any): Promise<{
    code: number;
    message: string;
    data?: { stream: string; app: string };
  }> {
    // Basic validation - only require action and stream
    if (!body.action || !body.stream) {
      this.logger.warn(
        `Missing required fields: action=${body.action}, stream=${body.stream}`,
      );
      return {
        code: 1,
        message: 'Missing required fields: action and stream are required',
      };
    }

    if (body.action !== 'on_connect' && body.action !== 'on_publish') {
      this.logger.warn(`Invalid action: ${body.action}`);
      return { code: 1, message: 'Invalid action' };
    }

    // For on_publish, stream key is required (in SRS, stream key is in 'stream' field)
    if (body.action === 'on_publish' && !body.stream) {
      this.logger.warn(`Missing stream key for on_publish`);
      return { code: 1, message: 'Stream key required for on_publish' };
    }

    this.logger.log(
      `Stream validation request for: ${body.stream}, action: ${body.action}, server_id: ${body.server_id}, app: ${body.app}`,
    );
    try {
      const result = await this.streamAuthService.validateStream(body);
      return result;
    } catch (error) {
      this.logger.error(`Stream validation error: ${error.message}`);
      return { code: 1, message: 'Internal server error' };
    }
  }

  @Post('event')
  @ApiOperation({
    summary: 'Xử lý sự kiện stream',
    description:
      'Xử lý các sự kiện stream (SRS on_unpublish, on_stop callbacks)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', example: 'vid-s3697v4' },
        service_id: { type: 'string', example: 'gfi83o74' },
        action: {
          type: 'string',
          enum: ['on_unpublish', 'on_stop'],
          example: 'on_unpublish',
        },
        client_id: { type: 'string', example: '5ozd10h8' },
        ip: { type: 'string', example: '172.65.32.248' },
        vhost: { type: 'string', example: '__defaultVhost__' },
        app: { type: 'string', example: 'live' },
        tcUrl: { type: 'string', example: 'rtmp://localhost:1935/live' },
        stream: {
          type: 'string',
          example: 'c3c057cfe37caf60911014924bec22dd',
          description: 'Stream key (for SRS, this is the actual stream key)',
        },
        param: { type: 'string', example: '' },
        stream_url: {
          type: 'string',
          example: '/live/c3c057cfe37caf60911014924bec22dd',
        },
        stream_id: { type: 'string', example: 'vid-lw44796' },
      },
      required: ['action', 'stream'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xử lý sự kiện',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 0,
          description: '0 = success, 1 = error',
        },
        message: { type: 'string', example: 'OK' },
      },
    },
  })
  async handleStreamEvent(
    @Body() body: any,
  ): Promise<{ code: number; message: string }> {
    this.logger.log(`Stream event request: ${body.action} for ${body.stream}`);

    try {
      const result = await this.streamAuthService.handleStreamEvent(body);
      return result;
    } catch (error) {
      this.logger.error(`Stream event error: ${error.message}`);
      return { code: 1, message: 'Internal server error' };
    }
  }

  @Post('secure-validate')
  @ApiOperation({
    summary: 'Xác thực URL đã ký',
    description: 'Xác thực URL đã ký cho playback (Traefik forward-auth)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', example: '/live/stream.flv?token=...' },
        ip: { type: 'string', example: '192.168.1.1' },
        userAgent: { type: 'string', example: 'Mozilla/5.0...' },
      },
      required: ['path'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xác thực URL',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 0,
          description: '0 = success, 1 = error',
        },
        message: { type: 'string', example: 'OK' },
      },
    },
  })
  async validateSecureUrl(
    @Body() body: any,
  ): Promise<{ code: number; message: string }> {
    this.logger.log(`Secure URL validation for: ${body.path}`);

    try {
      const result = await this.streamAuthService.validateSecureUrl(body);
      return result;
    } catch (error) {
      this.logger.error(`Secure URL validation error: ${error.message}`);
      return { code: 1, message: 'Internal server error' };
    }
  }

  @Post('play-validate')
  @ApiOperation({
    summary: 'Xác thực quyền phát',
    description: 'Xác thực quyền phát stream cho SRS on_play callback',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', example: 'vid-s3697v4' },
        service_id: { type: 'string', example: 'gfi83o74' },
        action: { type: 'string', enum: ['on_play'], example: 'on_play' },
        client_id: { type: 'string', example: '5ozd10h8' },
        ip: { type: 'string', example: '172.65.32.248' },
        vhost: { type: 'string', example: '__defaultVhost__' },
        app: { type: 'string', example: 'live' },
        tcUrl: { type: 'string', example: 'rtmp://localhost:1935/live' },
        stream: {
          type: 'string',
          example: 'c3c057cfe37caf60911014924bec22dd',
          description: 'Stream key (for SRS, this is the actual stream key)',
        },
        param: { type: 'string', example: '' },
        stream_url: {
          type: 'string',
          example: '/live/c3c057cfe37caf60911014924bec22dd',
        },
        stream_id: { type: 'string', example: 'vid-lw44796' },
        wsSecret: { type: 'string', example: 'signature_token' },
        wsTime: { type: 'string', example: '1640995200' },
      },
      required: ['action', 'stream'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xác thực quyền phát',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 0,
          description: '0 = success, 1 = error',
        },
        message: { type: 'string', example: 'OK' },
      },
    },
  })
  async validatePlay(
    @Body() body: any,
  ): Promise<{ code: number; message: string }> {
    if (!body) {
      return { code: 1, message: 'Invalid body' };
    }
    if (!body.action || !body.stream) {
      return {
        code: 1,
        message: 'Missing required fields: action and stream are required',
      };
    }
    if (body.action !== 'on_play') {
      return { code: 1, message: 'Invalid action' };
    }

    this.logger.log(
      `Play validation request for: ${body.stream}, server_id: ${body.server_id}, app: ${body.app}`,
    );

    try {
      const result = await this.streamAuthService.validatePlay(body);
      return result;
    } catch (error) {
      this.logger.error(`Play validation error: ${error.message}`);
      return { code: 1, message: 'Internal server error' };
    }
  }
}
