'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getPlayerType, validateSrsStreamUrl, toAbsoluteUrl } from '@/utils/streamUtils';

interface FlvPlayer {
  destroy(): void;
  attachMediaElement(element: HTMLVideoElement): void;
  load(): void;
  on(event: string, callback: (data?: unknown) => void): void;
  off(event: string, callback: (data?: unknown) => void): void;
  unload(): void;
  pause(): void;
  play(): void;
}

interface FlvJs {
  isSupported(): boolean;
  createPlayer(config: {
    type: string;
    url: string;
    isLive: boolean;
    hasAudio: boolean;
    hasVideo: boolean;
    enableWorker: boolean;
    enableStashBuffer: boolean;
    stashInitialSize: number;
    lazyLoad?: boolean;
    lazyLoadMaxDuration?: number;
    lazyLoadRecoverDuration?: number;
    deferLoadAfterSourceOpen?: boolean;
    autoCleanupSourceBuffer?: boolean;
    statisticsInfoReportInterval?: number;
    fixAudioTimestampGap?: boolean;
    accurateSeek?: boolean;
    seekType?: string;
    seekParamStart?: string;
    seekParamEnd?: string;
    rangeLoadZeroStart?: boolean;
    liveBufferLatencyChasing?: boolean;
    liveBufferLatencyMaxLatency?: number;
    liveBufferLatencyMinRemain?: number;
  }): FlvPlayer;
}

interface FlvVideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  baseDomain?: string;
  onError?: (error: Error) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onVideoElementReady?: (element: HTMLVideoElement | null) => void;
}

