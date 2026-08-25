import React from 'react';
// import { Smartphone, Bike, Clock } from 'lucide-react';
import deliveryBoy from '../../assets/delivery_section/delivery_boy.svg';
import d1 from '../../assets/delivery_section/d1.svg';
import d2 from '../../assets/delivery_section/d2.svg';
import d3 from '../../assets/delivery_section/d3.svg';

export const DeliveryFeatures: React.FC = () => {
    return (
        <div className="w-full bg-white py-16 md:py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

                {/* Left Side: Image Container */}
                <div className="w-full lg:w-1/2 relative flex justify-center items-center">
                    {/* Delivery Boy Image */}
                    <img
                        src={deliveryBoy}
                        alt="Delivery Driver"
                        className="w-full max-w-[440px] object-contain relative z-10"
                    />

                    {/* Floating icons/elements placeholders to mimic the layout */}
                    {/* <div className="absolute top-10 left-0 bg-white p-2 border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform -rotate-12 z-20">
                        <span className="text-3xl">🥩</span>
                    </div>
                    <div className="absolute top-32 right-10 bg-white p-2 border border-gray-100 text-2xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform rotate-12 z-20 hidden md:block">
                        📦
                    </div> */}
                </div>

                {/* Right Side: Content */}
                <div className="w-full lg:w-1/2 flex flex-col text-gray-900">
                    <h2 className="text-4xl md:text-5xl font-roboto leading-tight mb-4 tracking-tight">
                        Your order is delivered <br />
                        <span className="text-brand-primary">quickly</span>
                    </h2>
                    <p className="text-gray-500 font-medium mb-10 text-base md:text-lg max-w-md">
                        Enjoy your food in a warm state will increase appetite
                    </p>

                    <div className="flex flex-col gap-3">
                        {/* Feature 1 */}
                        <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                            <div className="bg-brand-light p-3 rounded-xl border border-red-50 text-brand-primary">
                                <img src={d1} alt="" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1 text-gray-900">Order from anywhere</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                    Order food anywhere easily via smartphone
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                            <div className="bg-brand-light p-3 rounded-xl border border-red-50 text-brand-primary">
                                <img src={d2} alt="" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1 text-gray-900">Fast delivery</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                    Delivered by professional courier and on time place
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl flex items-start gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                            <div className="bg-brand-light p-3 rounded-xl border border-red-50 text-brand-primary">
                                <img src={d3} alt="" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1 text-gray-900">Receive on time</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                    Receive your food while it is still warm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
