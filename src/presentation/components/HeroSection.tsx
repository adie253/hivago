import React from 'react';
import { Star } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <div className="bg-brand-primary w-full shadow-sm min-h-[300px] lg:min-h-[250px] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-25 py-12 lg:py-16 relative overflow-hidden font-sans gap-12 lg:gap-4">

            {/* Background Blob decoration - scales responsibly */}
            {/* <div className="absolute right-0 top-0 h-1/2 lg:h-full w-full lg:w-1/2 bg-[#8B3423] opacity-80 rounded-b-[100px] lg:rounded-b-none lg:rounded-l-[150px] z-0 pointer-events-none"></div> */}

            {/* Extra floating white blob for the review card shadow effect */}
            <div className="hidden lg:block absolute left-25 top-25 w-64 h-32 bg-white/20 rounded-3xl transform rotate-3 z-0 pointer-events-none"></div>

            {/* ---------------- SECTION 1: Ratings Card ---------------- */}
            <div className="z-10 hidden lg:flex w-full lg:w-1/4 justify-center lg:justify-start lg:-mt-10">
                <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl w-56 md:w-64 transform lg:-rotate-3 hover:rotate-0 transition-transform duration-300 relative cursor-pointer group">
                    <div className="flex gap-1 text-emerald-500 mb-1 md:mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                        <span className="text-gray-400 font-bold ml-2 text-base">4.5</span>
                    </div>
                    <p className="font-extrabold text-lg md:text-xl text-gray-800 group-hover:text-brand-primary transition-colors">5k Happy reviews</p>
                </div>
            </div>

            {/* ---------------- SECTION 2: Main Text Content ---------------- */}
            <div className="z-10 w-full lg:w-1/3 flex flex-col items-center">
                <h1 className="text-white font-extrabold text-5xl md:text-6xl lg:text-[3rem] leading-[1.1] mb-2  drop-shadow-md">
                    Delicious Food, <br className="hidden md:block" />
                    <span className="font-light">Delivered Fast</span>
                </h1>
                <p className="text-red-100 text-lg md:text-l max-w-sm mx-auto font-medium">
                    Order from the best local restaurants with easy on-demand delivery
                </p>
            </div>

            {/* ---------------- SECTION 3: Hero Image + Blob + Arrow ---------------- */}
            <div className="z-10 w-full lg:w-1/3 flex justify-center lg:justify-end relative mt-8 lg:mt-0 items-center">

                {/* Dashed arrow decoration pointing to the burger */}
                {/* <div className="hidden lg:block absolute -left-16 top-[30%] opacity-80 z-20">
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 70 Q 50 10 110 40" stroke="white" strokeWidth="3" strokeDasharray="8 8" fill="none" strokeLinecap="round" />
                        <path d="M110 40 L 95 35 M 110 40 L 102 55" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </svg>
                </div> */}

                {/* Burger Image Container with Responsive max-widths */}
                <div className="relative inline-block z-10 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[350px]">

                    {/* Dynamic SVG Blob replacing the missing blob.png */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] -z-10 text-brand-secondary opacity-100">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
                            <path d="M49.4,-72.4C64.3,-62.4,76.8,-48.1,84.6,-31.2C92.4,-14.3,95.5,5.2,89.5,22.1C83.5,39.1,68.4,53.4,51.8,63.1C35.2,72.8,17.6,77.8,-0.1,77.9C-17.8,78,-35.6,73.2,-50.2,63.1C-64.8,53,-76.2,37.6,-82.1,20.4C-88.1,3.2,-88.6,-15.8,-81.1,-31.5C-73.6,-47.2,-58.1,-59.6,-42.1,-69C-26.1,-78.4,-13,-84.8,1.3,-86.6C15.6,-88.4,31.2,-85.7,46.7,-78.4L49.4,-72.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>

                    {/* Discount Badge */}
                    <div className="absolute top-4 -left-4 lg:-left-8 bg-white rounded-full p-2 shadow-xl transform -rotate-12 z-20">
                        <div className="border-[2px] border-dashed border-brand-primary rounded-full w-14 h-14 flex flex-col items-center justify-center text-brand-primary font-black leading-[1.1] text-xs">
                            <span className="text-sm">70%</span>
                            <span>OFF</span>
                        </div>
                    </div>

                    <img
                        src="https://imgs.search.brave.com/Q6TJ3AWLLdxEXLKT4XUvC627gkBwV4zdWy-enEPwP1U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNi8w/NS9CdXJnZXItUE5H/LUhELnBuZw"
                        alt="Delicious Burgers"
                        className="w-[300px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative z-10 hover:scale-105 transition-transform duration-500 ease-out"
                    />
                </div>
            </div>

        </div>
    );
};
