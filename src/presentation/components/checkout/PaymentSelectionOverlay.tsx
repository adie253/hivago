import React, { useState } from 'react';
import { Smartphone, CreditCard, Wallet, Banknote, Lock, X } from 'lucide-react';

interface PaymentSelectionOverlayProps {
    onClose: () => void;
    onSelect: (method: string) => void;
}

export const PaymentSelectionOverlay: React.FC<PaymentSelectionOverlayProps> = ({ onClose, onSelect }) => {
    const [selectedId, setSelectedId] = useState('UPI');

    const paymentMethods = [
        {
            id: 'UPI',
            title: 'UPI',
            description: 'Google Pay, PhonePe, Paytm',
            icon: Smartphone,
            iconBg: 'bg-[#E8F8EF]',
            iconColor: 'text-[#00A859]'
        },
        {
            id: 'Card',
            title: 'Credit / Debit Card',
            description: 'Visa, Mastercard, RuPay',
            icon: CreditCard,
            iconBg: 'bg-[#FFF0EF]',
            iconColor: 'text-[#FF4732]'
        },
        {
            id: 'Wallet',
            title: 'Wallet',
            description: 'Paytm, PhonePe, Amazon Pay',
            icon: Wallet,
            iconBg: 'bg-[#FFF4E8]',
            iconColor: 'text-[#F7A626]'
        },
        {
            id: 'COD',
            title: 'Cash on Delivery',
            description: 'Pay with cash',
            icon: Banknote,
            iconBg: 'bg-[#FFF0EF]',
            iconColor: 'text-[#FF4732]'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 pb-8 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add Payment Details</h2>
                    <button onClick={onClose} className="p-2 text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => setSelectedId(method.id)}
                            className={`flex items-start gap-4 p-4 rounded-[20px] border-2 transition-all cursor-pointer ${selectedId === method.id ? 'border-[#00A859] bg-[#F8FFF9]' : 'border-gray-100 bg-white'}`}
                        >
                            <div className={`${method.iconBg} ${method.iconColor} p-3 rounded-full flex-shrink-0`}>
                                <method.icon className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-[17px] text-gray-900">{method.title}</h3>
                                <p className="text-gray-400 text-[13px] font-medium">{method.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-[#F8F9FA] flex items-center gap-3 p-4 rounded-xl mb-6">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm font-medium">Your payment is secure and encrypted</span>
                </div>

                <button
                    onClick={() => onSelect(selectedId)}
                    className="w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-lg shadow-red-100 hover:bg-[#E5483B] transition-colors active:scale-[0.98]"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};
