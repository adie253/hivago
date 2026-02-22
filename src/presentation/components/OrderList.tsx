import React, { useEffect, useRef } from 'react';
import { Order } from '../../core/entities/Order';
import gsap from 'gsap';

interface OrderListProps {
    orders: Order[];
    onUpdateStatus: (id: string, status: Order['status']) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onUpdateStatus }) => {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (orders.length > 0 && listRef.current) {
            gsap.fromTo(
                listRef.current.children,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' }
            );
        }
    }, [orders.length]); // Re-animate when array length changes

    if (orders.length === 0) {
        return <div className="p-8 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">No orders found.</div>;
    }

    return (
        <div ref={listRef} className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {orders.map(order => (
                <div key={order.id} className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="m-0 text-xl font-bold text-slate-800">Order #{order.id}</h3>
                        <span className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
              ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : ''}
              ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : ''}
              ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
            `}>
                            {order.status}
                        </span>
                    </div>

                    <div className="space-y-2 mb-6 text-sm">
                        <p className="text-slate-600">
                            <strong className="text-slate-800">Customer:</strong> <span className="text-slate-500">{order.customerId}</span>
                        </p>
                        <p className="text-slate-600">
                            <strong className="text-slate-800">Items:</strong> <span className="text-slate-500">{order.items.join(', ')}</span>
                        </p>
                        <p className="text-lg font-black text-emerald-600 pt-2 border-t border-slate-50">
                            ${order.totalAmount.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {order.status === 'pending' && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'shipped')}
                                className="flex-1 bg-blue-600 text-white border-none py-2.5 px-3 rounded-xl cursor-pointer text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-blue-200"
                            >
                                Mark Shipped
                            </button>
                        )}
                        {order.status === 'shipped' && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'delivered')}
                                className="flex-1 bg-emerald-500 text-white border-none py-2.5 px-3 rounded-xl cursor-pointer text-sm font-semibold hover:bg-emerald-600 active:scale-95 transition-all shadow-sm hover:shadow-emerald-200"
                            >
                                Mark Delivered
                            </button>
                        )}
                        {order.status === 'delivered' && (
                            <div className="flex-1 text-center py-2.5 bg-slate-50 text-slate-400 rounded-xl text-sm font-medium border border-slate-100">
                                Completed
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
