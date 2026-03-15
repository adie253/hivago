import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, Navigation2, Plus, Home, Building2, Send, ChevronDown, X } from 'lucide-react';

interface LocationSelectorOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LocationSelectorOverlay: React.FC<LocationSelectorOverlayProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Prevent body scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const savedAddresses = [
        { id: '1', name: 'Home Name', address: 'Lorem Ipsum', type: 'home', selected: true },
        { id: '2', name: 'Company Name', address: 'Lorem Ipsum', type: 'work' },
        { id: '3', name: 'Other', address: 'Lorem Ipsum', type: 'other' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'home': return <Home className="w-5 h-5 text-gray-700" />;
            case 'work': return <Building2 className="w-5 h-5 text-gray-700" />;
            default: return <Send className="w-5 h-5 text-gray-700" />;
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center px-4 py-4 md:px-6">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h2 className="ml-2 text-lg font-medium text-gray-700">Select your location</h2>
            </div>

            {/* Search Bar */}
            <div className="px-4 mb-6 md:px-6">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search an area or address"
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 grid grid-cols-2 gap-4 mb-6 md:px-6">
                <button className="flex flex-col items-start gap-2 p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors shadow-sm group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                        <Navigation2 className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">Use Current</p>
                        <p className="text-sm font-semibold text-gray-800">Location</p>
                    </div>
                </button>

                <button className="flex flex-col items-start gap-2 p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors shadow-sm group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                        <Plus className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">Add New</p>
                        <p className="text-sm font-semibold text-gray-800">Address</p>
                    </div>
                </button>
            </div>

            {/* Saved Addresses List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6">
                <div className="bg-white border border-gray-50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
                    {savedAddresses.map((addr, index) => (
                        <div key={addr.id}>
                            <div className="flex items-start gap-4 p-5 hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                                    {getIcon(addr.type)}
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <h3 className="font-bold text-gray-900">{addr.name}</h3>
                                        {addr.selected && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                                SELECTED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">{addr.address}</p>
                                </div>
                            </div>
                            {index < savedAddresses.length - 1 && (
                                <div className="mx-5 border-b border-gray-100" />
                            )}
                        </div>
                    ))}
                    
                    {/* View All Button */}
                    <button className="w-full flex items-center justify-center gap-2 py-5 text-brand-primary font-bold hover:bg-gray-50 transition-colors border-t border-gray-50">
                        View All
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
