import { UserRole } from '@/types/user';

/**
 * Access Control System cho VaoLuoiTV Admin Panel
 * Dựa trên backend role changes: ADMIN, STAFF, CASTER, USER
 */

// Define accessible routes cho từng role
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    // Quản lý Vận Hành - ADMIN và STAFF có quyền
    'matches',
    'matches-monitoring', 
    'stream-keys',
    'uploads',
    'media-controller',
    
    // Quản lý API - chỉ ADMIN có quyền
    'users',
    
    // Media Controller - ADMIN và STAFF có quyền  
    'ads-config',
    
    // Caster features - ADMIN và CASTER có quyền
    'caster',
  ],
  
  [UserRole.STAFF]: [
    // Quản lý Vận Hành - STAFF chỉ có quyền quản lý data CRUD operations
    // Không có quyền truy cập Media Controller
    'matches',
    'matches-monitoring',
    'stream-keys', 
    'uploads',
    // Loại bỏ media controller access
  ],
  
  [UserRole.CASTER]: [
    // CASTER chỉ có quyền truy cập caster dashboard
    'caster',
  ],
  
  [UserRole.USER]: [
    // Users chỉ có thể truy cập login
    'login',
  ],
} as const;

// Route groups để dễ dàng kiểm soát permissions
export const ROUTE_GROUPS = {
  OPERATION_MANAGEMENT: [
    'matches',
    'matches-monitoring', 
    'stream-keys',
    'uploads',
    'media-controller',
  ],
  
  API_MANAGEMENT: [
    'users',
  ],
  
  MEDIA_CONTROLLER: [
    'ads-config',
  ],
  
  CASTER_FEATURES: [
    'caster',
  ],
} as const;

/**
 * Kiểm tra user có quyền truy cập route cụ thể không
 */
export function hasPermission(userRole: UserRole, route: string): boolean {
  if (!userRole || !route) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions?.includes(route as never) ?? false;
}

/**
 * Kiểm tra user có quyền truy cập route group không
 */
export function hasGroupPermission(userRole: UserRole, groupName: keyof typeof ROUTE_GROUPS): boolean {
  if (!userRole || !groupName) return false;
  
  const routes = ROUTE_GROUPS[groupName];
  return routes.some(route => hasPermission(userRole, route));
}

/**
 * Lấy danh sách routes mà user có quyền truy cập
 */
export function getUserPermissions(userRole: UserRole): readonly string[] {
  if (!userRole) return [];
  
  return (ROLE_PERMISSIONS[userRole] as readonly string[]) ?? [];
}

/**
 * Kiểm tra user có thể tạo/chỉnh sửa data không (STAFF chỉ có thể CRU, không DELETE)
 */
export function canCreateGroup(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.STAFF;
}

/**
 * Kiểm tra user có thể xóa data không (chỉ ADMIN)
 */
export function canDelete(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Kiểm tra user có quyền user management không (chỉ ADMIN)
 */
export function canManageUsers(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Kiểm tra user có quyền caster features không
 */
export function canAccessCasterFeatures(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.CASTER;
}

/**
 * Kiểm tra user có quyền admin features không (chỉ ADMIN)
 */
export function canAccessAdminFeatures(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Lấy danh sách route groups mà user có quyền truy cập
 */
export function getUserRouteGroups(userRole: UserRole): (keyof typeof ROUTE_GROUPS)[] {
  const groups: (keyof typeof ROUTE_GROUPS)[] = [];
  
  Object.entries(ROUTE_GROUPS).forEach(([groupName, routes]) => {
    if (routes.some(route => hasPermission(userRole, route))) {
      groups.push(groupName as keyof typeof ROUTE_GROUPS);
    }
  });
  
  return groups;
}

/**
 * Helper để check permissions trong React components
 */
export function usePermissions(userRole: UserRole | undefined | null) {
  if (!userRole) {
    return {
      hasPermission: () => false,
      hasGroupPermission: () => false,
      getUserPermissions: () => [],
      canCreateGroup: false,
      canDelete: false,
      canManageUsers: false,
      canAccessCasterFeatures: false,
      canAccessAdminFeatures: false,
      getUserRouteGroups: () => [],
    };
  }

  return {
    hasPermission: (route: string) => hasPermission(userRole, route),
    hasGroupPermission: (group: keyof typeof ROUTE_GROUPS) => hasGroupPermission(userRole, group),
    getUserPermissions: () => getUserPermissions(userRole),
    canCreateGroup: canCreateGroup(userRole),
    canDelete: canDelete(userRole),
    canManageUsers: canManageUsers(userRole),
    canAccessCasterFeatures: canAccessCasterFeatures(userRole),
    canAccessAdminFeatures: canAccessAdminFeatures(userRole),
    getUserRouteGroups: () => getUserRouteGroups(userRole),
  };
}

/**
 * Định nghĩa navigation items với permission checks
 */
export interface NavigationItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; [key: string]: unknown }>;
  path?: string;
  children?: NavigationItem[];
  requiredRoles?: UserRole[];
}

/**
 * Default navigation structure với permission-based rendering
 */
export const NAVIGATION_CONFIG = {
  operationManagement: {
    label: 'Quản lý Vận Hành',
    icon: 'Briefcase',
    children: [
      { label: 'Quản lý bình luận viên', icon: 'Key', path: '/stream-keys', key: 'stream-keys' },
      { label: 'Giám sát trận đấu', icon: 'Monitor', path: '/matches-monitoring', key: 'matches-monitoring' },
    ],
  },
  
  apiManagement: {
    label: 'Quản lý API',
    icon: 'Database',
    children: [
      { label: 'Users (Người dùng)', icon: 'Users', path: '/users', key: 'users' },
      { label: 'Matches (Trận đấu)', icon: 'Trophy', path: '/matches', key: 'matches' },
      { label: 'Media (Ảnh và Video)', icon: 'Upload', path: '/uploads', key: 'uploads' },
    ],
  },
  
  mediaController: {
    label: 'Media Controller',
    icon: 'Settings',
    children: [
      { label: 'Ads Banner', icon: 'Megaphone', path: '/ads-config', key: 'ads-config' },
    ],
  },
} as const;
