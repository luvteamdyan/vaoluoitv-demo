import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/schemas/user.schema';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { UserQueryDto, SortOrder } from '@/users/dto/user-query.dto';
import { UpdateProfileDto } from '@/users/dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.userModel
      .findOne({
        $or: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      })
      .exec();

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password if provided
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    // referral_code sẽ được cung cấp từ external source hoặc null

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findAllWithPagination(query: UserQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    sortOrder?: string;
    filters?: Record<string, any>;
  }> {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    // Build filter object with advanced filtering
    const filter: any = {};

    // Role filter
    if (role) {
      filter.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Global search across multiple fields
    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { username: searchRegex },
        { display_name: searchRegex },
        { email: searchRegex },
        { phone_number: searchRegex },
        { full_name: searchRegex },
      ];
    }

    // Build sort object - chỉ sort theo createdAt
    const sortObj: any = {};
    const sortDirection = sortOrder === SortOrder.ASC ? 1 : -1;
    sortObj.createdAt = sortDirection;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -refresh_tokens')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean() // Use lean() for better performance
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      users,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
      sortOrder,
      filters: {
        role,
        isActive,
        search,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByReferralCode(referralCode: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ referral_code: referralCode }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if username or email conflicts with existing users
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.userModel
        .findOne({
          $and: [
            { _id: { $ne: id } },
            {
              $or: [
                ...(updateUserDto.username
                  ? [{ username: updateUserDto.username }]
                  : []),
                ...(updateUserDto.email
                  ? [{ email: updateUserDto.email }]
                  : []),
              ],
            },
          ],
        })
        .exec();

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    // Kiểm tra user có tồn tại không
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra username và email có bị trùng với user khác không
    const conflicts = await this.userModel
      .findOne({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              { username: updateProfileDto.username },
              { email: updateProfileDto.email },
              { phone_number: updateProfileDto.phone_number },
            ],
          },
        ],
      })
      .exec();

    if (conflicts) {
      if (conflicts.username === updateProfileDto.username) {
        throw new ConflictException('Username đã được sử dụng');
      }
      if (conflicts.email === updateProfileDto.email) {
        throw new ConflictException('Email đã được sử dụng');
      }
      if (conflicts.phone_number === updateProfileDto.phone_number) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    // Cập nhật thông tin profile
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          username: updateProfileDto.username,
          display_name: updateProfileDto.display_name,
          email: updateProfileDto.email,
          phone_number: updateProfileDto.phone_number,
          address: updateProfileDto.address,
          ...(updateProfileDto.is_active !== undefined && {
            is_active: updateProfileDto.is_active,
          }),
          updatedAt: new Date(),
        },
        { new: true },
      )
      .select('-password -refresh_tokens')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
