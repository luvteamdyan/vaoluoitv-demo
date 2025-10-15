"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import LiveChatBox from "./LiveChatBox";
import UniversalVideoPlayer from "@/components/videos/UniversalVideoPlayer";
import AdTvcPlayer from "@/components/videos/AdTvcPlayer";
import { matchService } from "@/services/matchService";
import { Match } from "@/types/match";
import { useStreamUrls } from "@/hooks/useStreamUrls";

interface LiveRoomTheaterSectionProps {
  matchId: string;
  signedUrl?: string | null;
  match?: Match | null;
  matchError?: string | null;
  isLoading?: boolean;
}

export default function LiveRoomTheaterSection({
  matchId,
  signedUrl,
  match: externalMatch,
  matchError: externalMatchError,
  isLoading: externalLoading
}: LiveRoomTheaterSectionProps) {
  // Detect if device is desktop (for autoplay behavior)
  const [, setIsDesktop] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // Volume level from 0 to 1
  // isPlaying will be set based on device type (desktop = true, mobile = false)
  const [isPlaying, setIsPlaying] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  // Controls visibility state 
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isStreamAvailable, setIsStreamAvailable] = useState(true);
  // Use the stream URLs hook
  const { 
    streamUrls,
    refreshUrls
  } = useStreamUrls(matchId, 120);

  // Detect device type on mount
  useEffect(() => {
    // Check if screen width is desktop size (>= 1024px for lg breakpoint)
    const isDesktopSize = window.innerWidth >= 1024;
    // Also check user agent to detect mobile devices
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const desktop = isDesktopSize && !isMobileUserAgent;
    setIsDesktop(desktop);
    
    // Set initial playing state based on device (only on mount)
    // Desktop: auto-play on page load/refresh
    // Mobile: wait for user interaction
    setIsPlaying(desktop);
  }, []); // Empty dependency array - only run once on mount

  // Use external match data if provided, otherwise fetch
  useEffect(() => {
    if (externalMatch || externalMatchError !== undefined || externalLoading !== undefined) {
      // Use external data
      setMatch(externalMatch || null);
      setMatchError(externalMatchError || null);
      setMatchLoading(externalLoading !== undefined ? externalLoading : false);
      
      // Check if stream is available (match exists and is live)
      const streamAvailable = externalMatch && externalMatch.status === 'live';
      setIsStreamAvailable(streamAvailable || false);
      
      if (!streamAvailable) {
        // Stream not available
      }
    } else {
      // Fetch match data if not provided externally
      const fetchMatch = async () => {
        try {
          setMatchLoading(true);
          setMatchError(null);
          const matchData = await matchService.getMatchById(matchId);
          setMatch(matchData);
          
          // Check if stream is available (match exists and is live)
          const streamAvailable = matchData && matchData.status === 'live';
          setIsStreamAvailable(streamAvailable);
          
          if (!streamAvailable) {
            // Stream not available
          }
        } catch (err) {
          console.error('Error fetching match:', err);
          setMatchError(err instanceof Error ? err.message : 'Failed to fetch match data');
          setIsStreamAvailable(false);
        } finally {
          setMatchLoading(false);
        }
      };

      if (matchId) {
        fetchMatch();
      }
    }
  }, [matchId, externalMatch, externalMatchError, externalLoading]);

  // Handle play/pause
  const handlePlayPause = async () => {
    if (videoElement) {
      if (videoElement.paused) {
        // Refresh URLs to get latest livestream when resuming from pause
        await refreshUrls();
        
        // Small delay to allow new URL to be applied
        setTimeout(() => {
          videoElement.play().catch(() => {
            // Auto-play failed, but we can still show the button state
          });
          setIsPlaying(true);
        }, 100);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle mute/unmute
  const handleMuteToggle = () => {
    if (videoElement) {
      const newMutedState = !isMuted;
      videoElement.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoElement) {
      videoElement.volume = newVolume;
      // Auto-unmute if volume is increased
      if (newVolume > 0 && isMuted) {
        videoElement.muted = false;
        setIsMuted(false);
      }
      // Auto-mute if volume is set to 0
      if (newVolume === 0) {
        videoElement.muted = true;
        setIsMuted(true);
      }
    }
  };

  // Handle video events - wrapped in useCallback to prevent unnecessary re-renders
  const handleVideoCanPlay = useCallback(() => {
    // Try to auto-play on desktop after a short delay to avoid browser restrictions
    if (videoElement && isPlaying) {
      setTimeout(() => {
        videoElement.play().catch(() => {
          // Auto-play failed, update state
          setIsPlaying(false);
        });
      }, 100);
    }
  }, [videoElement, isPlaying]);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Handle fullscreen toggle - supports both desktop and mobile browsers
  const handleFullscreenToggle = useCallback(() => {
    // Try to use video element first for better mobile support
    const targetElement = videoElement || document.querySelector('.video-container') as HTMLElement;
    
    if (!targetElement) return;

    // Check if currently in fullscreen (with webkit support for iOS)
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
    );

    if (isCurrentlyFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      } else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
        (document as Document & { mozCancelFullScreen: () => void }).mozCancelFullScreen();
      } else if ((document as Document & { msExitFullscreen?: () => void }).msExitFullscreen) {
        (document as Document & { msExitFullscreen: () => void }).msExitFullscreen();
      }
    } else {
      // Enter fullscreen - try video element methods first for mobile
      if (videoElement) {
        // iOS Safari specific method
        if ((videoElement as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
          try {
            (videoElement as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
            return;
          } catch {
            // Continue to other methods if this fails
          }
        }
        
        // Standard and webkit prefixed methods
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen().catch(() => {});
        } else if ((videoElement as HTMLVideoElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
          (videoElement as HTMLVideoElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
        } else if ((videoElement as HTMLVideoElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
          (videoElement as HTMLVideoElement & { mozRequestFullScreen: () => void }).mozRequestFullScreen();
        } else if ((videoElement as HTMLVideoElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
          (videoElement as HTMLVideoElement & { msRequestFullscreen: () => void }).msRequestFullscreen();
        }
      } else {
        // Fallback to container
        const container = targetElement as HTMLElement & {
          requestFullscreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => void;
          mozRequestFullScreen?: () => void;
          msRequestFullscreen?: () => void;
        };
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(() => {});
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      }
    }
  }, [videoElement]);

  // Handle controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 3 seconds of inactivity (only when playing)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Handle mouse move on video container
  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Handle mouse enter on video container
  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
  }, []);

  // Handle mouse leave on video container
  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, [isPlaying]);

  // Handle touch/click on video container (for mobile)
  const handleVideoContainerTouch = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  // Show controls when video is paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
        (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
      );
      setIsFullscreen(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="w-full container mx-auto lg:px-32 xl:px-32">
      <div
        className="
          grid gap-0 lg:gap-4
          lg:grid-cols-3
          lg:h-[700px]
        "
      >
        {/* Video Section */}
        <div className="col-span-full lg:col-span-2 bg-white dark:bg-gradient-to-br from-red-700 to-black lg:rounded-sm shadow-xl overflow-hidden flex flex-col">
          {/* Header - Hidden on small screens, visible on md and lg */}
          <div className="hidden md:flex flex-col flex-shrink-0 px-2 py-1.5 md:p-4 bg-gradient-to-r from-red-900 via-red-700 to-red-900 rounded-none lg:rounded-t-sm">
            {matchLoading ? (
              <>
                {/* Top row: League + Date/Time and Status skeleton */}
                <div className="w-full flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20 animate-pulse"></div>
                </div>
                {/* Bottom row: Teams with Score skeleton */}
                <div className="w-full flex justify-center">
                  <div className="animate-pulse flex items-center gap-2 lg:gap-3">
                    <div className="h-5 lg:h-7 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-7 lg:h-9 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-2"></div>
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-5 lg:h-7 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
                  </div>
                </div>
              </>
            ) : matchError ? (
              <div className="text-center w-full">
                <h2 className="text-sm lg:text-xl font-bold text-gray-900 dark:text-white">
                  Không thể tải thông tin trận đấu
                </h2>
                <p className="text-xs lg:text-sm text-red-500 dark:text-red-400">
                  {matchError}
                </p>
              </div>
            ) : match ? (
              <>
                {/* Top row: Teams with Score */}
                <div className="w-full flex justify-center items-center mb-2">
                  {/* Home Team - Left */}
                  <div className="flex items-center gap-2 lg:gap-3 mr-4 lg:mr-6">
                    <span className="text-base lg:text-xl font-bold text-gray-900 dark:text-white">
                      {match.home_team.name}
                    </span>
                    {match.home_team.logo && (
                      <img 
                        src={match.home_team.logo} 
                        alt={`${match.home_team.name} logo`}
                        className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Score - Center */}
                  <div className="flex items-center gap-1">
                   
                    <span className="text-lg lg:text-2xl font-bold text-gray-600 dark:text-gray-400 mx-1">vs</span>
                   
                  </div>
                  
                  {/* Away Team - Right */}
                  <div className="flex items-center gap-2 lg:gap-3 ml-4 lg:ml-6">
                    {match.away_team.logo && (
                      <img 
                        src={match.away_team.logo} 
                        alt={`${match.away_team.name} logo`}
                        className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-base lg:text-xl font-bold text-gray-900 dark:text-white">
                      {match.away_team.name}
                    </span>
                  </div>
                </div>
                
                
              </>
            ) : (
              <div className="text-center w-full">
                <h2 className="text-sm lg:text-xl font-bold text-gray-900 dark:text-white">
                  Trận đấu không tìm thấy
                </h2>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  Vui lòng thử lại sau
                </p>
              </div>
            )}
          </div>

          {/* Video Container */}
          <div 
            className="relative bg-black flex-1 aspect-[16/9] lg:aspect-auto video-container"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleVideoContainerTouch}
          >
            {isStreamAvailable ? (
              <UniversalVideoPlayer
                streamUrls={streamUrls}
                fallbackUrl={signedUrl}
                autoPlay={isPlaying}
                muted={isMuted}
                className="w-full h-full object-contain"
                onCanPlay={handleVideoCanPlay}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onVideoElementReady={setVideoElement}
              />
            ) : (
              <AdTvcPlayer
                match={match}
                error={matchError}
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Control Buttons with overlay transition - Only show for live streams */}
            {isStreamAvailable && (
              <>
            {/* Volume Control - Bottom Left */}
            <div 
              className={`absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/50 rounded-lg px-2 py-2 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering video container click
                  handleMuteToggle();
                }}
                className="cursor-pointer text-white p-1 rounded transition-all duration-200 hover:scale-110"
                title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              >
                {isMuted ? (
                  // Muted icon
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                ) : (
                  // Volume icon
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                )}
              </button>
              
              {/* Volume Slider - Hidden on mobile, visible on desktop */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="hidden md:block w-20 lg:w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-all"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                }}
                title={`Âm lượng: ${Math.round(volume * 100)}%`}
              />
            </div>

            {/* Play/Pause Button - Absolute Center */}
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering video container click
                  handlePlayPause();
                }}
                className="bg-black/50 hover:bg-black/70 cursor-pointer text-white p-3 md:p-4 rounded-full transition-all duration-200 hover:scale-110"
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  // Pause icon - larger for center
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  // Play icon - larger for center
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Fullscreen Button - Bottom Right */}
            <div 
              className={`absolute bottom-4 right-4 z-10 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering video container click
                  handleFullscreenToggle();
                }}
                className="bg-black/50 hover:bg-black/70 cursor-pointer text-white p-2 rounded-lg transition-all duration-200 hover:scale-105"
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
              {isFullscreen ? (
                // Exit fullscreen icon
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                  />
                </svg>
              ) : (
                // Enter fullscreen icon
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
              </button>
            </div>
              </>
            )}
          </div>
        </div>

        {/* Chat Section - Hidden on mobile and tablet */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="h-full">
            <LiveChatBox matchId={matchId} />
          </div>
        </div>
      </div>
    </div>
  );
}
