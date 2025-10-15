import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  })
  access_token: string;

  @ApiProperty({
    description: 'Thông tin người dùng',
    type: 'object',
    properties: {
      id: { type: 'string', example: '5a1101a4-c71e-4695-b344-457522dc92ed' },
      username: { type: 'string', example: 'testuser' },
      display_name: { type: 'string', example: 'Nguyễn Văn A' },
      email: { type: 'string', example: 'test@abc.com' },
      phone_number: { type: 'string', example: '+84901234547' },
      address: { type: 'string', example: '123 Đường ABC, Quận 1, TP.HCM' },
      sms_verified: { type: 'boolean', example: false },
      points: { type: 'number', example: 50 },
      referral_code: { type: 'string', example: 'VNLZHX0W' },
      invited_by: { type: 'string', example: null },
      role: { type: 'string', example: 'user' },
      last_login: { type: 'string', example: '2025-09-23T02:55:27.677Z' },
      is_active: { type: 'boolean', example: true },
      external_id: {
        type: 'string',
        example: '5a1101a4-c71e-4695-b344-457522dc92ed',
      },
    },
  })
  user: {
    id: string;
    username: string;
    display_name?: string;
    email: string;
    phone_number?: string;
    address?: string;
    sms_verified: boolean;
    points: number;
    referral_code: string;
    invited_by?: string;
    role: string;
    last_login?: Date;
    is_active: boolean;
    external_id?: string;
  };
}
