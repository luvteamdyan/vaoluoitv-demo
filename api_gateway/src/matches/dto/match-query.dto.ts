import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { BaseFilterDto, SortDirection } from '@/common/dto/base-filter.dto';
import { MatchStatus, MatchType } from '@/schemas/match.schema';

export class MatchFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsEnum(MatchStatus, { message: 'Invalid match status' })
  status?: MatchStatus;

  @IsOptional()
  @IsString({ message: 'League ID must be a string' })
  league_id?: string;

  @IsOptional()
  @IsString({ message: 'Team ID must be a string' })
  team_id?: string;

  @IsOptional()
  @IsString({ message: 'Date must be a string in DD/MM/YYYY format' })
  date?: string;

  @IsOptional()
  @IsString({ message: 'Featured filter must be a string' })
  featured?: string;

  @IsOptional()
  @IsEnum(MatchType, { message: 'Invalid match type' })
  type?: MatchType;

  @IsOptional()
  @IsString({ message: 'Active filter must be a string' })
  is_active?: string;
}

export class MatchQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(MatchStatus, { message: 'Invalid match status' })
  status?: MatchStatus;

  @IsOptional()
  @IsString({ message: 'League ID must be a string' })
  league_id?: string;

  @IsOptional()
  @IsString({ message: 'Team ID must be a string' })
  team_id?: string;

  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Featured filter must be a string' })
  featured?: string;

  @IsOptional()
  @IsString({ message: 'Date must be a string in DD/MM/YYYY format' })
  date?: string;

  @IsOptional()
  @IsEnum(MatchType, { message: 'Invalid match type' })
  type?: MatchType;

  @IsOptional()
  @IsString({ message: 'Active filter must be a string' })
  is_active?: string;

  @IsOptional()
  @IsEnum(SortDirection, { message: 'Sort direction must be asc or desc' })
  sort?: SortDirection;

  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sort_by?: string;

  @IsOptional()
  @IsString({ message: 'Has commentator filter must be a string' })
  has_commentator?: string;
}
