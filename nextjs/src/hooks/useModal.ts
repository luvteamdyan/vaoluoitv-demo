import { useState, useEffect, useCallback } from 'react';

export interface UseModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
  preventScroll?: boolean;
}

export function useModal(options: UseModalOptions = {}) {
  const { onOpen, onClose, preventScroll = true } = options;
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const open = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      onClose?.();
    }, 300); // Match transition duration
  }, [onClose]);

  // Handle visibility animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      setIsVisible(false);
      if (preventScroll) {
        document.body.style.overflow = 'unset';
      }
    }

    return () => {
      if (preventScroll) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, preventScroll]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    isVisible,
    open,
    close,
  };
}
