import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import banner1 from "../../assets/hero_section/banner1.svg";
import banner2 from "../../assets/hero_section/banner2.svg";
import banner3 from "../../assets/hero_section/banner3.svg";
import mobileBanner1 from "../../assets/hero_section/mobile_banner1.svg";
import mobileBanner2 from "../../assets/hero_section/mobile_banner2.svg";

export const HeroSection: React.FC = () => {
    const slides = [
        { desktop: banner1, mobile: mobileBanner1 },
        { desktop: banner2, mobile: mobileBanner2 },
        { desktop: banner3, mobile: mobileBanner1 } // Fallback since there is no mobile_banner3
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full overflow-hidden bg-gray-50 group">
            {/* Slider Container */}
            <div 
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div key={index} className="w-full flex-shrink-0 relative">
                        <picture>
                            <source media="(max-width: 767px)" srcSet={slide.mobile} />
                            <source media="(min-width: 768px)" srcSet={slide.desktop} />
                            <img 
                                src={slide.desktop} 
                                alt={`Hero Banner ${index + 1}`} 
                                className="w-full h-auto block object-cover md:object-contain min-h-[160px] md:min-h-0" 
                            />
                        </picture>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows (visible on desktop hover, hidden on mobile) */}
            <button 
                onClick={prevSlide}
                className="hidden md:block absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100 z-10 active:scale-95"
                aria-label="Previous banner"
            >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </button>
            <button 
                onClick={nextSlide}
                className="hidden md:block absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100 z-10 active:scale-95"
                aria-label="Next banner"
            >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </button>
            
            {/* Dots indicator */}
            <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all rounded-full shadow-sm outline-none ${
                            currentIndex === index 
                            ? 'bg-white w-6 md:w-8 h-1.5 md:h-2 opacity-100' 
                            : 'bg-white/60 hover:bg-white/90 w-1.5 md:w-2 h-1.5 md:h-2'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
