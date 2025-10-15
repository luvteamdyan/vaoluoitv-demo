'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FlvVideoPlayer from './FlvVideoPlayer';
import HlsVideoPlayer from './HlsVideoPlayer';
import { detectDeviceCapabilities, isStreamUrlExpired } from '@/utils/streamUtils';

interface StreamUrls {
  flv: {
    url: string;
    token: string;
    time: number;
    expiresAt: string;
  };
  m3u8: {
    url: string;
    token: string;
    time: number;
    expiresAt: string;
  };
}

interface UniversalVideoPlayerProps {
  streamUrls: StreamUrls | null;
  fallbackUrl?: string | null;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onVideoElementReady?: (element: HTMLVideoElement | null) => void;
}

export default function UniversalVideoPlayer({
  streamUrls,
  fallbackUrl,
  autoPlay = true,
  muted = false,
  className = '',
  onLoadStart,
  onCanPlay,
  onPlay,
  onPause,
  onVideoElementReady,
}: UniversalVideoPlayerProps) {
  const [deviceCapabilities, setDeviceCapabilities] = useState(() => detectDeviceCapabilities());
  const [selectedFormat, setSelectedFormat] = useState<'flv' | 'hls'>('hls');
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isUrlExpired, setIsUrlExpired] = useState(false);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  // Update device capabilities on mount
  useEffect(() => {
    setDeviceCapabilities(detectDeviceCapabilities());
  }, []);

  // Select appropriate stream format and URL
  useEffect(() => {
    if (!streamUrls) {
      // Use fallback URL if available
      setCurrentUrl(fallbackUrl || null);
      setSelectedFormat('hls'); // Default format for fallback
      setIsUrlExpired(false);
      return;
    }

    // Check if URLs are expired
    const flvExpired = isStreamUrlExpired(streamUrls.flv.expiresAt);
    const m3u8Expired = isStreamUrlExpired(streamUrls.m3u8.expiresAt);
    
    setIsUrlExpired(flvExpired && m3u8Expired);

    // If both URLs are expired, use fallback
    if (flvExpired && m3u8Expired && fallbackUrl) {
      setCurrentUrl(fallbackUrl);
      setSelectedFormat('hls');
      return;
    }

    // Always prioritize FLV first, then HLS
    let format: 'flv' | 'hls' = 'hls'; // Default fallback
    
    // Try FLV first if supported and not expired
    if (deviceCapabilities.supportsFlv && !flvExpired) {
      format = 'flv';
    } 
    // Fallback to HLS if FLV not available or expired
    else if (deviceCapabilities.supportsHls && !m3u8Expired) {
      format = 'hls';
    }
    // Last resort: try FLV even if expired (might still work)
    else if (deviceCapabilities.supportsFlv) {
      format = 'flv';
    }

    setSelectedFormat(format);
    setCurrentUrl(format === 'flv' ? streamUrls.flv.url : streamUrls.m3u8.url);
    setHasTriedFallback(false); // Reset fallback flag when URLs change
  }, [streamUrls, deviceCapabilities, fallbackUrl]);

  // Handle errors with fallback - use useCallback to prevent infinite re-renders
  const handleError = useCallback(() => {
    // Prevent infinite fallback loops - only try fallback once
    if (hasTriedFallback) {
      return; // Don't call onError to prevent infinite loops
    }

    // If currently using HLS, try FLV first
    if (streamUrls && selectedFormat === 'hls' && deviceCapabilities.supportsFlv) {
      setSelectedFormat('flv');
      setCurrentUrl(streamUrls.flv.url);
      setHasTriedFallback(true);
      return;
    } 
    // If currently using FLV, try HLS
    else if (streamUrls && selectedFormat === 'flv' && deviceCapabilities.supportsHls) {
      setSelectedFormat('hls');
      setCurrentUrl(streamUrls.m3u8.url);
      setHasTriedFallback(true);
      return;
    } 
    // Try fallback URL
    else if (fallbackUrl && currentUrl !== fallbackUrl) {
      setCurrentUrl(fallbackUrl);
      setSelectedFormat('hls');
      setHasTriedFallback(true);
      return;
    }
    
    // If no fallback available, just set fallback flag to prevent further attempts
    setHasTriedFallback(true);
  }, [streamUrls, selectedFormat, deviceCapabilities, fallbackUrl, currentUrl, hasTriedFallback]);

  // Show empty video if no URL available or expired
  if (!currentUrl || isUrlExpired) {
    return (
      <video
        className={`w-full h-full object-contain ${className}`}
        controls={false}
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />
    );
  }

  // Render appropriate player based on selected format
  if (selectedFormat === 'flv') {
    return (
      <FlvVideoPlayer
        src={currentUrl}
        autoPlay={autoPlay}
        muted={muted}
        className={className}
        onError={handleError}
        onLoadStart={onLoadStart}
        onCanPlay={onCanPlay}
        onPlay={onPlay}
        onPause={onPause}
        onVideoElementReady={onVideoElementReady}
      />
    );
  } else {
    return (
      <HlsVideoPlayer
        src={currentUrl}
        autoPlay={autoPlay}
        muted={muted}
        className={className}
        onError={handleError}
        onLoadStart={onLoadStart}
        onCanPlay={onCanPlay}
        onPlay={onPlay}
        onPause={onPause}
        onVideoElementReady={onVideoElementReady}
      />
    );
  }
}
