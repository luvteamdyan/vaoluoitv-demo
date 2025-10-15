import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}
