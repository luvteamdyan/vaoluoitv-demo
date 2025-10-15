import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateSpinDto {
  @IsString()
  user_id: string;

  @IsNumber()
  @Min(0)
  count: number;
}

export class UpdateCountDto {
  @IsNumber()
  @Min(0)
  count: number;

  @IsString()
  username?: string;
}

export class IncrementSpinDto {
  @IsNumber()
  increment: number;

  @IsString()
  @IsOptional()
  username?: string;
}

export class CreateSpinDto {
  @IsString()
  user_id: string;

  @IsString()
  username: string;

  @IsNumber()
  @Min(0)
  count?: number = 0;

  @IsString()
  @IsOptional()
  external_id?: string;
}
