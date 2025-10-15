import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateWheelSegmentDto {
  @IsString()
  segment_id: string;

  @IsString()
  label: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsString()
  reward_type: string;

  @IsNumber()
  reward_value: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateWheelSegmentDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsString()
  reward_type?: string;

  @IsOptional()
  @IsNumber()
  reward_value?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class SpinWheelDto {
  @IsOptional()
  @IsString()
  user_id?: string; // External ID (UUID) - sẽ lấy từ JWT token

  @IsOptional()
  @IsString()
  mongo_id?: string; // MongoDB ID - sẽ lấy từ JWT token
}

export class WheelSpinResponseDto {
  segment_id: string;
  segment_label: string;
  segment_index: number;
  reward_type: string;
  reward_value: number;
  stop_angle: number;
  points_updated: boolean;
  points_added: number;
}
