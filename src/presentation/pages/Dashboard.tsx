import React, { useEffect, useRef } from 'react';
import { useOrdersViewModel } from '../hooks/useOrdersViewModel';
import { OrderList } from '../components/OrderList';
import gsap from 'gsap';

export const Dashboard: React.FC = () => {
    const { orders, loading, error, updateStatus, refreshOrders } = useOrdersViewModel();
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!loading && headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-700 animate-pulse font-semibold">
                Loading deliveries...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center mt-12">
                <h2 className="text-2xl font-bold mb-4">Error loading dashboard</h2>
                <p className="mb-4">{error}</p>
                <button
                    onClick={refreshOrders}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 font-sans">
            <header
                ref={headerRef}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
            >
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Delivery Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage and track your customer orders in real-time.</p>
                </div>
                <button
                    onClick={refreshOrders}
                    className="bg-white border text-sm border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                    Refresh Orders
                </button>
            </header>

            <main>
                <OrderList orders={orders} onUpdateStatus={updateStatus} />
            </main>
        </div>
    );
};
