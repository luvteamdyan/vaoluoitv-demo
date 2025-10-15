import { Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: '5a1101a4-c71e-4695-b344-457522dc92ed',
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Tên đăng nhập của người dùng',
    example: 'testuser',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Tên hiển thị của người dùng',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @Expose()
  display_name?: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'test@abc.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '+84901234547',
    required: false,
  })
  @Expose()
  phone_number?: string;

  @ApiProperty({
    description: 'Địa chỉ của người dùng',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @Expose()
  address?: string;

  @ApiProperty({
    description: 'Trạng thái xác thực SMS',
    example: false,
  })
  @Expose()
  sms_verified: boolean;

  @ApiProperty({
    description: 'Điểm của người dùng',
    example: 50,
  })
  @Expose()
  points: number;

  @ApiProperty({
    description: 'Mã giới thiệu của người dùng',
    example: 'VNLZHX0W',
  })
  @Expose()
  referral_code: string;

  @ApiProperty({
    description: 'Mã giới thiệu của người mời',
    example: null,
    required: false,
  })
  @Expose()
  invited_by?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'user',
  })
  @Expose()
  role: string;

  @ApiProperty({
    description: 'Lần đăng nhập cuối cùng',
    example: '2025-09-23T02:55:27.677Z',
    required: false,
  })
  @Expose()
  last_login?: Date;

  @ApiProperty({
    description: 'Trạng thái hoạt động của người dùng',
    example: true,
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2025-09-23T02:55:00.698Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2025-09-23T02:55:27.679Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: any) {
    const data = partial._doc || partial;
    Object.assign(this, data);
    this.id = data._id?.toString() || data.id;
  }
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'Danh sách người dùng',
    type: [UserResponseDto],
  })
  @Expose()
  @Type(() => UserResponseDto)
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Tổng số lượng người dùng',
    example: 100,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Số trang hiện tại',
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 10,
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 10,
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo',
    example: true,
  })
  @Expose()
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước',
    example: false,
  })
  @Expose()
  hasPrev: boolean;

  @ApiProperty({
    description: 'Trường đang được sắp xếp (luôn là createdAt)',
    example: 'createdAt',
    required: false,
  })
  @Expose()
  sortBy?: string;

  @ApiProperty({
    description: 'Thứ tự sắp xếp (asc: tăng dần, desc: giảm dần)',
    example: 'desc',
    required: false,
  })
  @Expose()
  sortOrder?: string;

  @ApiProperty({
    description: 'Các bộ lọc đang được áp dụng',
    example: {
      role: 'admin',
      search: 'john',
      isActive: true,
    },
    required: false,
  })
  @Expose()
  filters?: Record<string, any>;

  constructor(
    users: any[],
    total: number,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string,
    filters?: Record<string, any>,
  ) {
    this.users = users.map((user) => new UserResponseDto(user));
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
    this.sortBy = sortBy || 'createdAt';
    this.sortOrder = sortOrder;
    this.filters = filters;
  }
}
