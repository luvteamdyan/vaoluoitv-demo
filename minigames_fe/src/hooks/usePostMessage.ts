/**
 * Custom hook for PostMessage communication
 * 
 * Manages PostMessage listener lifecycle and provides state management
 * for authentication messages from parent sites.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { postMessageService, PostMessageAuthData } from '../services/postmessage.service';

export interface PostMessageState {
  isListening: boolean;
  lastMessage: PostMessageAuthData | null;
  source: 'vaoluoitv' | 'luck8event' | null;
  error: string | null;
}

export interface UsePostMessageOptions {
  autoStart?: boolean;
  timeout?: number;
}

export interface UsePostMessageReturn {
  state: PostMessageState;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

/**
 * Hook for managing PostMessage authentication
 * 
 * @param onMessage - Callback function when authentication message is received
 * @param options - Configuration options
 * @returns PostMessage state and control functions
 * 
 * @example
 * ```tsx
 * const { state, startListening, stopListening } = usePostMessage(
 *   (data) => {
 *     console.log('Received auth from:', data.source);
 *     // Handle authentication...
 *   },
 *   { autoStart: true }
 * );
 * ```
 */
export const usePostMessage = (
  onMessage: (data: PostMessageAuthData) => void,
  options: UsePostMessageOptions = {}
): UsePostMessageReturn => {
  const { autoStart = false, timeout } = options;
  
  const [state, setState] = useState<PostMessageState>({
    isListening: false,
    lastMessage: null,
    source: null,
    error: null
  });

  const onMessageRef = useRef(onMessage);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref when it changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  /**
   * Handle incoming PostMessage
   */
  const handleMessage = useCallback((data: PostMessageAuthData) => {
    try {
      setState(prevState => ({
        ...prevState,
        lastMessage: data,
        source: data.source,
        error: null
      }));

      // Call the provided callback
      onMessageRef.current(data);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prevState => ({
        ...prevState,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Stop listening for PostMessage events
   */
  const stopListening = useCallback(() => {
    if (!state.isListening) return;

    setState(prevState => ({
      ...prevState,
      isListening: false
    }));

    // Stop the PostMessage service
    postMessageService.stopListening();

    // Clear custom timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

  }, [state.isListening]);

  /**
   * Start listening for PostMessage events
   */
  const startListening = useCallback(() => {
    if (state.isListening) {
      console.warn('PostMessage hook is already listening');
      return;
    }

    setState(prevState => ({
      ...prevState,
      isListening: true,
      error: null
    }));

    // Start the PostMessage service
    postMessageService.startListening(handleMessage);

    // Set custom timeout if provided
    if (timeout && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setState(prevState => ({
          ...prevState,
          error: 'PostMessage timeout: No authentication message received'
        }));
      }, timeout);
    }

  }, [state.isListening, handleMessage, timeout, stopListening]);

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    stopListening();
    setState({
      isListening: false,
      lastMessage: null,
      source: null,
      error: null
    });
  }, [stopListening]);

  /**
   * Auto-start listening if enabled
   */
  useEffect(() => {
    if (autoStart) {
      startListening();
    }

    // Cleanup on unmount
    return () => {
      stopListening();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoStart, startListening, stopListening]);

  return {
    state,
    startListening,
    stopListening,
    reset
  };
};

export default usePostMessage;
