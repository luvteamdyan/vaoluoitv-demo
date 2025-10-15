import { IsString, IsNumber, IsIn } from 'class-validator';

export class UpdatePointsDto {
  @IsString()
  user_id: string;

  @IsNumber()
  points: number;

  @IsIn(['plus', 'minus'])
  action_type: 'plus' | 'minus';

  @IsString()
  source: string;
}

export class UpdatePointsResponseDto {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    new_points: number;
    previous_points: number;
  };
}
