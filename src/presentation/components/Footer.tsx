import React from 'react';
import { Facebook, Linkedin, Twitter, Youtube, Instagram, MapPin, Mail, Phone } from 'lucide-react';
import footerLogo from '../../assets/footer/footer_logo.svg';
import scooty from '../../assets/footer/scooty.svg';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-[#B02421] py-12 md:py-20 px-6 md:px-12 lg:px-24 border-t border-white/10 text-white font-sans">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8">
                
                {/* Logo Section - Order 1 on Mobile/Desktop */}
                <div className="flex-shrink-0 order-1">
                    <img src={footerLogo} alt="Hivago Logo" className="h-12 md:h-12 w-auto" />
                </div>

                {/* Scooty Illustration - Mobile Only, Order 2 */}
                <div className="md:hidden order-2 flex justify-center w-25">
                    <img src={scooty} alt="Delivery Illustration" className="w-40 h-auto opacity-90" />
                </div>

                {/* Social Icons - Order 3 on Mobile, Order 3 on Desktop */}
                <div className="flex items-center gap-6 md:gap-5 order-3 md:order-3">
                    <a href="#" className="hover:scale-110 transition-transform opacity-90 hover:opacity-100">
                        <Facebook className="w-5 h-5 md:w-4 md:h-4" />
                    </a>
                    <a href="#" className="hover:scale-110 transition-transform opacity-90 hover:opacity-100">
                        <Linkedin className="w-5 h-5 md:w-4 md:h-4" />
                    </a>
                    <a href="#" className="hover:scale-110 transition-transform opacity-90 hover:opacity-100">
                        <Twitter className="w-5 h-5 md:w-4 md:h-4" />
                    </a>
                    <a href="#" className="hover:scale-110 transition-transform opacity-90 hover:opacity-100">
                        <Youtube className="w-5 h-5 md:w-4 md:h-4" />
                    </a>
                    <a href="#" className="hover:scale-110 transition-transform opacity-90 hover:opacity-100">
                        <Instagram className="w-5 h-5 md:w-4 md:h-4" />
                    </a>
                </div>

                {/* Contact Info - Order 4 on Mobile, Order 2 on Desktop (hidden middle on desktop) */}
                <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-center gap-4 md:gap-12 lg:gap-16 order-4 md:order-2 w-full md:w-auto mt-4 md:mt-0">
                    {/* Address */}
                    <div className="flex items-start gap-4 md:gap-3">
                        <div className="bg-white/10 p-2 rounded-lg md:bg-transparent md:p-0">
                            <MapPin className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-white" />
                        </div>
                        <div className="text-sm md:text-sm font-medium leading-relaxed opacity-90">
                            Block A, First Floor, M.G. road,<br className="hidden md:block" />
                            Navi Mumbai, India
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-4 md:gap-3">
                        <div className="bg-white/10 p-2 rounded-lg md:bg-transparent md:p-0">
                            <Mail className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-white" />
                        </div>
                        <a href="mailto:info@hivago.com" className="text-sm md:text-sm font-medium hover:text-white/80 transition-colors opacity-90">
                            info@hivago.com
                        </a>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-4 md:gap-3">
                        <div className="bg-white/10 p-2 rounded-lg md:bg-transparent md:p-0">
                            <Phone className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-white" />
                        </div>
                        <a href="tel:+918830644852" className="text-sm md:text-sm font-medium hover:text-white/80 transition-colors opacity-90">
                            + 91 8830644852
                        </a>
                    </div>
                </div>

                {/* Mobile Bottom Line */}
                <div className="md:hidden order-5 w-3/4 h-[1px] bg-white/20 mt-4 self-center"></div>

            </div>
        </footer>
    );
};
