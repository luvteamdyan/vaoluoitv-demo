// import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/constants/match-schedule.constants";
import { Match } from "@/types/match";
import { useRouter } from "next/navigation";
import LiveStatusImage from "@/assets/images/matchschedulecard.jpg";
import LogoImg from "@/app/favicon.ico";
import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { sanityContentService } from "@/services/sanityContentService";
import type { SanityInvestorLogoContent } from "@/types/sanity-content";
import { urlFor } from "@/lib/sanity";

interface MatchScheduleCardProps {
  match: Match;
}

// Helper functions
const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || null;
};
const getMatchStatus = (status: string): string => {
  const statusMap = {
    finished: "Kết thúc",
    live: "Trực tiếp",
    cancelled: "Hủy bỏ",
    scheduled: "Sắp diễn ra",
    not_started: "Chưa bắt đầu",
  };
  return statusMap[status as keyof typeof statusMap] || "Chưa bắt đầu";
};
const formatMatchDateTime = (matchTime: string, matchDate: string) => {
  try {
    // Check if matchDate is already in DD/MM/YYYY format (from new API)
    if (matchDate.includes('/') && matchDate.length === 10) {
      // Already in DD/MM/YYYY format, use directly
      return `${matchTime} - ${matchDate}`;
    }
    
    // Legacy format: Extract date part from matchDate (remove time part)
    // matchDate format: "2025-09-23T09:00:00.000Z" -> "2025-09-23"
    const dateOnly = matchDate.split('T')[0];
    
    // Parse date parts
    const [year, month, day] = dateOnly.split('-');
    
    // Format as dd/MM/yyyy
    const formattedDate = `${day}/${month}/${year}`;
    
    // Combine time and date: "16:00 - 23/09/2025"
    return `${matchTime} - ${formattedDate}`;
  } catch {
    // Fallback if date parsing fails
    return `${matchTime}`;
  }
};
// const getScoreDisplay = (
//   status: string,
//   homeScore: number,
//   awayScore: number
// ): string => {
//   return status === "scheduled" || status === "not_started"
//     ? "0 : 0"
//     : `${homeScore} : ${awayScore}`;
// };

