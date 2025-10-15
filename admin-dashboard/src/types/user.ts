// User interface dựa trên backend schema
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CASTER = 'caster',
  STAFF = 'staff',
}

export interface User {
  id?: string; // Backend có thể trả về 'id' hoặc '_id'
  _id?: string; // MongoDB ObjectId
  username: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  full_name?: string; // Thêm field full_name theo API spec
  address?: string;
  sms_verified: boolean;
  points: number;
  referral_code: string;
  invited_by?: string;
  role: UserRole;
  last_login?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface cho việc tạo user mới (không bao gồm _id và timestamps)
export interface CreateUserRequest {
  username: string;
  display_name?: string;
  email: string;
  password: string;
  phone_number?: string;
  full_name?: string; // Thêm field full_name
  address?: string;
  sms_verified?: boolean;
  points?: number;
  referral_code?: string;
  invited_by?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Interface cho việc cập nhật user
export interface UpdateUserRequest {
  username?: string;
  display_name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  full_name?: string; // Thêm field full_name
  address?: string;
  sms_verified?: boolean;
  points?: number;
  referral_code?: string;
  invited_by?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Interface cho response từ API
export interface UserResponse {
  id?: string; // Backend có thể trả về 'id' hoặc '_id'
  _id?: string; // MongoDB ObjectId
  username: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  full_name?: string; // Thêm field full_name
  address?: string;
  sms_verified: boolean;
  points: number;
  referral_code: string;
  invited_by?: string;
  role: UserRole;
  last_login?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface cho danh sách users với pagination
export interface UsersListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface cho filter users
export interface UserFilters {
  search?: string;
  username?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc'; // Thêm sortOrder parameter
}

// Interface cho user statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
  newUsersThisMonth: number;
}
