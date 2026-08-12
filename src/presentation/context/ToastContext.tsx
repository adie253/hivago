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

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(() => {
      // Replace existing toast so multiple toasts never stack on top of each other
      return [{ id, message, type, duration }];
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
          card: "bg-[#DCFCE7] border-[#BBF7D0] text-[#14532D]",
          icon: (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-black" />
              <path d="M9 12l2 2 4-4" stroke="#DCFCE7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )
        };
      case 'error':
        return {
          card: "bg-[#FEE2E2] border-[#FECACA] text-[#7F1D1D]",
          icon: (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-black" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="#FEE2E2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )
        };
      case 'warning':
        return {
          card: "bg-[#FEF9C3] border-[#FEF08A] text-black",
          icon: (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-black" />
              <rect x="11" y="7" width="2" height="6" rx="1" fill="#FEF9C3" />
              <circle cx="12" cy="16" r="1.2" fill="#FEF9C3" />
            </svg>
          )
        };
      default: // info
        return {
          card: "bg-[#EFF6FF] border-[#DBEAFE] text-black",
          icon: (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-black" />
              <rect x="11" y="11" width="2" height="5" rx="1" fill="#EFF6FF" />
              <circle cx="12" cy="8" r="1.2" fill="#EFF6FF" />
            </svg>
          )
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`group relative overflow-hidden rounded-[16px] py-4 px-5 border flex items-center gap-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 ${style.card}`}>
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium leading-normal tracking-tight">
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 p-1 rounded-lg text-black/30 hover:text-black hover:bg-black/5 transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
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
