import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/guards/local-auth.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RegisterDto } from '@/auth/dto/register.dto';
import { RegisterV2Dto } from '@/auth/dto/register-v2.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập (Public)',
    description:
      'Đăng nhập vào hệ thống bằng email/username và mật khẩu. Hệ thống sẽ gọi webhook đến https://auth.luck8event.com/api/v1/auth/login trước để xác thực. Nếu webhook thành công nhưng user chưa có trong database local, hệ thống sẽ tự động tạo tài khoản từ dữ liệu webhook.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description:
      'Đăng nhập thành công. Nếu user chưa có trong database local, hệ thống sẽ tự động tạo tài khoản từ webhook.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      'Thông tin đăng nhập không chính xác hoặc webhook xác thực thất bại',
  })
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản (Public)',
    description:
      'Tạo tài khoản người dùng mới. Hệ thống sẽ gửi dữ liệu đến webhook endpoint trước để đăng ký trên hệ thống chính, sau đó mới tạo tài khoản local.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Registration successful' },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '5a1101a4-c71e-4695-b344-457522dc92ed',
            },
            username: { type: 'string', example: 'testuser' },
            email: { type: 'string', example: 'test@abc.com' },
            phone_number: { type: 'string', example: '+84901234567' },
            address: {
              type: 'string',
              example: '123 Đường ABC, Quận 1, TP.HCM',
            },
            sms_verified: { type: 'boolean', example: false },
            points: { type: 'number', example: 0 },
            referral_code: { type: 'string', example: 'VNLZHX0W' },
            invited_by: { type: 'string', example: 'VNLZHX0W' },
            role: { type: 'string', example: 'user' },
            is_active: { type: 'boolean', example: true },
            external_id: {
              type: 'string',
              example: '5a1101a4-c71e-4695-b344-457522dc92ed',
            },
            created_at: { type: 'string', example: '2025-09-23T02:55:00.698Z' },
            updated_at: { type: 'string', example: '2025-09-23T02:55:00.698Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 409,
    description: 'Email đã tồn tại trong hệ thống',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi webhook hoặc không thể tạo tài khoản',
  })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
      registerDto.phone_number,
      registerDto.address,
      registerDto.referral_code,
      registerDto.display_name,
    );
    return { message: 'Registration successful', user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  @ApiOperation({
    summary: 'Validate JWT token (Internal)',
    description: 'Endpoint để validate JWT token cho các microservice khác',
  })
  @ApiResponse({
    status: 200,
    description: 'Token hợp lệ',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            name: { type: 'string' },
            external_id: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async validateToken(@Request() req: { user: any }) {
    return {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        external_id: req.user.external_id,
      },
    };
  }

  @Post('v2/register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản với reCAPTCHA v3 (Public)',
    description:
      'Tạo tài khoản người dùng mới với reCAPTCHA v3 validation. Hệ thống sẽ gửi dữ liệu đến webhook endpoint https://auth.luck8event.com/api/v1/auth/v2/register để validate reCAPTCHA token và đăng ký trên hệ thống chính.',
  })
  @ApiBody({ type: RegisterV2Dto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Registration successful' },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '5a1101a4-c71e-4695-b344-457522dc92ed',
            },
            username: { type: 'string', example: 'jolene' },
            email: { type: 'string', example: 'user@example.com' },
            phone_number: { type: 'string', example: '+84901234567' },
            address: {
              type: 'string',
              example: '123 Đường ABC, Quận 1, TP.HCM',
            },
            sms_verified: { type: 'boolean', example: false },
            points: { type: 'number', example: 0 },
            referral_code: { type: 'string', example: 'VNLZHX0W' },
            invited_by: { type: 'string', example: 'VNLZHX0W' },
            role: { type: 'string', example: 'user' },
            is_active: { type: 'boolean', example: true },
            external_id: {
              type: 'string',
              example: '5a1101a4-c71e-4695-b344-457522dc92ed',
            },
            created_at: { type: 'string', example: '2025-09-23T02:55:00.698Z' },
            updated_at: { type: 'string', example: '2025-09-23T02:55:00.698Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu đầu vào không hợp lệ hoặc webhook endpoint trả về lỗi',
  })
  @ApiResponse({
    status: 409,
    description: 'Email đã tồn tại trong hệ thống',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi webhook hoặc không thể tạo tài khoản',
  })
  async registerV2(@Body() registerDto: RegisterV2Dto) {
    const user = await this.authService.registerV2(registerDto);
    return { message: 'Registration successful', user };
  }
}
