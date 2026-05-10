import React, { createContext, useContext, useEffect, useState } from 'react';
import { signalRService } from '../../data/signalrService';
import toast from 'react-hot-toast';

interface OrderStatusPayload {
    orderId: string;
    status: string;
    message: string;
}

interface NotificationContextType {
    lastStatusUpdate: OrderStatusPayload | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lastStatusUpdate, setLastStatusUpdate] = useState<OrderStatusPayload | null>(null);

    useEffect(() => {
        // Start SignalR connection
        signalRService.start();

        // Listen for status updates
        const unsubscribe = signalRService.onStatusUpdate((payload: OrderStatusPayload) => {
            setLastStatusUpdate(payload);

            switch (payload.status) {
                case "Preparing":
                    toast.success("Your order is being prepared!", {
                        icon: '👨‍🍳',
                        style: { borderRadius: '16px', fontWeight: '600' },
                    });
                    break;

                case "ReadyForPickup":
                    toast("Order is ready — rider is on the way.", {
                        icon: '📦',
                        style: { borderRadius: '16px', fontWeight: '600' },
                    });
                    break;

                case "PickedUp":
                    toast.success("Rider collected your order! Heading your way.", {
                        icon: '🛵',
                        style: { borderRadius: '16px', fontWeight: '600' },
                    });
                    break;

                case "Delivered":
                    toast.success("Enjoy your meal!", {
                        icon: '🎉',
                        duration: 6000,
                        style: { borderRadius: '16px', fontWeight: '600' },
                    });
                    break;

                case "Cancelled":
                case "Rejected":
                    // Neutral toast for initial cancellation/rejection
                    // Spec: Do not show "refund initiated" here. Wait for RefundInitiated event.
                    toast(payload.message, {
                        icon: 'ℹ️',
                        duration: 4000,
                        style: {
                            borderRadius: '16px',
                            background: '#F8FAFC',
                            color: '#475569',
                            fontWeight: '600',
                            border: '1px solid #E2E8F0'
                        },
                    });
                    break;
                
                case "RefundInitiated":
                    // Green toast for successful refund initiation
                    toast.success(payload.message, {
                        icon: '✅',
                        duration: 5000,
                        style: {
                            borderRadius: '16px',
                            background: '#F0FDF4',
                            color: '#166534',
                            fontWeight: '600',
                            border: '1px solid #DCFCE7'
                        },
                    });
                    break;

                case "RefundFailed":
                    // Amber toast for refund failure
                    toast.error(payload.message, {
                        icon: '⚠️',
                        duration: 6000,
                        style: {
                            borderRadius: '16px',
                            background: '#FFFBEB',
                            color: '#92400E',
                            fontWeight: '600',
                            border: '1px solid #FEF3C7'
                        },
                    });
                    break;

                default:
                    console.log(`[SignalR] Status update: ${payload.status}`);
                    break;
            }
        });

        return () => {
            unsubscribe();
            signalRService.stop();
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ lastStatusUpdate }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
