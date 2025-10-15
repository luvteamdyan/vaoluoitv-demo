'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { secureApiService } from '@/services/secureApiService';
import { StreamAccessInfo } from '@/types/secure-api';

interface UseStreamAccessReturn {
  streamAccess: StreamAccessInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshAccess: () => Promise<void>;
  hasAccess: boolean;
  signedUrl: string | null;
  expiresAt: string | null;
}

export function useStreamAccess(matchId: string): UseStreamAccessReturn {
  const { user, isAuthenticated } = useAuth();
  const [streamAccess, setStreamAccess] = useState<StreamAccessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreamAccess = useCallback(async () => {
    if (!matchId) {
      setError('Match ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let accessInfo: StreamAccessInfo;

      if (isAuthenticated && user) {
        // User is authenticated, try to get full access
        accessInfo = await secureApiService.getStreamAccess(matchId);
      } else {
        // User is not authenticated, try public access
        accessInfo = await secureApiService.getPublicStreamAccess(matchId);
      }

      setStreamAccess(accessInfo);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get stream access';
      setError(errorMessage);
      setStreamAccess({
        hasAccess: false,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [matchId, isAuthenticated, user]);

  const refreshAccess = useCallback(async () => {
    await fetchStreamAccess();
  }, [fetchStreamAccess]);

  useEffect(() => {
    fetchStreamAccess();
  }, [fetchStreamAccess]);

  return {
    streamAccess,
    isLoading,
    error,
    refreshAccess,
    hasAccess: streamAccess?.hasAccess || false,
    signedUrl: streamAccess?.signedUrl || null,
    expiresAt: streamAccess?.expiresAt || null,
  };
}
