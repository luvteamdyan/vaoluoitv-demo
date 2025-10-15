"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePopup from "@/components/modals/ProfilePopup";
import AuthModal from "@/components/modals/AuthModal";
import { User } from "lucide-react";
import { sanityContentService } from "@/services/sanityContentService";
import type { SanityLogoContent } from "@/types/sanity-content";

import LogoImg from "@/app/favicon.ico";

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [logoContent, setLogoContent] = useState<SanityLogoContent | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const authMenuRef = useRef<HTMLDivElement>(null);

  // ===== NAVIGATION HELPERS =====

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getNavItemClasses = (path: string, isMobile: boolean = false) => {
    const baseClasses = isMobile
      ? "block px-3 py-2 text-sm transition-all duration-300 rounded-lg"
      : "font-medium transition-all duration-300 px-2 md:px-3 py-2 rounded-lg whitespace-nowrap text-sm md:text-base";

    const activeClasses = isActiveRoute(path)
      ? "text-white bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-lg shadow-red-500/30 transform scale-105"
      : "text-muted-foreground hover:text-primary hover:bg-accent/50";

    return `${baseClasses} ${activeClasses}`;
  };

  // ===== EVENT HANDLERS =====

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Auth modal handlers
  const handleLoginClick = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
    setShowMobileMenu(false);
  };

  const handleRegisterClick = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
    setShowMobileMenu(false);
  };


  const handleMenuLinkClick = () => {
    setShowMobileMenu(false);
  };

  const handleProfileClick = () => {
    setShowProfilePopup(true);
    setShowUserMenu(false);
    setShowMobileUserMenu(false);
  };

  // Fetch logo from Sanity
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logo = await sanityContentService.getLogoContent();
        setLogoContent(logo);
      } catch (error) {
        console.error('Error fetching logo:', error);
        setLogoContent(null);
      } finally {
        setLogoLoading(false);
      }
    };
    fetchLogo();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target as Node)) {
        setShowMobileUserMenu(false);
      }
      if (authMenuRef.current && !authMenuRef.current.contains(event.target as Node)) {
        setShowAuthMenu(false);
      }
      if (showMobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu || showMobileUserMenu || showAuthMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu, showMobileUserMenu, showAuthMenu]);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-32 relative">
          <div className="flex h-12 sm:h-14 md:h-16 items-center min-w-0">
            {/* Logo - Always visible with responsive sizing */}
            <div className="flex items-center flex-shrink-0 mr-2 sm:mr-4 md:mr-6 lg:mr-7">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
                {logoLoading ? null : (
                  <img
                    src={logoContent?.image?.asset?.url || LogoImg.src}
                    width={90}
                    height={64}
                    alt={logoContent?.alt || "VaoluoiTV Live"}
                    className="w-16 sm:w-20 md:w-24 h-auto object-contain"
                  />
                )}
              </Link>
            </div>

          {/* Navigation - Hidden on mobile/tablet, visible on desktop+ */}
          <nav className="hidden lg:flex items-center justify-start space-x-2 xl:space-x-3 flex-1 mr-auto">
            <Link 
              href="/" 
              className={getNavItemClasses('/')}
            >
              Trang chủ
            </Link>
            <Link 
              href="/match-schedule" 
              className={getNavItemClasses('/match-schedule')}
            >
              Lịch Thi đấu
            </Link>
            <Link 
              href="/match-result" 
              className={getNavItemClasses('/match-result')}
            >
              Kết quả
            </Link>
            <Link 
              href="/special-offer" 
              className={getNavItemClasses('/special-offer')}
            >
              Khuyến mãi
            </Link>
            <Link 
              href="/news" 
              className={getNavItemClasses('/news')}
            >
              Tin tức
            </Link>
          </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 ml-auto lg:ml-8">

              {/* Mobile User Menu - Only show when authenticated and below desktop */}
              {isAuthenticated && (
                <div className="lg:hidden relative" ref={mobileUserMenuRef}>
                  <button
                    onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
                    className="flex items-center space-x-1 px-2 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-700/90 to-red-900/90 hover:from-red-700/95 hover:to-red-900/95 border border-red-500/30 rounded-lg shadow-lg shadow-red-500/20 transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-xl hover:shadow-red-500/30 active:scale-95"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-semibold transition-all duration-300 truncate max-w-[80px] sm:max-w-[100px]" title={user?.display_name || user?.username || 'User'}>{user?.display_name || user?.username || 'User'}</span>
                    <div className={`transition-transform duration-500 ease-in-out ${showMobileUserMenu ? 'rotate-180' : 'rotate-0'}`}>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Mobile User Dropdown Menu */}
                  {showMobileUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md border border-gray-200/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3 group-hover:bg-red-200 transition-colors duration-200">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-medium">Hồ sơ cá nhân</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowMobileUserMenu(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3 group-hover:bg-red-200 transition-colors duration-200">
                            <svg className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="font-medium">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button - Show on mobile and tablet */}
              <button
                ref={mobileMenuButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="lg:hidden p-1.5 text-muted-foreground hover:text-primary transition-colors duration-200 rounded-lg hover:bg-accent/50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Auth Section - Responsive visibility */}
              <div className="hidden lg:flex items-center space-x-1 ">
                {isLoading ? (
                  <div className="flex items-center space-x-2 px-2 py-1 text-xs md:text-sm font-medium text-muted-foreground">
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden md:inline">Đang tải...</span>
                  </div>
                ) : isAuthenticated ? (
                  /* User Menu - Desktop only */
                  <div className="relative hidden lg:block" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-red-700/90 to-red-900/90 hover:from-red-700/95 hover:to-red-900/95 border border-red-500/30 rounded-lg shadow-lg shadow-red-500/20 transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-xl hover:shadow-red-500/30 active:scale-95"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-semibold transition-all duration-300 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[200px]" title={user?.display_name || user?.username || 'User'}>{user?.display_name || user?.username || 'User'}</span>
                      <div className={`transition-transform duration-500 ease-in-out ${showUserMenu ? 'rotate-180' : 'rotate-0'}`}>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-200/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="py-1">
                          <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3 group-hover:bg-red-200 transition-colors duration-200 flex-shrink-0">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium whitespace-nowrap">Hồ sơ cá nhân</span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">Xem và chỉnh sửa thông tin</span>
                            </div>
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3 group-hover:bg-red-200 transition-colors duration-200 flex-shrink-0">
                              <svg className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium whitespace-nowrap">Đăng xuất</span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">Thoát khỏi tài khoản</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Login/Register Buttons - Desktop only */
                  <>
                    {/* Auth Menu Button for lg-xl screens (1024-1280px) */}
                    <div className="hidden lg:block xl:hidden relative" ref={authMenuRef}>
                      <button
                        onClick={() => setShowAuthMenu(!showAuthMenu)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-white 
                          rounded-lg bg-gradient-to-r from-red-700/70 to-red-900/70
                          transition-all duration-300 ease-in-out whitespace-nowrap
                          hover:from-red-700/90 hover:to-red-900/90 hover:scale-102"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${showAuthMenu ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Auth Dropdown Menu */}
                      {showAuthMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50 transform transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in-0">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleLoginClick();
                                setShowAuthMenu(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors duration-200"
                            >
                              Đăng nhập
                            </button>
                            <button
                              onClick={() => {
                                handleRegisterClick();
                                setShowAuthMenu(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors duration-200"
                            >
                              Đăng ký
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Direct buttons for xl+ screens (>=1280px) */}
                    <div className="hidden xl:flex items-center space-x-2">
                      <button
                        onClick={handleLoginClick}
                        className="
                          group flex items-center gap-2 px-5 py-3 text-sm font-bold text-white 
                          rounded-lg bg-gradient-to-r from-red-700/50 to-red-900/50
                          transition-all duration-300 ease-in-out whitespace-nowrap
                        hover:from-red-700/90 hover:to-red-900/90 hover:scale-102"
                      >
                        <span>Đăng nhập</span>
                      </button>
                      <button
                        onClick={handleRegisterClick}
                        className="
                          group flex items-center gap-2 px-8 py-3 text-sm font-bold text-white 
                          rounded-lg bg-gradient-to-r from-red-700/90 to-red-900/90
                          transition-all duration-300 ease-in-out whitespace-nowrap
                          hover:scale-102 cursor-pointer"
                      >
                        <span>Đăng ký</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ===== MOBILE MENU ===== */}
          <div
            className={`lg:hidden absolute top-full left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur shadow-lg transform transition-all duration-300 ease-in-out overflow-hidden ${showMobileMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            ref={mobileMenuRef}
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  href="/"
                  className={getNavItemClasses('/', true)}
                  onClick={handleMenuLinkClick}
                >
                  Trang chủ
                </Link>
                <Link
                  href="/match-schedule"
                  className={getNavItemClasses('/match-schedule', true)}
                  onClick={handleMenuLinkClick}
                >
                  Lịch Thi đấu
                </Link>
                <Link
                  href="/match-result"
                  className={getNavItemClasses('/match-result', true)}
                  onClick={handleMenuLinkClick}
                >
                  Kết quả
                </Link>
                <Link
                  href="/special-offer"
                  className={getNavItemClasses('/special-offer', true)}
                  onClick={handleMenuLinkClick}
                >
                  Khuyến mãi
                </Link>
                <Link 
                  href="/news" 
                  className={getNavItemClasses('/news', true)}
                  onClick={handleMenuLinkClick}
                >
                  Tin tức
                </Link>
              </nav>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-border">
                {isLoading ? (
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tải...</span>
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfileClick}
                      className="
                        group flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white 
                        rounded-lg bg-gradient-to-r from-red-700/50 to-red-900/50
                        transition-all duration-300 ease-in-out whitespace-nowrap flex-1
                      hover:from-red-700/90 hover:to-red-900/90 hover:scale-102"
                    >
                      <User className="w-3 h-3" />
                      <span>Hồ sơ</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="
                        group flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white 
                        rounded-lg bg-gradient-to-r from-red-700/90 to-red-900/90
                        transition-all duration-300 ease-in-out whitespace-nowrap flex-1
                        hover:scale-102"
                    >
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleLoginClick}
                      className="
                        group flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white 
                        rounded-lg bg-gradient-to-r from-red-700/50 to-red-900/50
                        transition-all duration-300 ease-in-out whitespace-nowrap flex-1
                      hover:from-red-700/90 hover:to-red-900/90 hover:scale-102"
                    >
                      <span>Đăng nhập</span>
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="
                        group flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white 
                        rounded-lg bg-gradient-to-r from-red-700/90 to-red-900/90
                        transition-all duration-300 ease-in-out whitespace-nowrap flex-1
                        hover:scale-102"
                    >
                      <span>Đăng ký</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Popup */}
      <ProfilePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </>
  );
}