'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkInService } from '@/services/checkin.service';
import { authService } from '@/services/auth.service';
import { CheckInStats } from '@/types/checkin.types';

interface CheckInGameProps {
  className?: string;
}

const CheckInGame: React.FC<CheckInGameProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [checkInStats, setCheckInStats] = useState<CheckInStats>({
    currentStreak: 0,
    totalCheckins: 0,
    lastCheckinAt: null,
    canCheckInToday: true,
    nextRewardIn: 4
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastClosing, setIsToastClosing] = useState(false);

  const monthNames = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Helper function để tính toán các ngày đã điểm danh
  const getCheckedInDates = (): Set<string> => {
    const checkedDates = new Set<string>();
    
    if (!checkInStats.lastCheckinAt || checkInStats.currentStreak === 0) {
      return checkedDates;
    }

    const lastCheckinDate = new Date(checkInStats.lastCheckinAt);
    
    // Tính toán các ngày đã điểm danh dựa trên chuỗi
    for (let i = 0; i < checkInStats.currentStreak; i++) {
      const checkInDate = new Date(lastCheckinDate);
      checkInDate.setDate(checkInDate.getDate() - i);
      
      // Format: YYYY-MM-DD
      const dateKey = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`;
      checkedDates.add(dateKey);
    }

    return checkedDates;
  };

  // Load checkin stats khi component mount
  useEffect(() => {
    const loadCheckInStats = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const stats = await checkInService.getCheckInStats();
          setCheckInStats(stats);
        } catch (error) {
          console.error('Error loading checkin stats:', error);
        }
      }
    };

    loadCheckInStats();
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    const token = authService.getToken();

    if (!token) {
      setMessage('Vui lòng đăng nhập để điểm danh');
      return;
    }

    if (!checkInStats.canCheckInToday) {
      setMessage('Bạn đã điểm danh hôm nay rồi!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await checkInService.performCheckIn();
      
      if (result.success && result.data) {
        // Hiển thị thông báo thành công với ngày cụ thể
        const today = new Date();
        const dateString = today.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setToastMessage(`Bạn đã điểm danh thành công ngày: ${dateString}`);
        setShowToast(true);
        setIsToastClosing(false);
        
        // Tự động ẩn toast sau 3 giây với animation
        setTimeout(() => {
          setIsToastClosing(true);
          setTimeout(() => {
            setShowToast(false);
            setIsToastClosing(false);
          }, 300); // Thời gian animation fade out
        }, 3000);
        
        // Cập nhật stats với lastCheckinAt mới
        setCheckInStats(prev => ({
          ...prev,
          currentStreak: result.data!.checkin.currentStreak,
          totalCheckins: result.data!.checkin.totalCheckins,
          lastCheckinAt: result.data!.checkin.lastCheckinAt,
          canCheckInToday: false,
          nextRewardIn: checkInService.calculateDaysToNextReward(result.data!.checkin.currentStreak)
        }));
      } else {
        setMessage(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra khi điểm danh');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    const todayDate = today.getDate();
    
    // Lấy danh sách các ngày đã điểm danh
    const checkedInDates = getCheckedInDates();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 lg:h-18 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === todayDate;
      
      // Tạo date key để so sánh với checkedInDates
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasCheckedIn = checkedInDates.has(dateKey);
      
      // Xác định background dựa trên trạng thái
      let backgroundClass = 'bg-white/5';
      if (hasCheckedIn && !isToday) {
        // Ngày quá khứ đã điểm danh - background xanh lá
        backgroundClass = 'bg-gradient-to-br from-green-500/20 to-emerald-500/20';
      } else if (isToday && hasCheckedIn) {
        // Hôm nay đã điểm danh - giữ background vàng cam
        backgroundClass = 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20';
      } else if (isToday && !hasCheckedIn) {
        // Hôm nay chưa điểm danh - background vàng cam
        backgroundClass = 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20';
      }
      
      days.push(
        <div
          key={day}
          onClick={isToday && checkInStats.canCheckInToday ? handleCheckIn : undefined}
          className={`h-14 lg:h-18 flex items-center justify-center text-white/90 text-xs lg:text-base font-medium transition-all duration-300 hover:rounded-lg rounded-lg border backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 ${backgroundClass} ${
            hasCheckedIn ? 'border-green-400 ring-2 ring-green-400/50' : 'border-white/20'
          } ${
            isToday && checkInStats.canCheckInToday ? 'cursor-pointer hover:bg-gradient-to-br hover:from-yellow-500/30 hover:to-orange-500/30 hover:ring-2 hover:ring-yellow-300 hover:ring-opacity-75' : 'cursor-default'
          } ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main content - Layout 3 columns on desktop, 1 column on mobile/tablet */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center px-2 py-2 lg:px-4 lg:py-4 h-full gap-2 lg:gap-4">
        {/* Left Panel - Title (Desktop only) */}
        <div className="hidden lg:flex items-center justify-center w-[300px]">
          <div 
            className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mr-2 shadow-2xl border border-green-400/50 flex flex-col items-center gap-4 w-full" 
            style={{
              backgroundImage: 'url(https://luck8event.com/page-bg.jpg)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              animation: 'float 3s ease-in-out infinite, glow 2s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(74, 222, 128, 0.6), 0 0 40px rgba(74, 222, 128, 0.4), 0 0 60px rgba(74, 222, 128, 0.2)'
            }}
          >
            <div style={{writingMode: 'horizontal-tb'}}>
              <h1 className="text-green-300 text-2xl font-bold uppercase whitespace-nowrap drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">Điểm Danh Mỗi Ngày</h1>
            </div>
            <img 
              src="https://cdn.vaoluoitv.com/images/luck8.png" 
              alt="Luck8 Event Logo" 
              className="w-24 h-auto opacity-90"
            />
          </div>
        </div>

        {/* Center Panel - Calendar */}
        <div className="flex-1 flex flex-col items-center justify-center w-full lg:max-w-[1200px]">
          {/* Mobile/Tablet Title */}
          <div className="lg:hidden text-center mb-2 w-full px-2">
            <h1 className="text-white text-lg lg:text-2xl font-bold uppercase">Điểm Danh Mỗi Ngày, Rinh Quà Liền Tay</h1>
          </div>

          <div className="w-full bg-black/30 backdrop-blur-sm rounded-2xl z-100 p-3 lg:p-6 shadow-2xl border border-white/10" style={{backgroundImage: 'url(https://luck8event.com/page-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            {/* Header Section */}
            <div className="flex justify-between items-start mb-2 lg:mb-4">
            {/* Left side - Month navigation and streak */}
            <div className="flex flex-col gap-2 lg:gap-3">
              {/* Month/Year Navigation */}
              <div className="flex items-center gap-2 lg:gap-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="w-8 h-8 lg:w-12 lg:h-12 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
                >
                  ←
                </button>
                
                <div className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {monthNames[currentMonth]}/{currentYear}
                </div>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="w-8 h-8 lg:w-12 lg:h-12 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
                >
                  →
                </button>
              </div>

              {/* Check-in streak info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 lg:p-3 border border-white/10">
                <p className="text-white/90 text-sm lg:text-lg">
                  Chuỗi điểm danh của bạn đã được: <span className="text-yellow-300 font-bold text-base lg:text-xl">{checkInStats.currentStreak}</span> Ngày
                </p>
              </div>
            </div>

            {/* Right side - Accumulated rewards */}
            <div className="text-left space-y-2 lg:space-y-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 lg:p-3 border border-white/10">
                <p className="text-white/90 text-sm lg:text-lg">
                  Lượt Quay: <span className="text-yellow-300 font-bold text-base lg:text-xl">{checkInService.calculateRewards(checkInStats.currentStreak).spinChances}</span> 
                </p>
              </div>
            </div>
            </div>

            {/* Calendar */}
            <div>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 lg:gap-3 mb-1 lg:mb-3">
                {dayNames.map((day, index) => (
                  <div key={index} className="h-10 lg:h-16 flex items-center justify-center shadow-lg shadow-yellow-500/25 text-yellow-200 text-xs lg:text-lg font-bold bg-gradient-to-r from-yellow-800/30 to-yellow-500/30 rounded-lg border border-white/10">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 lg:gap-3">
                {renderCalendar()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Title (Desktop only) */}
        <div className="hidden lg:flex items-center justify-center w-[300px]">
          <div 
            className="bg-black/30 backdrop-blur-sm rounded-2xl ml-1 p-6 shadow-2xl border border-green-400/50 flex flex-col items-center gap-4 w-full" 
            style={{
              backgroundImage: 'url(https://luck8event.com/page-bg.jpg)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              animation: 'float 3s ease-in-out infinite, glow 2s ease-in-out infinite',
              animationDelay: '1.5s',
              boxShadow: '0 0 20px rgba(74, 222, 128, 0.6), 0 0 40px rgba(74, 222, 128, 0.4), 0 0 60px rgba(74, 222, 128, 0.2)'
            }}
          >
            <div style={{writingMode: 'horizontal-tb'}}>
              <h1 className="text-green-300 text-2xl font-bold uppercase whitespace-nowrap drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">Rinh Quà Liền Tay</h1>
            </div>
            <img 
              src="https://cdn.vaoluoitv.com/images/luck8.png" 
              alt="Luck8 Event Logo" 
              className="w-24 h-auto opacity-90"
            />
          </div>
        </div>
      </div>

      {/* CSS Animation for floating and glow effects */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.6), 
                        0 0 40px rgba(74, 222, 128, 0.4), 
                        0 0 60px rgba(74, 222, 128, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(74, 222, 128, 0.8), 
                        0 0 60px rgba(74, 222, 128, 0.6), 
                        0 0 90px rgba(74, 222, 128, 0.4);
          }
        }
      `}</style>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`${
            isToastClosing ? 'animate-slide-up-fade-out' : 'animate-slide-down'
          }`}>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-400 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <p className="font-medium">{toastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInGame;
