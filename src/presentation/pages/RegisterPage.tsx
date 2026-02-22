import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock registration
        navigate('/');
    };

    return (
        <div className="w-full flex items-center justify-center py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Delicate Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[32px] shadow-xl border border-gray-100 relative z-10 my-4">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">
                        Join Hivago to discover the best restaurants
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4732] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4732] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4732] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4732] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors shadow-lg"
                        >
                            Create Account
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600 font-medium pb-2">
                    Already have an account?{' '}
                    <Link to="/signin" className="font-bold text-[#FF4732] hover:text-red-700 transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
};
