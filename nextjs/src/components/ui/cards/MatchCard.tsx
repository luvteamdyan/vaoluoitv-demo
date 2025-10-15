import { Match, MatchStatus } from '@/types/match';
import { useRouter } from 'next/navigation';
import { formatMatchDateTime } from '@/utils/dateUtils';

interface MatchCardProps {
  match: Match;
  backgroundImage?: string;
}

export default function MatchCard({
  match,
  backgroundImage,
}: MatchCardProps) {
  const router = useRouter();

  // Handle card click to navigate to match page (any status)
  const handleCardClick = () => {
    // Navigate to match page regardless of status
    router.push(`/live/${match.id}`);
  };

  // Helper function to get status display text
  const getStatusText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.LIVE:
        return 'TRỰC TIẾP';
      case MatchStatus.SCHEDULED:
        return 'SẮP DIỄN RA';
      case MatchStatus.FINISHED:
        return 'KẾT THÚC';
      case MatchStatus.CANCELLED:
        return 'HỦY BỎ';
      case MatchStatus.NOT_STARTED:
        return 'CHƯA BẮT ĐẦU';
      default:
        return String(status).toUpperCase();
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.LIVE:
        return 'bg-red-500 text-white';
      case MatchStatus.SCHEDULED:
        return 'bg-blue-500 text-white';
      case MatchStatus.NOT_STARTED:
        return 'bg-purple-500 text-white';
      case MatchStatus.FINISHED:
        return 'bg-gray-500 text-white';
      case MatchStatus.CANCELLED:
        return 'bg-orange-500 text-white';
      default:
        return 'bg-yellow-400 text-black';
    }
  };
  return (
    <div 
      className="group relative border border-yellow-500/30 rounded-lg p-2 md:p-4 lg:p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-101 overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onClick={handleCardClick}
    >
      {/* Dark overlay - reduced opacity for clearer background */}
      <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Match Header - Compact on mobile */}
        <div className="flex items-center justify-between mb-2 md:mb-4 lg:mb-6">
          {/* League Name - Left */}
          <div className="text-left flex-1 min-w-0">
            <span className="text-xs md:text-sm lg:text-base font-medium text-gray-300 truncate block max-w-[80%] md:max-w-none">
              {match.league.name}
            </span>
          </div>
          
          {/* Match Status - Center */}
          <div className="text-center mx-2 flex-shrink-0">
            <span className={`text-xs md:text-sm lg:text-md xl:text-md font-semibold px-2 py-0.5 md:px-3 md:py-1.5 lg:px-4 lg:py-2 xl:px-2 xl:py-2 rounded ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
          </div>
          
          {/* Match Time - Right */}
          <div className="text-right flex-1 min-w-0">
            <span className="text-xs md:text-sm lg:text-base text-gray-300 truncate block md:max-w-none">
              {formatMatchDateTime(match.match_time, match.match_date)}
            </span>
          </div>
        </div>

        {/* Match Body - Unified responsive layout */}
        <div className="mb-2 md:mb-4 lg:mb-6">
          {/* Mobile: Stacked layout for better readability */}
          <div className="md:hidden">
            {/* Teams and Score - Mobile Stacked */}
            <div className="flex items-center justify-between mb-2">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="text-xs font-semibold text-white text-center leading-tight break-words max-w-[80px]">
                  {match.home_team.name}
                </div>
                {match.home_team.logo && (
                  <div className="w-6 h-6 mt-1">
                    <img 
                      src={match.home_team.logo} 
                      alt={`${match.home_team.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Score */}
              <div className="flex items-center justify-center mx-2">
                <div className="text-sm font-bold text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                  {match.home_score} - {match.away_score}
                </div>
              </div>
              
              {/* Away Team */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="text-xs font-semibold text-white text-center leading-tight break-words max-w-[80px]">
                  {match.away_team.name}
                </div>
                {match.away_team.logo && (
                  <div className="w-6 h-6 mt-1">
                    <img 
                      src={match.away_team.logo} 
                      alt={`${match.away_team.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Perfect grid layout */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-x-4 lg:gap-x-6 xl:gap-x-8 items-center">
            {/* Home Team - Left */}
            <div className="flex items-center justify-end space-x-2 lg:space-x-3">
              <div className="font-bold text-white text-right text-sm lg:text-md xl:text-md">
                {match.home_team.name}
              </div>
              {match.home_team.logo && (
                <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-10 xl:h-10 flex-shrink-0">
                  <img 
                    src={match.home_team.logo} 
                    alt={`${match.home_team.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Score - Center - Perfect alignment */}
            <div className="text-center flex-shrink-0">
              <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-white whitespace-nowrap">
                {match.home_score} - {match.away_score}
              </div>
            </div>
            
            {/* Away Team - Right */}
            <div className="flex items-center justify-start space-x-2 lg:space-x-3">
              {match.away_team.logo && (
                <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-10 xl:h-10 flex-shrink-0">
                  <img 
                    src={match.away_team.logo} 
                    alt={`${match.away_team.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="font-bold text-white text-left text-sm lg:text-md xl:text-md">
                {match.away_team.name}
              </div>
            </div>
          </div>
        </div>

        {/* Match Footer - Compact on mobile */}
        <div className="border-t border-yellow-500/30 pt-1 md:pt-3 lg:pt-4">
          <div className="flex items-center justify-between text-xs md:text-sm">
            {/* BLV (Commentator) */}
            <div className="flex items-center space-x-1 bg-gray-800 border-1 border-yellow-500/30 md:space-x-2 px-2 py-1 rounded-xl">
              <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-yellow-300 font-medium whitespace-nowrap">
                {match.stream_key?.user ? 
                  `${match.stream_key.user.display_name || match.stream_key.user.username}` : 
                  'Chưa có BLV'
                }
              </span>
            </div>
            
            {/* Match Type */}
            <div className="flex items-center space-x-1 md:space-x-2 mx-2">
            </div>
            
            {/* Featured Badge */}
            {match.is_featured && (
              <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-yellow-400 font-medium hidden md:inline">Nổi bật</span>
                <span className="text-yellow-400 font-medium md:hidden">★</span>
              </div>
            )}
          </div>
          
          {/* Description - Hidden on mobile to save space */}
          {match.description && (
            <div className="mt-1 md:mt-3 lg:mt-4 text-xs md:text-sm text-gray-400 line-clamp-2 hidden md:block">
              {match.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
