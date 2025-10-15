import { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ModalWithTitleProps extends ModalProps {
  title: string;
}

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
  showBackdrop?: boolean;
  backdropClassName?: string;
}

export interface UseModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
  preventScroll?: boolean;
}

export interface UseModalReturn {
  isOpen: boolean;
  isVisible: boolean;
  open: () => void;
  close: () => void;
}
