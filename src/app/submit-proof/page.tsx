"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SubmitProofScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [proofUrl, setProofUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) return;
        fetch('/api/activity-requests/me', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const approved = data.filter((r: any) => r.status === 'approved');
                    setApprovedRequests(approved);
                    if (approved.length > 0) setSelectedRequest(approved[0]);
                }
            })
            .catch(console.error);
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) {
            setMessage("Please select an approved request to submit proof for.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    request_id: selectedRequest.request_id,
                    proof: proofUrl,
                    description: notes || ""
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to submit proof");

            setMessage("Proof submitted successfully! Awaiting verification.");
            setTimeout(() => router.push('/submissions-history'), 1500);
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 md:px-10 pt-8 pb-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
                <button className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined text-primary dark:text-white text-xl md:text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg md:text-2xl font-bold text-primary dark:text-white flex-1 text-center pr-8">Submit Proof</h1>
            </div>

            <div className="flex-1 px-6 md:px-10 pb-24 max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Summary View (Left column on large screens) */}
                <div className="mt-4 md:mt-8">
                    {message && (
                        <div className={`p-4 rounded-xl mb-6 ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm md:text-base font-semibold text-primary dark:text-white pl-1 mb-2">Select Approved Activity</label>
                        <select
                            className="w-full h-14 pl-4 pr-10 bg-surface-light dark:bg-surface-dark border-transparent focus:border-primary focus:ring-2 rounded-2xl text-primary dark:text-white shadow-soft"
                            value={selectedRequest?.request_id || ""}
                            onChange={(e) => {
                                const req = approvedRequests.find(r => r.request_id === parseInt(e.target.value));
                                setSelectedRequest(req);
                            }}
                        >
                            <option value="" disabled>Select Activity</option>
                            {approvedRequests.map(req => (
                                <option key={req.request_id} value={req.request_id}>{req.activity}</option>
                            ))}
                        </select>
                    </div>

                    {selectedRequest ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-neumorphic border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                        Approved
                                    </span>
                                    <span className="text-2xl md:text-4xl font-bold text-primary dark:text-white">+{selectedRequest.points}</span>
                                </div>
                                <h2 className="text-xl md:text-3xl font-bold text-primary dark:text-white mb-4 leading-tight">{selectedRequest.activity}</h2>
                                <div className="flex items-center text-sm md:text-base text-gray-500 dark:text-gray-400 gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">calendar_today</span>
                                        <span className="font-medium">{new Date(selectedRequest.requested_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 text-center text-gray-500 shadow-soft">
                            No approved requests available for submission.
                        </div>
                    )}

                    <div className="hidden lg:block mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Instructions</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-2 list-disc pl-4">
                            <li>Ensure your Google Drive link has its access set to &quot;Anyone with the link can view&quot;.</li>
                            <li>Upload an image if appropriate (certificate or photo).</li>
                            <li>Include any details the verifier may need.</li>
                        </ul>
                    </div>
                </div>

                {/* Form (Right column on large screens) */}
                <form className="space-y-6 md:space-y-8 mt-4 md:mt-8" onSubmit={handleSubmit}>
                    {/* Drive Link */}
                    <div className="space-y-2 lg:space-y-3">
                        <label className="block text-sm md:text-base font-semibold text-primary dark:text-white pl-1">
                            Proof Link <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-xl md:text-2xl">add_link</span>
                            </div>
                            <input required value={proofUrl} onChange={e => setProofUrl(e.target.value)} className="block w-full h-14 md:h-16 pl-12 md:pl-16 pr-12 md:pr-16 bg-surface-light dark:bg-surface-dark border-transparent focus:border-primary focus:ring-2 rounded-2xl text-primary dark:text-white placeholder-gray-400 shadow-soft transition-all text-sm md:text-base" placeholder="Paste Google Drive link" type="url" />
                            <button type="button" className="absolute inset-y-0 right-0 pr-4 md:pr-5 flex items-center text-primary dark:text-white hover:text-gray-600 transition-colors">
                                <span className="material-symbols-outlined text-xl md:text-2xl">content_paste</span>
                            </button>
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 px-2 lg:hidden">Make sure the link is publicly accessible.</p>
                    </div>

                    {/* Notes Text Area */}
                    <div className="space-y-2 lg:space-y-3">
                        <label className="block text-sm md:text-base font-semibold text-primary dark:text-white pl-1">
                            Notes for Verifier
                        </label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="block w-full p-4 md:p-6 bg-surface-light dark:bg-surface-dark border-transparent focus:border-primary focus:ring-2 rounded-2xl text-primary dark:text-white placeholder-gray-400 shadow-soft resize-none transition-all text-sm md:text-base" placeholder="Add any additional context or details about your participation..." rows={4}></textarea>
                    </div>

                    {/* Submit */}
                    <div className="pt-6">
                        <button disabled={loading || !selectedRequest} type="submit" className="w-full bg-primary text-white font-bold py-4 md:py-5 px-6 rounded-2xl shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group text-lg border border-transparent dark:border-gray-700 disabled:opacity-50">
                            <span>{loading ? "Submitting..." : "Submit for Verification"}</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
