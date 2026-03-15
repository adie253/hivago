import React from 'react';
import { Star } from 'lucide-react';
import blob_bg from "../../assets/hero_section/burger_bg.svg";
import burger from "../../assets/hero_section/burger_image.png";

export const HeroSection: React.FC = () => {
    return (
        <div className="bg-[#FFF7F7] w-full shadow-sm min-h-[225px] lg:min-h-[250px] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-25 py-12 lg:py-12 relative overflow-hidden font-sans gap-12 lg:gap-4">

            {/* Background Blob decoration - scales responsibly */}
            {/* <div className="absolute right-0 top-0 h-1/2 lg:h-full w-full lg:w-1/2 bg-[#8B3423] opacity-80 rounded-b-[100px] lg:rounded-b-none lg:rounded-l-[150px] z-0 pointer-events-none"></div> */}

            {/* Extra floating white blob for the review card shadow effect */}
            <div className="hidden lg:block absolute left-25 top-25 w-64 h-32 bg-black-400 rounded-3xl transform rotate-3 z-0 pointer-events-none"></div>

            {/* ---------------- SECTION 1: Ratings Card ---------------- */}
            <div className="z-10 hidden lg:flex w-full lg:w-1/4 justify-center lg:justify-start lg:-mt-10">
                <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl w-56 md:w-64 transform lg:-rotate-3 hover:rotate-0 transition-transform duration-300 relative cursor-pointer group">
                    <div className="flex gap-1 text-[#B02421] mb-1 md:mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                        <span className="text-[#B02421] font-bold ml-2 text-base">4.5</span>
                    </div>
                    <p className="font-extrabold text-lg md:text-xl text-gray-800 group-hover:text-brand-primary transition-colors">5k Happy reviews</p>
                </div>
            </div>

            {/* ---------------- SECTION 2 & 3: Main Text Content & Hero Image ---------------- */}
            <div className="z-10 w-full lg:w-3/4 flex flex-row items-center justify-between gap-4 lg:gap-8">
                {/* ---------------- SECTION 2: Main Text Content ---------------- */}
                <div className="w-[65%] lg:w-1/2 flex flex-col font-poppins">
                    <h1 className="text-black text-left font-bold text-2xl md:text-6xl lg:text-[3rem] leading-[1.1] mb-2 drop-shadow-md">
                        Delicious Food, <br className="md:block" />
                        <span className="font-light">Delivered Fast</span>
                    </h1>
                    <p className="text-red-500 mt-4 leading-3.5 max-w-[130px] text-[12px] md:text-lg md:max-w-[200px] md:leading-6 font-poppins font-weight-400">
                        Order from the best local restaurants with easy on-demand delivery
                    </p>
                </div>

                {/* ---------------- SECTION 3: Hero Image + Blob + Arrow ---------------- */}
                <div className="w-[35%] lg:w-1/2 flex justify-center lg:justify-end relative items-center">

                    {/* Burger Image Container with Responsive max-widths */}
                    <div className="relative inline-block z-10 w-full max-w-[120px] sm:max-w-[200px] md:max-w-[380px] lg:max-w-[350px]">

                        {/* Dynamic SVG Blob replacing the missing blob.png */}
                        <div className="absolute mt-5 top-1/2 left-1/2 ml-[-20px] -translate-x-1/2 -translate-y-1/2 w-[120%] h-[130%] -z-10 text-brand-secondary opacity-100">
                            <img src={blob_bg} alt="" className="w-full md:w-[70%] h-full object-contain" />
                        </div>

                        {/* Discount Badge */}
                        <div className="hidden md:block absolute top-2 -left-4 lg:-left-8 bg-white rounded-full p-2 shadow-xl transform -rotate-12 z-20">
                            <div className="border-[2px] border-dashed border-brand-primary rounded-full w-14 h-14 flex flex-col items-center justify-center text-brand-primary font-black leading-[1.1] text-xs">
                                <span className="text-sm">70%</span>
                                <span>OFF</span>
                            </div>
                        </div>

                        <img
                            src={burger}
                            alt="Delicious Burgers"
                            className="w-full md:w-[80%] position-absolute top-10 -left-8 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative z-10 hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};
