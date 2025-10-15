import { User, CreateUserRequest, UpdateUserRequest, UserFilters, UsersListResponse } from '@/types/user';
import { getCookie } from '@/utils/cookies';
import { withErrorHandling, withRetry } from '@/utils/errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';

class UserService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryable: boolean = true
  ): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const token = getCookie('access_token');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
          (error as Error & { status: number; statusCode: number }).status = response.status;
          (error as Error & { status: number; statusCode: number }).statusCode = response.status;
          throw error;
        }

        // Kiểm tra xem response có content không
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        // Nếu response rỗng hoặc không phải JSON, trả về undefined
        if (!contentType || !contentType.includes('application/json') || contentLength === '0') {
          return undefined as T;
        }
        
        try {
          const result = await response.json();
          return result;
        } catch {
          // Nếu parse JSON thất bại, trả về undefined
          return undefined as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    if (retryable) {
      return withRetry(makeRequest, 3, 1000);
    } else {
      return withErrorHandling(makeRequest, `UserService.request(${endpoint})`);
    }
  }

  // Lấy thông tin profile của user hiện tại
  async getProfile(): Promise<User> {
    return withErrorHandling(async () => {
      return this.request<User>('/users/profile', {}, false);
    }, 'UserService.getProfile');
  }

  // Lấy danh sách tất cả users
  async getAllUsers(): Promise<User[]> {
    return withErrorHandling(async () => {
      const response = await this.request<{ users: User[] }>('/users', {}, false); // Disable retry
      
      // Backend trả về object với pagination, cần extract users array
      const users = response?.users || [];
      
      return users;
    }, 'UserService.getAllUsers');
  }

  // Lấy thống kê users
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    casterUsers: number;
    regularUsers: number;
    newUsersThisMonth: number;
  }> {
    return withErrorHandling(async () => {
      // Gọi API để lấy tất cả users với limit lớn để tính stats
      const response = await this.request<UsersListResponse>('/users?limit=10', {}, false);
      
      if (response && response.users) {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return {
          totalUsers: response.total,
          activeUsers: response.users.filter(user => user.is_active).length,
          adminUsers: response.users.filter(user => user.role === 'admin').length,
          casterUsers: response.users.filter(user => user.role === 'caster').length,
          regularUsers: response.users.filter(user => user.role === 'user').length,
          newUsersThisMonth: response.users.filter(user => 
            new Date(user.createdAt) >= thisMonth
          ).length,
        };
      }
      
      // Fallback nếu API không trả về dữ liệu
      return {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        casterUsers: 0,
        regularUsers: 0,
        newUsersThisMonth: 0,
      };
    }, 'UserService.getUserStats');
  }


  // Tạo user mới
  async createUser(userData: CreateUserRequest): Promise<User> {
    return withErrorHandling(async () => {
      return this.request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }, false); // Don't retry create operations
    }, 'UserService.createUser');
  }

  // Cập nhật user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return withErrorHandling(async () => {
      return this.request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      }, false); // Don't retry update operations
    }, 'UserService.updateUser');
  }

  // Cập nhật role của user
  async updateUserRole(id: string, role: 'admin' | 'user' | 'caster'): Promise<User> {
    return withErrorHandling(async () => {
      return this.request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }, false); // Don't retry role update operations
    }, 'UserService.updateUserRole');
  }

  // Xóa user (soft delete - set is_active = false)
  async deleteUser(id: string): Promise<void> {
    return withErrorHandling(async () => {
      return this.request<void>(`/users/${id}`, {
        method: 'DELETE',
      }, false); // Don't retry delete operations
    }, 'UserService.deleteUser');
  }

  // Cập nhật điểm của user
  async updateUserPoints(id: string, points: number): Promise<User> {
    return withErrorHandling(async () => {
      return this.request<User>(`/users/${id}/points`, {
        method: 'PATCH',
        body: JSON.stringify({ points }),
      }, false); // Don't retry points update operations
    }, 'UserService.updateUserPoints');
  }

  // Xác thực SMS của user
  async verifyUserSms(id: string): Promise<User> {
    return withErrorHandling(async () => {
      return this.request<User>(`/users/${id}/verify-sms`, {
        method: 'PATCH',
      }, false); // Don't retry SMS verification operations
    }, 'UserService.verifyUserSms');
  }


  // Tìm kiếm và lọc users với pagination - cập nhật theo API mới
  async searchUsers(filters: UserFilters): Promise<UsersListResponse> {
    return withErrorHandling(async () => {
      try {
        // Tạo query parameters theo API specification
        const params = new URLSearchParams();
        
        // Các tham số được hỗ trợ bởi API backend
        if (filters.search) params.append('search', filters.search);
        if (filters.role) params.append('role', filters.role);
        if (filters.is_active !== undefined) params.append('isActive', filters.is_active.toString());
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        
        // Thêm sortOrder từ filters hoặc mặc định là 'desc' như API spec
        params.append('sortOrder', filters.sortOrder || 'desc');

        // Gọi API với pagination
        const response = await this.request<UsersListResponse>(`/users?${params.toString()}`, {}, false);
        
        if (response && typeof response === 'object' && 'users' in response) {
          return response;
        }
        
        // Fallback: nếu backend chưa hỗ trợ pagination, xử lý ở frontend
        const users = await this.getAllUsers();
        
        let filteredUsers = users;

        // Lọc theo search term (tìm kiếm toàn cục như API spec)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user =>
            user.username.toLowerCase().includes(searchTerm) ||
            (user.display_name && user.display_name.toLowerCase().includes(searchTerm)) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.phone_number && user.phone_number.toLowerCase().includes(searchTerm)) ||
            (user.full_name && user.full_name.toLowerCase().includes(searchTerm))
          );
        }

        // Lọc theo role
        if (filters.role) {
          filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }

        // Lọc theo trạng thái active
        if (filters.is_active !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.is_active === filters.is_active);
        }

        // Sắp xếp theo createdAt với sortOrder từ filters
        const sortOrder = filters.sortOrder || 'desc';
        filteredUsers.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Pagination
        const total = filteredUsers.length;
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const totalPages = Math.ceil(total / limit);
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return {
          users: paginatedUsers,
          total,
          page,
          limit,
          totalPages,
        };
      } catch {
        // Fallback to empty response
        return {
          users: [],
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
        };
      }
    }, 'UserService.searchUsers');
  }
}

export const userService = new UserService();
