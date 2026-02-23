"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [usn, setUsn] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Registration token missing. Try logging in again.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, usn })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            login(data.access_token);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark p-6">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Complete Profile</h1>
                <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Please enter your USN to finish setting up your account.
                </p>

                {error && (
                    <div className="w-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-xl text-sm mb-4 border border-red-100 dark:border-red-900/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">USN</label>
                        <input
                            required
                            value={usn}
                            onChange={(e) => setUsn(e.target.value)}
                            className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary shadow-sm uppercase tracking-wide"
                            placeholder="e.g. 1MS21CS001"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? "Registering..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
