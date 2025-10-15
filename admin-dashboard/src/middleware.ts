import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/types/user';
import { hasPermission } from '@/utils/permissions';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token và user từ cookie với admin prefix (isolated từ main domain)
  const token = request.cookies.get('admin_access_token')?.value;
  const userCookie = request.cookies.get('admin_user')?.value;
  
  // Parse user data nếu có
  let user = null;
  let userRole: UserRole | null = null;
  
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
      userRole = user?.role as UserRole;
    } catch {
      // Invalid user cookie, ignore
    }
  }
  
  // Định nghĩa routes và permissions
  const routeMap: Record<string, string> = {
    '/users': 'users', 
    '/matches': 'matches',
    '/matches-monitoring': 'matches-monitoring',
    '/stream-keys': 'stream-keys',
    '/uploads': 'uploads',
    '/ads-config': 'ads-config',
    '/caster': 'caster',
  };
  
  const currentRoute = routeMap[pathname];
  
  // Xử lý chuyển hướng cho route root (/)
  if (pathname === '/') {
    if (!token || !userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Chuyển hướng dựa trên role
    if (userRole === UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/users', request.url));
    } else if (userRole === UserRole.STAFF) {
      return NextResponse.redirect(new URL('/matches-monitoring', request.url));
    } else if (userRole === UserRole.CASTER) {
      return NextResponse.redirect(new URL('/caster', request.url));
    } else {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Nếu không xác định được route, cho phép truy cập
  if (!currentRoute) {
    return NextResponse.next();
  }
  
  // Kiểm tra authentication
  if (!token || !userRole) {
    // Chỉ cho phép truy cập login page khi chưa authenticated
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Kiểm tra permissions
  if (!hasPermission(userRole, currentRoute)) {
    // Redirect based on role
    if (userRole === UserRole.STAFF) {
      // STAFF chuyển hướng đến matches-monitoring
      return NextResponse.redirect(new URL('/matches-monitoring', request.url));
    } else if (userRole === UserRole.CASTER) {
      // CASTER chỉ có thể truy cập caster dashboard
      return NextResponse.redirect(new URL('/caster', request.url));
    } else if (userRole === UserRole.USER) {
      // USER không có quyền truy cập admin panel
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Caster-specific logic - nếu caster cố gắng truy cập non-caster routes
  if (userRole === UserRole.CASTER && currentRoute !== 'caster') {
    return NextResponse.redirect(new URL('/caster', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
