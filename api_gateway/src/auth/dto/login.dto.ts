import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email hoặc username của người dùng',
    example: 'user@example.com hoặc lee3',
    type: 'string',
  })
  @IsString({ message: 'Email/username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Email/username không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
    type: 'string',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