export default function MatchScheduleCard({ match }: MatchScheduleCardProps) {
  const router = useRouter();
  const [investorLogos, setInvestorLogos] = useState<SanityInvestorLogoContent | null>(null);

  // Fetch investor logos
  useEffect(() => {
    const fetchInvestorLogos = async () => {
      try {
        const logos = await sanityContentService.getInvestorLogoContent();
        setInvestorLogos(logos);
      } catch (error) {
        console.error('Error fetching investor logos:', error);
      }
    };
    fetchInvestorLogos();
  }, []);

  const matchStatus = getMatchStatus(match.status);
  const statusConfig = getStatusConfig(matchStatus);
  // const isLive = match.status === "live";
  // const matchDateTime = formatMatchDateTime(match.match_time, match.match_date);
  // const scoreDisplay = getScoreDisplay(
  //   match.status,
  //   match.home_score,
  //   match.away_score
  // );

  const handleCardClick = () => {
    // Navigate to match page regardless of status
    router.push(`/live/${match.id}`);
  };

  return (
    <div
      className="relative rounded-lg mb-1 md:rounded-xl shadow-xl border-l-3 border-r-3 border-yellow-500/50 overflow-hidden transition-all duration-300 group w-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={LiveStatusImage.src}
          alt="Football background"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay - reduced blur for clearer background */}
        <div className="absolute inset-0 bg-black/90"></div>
      </div>
      {/* Header Section - League, Status, Date/Time */}
      <div className="relative z-10 md:px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          {/* League Name (Start) */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {match.league.logo && (
              <img
                src={match.league.logo}
                alt={`${match.league.name} logo`}
                className="w-4 h-4 md:w-5 md:h-5 object-contain flex-shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <div className="text-slate-100 text-xs md:text-sm font-semibold truncate max-w-[120px] md:max-w-[150px]">
              {match.league.name}
            </div>
          </div>

          {/* Status Badge (Center) */}
          <div className="flex items-center justify-center flex-shrink-0">
            <div className={`px-1 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-full text-xs sm:text-xs md:text-sm font-bold shadow-md transition-colors ${
              matchStatus === 'Trực tiếp' 
                ? 'text-white bg-red-600 hover:bg-red-700' 
                : matchStatus === 'Sắp diễn ra'
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : matchStatus === 'Chưa bắt đầu'
                ? 'text-white bg-purple-600 hover:bg-purple-700'
                : 'text-white bg-gray-600 hover:bg-gray-700'
            }`}>
              {statusConfig?.label || matchStatus}
            </div>
          </div>

          {/* Date and Time (End) */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <div className="text-slate-200 text-xs md:text-sm font-semibold bg-gray-900/60 border-l border-r border-b border-gray-600/50 px-2 py-1 rounded-lg whitespace-nowrap">
              {formatMatchDateTime(match.match_time, match.match_date)}
            </div>
          </div>
        </div>

        {/* Team Information Row */}
        <div className="flex items-center justify-center mt-5">
          <div className="relative flex items-center w-full max-w-md">
            {/* Home Team */}
            <div className="flex items-center justify-end gap-3 flex-1 pr-8 sm:pr-10 md:pr-12">
              <div className="text-right text-xs md:text-sm font-semibold text-slate-100 leading-tight max-w-[120px] md:max-w-[150px] break-words">
                {match.home_team.name}
              </div>
              {match.home_team.logo && (
                <img
                  src={match.home_team.logo}
                  alt={`${match.home_team.name} logo`}
                  className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {/* VS Icon - absolutely centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full border-2 border-yellow-400 flex items-center justify-center">
                <span className="text-white text-xs md:text-sm font-bold">VS</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-start gap-3 flex-1 pl-8 sm:pl-10 md:pl-12">
              {match.away_team.logo && (
                <img
                  src={match.away_team.logo}
                  alt={`${match.away_team.name} logo`}
                  className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <div className="text-left text-xs md:text-sm font-semibold text-slate-100 leading-tight max-w-[120px] md:max-w-[150px] break-words">
                {match.away_team.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Random Icon (Center) and Logo (End) */}
      <div className="relative z-10 md:px-3 py-2 border-t border-l border-r border-gray-600/50 rounded-lg mx-2 mb-2">
        <div className="relative flex items-center justify-center h-6 mx-2 px-2">
          {/* Start - Investor Logo 1 */}
          <div className="flex items-center justify-start flex-1 mt-2">
            {investorLogos?.logo1?.image?.asset?.url ? (
              investorLogos.logo1.url ? (
                <a
                  href={investorLogos.logo1.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity duration-200"
                >
                  <img
                    src={urlFor(investorLogos.logo1.image)
                      .width(60)
                      .auto('format')
                      .quality(85)
                      .url()}
                    alt={investorLogos.logo1.alt || 'Investor Logo 1'}
                    width={60}
                    height={30}
                    className="object-contain"
                  />
                </a>
              ) : (
                <img
                  src={urlFor(investorLogos.logo1.image)
                    .width(60)
                    .auto('format')
                    .quality(85)
                    .url()}
                  alt={investorLogos.logo1.alt || 'Investor Logo 1'}
                  width={60}
                  height={30}
                  className="object-contain"
                />
              )
            ) : (
              <img
                src={LogoImg.src}
                alt="VaoluoiTV Logo"
                width={60}
                height={30}
                className="object-contain"
              />
            )}
          </div>
          
          {/* Center - BLV Info */}
          <div className="flex items-center justify-center flex-1">
            {match.stream_key?.user ? (
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-100 text-xs md:text-sm font-semibold">
                  {match.stream_key.user.display_name || match.stream_key.user.username}
                </span>
              </div>
            ) : (
              <div className="flex items-center md:gap-3">
                <Mic className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300 text-xs md:text-sm font-semibold">
                  Chưa có BLV
                </span>
              </div>
            )}
          </div>
           
          {/* End - Investor Logo 2 */}
          <div className="flex items-center justify-end flex-1">
            {investorLogos?.logo2?.image?.asset?.url ? (
              investorLogos.logo2.url ? (
                <a
                  href={investorLogos.logo2.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity duration-200"
                >
                  <img
                    src={urlFor(investorLogos.logo2.image)
                      .width(60)
                      .auto('format')
                      .quality(85)
                      .url()}
                    alt={investorLogos.logo2.alt || 'Investor Logo 2'}
                    width={60}
                    height={30}
                    className="object-contain"
                  />
                </a>
              ) : (
                <img
                  src={urlFor(investorLogos.logo2.image)
                    .width(60)
                    .auto('format')
                    .quality(85)
                    .url()}
                  alt={investorLogos.logo2.alt || 'Investor Logo 2'}
                  width={60}
                  height={30}
                  className="object-contain"
                />
              )
            ) : (
              <img
                src="https://cdn.vaoluoitv.com/images/luck8.png"
                alt="LUCK8 Logo"
                width={60}
                height={30}
                className="object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
