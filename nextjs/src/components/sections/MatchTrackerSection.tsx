"use client";
import React, { useState } from "react";
import { LiveMatch, MatchStatus, MatchType } from "@/types/match";

// Mock data cho trận đấu
const mockMatchData: LiveMatch = {
  id: "1",
  home_team: {
    id: "team_1",
    name: "Manchester United",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png"
  },
  away_team: {
    id: "team_2", 
    name: "Liverpool FC",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png"
  },
  league: {
    id: "league_1",
    name: "Premier League",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png"
  },
  match_time: "15:00",
  match_date: "2024-01-15T15:00:00Z",
  venue: "Old Trafford",
  status: MatchStatus.LIVE,
  type: MatchType.LEAGUE,
  home_score: 2,
  away_score: 1,
  is_active: true,
  is_featured: true,
  description: "Trận đấu quan trọng giữa hai đội bóng hàng đầu Premier League",
  tags: ["premier-league", "manchester-united", "liverpool"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T16:30:00Z",
  currentTime: "67'",
  stats: {
    homeTeam: {
      possession: 58,
      shots: 12,
      shotsOnTarget: 6,
      corners: 4,
      fouls: 8,
      yellowCards: 2,
      redCards: 0
    },
    awayTeam: {
      possession: 42,
      shots: 8,
      shotsOnTarget: 3,
      corners: 2,
      fouls: 12,
      yellowCards: 3,
      redCards: 1
    }
  },
  events: [
    {
      id: "1",
      type: "goal",
      team: "home",
      player: "Marcus Rashford",
      minute: 23,
      description: "Bàn thắng đẹp từ cú sút xa"
    },
    {
      id: "2",
      type: "yellow_card",
      team: "away",
      player: "Virgil van Dijk",
      minute: 34
    },
    {
      id: "3",
      type: "goal",
      team: "away",
      player: "Mohamed Salah",
      minute: 45,
      description: "Phạt đền"
    },
    {
      id: "4",
      type: "red_card",
      team: "away",
      player: "Jordan Henderson",
      minute: 52
    },
    {
      id: "5",
      type: "goal",
      team: "home",
      player: "Bruno Fernandes",
      minute: 61,
      description: "Đánh đầu từ pha đá phạt góc"
    },
    {
      id: "6",
      type: "substitution",
      team: "home",
      player: "Anthony Martial",
      minute: 65,
      description: "Thay thế cho Marcus Rashford"
    }
  ]
};

export default function MatchTrackerSection() {
  const [match] = useState<LiveMatch>(mockMatchData);
  const [activeTab, setActiveTab] = useState<'events' | 'stats'>('events');

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '🔄';
      case 'penalty':
        return '⚽';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'yellow_card':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'red_card':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'substitution':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-32">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Theo dõi trận đấu
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {match.home_team.name} vs {match.away_team.name} • {match.league.name}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  LIVE • {match.currentTime}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Diễn biến trận đấu
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Thống kê chi tiết
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'events' ? (
              /* Events Timeline */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Timeline sự kiện
                </h3>
                <div className="space-y-3">
                  {match.events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.player}
                          </span>
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            {event.minute}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {event.team === 'home' ? match.home_team.name : match.away_team.name}
                        </div>
                        {event.description && (
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Detailed Stats */
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Thống kê chi tiết
                </h3>
                
                {/* Possession */}
                <div>
                  <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex justify-center ">
                    Kiểm soát bóng
                  </h4>
                  <div className="flex items-center space-x-4">
                    {/* Home Team */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {match.home_team.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {match.stats.homeTeam.possession}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                      <div 
                        className="bg-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${match.stats.homeTeam.possession}%` }}
                      ></div>
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {match.stats.awayTeam.possession}%
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {match.away_team.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Cú sút
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Tổng cú sút
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.homeTeam.shots}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.awayTeam.shots}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Sút trúng đích
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.homeTeam.shotsOnTarget}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.awayTeam.shotsOnTarget}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Phạt góc & Lỗi
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Phạt góc
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.homeTeam.corners}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.awayTeam.corners}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Lỗi
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.homeTeam.fouls}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.awayTeam.fouls}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Thẻ phạt
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {match.home_team.name}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.homeTeam.yellowCards}
                          </span>
                          <span className="text-xs">🟨</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.homeTeam.redCards}
                          </span>
                          <span className="text-xs">🟥</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {match.away_team.name}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.awayTeam.yellowCards}
                          </span>
                          <span className="text-xs">🟨</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {match.stats.awayTeam.redCards}
                          </span>
                          <span className="text-xs">🟥</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
