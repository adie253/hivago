import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface VegSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (type: 'all' | 'pure-veg') => void;
}

export const VegSelectorModal: React.FC<VegSelectorModalProps> = ({ isOpen, onClose, onApply }) => {
    const [selection, setSelection] = useState<'all' | 'pure-veg'>('pure-veg');
    const [remember, setRemember] = useState(true);

    React.useEffect(() => {
        if (!isOpen) return;
        (window as any).__activeModalsCount = ((window as any).__activeModalsCount || 0) + 1;
        document.body.style.overflow = 'hidden';
        return () => {
            (window as any).__activeModalsCount = Math.max(0, ((window as any).__activeModalsCount || 0) - 1);
            if (((window as any).__activeModalsCount) === 0) {
                document.body.style.overflow = 'unset';
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-10">
                        <h2 className="text-lg font-bold text-gray-700 leading-tight">
                            I want to see veg choices from
                        </h2>
                    </div>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg mr-10">
                            <img
                                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"
                                alt="Veg Bowl"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute -top-3 -right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Options */}
                <div className="">
                    <button
                        onClick={() => setSelection('all')}
                        className="w-full flex items-center justify-between py-3 group"
                    >
                        <span className={`text-md transition-colors ${selection === 'all' ? 'text-gray-900 font-bold' : 'text-gray-500 font-inter-500'}`}>
                            All Restaurants
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selection === 'all' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
                            }`}>
                            {selection === 'all' && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                        </div>
                    </button>

                    {/* <div className="h-px bg-gray-100" /> */}

                    <button
                        onClick={() => setSelection('pure-veg')}
                        className="w-full flex items-center justify-between group mt-3"
                    >
                        <span className={`text-md transition-colors ${selection === 'pure-veg' ? 'text-gray-900 font-bold' : 'text-gray-500  font-inter-500'}`}>
                            Pure veg restaurants only
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selection === 'pure-veg' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
                            }`}>
                            {selection === 'pure-veg' && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                        </div>
                    </button>
                </div>

                {/* Remember Checkbox */}
                <div className="flex items-center justify-between mb-8 mt-10 opacity-60">
                    <span className="text-sm text-gray-600">Remember my choice going forward</span>
                    <button
                        onClick={() => setRemember(!remember)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${remember ? 'bg-emerald-600' : 'border-2 border-gray-300'
                            }`}
                    >
                        {remember && <Check className="w-4 h-4 text-white" />}
                    </button>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onApply(selection)}
                    className="w-full bg-[#FF4732] hover:bg-red-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Show Restaurants
                </button>
            </div>
        </div>
    );
};
