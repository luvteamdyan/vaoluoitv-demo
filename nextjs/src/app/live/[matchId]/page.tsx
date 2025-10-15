
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ScoreTableSection from "@/components/sections/live-page/ScoreTableSection";
import SubAdsBannerSection from "@/components/sections/live-page/LiveAdsBannerSection";
import LiveRoomTheaterSection from "@/components/sections/live-page/LiveRoomTheaterSection";
import LiveChatBox from "@/components/sections/live-page/LiveChatBox";
import MarqueeBoxSection from "@/components/sections/MarqueeBoxSection";
// import NotFoundPage from "@/components/errors/NotFoundPage";
import { useStreamAccess } from '@/hooks/useStreamAccess';
import { matchService } from '@/services/matchService';
import { Match } from '@/types/match';

export default function LivePage() {
    const params = useParams();
    const matchId = params.matchId as string;
    
    const [match, setMatch] = useState<Match | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { 
        signedUrl 
    } = useStreamAccess(matchId);

    // Fetch match data and validate
    useEffect(() => {
        const fetchAndValidateMatch = async () => {
            if (!matchId) {
                setError('Match ID không hợp lệ');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                
                const matchData = await matchService.getMatchById(matchId);
                setMatch(matchData);
                
                // Don't set error for non-live matches anymore
                // Let AdTvcPlayer handle status display
            } catch (err) {
                console.error('Error fetching match:', err);
                setError('Không tìm thấy trận đấu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndValidateMatch();
    }, [matchId]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-white text-sm">Đang tải thông tin trận đấu...</p>
                </div>
            </div>
        );
    }

    // Show live page if match is valid and live
    const pageTitle = match 
        ? `${match.home_team} vs ${match.away_team} - Trực tiếp | VaoLuoiTV`
        : 'Xem trực tiếp bóng đá | VaoLuoiTV';
    
    const pageDescription = match 
        ? `Xem trực tiếp trận đấu ${match.home_team} vs ${match.away_team}. Chất lượng HD, không lag, hoàn toàn miễn phí.`
        : 'Xem trực tiếp các trận đấu bóng đá hấp dẫn nhất. Chất lượng HD, không lag, hoàn toàn miễn phí.';

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            
            <section className="w-full">
                <MarqueeBoxSection />
            </section>

            <section className="w-full mt-0 lg:mt-3">
                <LiveRoomTheaterSection 
                    matchId={matchId}
                    signedUrl={signedUrl}
                    match={match}
                    matchError={error}
                    isLoading={isLoading}
                />
            </section>

            {/* Live Chat Section - Mobile/Tablet only */}
            <section className="w-full lg:hidden">
                <div className="container mx-auto">
                    <div className="h-90 lg:h-[500px]">
                        <LiveChatBox matchId={matchId} />
                    </div>
                </div>
            </section>

            <section className="w-full mt-5 sm:mt-5">
                <ScoreTableSection match={match} />
            </section>

            <section className="w-full mt-2 sm:mt-3">
                <SubAdsBannerSection />
            </section>
        </>
    );
}