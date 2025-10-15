'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Trophy, 
  Key, 
  Upload, 
  Megaphone,
  ChevronDown,
  Settings,
  Briefcase,
  Database,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { 
  hasPermission, 
  hasGroupPermission
} from '@/utils/permissions';

interface SidebarProps {
  activeItem?: string;
  isOpen?: boolean;
}

export default function Sidebar({ activeItem = 'dashboard', isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const [active, setActive] = useState(activeItem);
  const { user } = useAuth();
  
  const userRole = user?.role as UserRole;
  
  // Permission checks
  const hasOperationsAccess = hasGroupPermission(userRole, 'OPERATION_MANAGEMENT');
  const hasApiManagementAccess = hasGroupPermission(userRole, 'API_MANAGEMENT');  
  const hasMediaControllerAccess = hasGroupPermission(userRole, 'MEDIA_CONTROLLER');
  
  // State management cho collapsible sections
  // Quản lý Vận Hành - chỉ expand nếu STAFF có access
  const [isOperationsOpen, setIsOperationsOpen] = useState(hasOperationsAccess && userRole === UserRole.STAFF);
  // Quản lý API - chỉ ADMIN expand
  const [isApiManagementOpen, setIsApiManagementOpen] = useState(hasApiManagementAccess && userRole === UserRole.ADMIN);
  // Media Controller - expand nếu có access  
  const [isMediaControllerOpen, setIsMediaControllerOpen] = useState(hasMediaControllerAccess);

  // Quản lý Vận Hành items - chỉ hiển thị cho ADMIN và STAFF với quyền phù hợp
  const operationsItems = [
    { id: 'match-monitoring', label: 'Quản lý trận đấu', href: '/matches-monitoring', icon: Eye, route: 'matches-monitoring' },
    { id: 'stream-keys', label: 'Quản lý bình luận viên', href: '/stream-keys', icon: Key, route: 'stream-keys' },
  ].filter(item => hasPermission(userRole, item.route));

  // Quản lý API items - chỉ ADMIN mới có quyền
  const apiManagementItems = [
    { id: 'users', label: 'Users (Nguời dùng)', href: '/users', icon: Users, route: 'users' },
    { id: 'matches', label: 'Matches (Trận đấu)', href: '/matches', icon: Trophy, route: 'matches' },
    { id: 'uploads', label: 'Media (Ảnh và Video)', href: '/uploads', icon: Upload, route: 'uploads' },
  ].filter(item => hasPermission(userRole, item.route));

  // Media Controller items - ADMIN và STAFF có quyền
  const mediaControllerItems = [
    { id: 'ads-banner', label: 'Ads Banner', href: '/ads-config', icon: Megaphone, route: 'ads-config' },
  ].filter(item => hasPermission(userRole, item.route));

  // Function to determine active item based on current pathname
  const getActiveItemFromPath = (path: string) => {
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/matches-monitoring')) return 'match-monitoring';
    if (path.startsWith('/matches')) return 'match-management';
    if (path.startsWith('/stream-keys')) return 'stream-keys';
    if (path.startsWith('/uploads')) return 'uploads';
    if (path.startsWith('/ads-config')) return 'ads-config';
    if (path.startsWith('/caster')) return 'caster-management';
    // Default fallback - redirect to appropriate page based on role
    return 'users'; // Default to users for admin, will be handled by middleware
  };

  // Update active state when pathname changes
  useEffect(() => {
    const currentActive = getActiveItemFromPath(pathname);
    setActive(currentActive);
    
    // Auto-open dropdowns based on current page
    if (currentActive === 'ads-config') {
      setIsMediaControllerOpen(true);
    }
    
    // Auto-open Quản lý Vận Hành if on match-monitoring or caster page
    if (['match-monitoring', 'caster-management'].includes(currentActive)) {
      setIsOperationsOpen(true);
    }
    
    // Auto-open Quản lý API if on users, stream-keys, uploads, or matches pages (không bao gồm dashboard)
    if (['users', 'stream-keys', 'uploads', 'match-management'].includes(currentActive)) {
      setIsApiManagementOpen(true);
    }
  }, [pathname]);

  return (
    <div className={`fixed flex flex-col top-0 px-5 left-0 h-full transition-all duration-300 ease-in-out z-50 w-[290px] ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}
    style={{ 
      backgroundColor: 'var(--sidebar-bg)', 
      borderRight: '1px solid var(--sidebar-border)',
      color: 'var(--foreground)'
    }}>
      {/* Logo & Title Section */}
      <div className="p-6 ">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-lg flex items-center justify-center">
            <Image
              src="/logo.ico"
              width={120}
              height={120}
              alt="Vào Lưới TV Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 pt-0 overflow-y-auto">
        <ul className="space-y-2">
          
          
          {/* Quản lý Vận Hành Dropdown - Chỉ hiển thị nếu có access */}
          {hasOperationsAccess && (
          <li>
            <button
              onClick={() => setIsOperationsOpen(!isOperationsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 font-semibold ${
                operationsItems.some(item => active === item.id)
                  ? 'border-l-4'
                  : ''
              }`}
              style={{
                color: 'var(--foreground)',
                backgroundColor: operationsItems.some(item => active === item.id) ? 'var(--hover-bg)' : 'transparent',
                borderLeftColor: operationsItems.some(item => active === item.id) ? 'var(--accent)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!operationsItems.some(item => active === item.id)) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!operationsItems.some(item => active === item.id)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-3" />
                <span>Quản lý Vận Hành</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOperationsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Operations Dropdown Menu */}
            {isOperationsOpen && (
              <ul className="ml-4 mt-2 space-y-1">
                {operationsItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        active === item.id
                          ? 'border-l-2'
                          : ''
                      }`}
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: active === item.id ? 'var(--hover-bg)' : 'transparent',
                        borderLeftColor: active === item.id ? 'var(--accent)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (active !== item.id) {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (active !== item.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      onClick={() => setActive(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          )}

          {/* Quản lý API Dropdown - Chỉ ADMIN có quyền */}
          {hasApiManagementAccess && (
          <li>
            <button
              onClick={() => setIsApiManagementOpen(!isApiManagementOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 font-semibold ${
                apiManagementItems.some(item => active === item.id)
                  ? 'border-l-4'
                  : ''
              }`}
              style={{
                color: 'var(--foreground)',
                backgroundColor: apiManagementItems.some(item => active === item.id) ? 'var(--hover-bg)' : 'transparent',
                borderLeftColor: apiManagementItems.some(item => active === item.id) ? 'var(--accent)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!apiManagementItems.some(item => active === item.id)) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!apiManagementItems.some(item => active === item.id)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-3" />
                <span>Quản lý API</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isApiManagementOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* API Management Dropdown Menu */}
            {isApiManagementOpen && (
              <ul className="ml-4 mt-2 space-y-1">
                {apiManagementItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        active === item.id
                          ? 'border-l-2'
                          : ''
                      }`}
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: active === item.id ? 'var(--hover-bg)' : 'transparent',
                        borderLeftColor: active === item.id ? 'var(--accent)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (active !== item.id) {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (active !== item.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      onClick={() => setActive(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          )}
          
          {/* Media Controller Dropdown - ADMIN và STAFF có quyền */}
          {hasMediaControllerAccess && (
          <li>
            <button
              onClick={() => setIsMediaControllerOpen(!isMediaControllerOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 font-semibold ${
                mediaControllerItems.some(item => active === item.id)
                  ? 'border-l-4'
                  : ''
              }`}
              style={{
                color: 'var(--foreground)',
                backgroundColor: mediaControllerItems.some(item => active === item.id) ? 'var(--hover-bg)' : 'transparent',
                borderLeftColor: mediaControllerItems.some(item => active === item.id) ? 'var(--accent)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!mediaControllerItems.some(item => active === item.id)) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!mediaControllerItems.some(item => active === item.id)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3" />
                <span>Media Controller</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isMediaControllerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Media Controller Dropdown Menu */}
            {isMediaControllerOpen && (
              <ul className="ml-4 mt-2 space-y-1">
                {mediaControllerItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        active === item.id
                          ? 'border-l-2'
                          : ''
                      }`}
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: active === item.id ? 'var(--hover-bg)' : 'transparent',
                        borderLeftColor: active === item.id ? 'var(--accent)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (active !== item.id) {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (active !== item.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      onClick={() => setActive(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          © 2025 Vào Lưới TV
        </p>
      </div>
    </div>
  );
}
