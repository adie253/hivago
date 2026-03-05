import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFilters } from '../context/FilterContext';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
    const {
        sortBy, setSortBy,
        isVegOnly, setIsVegOnly,
        minRating, setMinRating
    } = useFilters();

    const [tempSort, setTempSort] = useState(sortBy);
    const [tempVeg, setTempVeg] = useState(isVegOnly);
    const [tempRating, setTempRating] = useState(minRating);

    // Keep other UI-only states
    const [selectedDelivery, setSelectedDelivery] = useState<string>('10 Minutes Delivery');
    const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>(['High Protein', 'Low Calorie']);
    const [_priceRange, _setPriceRange] = useState<number[]>([400, 3200]);

    if (!isOpen) return null;

    const toggleQuickFilter = (filter: string) => {
        setSelectedQuickFilters((prev: string[]) =>
            prev.includes(filter) ? prev.filter((f: string) => f !== filter) : [...prev, filter]
        );
    };

    const handleReset = () => {
        setTempSort('Relevance');
        setTempVeg(false);
        setTempRating(0);
        setSelectedDelivery('10 Minutes Delivery');
        setSelectedQuickFilters([]);
        _setPriceRange([400, 3200]);
    };

    const handleApply = () => {
        setSortBy(tempSort);
        setIsVegOnly(tempVeg);
        setMinRating(tempRating);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-0 md:px-4">
            <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl">
                {/* Header */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="w-10 h-1 bg-gray-200 rounded-full md:hidden absolute top-2 left-1/2 -translate-x-1/2" />
                    <div className="flex-1" />
                    <h2 className="text-lg font-bold text-gray-900">Fillter</h2>
                    <div className="flex-1 flex justify-end">
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 overflow-y-auto space-y-6 pb-28 custom-scrollbar">
                    {/* Sort */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">Sort</h3>
                        <div className="flex gap-2.5">
                            {['Relevance', 'Low to high', 'High to low', 'Rating'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => setTempSort(option)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${tempSort === option
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Fast Delivery */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Fast Delivery</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {['10 Minutes Delivery', '20 Minutes Delivery', '30 Minutes Delivery'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => setSelectedDelivery(option)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${selectedDelivery === option
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Veg/Non-Veg */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Veg/Non-Veg</h3>
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setTempVeg(true)}
                                className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${tempVeg
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                    : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Veg Only
                            </button>
                            <button
                                onClick={() => setTempVeg(false)}
                                className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${!tempVeg
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                    : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Both
                            </button>
                        </div>
                    </section>

                    {/* Quick Filters */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Filters</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {['High Protein', 'Open Now', 'Newly Added', "Chef's Special", 'Pickup Available', 'Most Loved', 'Low Calorie'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleQuickFilter(option)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${selectedQuickFilters.includes(option)
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Ratings */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Ratings</h3>
                        <div className="flex gap-2.5">
                            {[0, 3.5, 4.0, 4.5].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setTempRating(val)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${tempRating === val
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {val === 0 ? 'All' : `${val}+`}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Price Range */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
                        <div className="px-1 pt-6 pb-2">
                            <div className="relative h-1.5 bg-gray-100 rounded-full mx-2">
                                <div
                                    className="absolute h-full bg-emerald-500/20"
                                    style={{ left: '5%', right: '60%' }}
                                />
                                <div
                                    className="absolute h-full bg-emerald-500"
                                    style={{ left: '5%', width: '35%' }}
                                />
                                <button className="absolute top-1/2 left-[5%] -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md z-10 cursor-pointer" />
                                <button className="absolute top-1/2 left-[40%] -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md z-10 cursor-pointer" />
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 px-1">
                                <span className="text-emerald-600">Rs.400</span>
                                <span>Rs.3200</span>
                                <span>Rs.8000</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-50 flex items-center gap-4 sticky bottom-0 bg-white shadow-[0_-8px_16px_rgba(0,0,0,0.01)]">
                    <button
                        onClick={handleReset}
                        className="flex-1 text-gray-400 font-bold text-base hover:text-gray-600 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-[2] bg-[#FF4732] hover:bg-red-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-xl shadow-red-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
