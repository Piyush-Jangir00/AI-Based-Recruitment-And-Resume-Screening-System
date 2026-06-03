import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300',
        bgColors[type],
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
};

export default Toast;
