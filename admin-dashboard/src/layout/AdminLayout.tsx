'use client';

import { useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { PanelLeftClose, PanelLeftOpen, ChevronDown, LogOut, User } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'xl:ml-[290px]' : 'ml-0'
      }`} onClick={() => setIsUserMenuOpen(false)}>
        {/* Top Header */}
        <header className="px-6 py-3" style={{ 
          backgroundColor: 'var(--background)', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--foreground)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </button>
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Chào mừng, <span className="font-semibold" style={{ color: 'var(--accent)' }}>{user?.display_name || user?.username || user?.email || 'User'}</span>
                </h1>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </p>
              </div>
            </div>
            {/* Theme Toggle & User Menu */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center space-x-3 px-4 py-2 transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  {/* User Info */}
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {user?.username || user?.email || 'User'}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {user?.role === 'admin' ? 'Admin' : 'User'}
                    </div>
                  </div>
                  {/* Dropdown Arrow */}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full w-full rounded-lg shadow-lg z-50" style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    border: '1px solid var(--border)' 
                  }}>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ 
                          color: 'var(--foreground)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
