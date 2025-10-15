'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/match';

import { formatMatchDateTime } from '@/utils/dateUtils';

interface AdTvcPlayerProps {
  match?: Match | null;
  error?: string | null;
  className?: string;
}

export default function AdTvcPlayer({ match, error, className = '' }: AdTvcPlayerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [tvcOpacity, setTvcOpacity] = useState(1);
  const [infoOpacity, setInfoOpacity] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // TVC advertisement URLs - có thể config từ backend
  const tvcUrls = [
    'https://cdn.vaoluoitv.com/videos/0922(13).mp4', // TVC quảng cáo mặc định
    // Có thể thêm nhiều TVC khác từ backend
  ];

  const currentTvcUrl = tvcUrls[0]; // Sử dụng TVC mặc định

  // Handle hover effect - làm mờ TVC và hiển thị thông tin trận đấu
  useEffect(() => {
    if (isHovering) {
      setTvcOpacity(0.3);
      setInfoOpacity(1);
    } else {
      setTvcOpacity(1);
      setInfoOpacity(0);
    }
  }, [isHovering]);

  // Auto-loop TVC
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.loop = true;
      video.muted = true; // TVC tự động mute để tuân thủ auto-play policy
    }
  }, []);

  const getMatchInfoText = () => {
    if (match) {
      return `Trực tiếp - VaoLuoiTV`;
    }
    
    if (error) {
      return 'Trận đấu không khả dụng';
    }
    
    return 'Trận đấu không tìm thấy';
  };

  const getMatchSubInfo = () => {
    if (error) return error;
    
    if (match) {
      const league = match.league?.name || 'Unknown League';
      
      if (match.status === 'live') {
        return league;
      } else {
        return league;
      }
    }
    
    return 'Thông tin không khả dụng';
  };

  const getMatchScheduleInfo = () => {
    if (!match || match.status === 'live' || match.status === 'finished') {
      return null;
    }

    const dateTime = formatMatchDateTime(match.match_time, match.match_date);
    
    return `Cùng đón xem vào lúc ${dateTime}`;
  };

  const getMatchScore = () => {
    if (!match || match.status !== 'live') {
      return null;
    }

    const homeScore = match.home_score || 0;
    const awayScore = match.away_score || 0;
    
    return `${homeScore} : ${awayScore}`;
  };

  const isHotMatch = () => {
    return match?.is_featured || false;
  };

  return (
    <div 
      className={`relative bg-black ${className}`}
      style={{ aspectRatio: '16/9' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* TVC Video Background */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain transition-opacity duration-500"
        style={{ opacity: tvcOpacity }}
        autoPlay
        muted
        playsInline
        loop
        controls={false}
        disablePictureInPicture={true}
        controlsList="nodownload nofullscreen noremoteplayback"
      >
        <source src={currentTvcUrl} type="video/mp4" />
        {/* Fallback TVC nếu video không load được */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">VaoLuoiTV</h2>
            <p className="text-sm sm:text-lg md:text-xl">Xem trực tiếp bóng đá</p>
          </div>
        </div>
      </video>

      {/* Match Information Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          infoOpacity > 0 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ opacity: infoOpacity }}
      >
        <div className="h-full flex flex-col">
          {/* Mobile-first compact layout */}
          <div className="flex-1 flex flex-col justify-center px-2 sm:px-4 md:px-6">
            {/* Main Title - Compact for mobile */}
            <div className="text-center mb-2 sm:mb-3">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {getMatchInfoText()}
              </h1>
              
              {/* Hot Badge - Smaller on mobile */}
              {isHotMatch() && (
                <div className="flex justify-center mt-1 sm:mt-2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                    🔥 TRẬN HOT
                  </span>
                </div>
              )}
            </div>

            {/* Team Section - Optimized for mobile */}
            {match && (
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                {/* Home Team - Compact */}
                <div className="flex flex-col items-center mr-2 sm:mr-3 md:mr-4 lg:mr-6">
                  {match.home_team?.logo && (
                    <img 
                      src={match.home_team.logo} 
                      alt={match.home_team.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
                    />
                  )}
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-center leading-tight max-w-[60px] sm:max-w-[80px] md:max-w-none break-words">
                    {match.home_team?.name || 'Unknown Team'}
                  </span>
                </div>

                {/* VS Section - Compact */}
                <div className="flex flex-col items-center mx-1 sm:mx-2">
                  {getMatchScore() && (
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-center">
                      {getMatchScore()}
                    </div>
                  )}
                  <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">VS</span>
                </div>

                {/* Away Team - Compact */}
                <div className="flex flex-col items-center ml-2 sm:ml-3 md:ml-4 lg:ml-6">
                  {match.away_team?.logo && (
                    <img 
                      src={match.away_team.logo} 
                      alt={match.away_team.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
                    />
                  )}
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-center leading-tight max-w-[60px] sm:max-w-[80px] md:max-w-none break-words">
                    {match.away_team?.name || 'Unknown Team'}
                  </span>
                </div>
              </div>
            )}

            {/* League Info - Compact */}
            <div className="text-center mb-2 sm:mb-3">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl text-yellow-400 mb-1">
                {getMatchSubInfo()}
              </h2>

              {/* Schedule Info - Compact */}
              {getMatchScheduleInfo() && (
                <div className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-300 font-medium">
                  {getMatchScheduleInfo()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Responsive bottom placement */}
          <div className="flex justify-center space-x-2 sm:space-x<｜tool▁sep｜>3 md:space-x-4 pb-2 sm:pb-3 md:pb-4 lg:pb-6">
            <button 
              onClick={() => window.location.href = '/match-schedule'}
              className="relative cursor-pointer px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 flex-1 sm:flex-initial max-w-[140px] sm:max-w-none"
            >
              Xem lịch thi đấu
            </button>
            
            <button 
              onClick={() => window.location.href = '/news'}
              className="relative cursor-pointer px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 flex-1 sm:flex-initial max-w-[140px] sm:max-w-none"
            >
              Tin tức
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}