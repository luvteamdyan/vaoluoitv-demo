'use client';

import { useEffect, useRef, useState } from 'react';

interface HlsPlayer {
  destroy(): void;
  attachMedia(element: HTMLVideoElement): void;
  loadSource(url: string): void;
  on(event: string, callback: (data?: unknown) => void): void;
  off(event: string, callback: (data?: unknown) => void): void;
}

interface HlsJs {
  isSupported(): boolean;
  createPlayer(): HlsPlayer;
}

interface HlsVideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onVideoElementReady?: (element: HTMLVideoElement | null) => void;
}

export default function HlsVideoPlayer({
  src,
  autoPlay = true,
  muted = false,
  className = '',
  onError,
  onLoadStart,
  onCanPlay,
  onPlay,
  onPause,
  onVideoElementReady,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsPlayerRef = useRef<HlsPlayer | null>(null);
  const [isHlsSupported, setIsHlsSupported] = useState(false);

  useEffect(() => {
    // Check if hls.js is already loaded
    if (typeof window !== 'undefined' && (window as unknown as { Hls: HlsJs }).Hls) {
      setIsHlsSupported(true);
      return;
    }

    // Load hls.js only when needed (lazy loading)
    const loadHlsJs = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      script.async = true;
      script.onload = () => {
        setIsHlsSupported(true);
      };
      script.onerror = () => {
        setIsHlsSupported(false);
      };
      document.head.appendChild(script);
    };

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadHlsJs);
    } else {
      setTimeout(loadHlsJs, 0);
    }
  }, []);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const videoElement = videoRef.current;

    // Event handler functions
    const handleCanPlay = () => {
      onCanPlay?.();
    };

    const handleLoadedMetadata = () => {
      // Metadata loaded
    };

    const handlePlay = () => {
      onPlay?.();
    };

    const handlePause = () => {
      onPause?.();
    };

    const handleLoadStart = () => {
      onLoadStart?.();
    };

    const handleError = () => {
      onError?.(new Error('Video playback error'));
    };

    const cleanup = () => {
      if (hlsPlayerRef.current) {
        hlsPlayerRef.current.destroy();
        hlsPlayerRef.current = null;
      }
      // Remove video element event listeners
      if (videoElement) {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('loadstart', handleLoadStart);
        videoElement.removeEventListener('error', handleError);
      }
    };

    // Cleanup previous player
    cleanup();

    // Check if browser supports HLS natively
    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari, iOS)
      videoElement.src = src;
      videoElement.load();
      
      const handleCanPlayNative = () => {
        onCanPlay?.();
      };

      const handleErrorNative = (e: Event) => {
        onError?.(e instanceof Error ? e : new Error('Video load error'));
      };

      const handleLoadStartNative = () => {
        onLoadStart?.();
      };

      const handlePlayNative = () => {
        onPlay?.();
      };

      const handlePauseNative = () => {
        onPause?.();
      };

      videoElement.addEventListener('canplay', handleCanPlayNative);
      videoElement.addEventListener('error', handleErrorNative);
      videoElement.addEventListener('loadstart', handleLoadStartNative);
      videoElement.addEventListener('play', handlePlayNative);
      videoElement.addEventListener('pause', handlePauseNative);

      return () => {
        videoElement.removeEventListener('canplay', handleCanPlayNative);
        videoElement.removeEventListener('error', handleErrorNative);
        videoElement.removeEventListener('loadstart', handleLoadStartNative);
        videoElement.removeEventListener('play', handlePlayNative);
        videoElement.removeEventListener('pause', handlePauseNative);
      };
    } else if (isHlsSupported) {
      // Use hls.js for HLS streams
      try {
        const Hls = (window as unknown as { Hls: HlsJs }).Hls;
        if (Hls.isSupported()) {
          hlsPlayerRef.current = Hls.createPlayer();

          hlsPlayerRef.current.attachMedia(videoElement);
          
          hlsPlayerRef.current.on('error', (event: unknown, data?: unknown) => {
            // Suppress common HLS errors that don't need user attention
            const errorData = data as { type?: string };
            if (errorData?.type === 'networkError' || errorData?.type === 'mediaError') {
              // These are common streaming errors, don't propagate
              return;
            }
            onError?.(new Error(`HLS error: ${JSON.stringify(data)}`));
          });

          hlsPlayerRef.current.on('loadstart', () => {
            onLoadStart?.();
          });

          hlsPlayerRef.current.on('canplay', () => {
            onCanPlay?.();
          });

          hlsPlayerRef.current.on('loadedmetadata', () => {
            // Metadata loaded
          });

          hlsPlayerRef.current.on('manifestparsed', () => {
            // Manifest parsed
          });

          // Also listen to the video element events
          videoElement.addEventListener('canplay', handleCanPlay);
          videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.addEventListener('play', handlePlay);
          videoElement.addEventListener('pause', handlePause);
          videoElement.addEventListener('loadstart', handleLoadStart);
          videoElement.addEventListener('error', handleError);

          hlsPlayerRef.current.loadSource(src);
        } else {
          onError?.(new Error('HLS.js not supported'));
        }
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error('Failed to create HLS player'));
      }
    } else {
      // Fallback to regular video element
      videoElement.src = src;
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

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, isHlsSupported]); // Only re-initialize when URL or support changes, not on callback changes

  // Pass video element reference to parent
  useEffect(() => {
    onVideoElementReady?.(videoRef.current);
    return () => {
      onVideoElementReady?.(null);
    };
  }, [onVideoElementReady]);

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
      style={{ pointerEvents: 'none' }}
    />
  );
}
