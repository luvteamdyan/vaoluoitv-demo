// Utility functions để quản lý cookies
// Admin dashboard sử dụng cookie riêng biệt, isolated từ main domain

// Cookie name prefix cho admin dashboard để tránh conflict với main domain
const ADMIN_PREFIX = 'admin_';

export const setCookie = (name: string, value: string, days: number = 7) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  // Sử dụng tên cookie với prefix để tách biệt khỏi main domain
  const cookieName = name.startsWith(ADMIN_PREFIX) ? name : `${ADMIN_PREFIX}${name}`;
  
  // KHÔNG set domain để cookie chỉ hoạt động trên members.vaoluoitv.com
  // SameSite=Strict để bảo mật cao nhất
  document.cookie = `${cookieName}=${value}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
};

export const getCookie = (name: string): string | null => {
  // Ưu tiên đọc cookie với admin prefix
  const cookieName = name.startsWith(ADMIN_PREFIX) ? name : `${ADMIN_PREFIX}${name}`;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${cookieName}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const deleteCookie = (name: string) => {
  const cookieName = name.startsWith(ADMIN_PREFIX) ? name : `${ADMIN_PREFIX}${name}`;
  
  // Xóa cookie của admin dashboard only
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
};

export const clearAllAuthCookies = () => {
  deleteCookie('access_token');
  deleteCookie('user');
  
  // Also clear any legacy cookies without prefix (if any)
  document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