export default function FlvVideoPlayer({
  src,
  autoPlay = true,
  muted = false,
  className = '',
  baseDomain = 'ingest.vaoluoitv.com',
  onError,
  onLoadStart,
  onCanPlay,
  onPlay,
  onPause,
  onVideoElementReady,
}: FlvVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<FlvPlayer | null>(null);
  const [isFlvSupported, setIsFlvSupported] = useState(false);
  const eventHandlersRef = useRef<Map<string, (data?: unknown) => void>>(new Map());
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if flv.js is already loaded
    if (typeof window !== 'undefined' && (window as unknown as { flvjs: FlvJs }).flvjs) {
      setIsFlvSupported(true);
      return;
    }

    // Check if flv.js is being loaded
    if (typeof window !== 'undefined' && (window as unknown as { flvjsLoaded: boolean }).flvjsLoaded) {
      setIsFlvSupported(true);
      return;
    }

    // Load flv.js only when needed (lazy loading)
    const loadFlvJs = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js';
      script.async = true;
      script.onload = () => {
        setIsFlvSupported(true);
      };
      script.onerror = () => {
        setIsFlvSupported(false);
      };
      document.head.appendChild(script);
    };

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadFlvJs);
    } else {
      setTimeout(loadFlvJs, 0);
    }
  }, []);

  // Enhanced cleanup function with proper memory management
  const cleanupPlayer = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }

    if (flvPlayerRef.current) {
      try {
        // Remove all event listeners first
        eventHandlersRef.current.forEach((handler, event) => {
          flvPlayerRef.current?.off(event, handler);
        });
        eventHandlersRef.current.clear();

        // Unload and destroy player
        flvPlayerRef.current.unload();
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      } catch (error) {
        console.warn('Error during FLV player cleanup:', error);
      }
    }
  }, []);

  // Cleanup video element event listeners
  const cleanupVideoElement = useCallback((videoElement: HTMLVideoElement) => {
    const events = ['canplay', 'loadedmetadata', 'play', 'pause', 'loadstart', 'error'];
    events.forEach(event => {
      videoElement.removeEventListener(event, () => {});
    });
  }, []);

  // Event handler functions - defined outside useEffect to avoid hook rules violation
  const handleCanPlay = useCallback(() => {
    onCanPlay?.();
  }, [onCanPlay]);

  const handleLoadedMetadata = useCallback(() => {
    // Metadata loaded
  }, []);

  const handlePlay = useCallback(() => {
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    onPause?.();
  }, [onPause]);

  const handleLoadStart = useCallback(() => {
    onLoadStart?.();
  }, [onLoadStart]);

  const handleError = useCallback(() => {
    onError?.(new Error('Video playback error'));
  }, [onError]);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    // Convert to absolute URL if needed
    const absoluteUrl = toAbsoluteUrl(src, baseDomain);
    
    // Validate stream URL first
    const urlValidation = validateSrsStreamUrl(src, baseDomain);
    if (!urlValidation.isValid) {
      return;
    }

    const videoElement = videoRef.current;

    // Cleanup previous player with delay to prevent race conditions
    cleanupPlayer();
    
    // Add small delay to ensure proper cleanup
    cleanupTimeoutRef.current = setTimeout(() => {
      cleanupVideoElement(videoElement);
    }, 100);

    const playerType = getPlayerType(src, baseDomain);
    if (isFlvSupported && playerType === 'flv') {
      // Use flv.js for FLV streams with optimized configuration
      try {
        const flvjs = (window as unknown as { flvjs: FlvJs }).flvjs;
        if (flvjs.isSupported()) {
          flvPlayerRef.current = flvjs.createPlayer({
            type: 'flv',
            url: absoluteUrl,
            isLive: true,
            hasAudio: true,
            hasVideo: true,
            enableWorker: true, // Enable worker for better performance
            enableStashBuffer: true, // Enable buffer for stability
            stashInitialSize: 384, // Increased buffer size for better stability
            lazyLoad: true, // Enable lazy loading
            lazyLoadMaxDuration: 3 * 60, // 3 minutes max buffer
            lazyLoadRecoverDuration: 30, // 30 seconds recovery buffer
            deferLoadAfterSourceOpen: true, // Defer loading for better performance
            autoCleanupSourceBuffer: true, // Auto cleanup to prevent memory leaks
            statisticsInfoReportInterval: 600, // Report stats every 10 minutes
            fixAudioTimestampGap: true, // Fix audio timestamp gaps
            accurateSeek: false, // Disable accurate seek for live streams
            rangeLoadZeroStart: false, // Don't load from zero for live streams
            liveBufferLatencyChasing: true, // Enable latency chasing for live streams
            liveBufferLatencyMaxLatency: 20, // Max 20 seconds latency
            liveBufferLatencyMinRemain: 1, // Keep at least 1 second buffer
          });

          flvPlayerRef.current.attachMediaElement(videoElement);
          
          // Enhanced error handling with proper event listener management
          const errorHandler = (error: unknown) => {
            // Suppress common FLV errors that don't need user attention
            const errorStr = String(error);
            if (errorStr.includes('network') || errorStr.includes('timeout') || errorStr.includes('fetch')) {
              // These are common streaming errors, don't propagate
              return;
            }
            onError?.(error instanceof Error ? error : new Error(errorStr));
          };

          const loadStartHandler = () => {
            onLoadStart?.();
          };

          const canPlayHandler = () => {
            onCanPlay?.();
          };

          const loadedMetadataHandler = () => {
            // Metadata loaded
          };

          const statisticsInfoHandler = () => {
            // Statistics info received - can be used for monitoring
          };

          // Store event handlers for proper cleanup
          eventHandlersRef.current.set('error', errorHandler);
          eventHandlersRef.current.set('loadstart', loadStartHandler);
          eventHandlersRef.current.set('canplay', canPlayHandler);
          eventHandlersRef.current.set('loadedmetadata', loadedMetadataHandler);
          eventHandlersRef.current.set('statistics_info', statisticsInfoHandler);

          // Attach event listeners
          flvPlayerRef.current.on('error', errorHandler);
          flvPlayerRef.current.on('loadstart', loadStartHandler);
          flvPlayerRef.current.on('canplay', canPlayHandler);
          flvPlayerRef.current.on('loadedmetadata', loadedMetadataHandler);
          flvPlayerRef.current.on('statistics_info', statisticsInfoHandler);

          // Also listen to the video element events
          videoElement.addEventListener('canplay', handleCanPlay);
          videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.addEventListener('play', handlePlay);
          videoElement.addEventListener('pause', handlePause);
          videoElement.addEventListener('loadstart', handleLoadStart);
          videoElement.addEventListener('error', handleError);

          flvPlayerRef.current.load();
        } else {
          onError?.(new Error('FLV.js not supported'));
        }
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error('Failed to create FLV player'));
      }
    } else {
      // Use regular video element for non-FLV streams
      videoElement.src = absoluteUrl;
      videoElement.load();
      
      const handleCanPlayFallback = () => {
        onCanPlay?.();
      };

      const handleErrorFallback = (e: Event) => {
        onError?.(e instanceof Error ? e : new Error('Video load error'));
      };

      const handleLoadStartFallback = () => {
        onLoadStart?.();
      };

      const handlePlayFallback = () => {
        onPlay?.();
      };

      const handlePauseFallback = () => {
        onPause?.();
      };

      videoElement.addEventListener('canplay', handleCanPlayFallback);
      videoElement.addEventListener('error', handleErrorFallback);
      videoElement.addEventListener('loadstart', handleLoadStartFallback);
      videoElement.addEventListener('play', handlePlayFallback);
      videoElement.addEventListener('pause', handlePauseFallback);

      return () => {
        videoElement.removeEventListener('canplay', handleCanPlayFallback);
        videoElement.removeEventListener('error', handleErrorFallback);
        videoElement.removeEventListener('loadstart', handleLoadStartFallback);
        videoElement.removeEventListener('play', handlePlayFallback);
        videoElement.removeEventListener('pause', handlePauseFallback);
      };
    }

    return () => {
      cleanupPlayer();
      cleanupVideoElement(videoElement);
    };
  }, [
    src, 
    baseDomain, 
    isFlvSupported, 
    cleanupPlayer, 
    cleanupVideoElement,
    handleCanPlay,
    handleLoadedMetadata,
    handlePlay,
    handlePause,
    handleLoadStart,
    handleError,
    onCanPlay,
    onError,
    onLoadStart,
    onPause,
    onPlay
  ]);

  // Pass video element reference to parent
  useEffect(() => {
    onVideoElementReady?.(videoRef.current);
    return () => {
      onVideoElementReady?.(null);
    };
  }, [onVideoElementReady]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupPlayer();
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [cleanupPlayer]);

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      muted={muted}
      controls={false}
      playsInline
      webkit-playsinline="true"
      className={`w-full h-full object-contain ${className}`}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      style={{ 
        pointerEvents: 'none',
        // Add hardware acceleration for better performance
        transform: 'translateZ(0)',
        willChange: 'auto'
      }}
    />
  );
}
