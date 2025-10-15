import { Match } from '@/types/match';
import { STATUS_CONFIG } from '@/constants/match-schedule.constants';

interface MatchResultCardProps {
  match: Match;
  onClick?: () => void;
}

export default function MatchResultCard({ match }: MatchResultCardProps) {

  // Helper function to format match date
  const formatMatchDate = (dateString: string) => {
    try {
      // Check if dateString is already in DD/MM/YYYY format (from new API)
      if (dateString.includes('/') && dateString.length === 10) {
        // Already in DD/MM/YYYY format, use directly
        return dateString;
      }
      
      // Legacy format: Parse the date
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      // Fallback if date parsing fails
      return dateString;
    }
  };

  // Helper function to get status config
  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || null;
  };

  // Helper function to get match status text
  const getMatchStatus = (status: string): string => {
    const statusMap = {
      'finished': 'Kết thúc',
      'live': 'Trực tiếp',
      'cancelled': 'Hủy bỏ',
      'scheduled': 'Sắp diễn ra',
      'not_started': 'Chưa bắt đầu'
    };
    return statusMap[status as keyof typeof statusMap] || 'Chưa bắt đầu';
  };

  // Get status config
  const matchStatus = getMatchStatus(match.status);
  const statusConfig = getStatusConfig(matchStatus);

  return (
      <div
        className={`relative flex flex-col sm:flex-row items-start sm:items-center bg-gradient-to-br from-red-900/40 to-red-700 rounded-lg md:rounded-xl shadow-xl border-l-3 border-r-3 border-yellow-500/50 p-3 sm:p-4 md:p-6 transition-all duration-300 gap-2 sm:gap-0 hover:translate-y-[-2px]`}
      >
      {/* Mobile: Status and Type - Top Right Corner */}
      <div className="absolute top-3 right-3 sm:hidden">
        <div className="flex flex-col items-end gap-1">
          <div className={`text-xs font-bold uppercase whitespace-nowrap ${statusConfig?.color || 'text-slate-400'}`}>
            {statusConfig?.label || matchStatus}
          </div>
        </div>
      </div>

      {/* Date/Time + Teams - Left Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1">
        {/* Date/Time */}
        <div className="text-slate-200 text-sm font-medium whitespace-nowrap">
          {formatMatchDate(match.match_date)}
        </div>

        {/* Teams */}
        <div className="flex flex-col space-y-1 min-w-0 flex-1 max-w-[150px] sm:max-w-[180px] lg:max-w-[250px]">
          <div className="flex items-center space-x-1 min-w-0 mb-3">
            {match.home_team.logo && (
              <img
                src={match.home_team.logo}
                alt={`${match.home_team.name} logo`}
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <span className="text-slate-100 font-bold text-xs sm:text-sm sm:whitespace-nowrap sm:truncate lg:whitespace-normal lg:break-words break-words hyphens-auto leading-tight">{match.home_team.name}</span>
          </div>
          <div className="flex items-center space-x-1 min-w-0">
            {match.away_team.logo && (
              <img
                src={match.away_team.logo}
                alt={`${match.away_team.name} logo`}
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <span className="text-slate-100 font-bold text-xs sm:text-sm sm:whitespace-nowrap sm:truncate lg:whitespace-normal lg:break-words break-words hyphens-auto leading-tight">{match.away_team.name}</span>
          </div>
        </div>
      </div>

      {/* Mobile: Score at center */}
      <div className="absolute left-[60%] top-[60%] transform -translate-x-1/2 -translate-y-1/2 sm:hidden">
        <div className="flex flex-col items-center gap-0">
          <span className="font-bold text-slate-100 text-sm">{match.home_score}</span>
          <span className="font-bold text-slate-100 text-sm">{match.away_score}</span>
        </div>
      </div>

      {/* Desktop: Score - Absolute Positioned (Independent) */}
      <div className="hidden sm:block absolute left-[70%] top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center justify-center gap-0">
          <span className="font-bold text-slate-100 text-sm sm:text-base mb-2">{match.home_score}</span>
          <span className="font-bold text-slate-100 text-sm sm:text-base">{match.away_score}</span>
        </div>
      </div>

      {/* Desktop: Status and Type - Right Section */}
      <div className="hidden sm:flex flex-col items-end gap-1 w-auto ml-auto">
        {/* Status */}
        <div className={`text-xs sm:text-sm font-bold uppercase whitespace-nowrap ${statusConfig?.color || 'text-slate-400'}`}>
          {statusConfig?.label || matchStatus}
        </div>
      </div>
    </div>
  );
}
