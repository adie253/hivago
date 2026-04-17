import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Truck, Heart, Users, Award, Target, ChevronRight, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

export const AboutUsPage: React.FC = () => {
    const navigate = useNavigate();
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        // Simple GSAP fade-in animations
        sectionRefs.current.forEach((ref, index) => {
            if (ref) {
                gsap.fromTo(ref, 
                    { opacity: 0, y: 30 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.8, 
                        delay: index * 0.2, 
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: ref,
                            start: "top 85%",
                        }
                    }
                );
            }
        });
    }, []);

    const values = [
        {
            icon: <ChefHat className="w-8 h-8 text-[#FF4732]" />,
            title: "Expert Curation",
            description: "We partner with the finest local restaurants to bring you a hand-picked selection of culinary delights."
        },
        {
            icon: <Truck className="w-8 h-8 text-[#FF4732]" />,
            title: "Lightning Fast",
            description: "Our dedicated delivery fleet ensures your food arrives hot and fresh, exactly when you need it."
        },
        {
            icon: <Heart className="w-8 h-8 text-[#FF4732]" />,
            title: "Customer First",
            description: "Your satisfaction is our obsession. We go above and beyond to make every meal a special occasion."
        }
    ];

    const stats = [
        { label: "Partner Restaurants", value: "500+" },
        { label: "Daily Deliveries", value: "10k+" },
        { label: "Happy Customers", value: "100k+" },
        { label: "Cities Covered", value: "25+" }
    ];

    return (
        <div className="min-h-screen bg-white font-sans overflow-hidden">
            {/* Hero Section */}
            <section 
                ref={(el) => (sectionRefs.current[0] = el)}
                className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6 overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#FF4732]/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#B02421]/5 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4732]/10 text-[#FF4732] text-sm font-bold mb-6">
                        <Award className="w-4 h-4" />
                        <span>Redefining Food Delivery</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-8">
                        Bringing the best of <br />
                        <span className="text-[#B02421] italic">local flavors</span> to you.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Hivago started with a simple mission: to make great local food accessible to everyone, anywhere. Today, we're proud to be the heart of your neighborhood's dining experience.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => navigate('/restaurants')}
                            className="w-full sm:w-auto px-8 py-4 bg-[#B02421] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#B02421]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Explore Restaurants <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Our Mission Section */}
            <section 
                ref={(el) => (sectionRefs.current[1] = el)}
                className="py-24 bg-gray-50 px-6"
            >
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative">
                        <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                            <img 
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" 
                                alt="Chef cooking"
                                className="w-full aspect-[4/5] object-cover"
                            />
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl z-20 hidden md:block max-w-[200px]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="font-bold text-gray-900">Our Goal</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Empowering local chefs and delighting foodies daily.</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                            Our mission is to <br />
                            <span className="text-[#FF4732]">Spread Happiness</span> <br />
                            through every bite.
                        </h2>
                        <div className="space-y-6">
                            <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                At Hivago, we believe that food is more than just sustenance—it's culture, it's celebration, and it's connection. We are committed to building the bridge between talented culinary creators and the people who appreciate their art.
                            </p>
                            <div className="pt-6 grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-2">
                                    <span className="text-3xl font-black text-gray-900 italic">2026</span>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Founded In</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-3xl font-black text-gray-900 italic">Global</span>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Vision</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section 
                ref={(el) => (sectionRefs.current[2] = el)}
                className="py-24 px-6"
            >
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Values that drive us</h2>
                    <p className="text-gray-500 font-bold max-w-xl mx-auto">We're built on a foundation of trust, quality, and community.</p>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((v, i) => (
                        <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#FF4732]/20 transition-all group">
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl w-fit group-hover:bg-[#FF4732]/10 transition-colors">
                                {v.icon}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{v.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{v.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            {/* <section 
                ref={(el) => (sectionRefs.current[3] = el)}
                className="py-20 px-6 bg-[#B02421]"
            >
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl md:text-5xl font-black text-white mb-2">{s.value}</div>
                            <div className="text-white/60 font-bold text-sm uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section> */}

            {/* Meet the Team Section (Culture) */}
            <section 
                ref={(el) => (sectionRefs.current[4] = el)}
                className="py-24 px-6 bg-white"
            >
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
                    <div className="lg:w-1/2 rounded-[40px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                            alt="Team working"
                            className="w-full h-96 object-cover"
                        />
                    </div>
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 text-[#FF4732] font-black text-sm uppercase tracking-widest mb-4">
                            <Users className="w-4 h-4" />
                            <span>Our Culture</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-6">Built by humans, <br /> for humans.</h2>
                        <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8">
                            Behind the app and the scooties is a diverse team of dreamers, doers, and food-lovers. We're united by a shared passion for technology and a deep respect for the culinary arts.
                        </p>
                        <button className="flex items-center gap-2 text-gray-900 font-black hover:text-[#FF4732] transition-colors group">
                            Learn more about our culture <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section 
                ref={(el) => (sectionRefs.current[5] = el)}
                className="py-24 px-6"
            >
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#D03727] to-[#AD2523] rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-red-200">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to taste the <br /> difference?</h2>
                        <button 
                            onClick={() => navigate('/restaurants')}
                            className="bg-white text-[#B02421] px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Order Your Next Meal
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
