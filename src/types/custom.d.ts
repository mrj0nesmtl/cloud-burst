// Declaration for sonner toast library
declare module 'sonner' {
  export interface ToastOptions {
    description?: React.ReactNode;
    duration?: number;
    icon?: React.ReactNode;
    id?: string | number;
    important?: boolean;
    onAutoClose?: (id: string | number) => void;
    onDismiss?: (id: string | number) => void;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    style?: React.CSSProperties;
    unstyled?: boolean;
    className?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    cancel?: {
      label: string;
      onClick?: () => void;
    };
    dismissible?: boolean;
  }

  export interface ToastT {
    (message: React.ReactNode, options?: ToastOptions): string | number;
    success: (message: React.ReactNode, options?: ToastOptions) => string | number;
    error: (message: React.ReactNode, options?: ToastOptions) => string | number;
    warning: (message: React.ReactNode, options?: ToastOptions) => string | number;
    info: (message: React.ReactNode, options?: ToastOptions) => string | number;
    loading: (message: React.ReactNode, options?: ToastOptions) => string | number;
    custom: (reactNode: React.ReactNode, options?: ToastOptions) => string | number;
    dismiss: (toastId?: string | number) => void;
    promise: <T>(promise: Promise<T>, msgs: {
      loading: React.ReactNode;
      success: React.ReactNode | ((data: T) => React.ReactNode);
      error: React.ReactNode | ((error: unknown) => React.ReactNode);
    }, options?: ToastOptions) => Promise<T>;
  }

  export const toast: ToastT;
  export const Toaster: React.FC<{
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    toastOptions?: ToastOptions;
    visibleToasts?: number;
    closeButton?: boolean;
    theme?: 'light' | 'dark' | 'system';
    richColors?: boolean;
  }>;
}

// Additional declarations for d3, leaflet, etc. can be added if needed 