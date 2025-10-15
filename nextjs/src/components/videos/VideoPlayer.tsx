'use client';

import { useRef, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
}

export default function VideoPlayer({ videoUrl, posterUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate videoUrl
  if (!videoUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-red-400 text-lg mb-2">⚠️ Không có video</div>
          <p>URL video không hợp lệ</p>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play error:', err);
          setError('Không thể phát video');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const errorCode = video.error?.code;
    
    const errors: Record<number, string> = {
      1: 'Người dùng hủy load video',
      2: 'Lỗi mạng - Không thể tải video',
      3: 'Lỗi decode - Video bị hỏng',
      4: 'Format video không được hỗ trợ'
    };
    
    const errorMsg = errorCode ? errors[errorCode] : 'Lỗi không xác định';
    console.error('Video error:', errorMsg, 'URL:', videoUrl);
    setError(errorMsg);
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={posterUrl}
        controls
        preload="metadata"
        playsInline
        title={title}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
      >
        <source src={videoUrl} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center px-6">
            <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
            <a 
              href={videoUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Mở video trong tab mới
            </a>
          </div>
        </div>
      )}

      {/* Custom Play Button Overlay (only when paused) */}
      {!isPlaying && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity hover:bg-black/50 z-10"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center transform transition-transform hover:scale-110 shadow-2xl">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
