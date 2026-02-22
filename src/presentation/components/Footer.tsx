import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-white pt-16 pb-8 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 pb-12 border-b border-gray-100">

                {/* Logo */}
                <div className="flex-shrink-0">
                    <h2 className="text-[#FF4732] text-3xl font-black tracking-tight cursor-pointer">
                        Hivago
                    </h2>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                    <a href="#" className="text-gray-600 hover:text-[#FF4732] font-semibold text-sm transition-colors">
                        About
                    </a>
                    <a href="#" className="text-[#FF4732] font-semibold text-sm transition-colors">
                        Terms & Conditions
                    </a>
                    <a href="#" className="text-gray-600 hover:text-[#FF4732] font-semibold text-sm transition-colors">
                        Privacy Policy
                    </a>
                    <a href="#" className="text-gray-600 hover:text-[#FF4732] font-semibold text-sm transition-colors">
                        Contact
                    </a>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-4">
                    <a href="#" className="w-8 h-8 rounded bg-[#FF4732] text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                        <Facebook className="w-4 h-4 fill-current" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded bg-[#FF4732] text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                        <Twitter className="w-4 h-4 fill-current" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded bg-[#FF4732] text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                        <Instagram className="w-4 h-4 fill-current" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded bg-[#FF4732] text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                        <Linkedin className="w-4 h-4 fill-current" />
                    </a>
                </div>

            </div>

            {/* Copyright */}
            <div className="text-center mt-8">
                <p className="text-gray-400 text-xs font-medium">
                    Copyright ©2021 Seven Spices
                </p>
            </div>
        </footer>
    );
};
