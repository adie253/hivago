import React, { useEffect, useState } from 'react';
import { Facebook, Linkedin, Twitter, Youtube, Instagram, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import footerLogo from '../../assets/footer/footer_logo.svg';
import { VERSION_URL } from '../../lib/apiUrl';

interface VersionInfo {
    version: string;
    commit?: string;
}

export const Footer: React.FC = () => {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetch(VERSION_URL)
            .then((res) => {
                if (res.ok) return res.json();
                return null;
            })
            .then((data) => {
                if (isMounted && data && data.version) {
                    setVersionInfo({
                        version: data.version,
                        commit: data.commit,
                    });
                }
            })
            .catch(() => {
                // Fail silently on network or parse error
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const linkStyle = "text-white/75 hover:text-white transition-colors duration-200 text-sm block py-1 font-normal hover:underline";
    const headerStyle = "text-xs font-bold tracking-wider text-white mb-4 uppercase";

    return (
        <footer id="main-footer" className="w-full bg-[#B02421] pt-16 pb-8 px-6 md:px-12 lg:px-24 border-t border-white/10 text-white font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Logo and Selectors Section */}
                <div className="flex justify-between items-center gap-6 mb-12">
                    <img src={footerLogo} alt="Hivago Logo" className="h-9 w-auto" />
                </div>

                {/* 5-Column Grid Links Section */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 lg:gap-8 mb-12">
                    
                    {/* Column 1 */}
                    <div>
                        <h4 className={headerStyle}>About Hivago</h4>
                        <nav className="flex flex-col gap-1.5">
                            <Link to="/about" className={linkStyle}>Who We Are</Link>
                              <Link to="/about" className={linkStyle}>Contact Us</Link>
                           
                        </nav>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className={headerStyle}>Hivagoverse</h4>
                        <nav className="flex flex-col gap-1.5">
                            <Link to="/" className={linkStyle}>Hivago</Link>
                        </nav>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className={headerStyle}>For Restaurants</h4>
                        <nav className="flex flex-col gap-1.5">
                            <a href="https://restaurant.hivago.in" className={linkStyle}>Partner With Us</a>
                        </nav>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h4 className={headerStyle}>Learn More</h4>
                        <nav className="flex flex-col gap-1.5">
                            <Link to="/privacy?doc=privacy" className={linkStyle}>Privacy</Link>
                            <Link to="/privacy?doc=refund" className={linkStyle}>Refund Policy</Link>
                            <Link to="/privacy?doc=terms" className={linkStyle}>Terms</Link>
                        </nav>
                    </div>

                    {/* Column 5 */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className={headerStyle}>Social Links</h4>
                        
                        {/* Social Icons */}
                        <div className="flex gap-2.5 mb-6">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300" aria-label="LinkedIn">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300" aria-label="Instagram">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300" aria-label="Twitter">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300" aria-label="YouTube">
                                <Youtube className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300" aria-label="Facebook">
                                <Facebook className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Contact & Support */}
                        <div className="text-white/75 text-sm space-y-3 font-normal">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-white/80 flex-shrink-0" />
                                <span className="text-white font-semibold">Airoli, Mumbai</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                                <a href="mailto:info@hivago.in" className="hover:text-white transition-colors hover:underline">info@hivago.in</a>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-white leading-tight">Help & Support</span>
                                    <a href="tel:+919082220155" className="text-xs text-white/75 hover:text-white transition-colors hover:underline mt-0.5">+91 9082220155</a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Disclaimer & Copyright */}
                <div className="w-full h-[1px] bg-white/10 my-8"></div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] leading-relaxed text-white/50 font-normal">
                    <p>
                        By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2026 © Hivago™ Ltd. All rights reserved.
                    </p>
                    {versionInfo && (
                        <span
                            className="text-[11px] text-white/40 flex-shrink-0 font-mono tracking-tight"
                            title={versionInfo.commit ? `Commit: ${versionInfo.commit}` : undefined}
                        >
                            v{versionInfo.version}
                        </span>
                    )}
                </div>

            </div>
        </footer>
    );
};

