import { EmptyStateProps } from '@/types/match-schedule.types';

const EmptyState = ({ showAllMatches, selectedLeague, selectedDate }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 md:py-12 mb-6 md:mb-8">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-2">
        {showAllMatches ? 'Không có trận đấu nào' : 'Không có trận đấu trong ngày này'}
      </h3>
      <p className="text-sm md:text-base text-gray-400">
        {showAllMatches 
          ? `Không có trận đấu nào${selectedLeague !== 'all' ? ` trong giải ${selectedLeague}` : ''}`
          : `Không có trận đấu nào diễn ra vào ngày ${selectedDate.toLocaleDateString('vi-VN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}${selectedLeague !== 'all' ? ` trong giải ${selectedLeague}` : ''}. Vui lòng chọn ngày khác hoặc nhấn "Tất cả" để xem tất cả các trận đấu.`
        }
      </p>
    </div>
  );
};

export default EmptyState;
