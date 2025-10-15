import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { UserQueryDto, SortOrder } from '@/users/dto/user-query.dto';
import {
  UserListResponseDto,
  UserResponseDto,
} from '@/users/dto/user-response.dto';
import { UpdateProfileDto } from '@/users/dto/update-profile.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/schemas/user.schema';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Tạo người dùng mới (Admin)',
    description: 'Tạo tài khoản người dùng mới',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo người dùng thành công',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Lấy danh sách tất cả người dùng (Admin)',
    description:
      'Lấy danh sách tất cả người dùng trong hệ thống với phân trang và tìm kiếm',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10, tối đa: 100)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Lọc theo role',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Lọc theo trạng thái active',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Tìm kiếm toàn cục trong username, display_name, email, phone_number, full_name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Thứ tự sắp xếp (mặc định: desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng với thông tin phân trang',
    type: UserListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async findAll(@Query() query: UserQueryDto): Promise<UserListResponseDto> {
    const result = await this.usersService.findAllWithPagination(query);
    return new UserListResponseDto(
      result.users,
      result.total,
      result.page,
      result.limit,
      undefined, // sortBy removed
      result.sortOrder,
      result.filters,
    );
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Lấy thông tin profile (User)',
    description: 'Lấy thông tin profile của người dùng hiện tại',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin profile người dùng',
  })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id as string);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Lấy thông tin người dùng theo ID (Admin)',
    description: 'Lấy thông tin chi tiết của một người dùng theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin người dùng',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật profile (User)',
    description:
      'Cập nhật thông tin profile của người dùng hiện tại với validation đầy đủ',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật profile thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: 409,
    description: 'Username/Email/Phone đã được sử dụng',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng',
  })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.id as string;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Cập nhật thông tin người dùng (Admin)',
    description: 'Cập nhật thông tin của một người dùng theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Xóa người dùng (Admin)',
    description: 'Xóa một người dùng khỏi hệ thống',
  })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Xóa người dùng thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
