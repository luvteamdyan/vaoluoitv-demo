import { useState, useEffect } from 'react';
import { matchService } from '@/services/matchService';
import { getTimeUntilExpiry } from '@/utils/streamUtils';

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

interface UseStreamUrlsReturn {
  streamUrls: StreamUrls | null;
  loading: boolean;
  error: string | null;
  refreshUrls: () => Promise<void>;
  timeUntilExpiry: number;
}

/**
 * Custom hook để lấy stream URLs cho một trận đấu
 * 
 * Workflow mới:
 * 1. Gọi GET /api/v1/matches/{matchId} để lấy thông tin match và stream_key
 * 2. Từ stream_key.user.username (ví dụ: "blv2"), extract số để lấy blv_id (ví dụ: 2)
 * 3. Sử dụng blv_id để gọi getSecureStreamUrls(blv_id, ttl) để lấy stream URLs
 * 
 * @param matchId - ID của trận đấu
 * @param ttl - Time to live cho stream URLs (default: 120 giây)
 */
export function useStreamUrls(matchId: string, ttl: number = 120): UseStreamUrlsReturn {
  const [streamUrls, setStreamUrls] = useState<StreamUrls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Function to extract blv_id from username (e.g., "blv2" -> 2)
  const extractBlvId = (username: string): number | null => {
    const match = username.match(/blv(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Simple fetch function without useCallback to avoid dependency issues
  const fetchStreamUrls = async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Get match details to find the BLV (bình luận viên)
      const match = await matchService.getMatchById(matchId);
      
      // Step 2: Extract blv_id from stream_key.user.username
      if (!match.stream_key?.user?.username) {
        throw new Error('No BLV (bình luận viên) found for this match');
      }

      const blv_id = extractBlvId(match.stream_key.user.username);
      if (!blv_id) {
        throw new Error(`Invalid BLV username format: ${match.stream_key.user.username}`);
      }

      // Step 3: Get secure stream URLs using the extracted blv_id
      const response = await matchService.getSecureStreamUrls(blv_id.toString(), ttl);
      
      if (response.success && response.data) {
        setStreamUrls(response.data);
        setRetryCount(0); // Reset retry count on success
        
        // Calculate time until expiry
        const flvTime = getTimeUntilExpiry(response.data.flv.expiresAt);
        const m3u8Time = getTimeUntilExpiry(response.data.m3u8.expiresAt);
        setTimeUntilExpiry(Math.min(flvTime, m3u8Time));
      } else {
        throw new Error('Failed to get stream URLs');
      }
    } catch (err) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setError(err instanceof Error ? err.message : 'Failed to fetch stream URLs');
      
      // Don't retry if we've already tried too many times
      if (newRetryCount >= 3) {
        setError('Max retry attempts reached. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch only once when matchId changes
  useEffect(() => {
    if (matchId) {
      setRetryCount(0); // Reset retry count when matchId changes
      fetchStreamUrls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]); // Only depend on matchId

  // Simple refresh function
  const refreshUrls = async () => {
    // Don't refresh if we've already tried too many times
    if (retryCount >= 3) {
      return;
    }
    await fetchStreamUrls();
  };

  return {
    streamUrls,
    loading,
    error,
    refreshUrls,
    timeUntilExpiry
  };
}
