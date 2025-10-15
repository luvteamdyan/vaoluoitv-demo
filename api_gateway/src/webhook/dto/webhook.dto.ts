import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class WebhookRequestDto {
  @ApiProperty({
    description: 'Tên đăng nhập của người dùng',
    example: 'lee1',
    type: 'string',
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'lee1@vaoluoitv.com',
    type: 'string',
    format: 'email',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'Admin@123',
    type: 'string',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '+84367013310',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone_number?: string;

  @ApiProperty({
    description: 'Địa chỉ của người dùng',
    example: '123 Abc hungf vuong',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  address?: string;

  @ApiProperty({
    description: 'Mã giới thiệu của người mời',
    example: 'VNLZHX0W',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mã giới thiệu phải là chuỗi ký tự' })
  referral_code?: string;

  @ApiProperty({
    description: 'reCAPTCHA v3 token từ frontend',
    example: '03AFcWeA...v3token',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'reCAPTCHA token phải là chuỗi ký tự' })
  recaptchaToken?: string;
}

export class WebhookLoginRequestDto {
  @ApiProperty({
    description: 'Tên đăng nhập hoặc email của người dùng',
    example: 'vladmin',
    type: 'string',
  })
  @IsString({ message: 'Tên đăng nhập hoặc email phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập hoặc email không được để trống' })
  identifier: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
    type: 'string',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}

export class WebhookResponseDto {
  @ApiProperty({
    description: 'Trạng thái thành công của request',
    example: true,
    type: 'boolean',
  })
  success: boolean;

  @ApiProperty({
    description: 'Dữ liệu response từ webhook endpoint',
    example: { id: '123', message: 'User created successfully' },
  })
  data: any;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
    type: 'number',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Thông báo kết quả',
    example: 'User data sent successfully',
    type: 'string',
  })
  message: string;
}

export class WebhookErrorDto {
  @ApiProperty({
    description: 'Trạng thái thành công của request',
    example: false,
    type: 'boolean',
  })
  success: boolean;

  @ApiProperty({
    description: 'Thông báo lỗi',
    example: 'Webhook request failed',
    type: 'string',
  })
  message: string;

  @ApiProperty({
    description: 'Chi tiết lỗi',
    example: 'Network error or timeout',
    type: 'string',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 500,
    type: 'number',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Chi tiết lỗi từ webhook response (nếu có)',
    example: { field: 'phone_number', message: 'Phone number already exists' },
    required: false,
  })
  webhookError?: {
    field?: string;
    message?: string;
    code?: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Dữ liệu lỗi từ webhook response',
    example: {
      error: 'Validation failed',
      details: { phone_number: ['already exists'] },
    },
    required: false,
  })
  webhookResponse?: any;
}
