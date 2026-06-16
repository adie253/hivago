import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PromoBanners: React.FC = () => {
    const navigate = useNavigate();
    const goToRestaurants = () => navigate('/restaurants');
    return (
        <div className="px-4 md:px-12 py-8 overflow-hidden">
            <div className="flex overflow-x-auto overflow-y-hidden pb-6 gap-6 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1">

                {/* 10% Off Card */}
                <div onClick={goToRestaurants} className="cursor-pointer hover:scale-[1.02] transition-transform flex-shrink-0 snap-start w-[300px] md:w-[400px] bg-[#EEF7F2] rounded-3xl p-6 flex items-center justify-between relative overflow-hidden h-48 md:h-56">
                    <div className="z-10 w-3/5">
                        <h3 className="text-xl md:text-2xl font-extrabold text-[#113C40] mb-2 leading-tight">10% off food</h3>
                        <p className="text-[10px] md:text-xs text-[#113C40] mb-4 opacity-70">
                            Orders over ₹399, the best food in Local countries is automatically applied.
                        </p>
                        <button onClick={goToRestaurants} className="bg-[#1D99B1] text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-teal-700 transition-colors">
                            Order now!
                        </button>
                    </div>
                    {/* Image placeholder for bowl */}
                    <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300"
                        alt="Salad Bowl"
                        className="absolute right-[-20px] bottom-[-20px] w-36 md:w-48 object-cover rounded-full mix-blend-multiply"
                    />
                </div>

                {/* Special Deal Card (Girl eating pizza) */}
                <div onClick={goToRestaurants} className="cursor-pointer hover:scale-[1.02] transition-transform flex-shrink-0 snap-start w-[300px] md:w-[400px] bg-[#7854F8] rounded-3xl p-6 flex flex-col items-end justify-center relative overflow-hidden h-48 md:h-56 text-right">
                    {/* Girl Image */}
                    <div className="absolute left-0 bottom-0 top-0 w-1/2 flex items-end justify-center">
                        <img
                            src="https://img.freepik.com/free-photo/hungry-young-brunette-with-glasses-posing-against-yellow-wall_273609-20639.jpg?semt=ais_hybrid&w=740&q=80"
                            alt="Girl eating pizza"
                            className="w-full h-full object-cover rounded-3xl"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)' }}
                        />
                    </div>

                    <div className="z-10 w-1/2 flex flex-col items-center pt-4">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight text-center">Special Deal For<br />February</h3>
                        <button onClick={goToRestaurants} className="bg-white text-[#7854F8] text-xs font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                            Order now!
                        </button>
                    </div>
                </div>

                {/* 20% Off Card */}
                <div onClick={goToRestaurants} className="cursor-pointer hover:scale-[1.02] transition-transform flex-shrink-0 snap-start w-[300px] md:w-[400px] bg-[#FFF5ED] rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden h-48 md:h-56">
                    <div className="z-10 w-full sm:w-4/5">
                        <h3 className="text-xl md:text-2xl font-extrabold text-[#113C40] mb-2 leading-tight">20% off food</h3>
                        <p className="text-[10px] md:text-xs text-[#113C40] mb-4 opacity-70">
                            Orders over ₹599, the best food in Local countries is automatically applied.
                        </p>
                        <button onClick={goToRestaurants} className="bg-[#E67E22] text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-orange-600 transition-colors">
                            Order now!
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
