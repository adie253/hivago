import React from 'react';

export const TrustBadges: React.FC = () => {
    return (
        <div className="w-full bg-white py-12 px-6 md:px-12 lg:px-24 flex justify-center">

            <div className="max-w-5xl w-full border border-gray-200 rounded-3xl py-10 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4 bg-white shadow-sm">

                {/* Badge 1: Daily Discounts */}
                <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        <img
                            src="https://static.vecteezy.com/system/resources/thumbnails/003/030/972/small_2x/discount-or-instalment-sign-black-and-white-outline-icon-vector.jpg"
                            alt="Discount Tag"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-extrabold text-[#FF8A00] leading-tight">Daily</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-[#FF8A00] leading-tight">Discounts</span>
                    </div>
                </div>

                {/* Divider 1 */}
                <div className="hidden md:block w-px h-16 bg-gray-200"></div>

                {/* Badge 2: Live Tracing */}
                <div className="flex items-center gap-4 flex-1 justify-center">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/010/751/612/non_2x/tracking-icon-design-free-vector.jpg"
                            alt="Location Pin"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-extrabold text-[#FF8A00] leading-tight">Live</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-[#FF8A00] leading-tight">Tracing</span>
                    </div>
                </div>

                {/* Divider 2 */}
                <div className="hidden md:block w-px h-16 bg-gray-200"></div>

                {/* Badge 3: Quick Delivery */}
                <div className="flex items-center gap-4 flex-1 justify-center md:justify-end">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        <img
                            src="https://img.freepik.com/free-vector/stopwatch-outline-moving-fast_78370-8142.jpg?semt=ais_user_personalization&w=740&q=80"
                            alt="Clock"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-extrabold text-[#FF8A00] leading-tight">Quick</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-[#FF8A00] leading-tight">Delivery</span>
                    </div>
                </div>

            </div>

        </div>
    );
};
