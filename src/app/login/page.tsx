"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from 'next/link';

export default function LoginPage() {
    const [role, setRole] = useState<'student' | 'admin'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await res.json();
            login(data.access_token);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex h-[100dvh] md:min-h-screen w-full flex-col items-center justify-center bg-black md:bg-gray-50 md:dark:bg-[#0a0a0a] md:p-4 lg:p-8 overflow-hidden md:overflow-y-auto font-sans antialiased transition-colors duration-300">

            {/* Header / Navigation */}
            <div className="absolute top-0 left-0 w-full flex items-center p-4 justify-between z-10 hidden md:flex">
                <Link href="/" className="text-gray-900 dark:text-white flex size-12 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
            </div>

            {/* Main Container / Hero + Bottom Sheet OR Desktop Card */}
            <main className="flex-grow md:flex-grow-0 flex flex-col justify-between pt-8 md:pt-0 z-10 w-full h-full md:h-auto relative md:max-w-5xl md:mx-auto md:flex-row md:items-stretch md:bg-white md:dark:bg-[#121212] md:shadow-2xl md:rounded-3xl md:overflow-hidden md:border md:border-gray-100 md:dark:border-gray-800 transition-all duration-300">

                {/* Desktop Background Blur Elements */}
                <div className="hidden md:block absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gray-200 dark:bg-gray-800 opacity-70 blur-[100px] pointer-events-none z-0"></div>
                <div className="hidden md:block absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-gray-300 dark:bg-gray-700 opacity-50 blur-[80px] pointer-events-none z-0"></div>
                <div className="hidden md:block absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-gray-400 dark:bg-gray-900 opacity-30 blur-[100px] pointer-events-none z-0"></div>

                {/* Text Content (Left Side) - Fixed layout on mobile */}
                <div className="px-5 text-center md:text-left w-full max-w-md mx-auto md:w-1/2 md:mx-0 md:p-12 lg:p-16 relative z-10 md:flex md:flex-col justify-center mb-4 md:mb-0 mt-20 md:mt-0 flex-none">
                    <h1 className="text-[56px] md:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight mb-4 md:mb-4 text-white md:text-gray-900 md:dark:text-white transition-colors duration-300">
                        Make Progress.<br className="hidden md:block" /> Earn Points.
                    </h1>
                    <p className="text-[#a0aec0] md:text-gray-600 md:dark:text-gray-300 text-[18px] leading-relaxed font-medium mb-10 transition-colors duration-300 mx-auto md:mx-0 max-w-[340px] md:max-w-none">
                        The centralized platform to log, manage, and verify your AICTE mandatory activity points.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-6 md:space-y-8 mx-auto w-fit md:mx-0 text-left">
                        <div className="flex items-start gap-4 md:gap-4">
                            <div className="bg-[#1a1c21] md:bg-gray-900 md:dark:bg-white p-3 md:p-0 md:mt-1 flex items-center justify-center shrink-0 w-14 h-14 md:w-10 md:h-10 rounded-2xl md:rounded-xl md:shadow-sm md:border md:border-gray-800 md:dark:border-gray-200 transition-colors duration-300">
                                <span className="material-symbols-outlined text-white md:dark:text-gray-900 text-[28px] md:text-xl md:font-bold">trending_up</span>
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-bold text-[18px] md:text-base text-white md:text-gray-900 md:dark:text-white transition-colors duration-300">Track Progress</h3>
                                <p className="text-[#a0aec0] md:text-gray-600 md:dark:text-gray-400 text-[15px] leading-snug mt-1 transition-colors duration-300 max-w-[240px] md:max-w-none">Monitor your journey towards the 100 points milestone in real-time.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 md:gap-4">
                            <div className="bg-[#1a1c21] md:bg-gray-900 md:dark:bg-white p-3 md:p-0 md:mt-1 flex items-center justify-center shrink-0 w-14 h-14 md:w-10 md:h-10 rounded-2xl md:rounded-xl md:shadow-sm md:border md:border-gray-800 md:dark:border-gray-200 transition-colors duration-300">
                                <span className="material-symbols-outlined text-white md:dark:text-gray-900 text-[28px] md:text-xl md:font-bold">approval</span>
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-bold text-[18px] md:text-base text-white md:text-gray-900 md:dark:text-white transition-colors duration-300">Request Approvals</h3>
                                <p className="text-[#a0aec0] md:text-gray-600 md:dark:text-gray-400 text-[15px] leading-snug mt-1 transition-colors duration-300 max-w-[240px] md:max-w-none">Submit new participation requests and get them officially verified.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 md:gap-4">
                            <div className="bg-[#1a1c21] md:bg-gray-900 md:dark:bg-white p-3 md:p-0 md:mt-1 flex items-center justify-center shrink-0 w-14 h-14 md:w-10 md:h-10 rounded-2xl md:rounded-xl md:shadow-sm md:border md:border-gray-800 md:dark:border-gray-200 transition-colors duration-300">
                                <span className="material-symbols-outlined text-white md:dark:text-gray-900 text-[28px] md:text-xl md:font-bold">verified</span>
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-bold text-[18px] md:text-base text-white md:text-gray-900 md:dark:text-white transition-colors duration-300">Verify Proofs</h3>
                                <p className="text-[#a0aec0] md:text-gray-600 md:dark:text-gray-400 text-[15px] leading-snug mt-1 transition-colors duration-300 max-w-[240px] md:max-w-none">Upload documentation securely for administrative verification.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Sheet Overlay (Right column on Desktop, Bottom sheet on Mobile) */}
                <div className="w-full mt-auto md:mt-0 md:w-1/2 transition-all z-20 flex flex-col justify-end md:justify-center md:bg-gray-50/50 md:dark:bg-[#121212] md:border-l md:border-gray-100 md:dark:border-gray-800/50 md:flex-auto">
                    <div className="bg-white md:bg-transparent rounded-t-[40px] md:rounded-none px-6 pt-6 pb-12 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-none h-auto flex flex-col max-w-full md:max-w-none mx-auto overflow-hidden md:overflow-visible md:p-12 lg:p-16">

                        {/* Mobile Handle */}
                        <div className="flex h-6 w-full items-center justify-center md:hidden mb-2">
                            <div className="h-1.5 w-12 rounded-full bg-slate-200 transition-colors duration-300"></div>
                        </div>

                        <div className="mx-auto w-full max-w-sm flex flex-col items-center">
                            {/* Title (for desktop mostly) */}
                            <div className="hidden md:block mb-8 text-center text-gray-900 dark:text-white mt-4 transition-colors duration-300">
                                <h2 className="text-2xl font-bold">Welcome back</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account.</p>
                            </div>

                            {/* Toggle Container */}
                            <div className="relative p-1.5 md:p-1 rounded-2xl md:rounded-full flex items-center mb-8 bg-[#f0f2f5] md:bg-gray-200/50 md:dark:bg-gray-800/50 md:border md:border-gray-200 md:dark:border-gray-700 w-full md:max-w-[240px] transition-colors duration-300">

                                {/* Background slider */}
                                <div
                                    className="absolute top-1.5 md:top-1 bottom-1.5 md:bottom-1 w-[calc(50%-6px)] md:w-[calc(50%-4px)] rounded-xl md:rounded-full bg-white md:dark:bg-gray-700 shadow-sm transition-all duration-300 ease-out"
                                    style={{ transform: role === 'student' ? 'translateX(0)' : 'translateX(100%)', left: typeof window !== 'undefined' && window.innerWidth >= 768 ? '4px' : '6px' }}
                                ></div>

                                <button
                                    onClick={() => setRole('student')}
                                    className={`relative z-10 flex-1 md:w-1/2 text-center py-2.5 md:py-2 cursor-pointer text-sm font-semibold transition-colors duration-200 ${role === 'student' ? 'text-[#1a202c] md:text-gray-900 md:dark:text-white' : 'text-[#718096] md:text-gray-500 md:hover:text-gray-700 md:dark:text-gray-400 md:dark:hover:text-gray-300'}`}
                                >
                                    Student
                                </button>
                                <button
                                    onClick={() => setRole('admin')}
                                    className={`relative z-10 flex-1 md:w-1/2 text-center py-2.5 md:py-2 cursor-pointer text-sm font-semibold transition-colors duration-200 ${role === 'admin' ? 'text-[#1a202c] md:text-gray-900 md:dark:text-white' : 'text-[#718096] md:text-gray-500 md:hover:text-gray-700 md:dark:text-gray-400 md:dark:hover:text-gray-300'}`}
                                >
                                    Admin
                                </button>
                            </div>

                            {/* Forms Container */}
                            <div className="w-full relative min-h-[300px] md:min-h-[220px]">

                                {/* STUDENT FORM */}
                                <div className={`absolute inset-0 w-full transition-all duration-300 ${role === 'student' ? 'opacity-100 md:translate-x-0 pointer-events-auto z-10' : 'opacity-0 md:-translate-x-4 pointer-events-none z-0'}`}>
                                    <a
                                        href="/api/auth/google/login"
                                        className="w-full bg-[#1a1c21] md:bg-white md:dark:bg-gray-800 hover:bg-black md:hover:bg-gray-50 md:dark:hover:bg-gray-700 text-white md:text-gray-700 md:dark:text-gray-200 py-4 md:px-6 rounded-2xl md:rounded-xl font-bold md:font-semibold flex items-center justify-center space-x-3 gap-0 transition-all active:scale-[0.98] md:shadow-sm md:hover:shadow-md md:border md:border-gray-200 md:dark:border-gray-700"
                                    >
                                        <svg className="h-5 w-5 bg-white md:bg-transparent rounded-full md:rounded-none p-0.5 md:p-0 md:mr-3" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </a>
                                    <p className="text-center text-[#718096] md:text-transparent text-sm mt-6 md:mt-0 lg:mt-0 transition-colors duration-300">
                                        Only authenticated sahyadri.edu.in accounts are supported.
                                    </p>
                                </div>

                                {/* ADMIN FORM */}
                                <div className={`absolute inset-0 w-full transition-all duration-300 ${role === 'admin' ? 'opacity-100 md:translate-x-0 pointer-events-auto z-10' : 'opacity-0 md:translate-x-4 pointer-events-none z-0'}`}>
                                    <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                                        {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 md:dark:bg-red-900/20 p-2 rounded-lg transition-colors duration-300">{error}</div>}

                                        <div className="flex flex-col md:gap-0">
                                            <label className="text-slate-600 text-xs font-semibold px-2 mb-1.5 md:hidden transition-colors duration-300">Email Address</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl transition-colors group-focus-within:text-black">mail</span>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-12 md:h-auto pl-12 pr-4 md:py-3 bg-slate-50 md:bg-white md:dark:bg-gray-800/50 border-2 md:border border-slate-100 md:border-gray-200 md:dark:border-gray-700 rounded-xl text-slate-900 md:dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-black md:focus:ring-4 md:focus:ring-black/5 md:dark:focus:border-white md:dark:focus:ring-white/10 transition-all text-sm"
                                                    placeholder="Admin Email"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:gap-0">
                                            <div className="flex justify-between items-end px-2 mb-1.5 md:hidden">
                                                <label className="text-slate-600 text-xs font-semibold transition-colors duration-300">Password</label>
                                            </div>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl transition-colors group-focus-within:text-black">lock</span>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full h-12 md:h-auto pl-12 pr-4 md:py-3 bg-slate-50 md:bg-white md:dark:bg-gray-800/50 border-2 md:border border-slate-100 md:border-gray-200 md:dark:border-gray-700 rounded-xl text-slate-900 md:dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-black md:focus:ring-4 md:focus:ring-black/5 md:dark:focus:border-white md:dark:focus:ring-white/10 transition-all text-sm"
                                                    placeholder="Password"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full mt-2 h-14 md:h-auto md:px-4 md:py-3 text-white md:dark:text-black text-base md:text-sm font-bold rounded-2xl md:rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-[#1a1c21] hover:bg-black md:bg-black md:dark:bg-white md:shadow-lg md:shadow-black/10 md:dark:shadow-white/10 md:hover:scale-[1.02] md:active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                                        >
                                            <span>{isLoading ? 'Authenticating...' : 'Sign in as Admin'}</span>
                                            {!isLoading && <span className="material-symbols-outlined md:hidden">arrow_forward</span>}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
