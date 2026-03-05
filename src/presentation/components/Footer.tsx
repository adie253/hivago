import React from 'react';
import { Facebook, Linkedin, Twitter, Youtube, Instagram, MapPin, Mail, Phone } from 'lucide-react';
import footerLogo from '../../assets/footer/footer_logo.svg';
import scooty from '../../assets/footer/scooty.svg';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-[#b22212] py-12 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-white">

                {/* Desktop/Tablet Responsive Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 items-center mb-12">

                    {/* Column 1: Logo and Scooty (Mobile: Stacked, Desktop: Left) */}
                    <div className="flex flex-col items-center md:items-start gap-8 order-1">
                        <img src={footerLogo} alt="Hivago Logo" className="h-12 w-auto" />
                        <img src={scooty} alt="Delivery Illustration" className="w-20 h-auto" />
                    </div>

                    {/* Column 2: Social Icons (Mobile: Center, Desktop: Center) */}
                    <div className="flex flex-col items-center gap-6 order-2 md:order-2">
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Facebook className="w-5 h-5 text-white" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Linkedin className="w-5 h-5 text-white" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Twitter className="w-5 h-5 text-white" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Youtube className="w-5 h-5 text-white" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Instagram className="w-5 h-5 text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Column 3: Contact Info (Mobile: Stacked, Desktop: Right) */}
                    <div className="flex flex-col gap-5 pl-14 md:pl-0 order-3 md:items-end">
                        <div className="flex items-start gap-3  md:justify-end">
                            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                            <p className="text-sm font-medium  md:text-right">
                                Block A, First Floor, M.G. road,<br />
                                Navi Mumbai, India
                            </p>
                        </div>

                        <div className="flex items-center gap-3 md:justify-end">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <a href="mailto:info@hivago.com" className="text-sm font-medium hover:underline">
                                info@hivago.com
                            </a>
                        </div>

                        <div className="flex items-center gap-3  md:justify-end">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <a href="tel:+918830644852" className="text-sm font-medium hover:underline">
                                + 91 8830644852
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Separator */}
                <div className="w-full border-t border-white/20">
                </div>
            </div>
        </footer>
    );
};
