import { useState, useEffect } from 'react';
import DIContainer from '../../di/container';
import { Order } from '../../core/entities/Order';

export const useOrdersViewModel = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const useCase = DIContainer.getOrdersUseCase();
            const data = await useCase.execute();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: Order['status']) => {
        try {
            const useCase = DIContainer.getUpdateOrderStatusUseCase();
            const updatedOrder = await useCase.execute(id, newStatus);
            setOrders(prev => prev.map(o => (o.id === id ? updatedOrder : o)));
        } catch (err: any) {
            setError(err.message || 'Failed to update order status');
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return {
        orders,
        loading,
        error,
        updateStatus,
        refreshOrders: loadOrders
    };
};
