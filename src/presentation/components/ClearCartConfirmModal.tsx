import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClearCartConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ClearCartConfirmModal: React.FC<ClearCartConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
            <div className="bg-white rounded-[28px] p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-red-50 text-[#FF4732] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Clear your cart?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-full border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 py-3 px-4 rounded-full bg-[#FF4732] text-white font-bold hover:bg-[#E5483B] shadow-lg shadow-red-100 transition-colors text-sm cursor-pointer"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};
