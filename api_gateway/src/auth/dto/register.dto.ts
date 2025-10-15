import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Tên đăng nhập của người dùng',
    example: 'testuser',
    type: 'string',
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({
    description: 'Tên hiển thị của người dùng',
    example: 'Nguyễn Văn A',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tên hiển thị phải là chuỗi ký tự' })
  display_name?: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
    type: 'string',
    minLength: 8,
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '+84901234567',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Định dạng số điện thoại không hợp lệ' })
  phone_number?: string;

  @ApiProperty({
    description: 'Địa chỉ của người dùng',
    example: '123 Đường ABC, Quận 1, TP.HCM',
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
}
