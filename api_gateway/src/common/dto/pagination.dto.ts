import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit must be less than or equal to 100' })
  limit?: number = 10;
}

export class SortDto {
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'asc' ? 1 : -1;
    }
    return value;
  })
  @IsNumber({}, { message: 'Sort order must be a number' })
  sortOrder?: 1 | -1 = -1; // 1 for ascending, -1 for descending
}
