import React from 'react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/offer_cards/girl.svg';
import banner2 from '../../assets/offer_cards/burger.png';
import banner3 from '../../assets/offer_cards/burger2.png';

export const OfferBanners: React.FC = () => {
    const navigate = useNavigate();
    const goToRestaurants = () => navigate('/restaurants');
    return (
        <div className="px-4 md:px-12 py-8 overflow-hidden">
            <div className="flex overflow-x-auto overflow-y-hidden pb-6 gap-6 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1">

                {/* Yellow Gradient Card - Burger Explosion */}
                <div onClick={goToRestaurants} className="cursor-pointer hover:scale-[1.02] transition-transform flex-shrink-0 snap-start w-[280px] md:w-[360px] bg-gradient-to-br from-[#FFD600] to-[#E67E22] rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden h-48 md:h-56">
                    <div className="z-10 w-3/5">
                        <p className="text-[10px] md:text-xs font-bold text-gray-900/80 mb-0.5">Get special discount</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">upto 60%</h3>
                        <button onClick={goToRestaurants} className="bg-[#0D1B1E] text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-gray-800 transition-colors shadow-lg text-white">
                            Order now
                        </button>
                    </div>
                    <img
                        src={banner2}
                        alt="Burger explosion"
                        className="absolute right-0 top-0 bottom-0 h-full w-1/2 object-contain drop-shadow-2xl translate-x-4 rotate-6"
                    />
                </div>

                {/* Purple Card - Girl Eating Pizza */}
                <div onClick={goToRestaurants} className="cursor-pointer hover:scale-[1.02] transition-transform flex-shrink-0 snap-start w-[280px] md:w-[360px] bg-[#6366F1] rounded-[32px] p-6 flex items-center justify-end relative overflow-hidden h-48 md:h-56">
                    <div className="absolute left-0 bottom-0 top-0 w-1/2 flex items-end">
                        <img
                            src={banner1}
                            alt="Girl eating pizza"
                            className="w-full h-full object-cover rounded-l-[32px]"
                        />
                    </div>
                    <div className="z-10 w-1/2 text-center flex flex-col items-center">
                        <p className="text-[10px] md:text-xs font-bold text-white/80 mb-0.5">Get special deal</p>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">for February</h3>
                        <button onClick={goToRestaurants} className="bg-white text-[#6366F1] text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                            Order now!
                        </button>
                    </div>
                </div>

                {/* Black Card - Green Accents Burger */}
                <div onClick={goToRestaurants} className="cursor-pointer hover:scale-[1.02] transition-transform flex-shrink-0 snap-start w-[260px] md:w-[340px] bg-[#000000] rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden h-48 md:h-56">
                    <div className="z-10 w-1/2">
                        <p className="text-[10px] md:text-xs font-bold text-emerald-500 mb-0.5">Get special discount</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">upto 60%</h3>
                        <button onClick={goToRestaurants} className="bg-[#00C853] text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg">
                            Order now
                        </button>
                    </div>
                    <div className="absolute right-0 h-full w-1/2 flex items-center justify-center translate-x-2">
                        <img
                            src={banner3}
                            alt="Cheeseburger"
                            className="w-[120%] h-auto object-contain drop-shadow-[0_20px_20px_rgba(255,255,255,0.1)]"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};
