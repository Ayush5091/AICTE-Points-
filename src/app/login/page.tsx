"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

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
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4 md:p-8">
            <div className="flex w-full max-w-5xl flex-col-reverse md:flex-row overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#121212] border border-gray-100 dark:border-gray-800">

                {/* Left Side - Info & Gradient */}
                <div className="relative flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                    {/* White/Black/Gray Gradient Background */}
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gray-200 dark:bg-gray-800 opacity-70 blur-[100px] pointer-events-none"></div>
                    <div className="absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-gray-300 dark:bg-gray-700 opacity-50 blur-[80px] pointer-events-none"></div>
                    <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-gray-400 dark:bg-gray-900 opacity-30 blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 text-gray-900 dark:text-white">
                        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Make Progress. <br /> Earn Points.
                        </h1>
                        <p className="mb-10 text-lg font-medium text-gray-600 dark:text-gray-300">
                            The centralized platform to log, manage, and verify your AICTE mandatory activity points.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm border border-gray-800 dark:border-gray-200">
                                    <span className="material-symbols-outlined text-xl font-bold">trending_up</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Track Progress</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your journey towards the 100 points milestone in real-time.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm border border-gray-800 dark:border-gray-200">
                                    <span className="material-symbols-outlined text-xl font-bold">approval</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Request Approvals</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Submit new participation requests and get them officially verified.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm border border-gray-800 dark:border-gray-200">
                                    <span className="material-symbols-outlined text-xl font-bold">verified</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Verify Proofs</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upload documentation securely for administrative verification.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex w-full flex-col justify-center bg-gray-50/50 p-8 md:w-1/2 md:p-12 lg:p-16 dark:bg-[#121212] z-10 border-l border-gray-100 dark:border-gray-800/50">
                    <div className="mx-auto w-full max-w-sm flex flex-col items-center">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white mt-4">Welcome back</h2>
                        <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Sign in to your account.
                        </p>

                        {/* Role Slider */}
                        <div className="relative flex w-full max-w-[240px] rounded-full bg-gray-200/50 p-1 mb-8 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            {/* Sliding Background */}
                            <div
                                className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-300 ease-out dark:bg-gray-700 ${role === 'student' ? 'left-1' : 'left-[calc(50%+3px)]'
                                    }`}
                            ></div>

                            {/* Buttons */}
                            <button
                                onClick={() => setRole('student')}
                                className={`relative z-10 w-1/2 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${role === 'student' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setRole('admin')}
                                className={`relative z-10 w-1/2 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${role === 'admin' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                Admin
                            </button>
                        </div>

                        <div className="w-full relative min-h-[220px]">
                            {/* Student Form (Google Auth) */}
                            <div className={`absolute w-full transition-all duration-300 ${role === 'student' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                                <a
                                    href="/api/auth/google/login"
                                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google Logo" />
                                    Continue with Google
                                </a>
                            </div>

                            {/* Admin Form (Email/Password) */}
                            <div className={`absolute w-full transition-all duration-300 ${role === 'admin' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                                    {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</div>}
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Admin Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 w-full rounded-xl bg-black dark:bg-white px-4 py-3 text-sm font-bold text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                                    >
                                        {isLoading ? 'Authenticating...' : 'Sign in as Admin'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
