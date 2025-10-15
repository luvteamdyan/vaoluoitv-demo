"use client";
import React, { useState } from "react";
import { Match } from "@/types/match";

interface ScoreTableSectionProps {
    match: Match | null;
}

export default function ScoreTableSection({ match }: ScoreTableSectionProps) {
    // Initialize hooks at the top level (before any conditional returns)
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // If no match data, show loading or placeholder
    if (!match) {
        return (
            <div className="w-full">
                <div className="w-full sm:container sm:mx-auto sm:px-4 lg:px-32">
                    <div className="bg-black/20 rounded-lg p-6 text-center">
                        <p className="text-white">Đang tải thông tin trận đấu...</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentSlide < 1) {
            setCurrentSlide(currentSlide + 1);
        }
        if (isRightSwipe && currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="w-full">
            <div className="w-full sm:container sm:mx-auto sm:px-4 lg:px-32">
                <div 
                    className="relative lg:rounded-sm sm:rounded-none shadow-xl border border-gray-200 dark:border-gray-700 p-2 sm:p-4 lg:p-6 overflow-hidden"
                    style={{
                        backgroundImage: "url('https://i.pinimg.com/1200x/58/a5/61/58a561486c0beee56739ce040b6edead.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                    }}
                >
                    {/* Overlay để text dễ đọc - reduced blur for clearer background */}
                    <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
                    
                    {/* Content với z-index cao hơn overlay */}
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                            <div className="flex items-center">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span className="text-xs sm:text-sm font-medium text-white">
                                    Cập nhật thông tin trận đấu theo thời gian thực sẽ được áp dụng trong thời gian sớm nhất
                                </span>
                            </div>
                        </div>

                        {/* Match Status */}
                        <div className="text-center mb-2 sm:mb-3">
                            <div className="text-base sm:text-xl lg:text-2xl font-bold text-yellow-400">
                                -
                            </div>
                            <div className="text-xs sm:text-lg lg:text-xl text-gray-200">
                                -
                            </div>
                        </div>

                        {/* Score Display */}
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            {/* Mobile Layout: Carousel */}
                            <div className="block sm:hidden w-full">
                                <div 
                                    className="relative overflow-hidden"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {/* Carousel Container */}
                                    <div 
                                        className="flex transition-transform duration-300 ease-in-out"
                                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                    >
                                        {/* Slide 1: Score */}
                                        <div className="w-full flex-shrink-0">
                                            <div className="bg-black/20 rounded-lg p-2 space-y-2">
                                                {/* Home Team */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {match.home_team.logo && (
                                                            <img
                                                                src={match.home_team.logo}
                                                                alt={match.home_team.name}
                                                                className="w-10 h-10 object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <h3 className="text-sm font-bold text-white">
                                                            {match.home_team.name}
                                                        </h3>
                                                    </div>
                                                    <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                                                        <span className="text-lg font-bold text-white">
                                                            -
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {match.away_team.logo && (
                                                            <img
                                                                src={match.away_team.logo}
                                                                alt={match.away_team.name}
                                                                className="w-10 h-10 object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <h3 className="text-sm font-bold text-white">
                                                            {match.away_team.name}
                                                        </h3>
                                                    </div>
                                                    <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                                                        <span className="text-lg font-bold text-white">
                                                            -
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Slide 2: Stats */}
                                        <div className="w-full flex-shrink-0">
                                            <div className="bg-black/20 rounded-lg p-2 space-y-2">
                                                {/* Corners */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm">🚩</span>
                                                        <span className="text-sm font-bold text-white">Phạt góc</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-bold text-white">-</span>
                                                        <span className="text-gray-300">-</span>
                                                        <span className="text-sm font-bold text-white">-</span>
                                                    </div>
                                                </div>

                                                {/* Yellow Cards */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm">🟨</span>
                                                        <span className="text-sm font-bold text-white">Thẻ vàng</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-bold text-white">-</span>
                                                        <span className="text-gray-300">-</span>
                                                        <span className="text-sm font-bold text-white">-</span>
                                                    </div>
                                                </div>

                                                {/* Red Cards */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm">🟥</span>
                                                        <span className="text-sm font-bold text-white">Thẻ đỏ</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-bold text-white">-</span>
                                                        <span className="text-gray-300">-</span>
                                                        <span className="text-sm font-bold text-white">-</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Carousel Indicators */}
                                    <div className="flex justify-center space-x-2 mt-2">
                                        <button
                                            onClick={() => setCurrentSlide(0)}
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                currentSlide === 0 ? 'bg-white' : 'bg-white/30'
                                            }`}
                                        />
                                        <button
                                            onClick={() => setCurrentSlide(1)}
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                currentSlide === 1 ? 'bg-white' : 'bg-white/30'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout: Elegant side by side */}
                            <div className="hidden sm:flex items-center justify-between w-full mb-2">
                                {/* Home Team */}
                                <div className="flex items-center space-x-4 flex-1 justify-end">
                                    <h3 className="text-lg lg:text-xl font-bold text-white text-right">
                                        {match.home_team.name}
                                    </h3>
                                    {match.home_team.logo && (
                                        <img
                                            src={match.home_team.logo}
                                            alt={match.home_team.name}
                                            className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Score - Centered with style */}
                                <div className="flex items-center space-x-6 flex-shrink-0 mx-6">
                                    <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                                        <span className="text-xl lg:text-2xl font-bold text-white">
                                            -
                                        </span>
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-yellow-400">
                                        -
                                    </div>
                                    <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                                        <span className="text-xl lg:text-2xl font-bold text-white">
                                            -
                                        </span>
                                    </div>
                                </div>

                                {/* Away Team */}
                                <div className="flex items-center space-x-4 flex-1 justify-start">
                                    {match.away_team.logo && (
                                        <img
                                            src={match.away_team.logo}
                                            alt={match.away_team.name}
                                            className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <h3 className="text-lg lg:text-xl font-bold text-white text-left">
                                        {match.away_team.name}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row - Hidden on mobile, shown on tablet+ */}
                        <div className="hidden sm:block pt-2 sm:pt-4 lg:pt-6 border-t border-gray-300/30">
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                                {/* Corners */}
                                <div className="bg-black/20 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="text-xs sm:text-sm font-bold text-gray-200 mb-2">Phạt góc</div>
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="bg-white/10 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                -
                                            </span>
                                        </div>
                                        <span className="text-sm sm:text-base">🚩</span>
                                        <div className="bg-white/10 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                -
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Yellow Cards */}
                                <div className="bg-black/20 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="text-xs sm:text-sm font-bold text-gray-200 mb-2">Thẻ vàng</div>
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="bg-yellow-500/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                -
                                            </span>
                                        </div>
                                        <span className="text-sm sm:text-base">🟨</span>
                                        <div className="bg-yellow-500/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                -
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Red Cards */}
                                <div className="bg-black/20 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="text-xs sm:text-sm font-bold text-gray-200 mb-2">Thẻ đỏ</div>
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="bg-red-500/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                -
                                            </span>
                                        </div>
                                        <span className="text-sm sm:text-base">🟥</span>
                                        <div className="bg-red-500/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                -
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
