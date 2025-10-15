import {
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Tên người dùng (unique)',
    example: 'testuser',
    required: true,
  })
  @IsString({ message: 'Username phải là chuỗi' })
  @Length(3, 50, { message: 'Username phải từ 3 đến 50 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username: string;

  @ApiProperty({
    description: 'Tên hiển thị',
    example: 'Nguyễn Văn A',
    required: true,
  })
  @IsString({ message: 'Display name phải là chuỗi' })
  @Length(2, 100, { message: 'Display name phải từ 2 đến 100 ký tự' })
  display_name: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '+84901234567',
    required: true,
  })
  @IsString({ message: 'Phone number phải là chuỗi' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Số điện thoại không hợp lệ (VD: +84901234567)',
  })
  phone_number: string;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: true,
  })
  @IsString({ message: 'Address phải là chuỗi' })
  @Length(10, 200, { message: 'Address phải từ 10 đến 200 ký tự' })
  address: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active phải là boolean' })
  is_active?: boolean;
}
