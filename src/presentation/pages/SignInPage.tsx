import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SignInPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        navigate('/');
    };

    return (
        <div className="w-full flex items-center justify-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Very Subtle Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[32px] shadow-xl border border-gray-100 relative z-10">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-[#FF4732] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 mb-6">
                        <span className="text-white text-3xl font-extrabold">H</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">
                        Enter your details to access your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="relative">
                            <label className="text-sm font-bold text-gray-700 mb-2 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4732] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <a href="#" className="font-semibold text-sm text-[#FF4732] hover:text-red-700 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4732] focus:border-transparent transition-all sm:text-sm font-medium"
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

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#FF4732] hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4732] transition-colors shadow-lg shadow-red-200"
                        >
                            Sign in securely
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                            Google
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="h-5 w-5 mr-2" />
                            Apple
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600 font-medium">
                    Not a member?{' '}
                    <Link to="/register" className="font-bold text-[#FF4732] hover:text-red-700 transition-colors">
                        Create an account now
                    </Link>
                </p>
            </div>
        </div>
    );
};
