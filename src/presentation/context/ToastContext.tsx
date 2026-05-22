import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const next = [...prev, { id, message, type, duration }];
      const limit = window.innerWidth < 640 ? 2 : 3;
      if (next.length > limit) {
        return next.slice(-limit);
      }
      return next;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:top-auto sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-6 z-[9999] flex flex-col sm:flex-col-reverse gap-3 pointer-events-none w-[calc(100%-2rem)] sm:w-full sm:max-w-md px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={isMobile ? { opacity: 0, y: -40, scale: 0.95 } : { opacity: 0, y: 40, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: isMobile ? -20 : 20, transition: { duration: 0.15 } }}
              transition={{ 
                type: 'spring', 
                stiffness: 380, 
                damping: 28,
                layout: { duration: 0.25 }
              }}
              className="pointer-events-auto w-full"
            >
              <ToastItem 
                toast={toast} 
                onClose={() => removeToast(toast.id)} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};


const ToastItem = ({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          card: "bg-emerald-50/95 border-emerald-100/50 shadow-emerald-500/5 text-emerald-900",
          iconBg: "bg-white text-emerald-600 border border-emerald-100 shadow-sm",
          progressBar: "bg-emerald-500",
          closeBtn: "text-emerald-400 hover:text-emerald-950 hover:bg-emerald-100/50"
        };
      case 'error':
        return {
          card: "bg-rose-50/95 border-rose-100/50 shadow-rose-500/5 text-rose-900",
          iconBg: "bg-white text-rose-600 border border-rose-100 shadow-sm",
          progressBar: "bg-rose-500",
          closeBtn: "text-rose-400 hover:text-rose-950 hover:bg-rose-100/50"
        };
      case 'warning':
        return {
          card: "bg-amber-50/95 border-amber-100/50 shadow-amber-500/5 text-amber-900",
          iconBg: "bg-white text-amber-600 border border-amber-100 shadow-sm",
          progressBar: "bg-amber-500",
          closeBtn: "text-amber-400 hover:text-amber-950 hover:bg-amber-100/50"
        };
      default:
        return {
          card: "bg-blue-50/95 border-blue-100/50 shadow-blue-500/5 text-blue-900",
          iconBg: "bg-white text-blue-600 border border-blue-100 shadow-sm",
          progressBar: "bg-blue-500",
          closeBtn: "text-blue-400 hover:text-blue-950 hover:bg-blue-100/50"
        };
    }
  };

  const styles = getStyle();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`group relative overflow-hidden rounded-[24px] backdrop-blur-xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.06)] border flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${styles.card}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold leading-snug tracking-tight">
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className={`shrink-0 p-1.5 rounded-xl transition-all ${styles.closeBtn}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full" />
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 ${styles.progressBar}`}
      />
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
