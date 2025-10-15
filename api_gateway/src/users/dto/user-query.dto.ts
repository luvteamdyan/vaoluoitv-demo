import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto, SortDto } from '@/common/dto/pagination.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { UserRole } from '@/schemas/user.schema';
import { Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class UserQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  search?: string;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be asc or desc' })
  sortOrder?: SortOrder = SortOrder.DESC;
}
