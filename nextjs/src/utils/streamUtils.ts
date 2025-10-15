/**
 * Utility functions for stream handling
 */

export interface StreamUrlInfo {
  isValid: boolean;
  isFlv: boolean;
  isHls: boolean;
  isMp4: boolean;
  protocol: string;
  domain: string;
  path: string;
}

/**
 * Parse and analyze stream URL (supports both absolute and relative URLs)
 */
export function parseStreamUrl(url: string, baseDomain: string = 'ingest.vaoluoitv.com'): StreamUrlInfo {
  try {
    let fullUrl = url;
    
    // If URL is relative, convert to absolute
    if (url.startsWith('/')) {
      fullUrl = `https://${baseDomain}${url}`;
    } else if (!url.startsWith('http')) {
      // If URL doesn't have protocol, add it
      fullUrl = `https://${baseDomain}/${url}`;
    }
    
    const urlObj = new URL(fullUrl);
    const path = urlObj.pathname.toLowerCase();
    
    return {
      isValid: true,
      isFlv: path.endsWith('.flv'),
      isHls: path.endsWith('.m3u8'),
      isMp4: path.endsWith('.mp4'),
      protocol: urlObj.protocol,
      domain: urlObj.hostname,
      path: urlObj.pathname,
    };
  } catch {
    // Fallback: try to parse as relative URL
    const path = url.toLowerCase();
    const isFlv = path.includes('.flv');
    const isHls = path.includes('.m3u8');
    const isMp4 = path.includes('.mp4');
    
    return {
      isValid: isFlv || isHls || isMp4,
      isFlv,
      isHls,
      isMp4,
      protocol: 'https:',
      domain: baseDomain,
      path: url.startsWith('/') ? url : `/${url}`,
    };
  }
}

/**
 * Generate proper FLV stream URL for SRS server
 */
export function generateFlvStreamUrl(
  domain: string = 'ingest.vaoluoitv.com',
  app: string = 'live',
  stream: string = 'test'
): string {
  return `https://${domain}/${app}/${stream}.flv`;
}

/**
 * Generate proper HLS stream URL for SRS server
 */
export function generateHlsStreamUrl(
  domain: string = 'ingest.vaoluoitv.com',
  app: string = 'live',
  stream: string = 'test'
): string {
  return `https://${domain}/${app}/${stream}.m3u8`;
}

/**
 * Check if URL is a valid stream URL
 */
export function isValidStreamUrl(url: string): boolean {
  const urlInfo = parseStreamUrl(url);
  return urlInfo.isValid && (urlInfo.isFlv || urlInfo.isHls || urlInfo.isMp4);
}

/**
 * Convert relative URL to absolute URL
 */
export function toAbsoluteUrl(url: string, baseDomain: string = 'ingest.vaoluoitv.com'): string {
  if (url.startsWith('http')) {
    return url; // Already absolute
  }
  
  if (url.startsWith('/')) {
    return `https://${baseDomain}${url}`;
  }
  
  return `https://${baseDomain}/${url}`;
}

/**
 * Get appropriate player type for stream URL
 */
export function getPlayerType(url: string, baseDomain: string = 'ingest.vaoluoitv.com'): 'flv' | 'hls' | 'mp4' | 'unknown' {
  const urlInfo = parseStreamUrl(url, baseDomain);
  
  if (!urlInfo.isValid) return 'unknown';
  if (urlInfo.isFlv) return 'flv';
  if (urlInfo.isHls) return 'hls';
  if (urlInfo.isMp4) return 'mp4';
  
  return 'unknown';
}

/**
 * Validate stream URL format for SRS server
 */
export function validateSrsStreamUrl(url: string, baseDomain: string = 'ingest.vaoluoitv.com'): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const urlInfo = parseStreamUrl(url, baseDomain);
  
  if (!urlInfo.isValid) {
    errors.push('Invalid URL format');
    return { isValid: false, errors };
  }
  
  if (urlInfo.protocol !== 'https:') {
    errors.push('Stream URL must use HTTPS protocol');
  }
  
  if (!urlInfo.isFlv && !urlInfo.isHls) {
    errors.push('Stream URL must be FLV (.flv) or HLS (.m3u8) format');
  }
  
  // Check if path follows SRS format: /app/stream.ext (or just /stream.ext for relative URLs)
  const pathParts = urlInfo.path.split('/').filter(part => part.length > 0);
  if (pathParts.length < 1) {
    errors.push('Stream URL must have a valid path');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Device detection utilities
 */
export interface DeviceCapabilities {
  supportsFlv: boolean;
  supportsHls: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
}

/**
 * Detect device capabilities and stream format support
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      supportsFlv: false,
      supportsHls: true,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: 'server'
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  // Check FLV support (browsers with flv.js support)
  const supportsFlv = (
    userAgent.includes('chrome') || 
    userAgent.includes('firefox') || 
    userAgent.includes('safari') || 
    userAgent.includes('edge') ||
    userAgent.includes('opera')
  );

  // HLS support is generally better across devices
  const supportsHls = true; // Most modern browsers support HLS natively or via hls.js

  return {
    supportsFlv,
    supportsHls,
    isMobile,
    isTablet,
    isDesktop,
    userAgent
  };
}

/**
 * Get preferred stream format based on device capabilities
 */
export function getPreferredStreamFormat(deviceCapabilities: DeviceCapabilities): 'flv' | 'hls' {
  // Always prioritize FLV if supported
  if (deviceCapabilities.supportsFlv) {
    return 'flv';
  }
  
  // Fallback to HLS for all other cases
  return 'hls';
}

/**
 * Check if stream URL is expired based on expiresAt timestamp
 */
export function isStreamUrlExpired(expiresAt: string): boolean {
  try {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    return now >= expiryDate;
  } catch {
    return true; // Assume expired if we can't parse the date
  }
}

/**
 * Get time until stream URL expires in seconds
 */
export function getTimeUntilExpiry(expiresAt: string): number {
  try {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  } catch {
    return 0;
  }
}
