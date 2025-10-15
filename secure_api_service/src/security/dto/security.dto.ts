import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UrlValidateRequestDto {
  @IsString()
  path: string;

  @IsString()
  wsSecret: string;

  @IsNumber()
  wsTime: number;
}

export class UrlSignResponseDto {
  url: string;
  wsSecret: string;
  wsTime: number;
  expiresAt: Date;
}

export class UrlValidateResponseDto {
  valid: boolean;
  streamId?: string;
  userId?: string;
  message?: string;
}

export class StreamInfoResponseDto {
  streamId: string;
  title: string;
  status: string;
  signedUrl?: string;
  expiresAt?: Date;
}

export class MultipleUrlsRequestDto {
  @IsOptional()
  @IsString({ each: true })
  formats?: string[];

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  ttl?: number;
}

export class CdnUrlSignRequestDto {
  @IsOptional()
  @IsString({ each: true })
  formats?: string[];

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  ttl?: number;
}

export class CdnUrlSignResponseDto {
  url: string;
  token: string;
  time: number;
  expiresAt: Date;
}
