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
        isVeganFriendly, setIsVeganFriendly,
        isJainOptions, setIsJainOptions,
        isOpenNow, setIsOpenNow,
        maxPrepTime, setMaxPrepTime,
        priceRange, setPriceRange,
        fulfillmentType, setFulfillmentType,
        isNewlyAdded, setIsNewlyAdded,
        minRating, setMinRating,
        isPopular, setIsPopular
    } = useFilters();   

    const [tempSort, setTempSort] = useState(sortBy);
    const [tempVeg, setTempVeg] = useState(isVegOnly);
    const [tempVegan, setTempVegan] = useState(isVeganFriendly);
    const [tempJain, setTempJain] = useState(isJainOptions);
    const [tempOpenNow, setTempOpenNow] = useState(isOpenNow);
    const [tempPrepTime, setTempPrepTime] = useState<number | null>(maxPrepTime);
    const [tempPriceRange, setTempPriceRange] = useState<[number, number] | null>(priceRange);
    const [tempFulfillment, setTempFulfillment] = useState(fulfillmentType);
    const [tempNewlyAdded, setTempNewlyAdded] = useState(isNewlyAdded);
    const [tempRating, setTempRating] = useState(minRating);
    const [tempPopular, setTempPopular] = useState(isPopular);

    if (!isOpen) return null;

    const handleReset = () => {
        setTempSort('Relevance');
        setTempVeg(false);
        setTempVegan(false);
        setTempJain(false);
        setTempOpenNow(false);
        setTempPrepTime(null);
        setTempPriceRange(null);
        setTempFulfillment('Both');
        setTempNewlyAdded(false);
        setTempRating(0);
        setTempPopular(false);
    };

    const handleApply = () => {
        setSortBy(tempSort);
        setIsVegOnly(tempVeg);
        setIsVeganFriendly(tempVegan);
        setIsJainOptions(tempJain);
        setIsOpenNow(tempOpenNow);
        setMaxPrepTime(tempPrepTime);
        setPriceRange(tempPriceRange);
        setFulfillmentType(tempFulfillment);
        setIsNewlyAdded(tempNewlyAdded);
        setMinRating(tempRating);
        setIsPopular(tempPopular);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-0 md:px-4 mt-15">
            <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl">
                {/* Header */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="w-10 h-1 bg-gray-200 rounded-full md:hidden absolute top-2 left-1/2 -translate-x-1/2" />
                    <div className="flex-1" />
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
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
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Sort By</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {['Relevance', 'Low to high', 'High to low', 'Fastest Delivery'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => setTempSort(option)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${tempSort === option
                                        ? 'bg-[#FF4732] text-white shadow-lg shadow-red-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Quick Filters */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Dietary & Preferences</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {[
                                { label: 'Veg Only', state: tempVeg, setter: setTempVeg },
                                { label: 'Vegan Friendly', state: tempVegan, setter: setTempVegan },
                                { label: 'Jain Options', state: tempJain, setter: setTempJain },
                                { label: 'Open Now', state: tempOpenNow, setter: setTempOpenNow },
                                { label: 'Newly Added', state: tempNewlyAdded, setter: setTempNewlyAdded },
                                { label: 'Popular', state: tempPopular, setter: setTempPopular },
                            ].map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => item.setter(!item.state)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${item.state
                                        ? 'bg-[#FF4732] text-white shadow-lg shadow-red-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
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
                                        ? 'bg-[#FF4732] text-white shadow-lg shadow-red-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {val === 0 ? 'All' : `${val}+`}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Service Type */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Service Type</h3>
                        <div className="flex gap-2.5">
                            {['Both', 'Delivery', 'Pickup'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTempFulfillment(type as any)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${tempFulfillment === type
                                        ? 'bg-[#FF4732] text-white shadow-lg shadow-red-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Max Prep Time */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Max Prep Time</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {[10, 20, 30, 45].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setTempPrepTime(tempPrepTime === mins ? null : mins)}
                                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${tempPrepTime === mins
                                        ? 'bg-[#FF4732] text-white shadow-lg shadow-red-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    Under {mins} min
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Price Range */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-gray-900">Price Range (Min Order)</h3>
                            {tempPriceRange && (
                                <span className="text-xs font-bold text-emerald-600">
                                    ₹{tempPriceRange[0]} - ₹{tempPriceRange[1]}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {[
                                { label: 'Below ₹200', range: [0, 200] },
                                { label: '₹200 - ₹500', range: [200, 500] },
                                { label: 'Above ₹500', range: [500, 2000] },
                            ].map(btn => (
                                <button
                                    key={btn.label}
                                    onClick={() => setTempPriceRange(tempPriceRange?.[0] === btn.range[0] && tempPriceRange?.[1] === btn.range[1] ? null : btn.range as [number, number])}
                                    className={`flex-1 px-3 py-2 rounded-xl font-medium text-[10px] transition-all duration-200 ${tempPriceRange?.[0] === btn.range[0] && tempPriceRange?.[1] === btn.range[1]
                                        ? 'bg-[#FF4732] text-white shadow-lg shadow-red-100'
                                        : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
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
