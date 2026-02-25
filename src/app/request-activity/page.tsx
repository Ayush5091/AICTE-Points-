"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function RequestActivityScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [activities, setActivities] = useState<any[]>([]);
    const [selectedActivity, setSelectedActivity] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [hours, setHours] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) return;
        fetch('/api/activities', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setActivities(data || []))
            .catch(console.error);
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch('/api/activity-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    activity_id: parseInt(selectedActivity),
                    description,
                    hours: parseInt(hours) || 0
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to submit request");

            setMessage(`Success! Request ID ${data.id} created.`);
            setTimeout(() => router.push('/submissions-history'), 1500);
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between px-6 md:px-10 pt-8 pb-6 bg-background-light dark:bg-background-dark sticky top-0 z-10">
                <button type="button" onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white text-2xl md:text-3xl">arrow_back</span>
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Request Activity</h1>
                <div className="w-10 md:w-12"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 md:px-10 pb-24 max-w-3xl mx-auto w-full">
                {message && (
                    <div className={`p-4 rounded-xl mb-4 ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
                <form className="flex flex-col gap-6 md:gap-8 mt-2" onSubmit={handleSubmit}>

                    {/* Category */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="category">
                            Activity Category
                        </label>
                        <div className="relative group">
                            <select
                                required
                                value={selectedActivity}
                                onChange={(e) => setSelectedActivity(e.target.value)}
                                className="w-full h-14 md:h-16 pl-5 md:pl-6 pr-12 md:pr-14 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all hover:shadow-md text-sm md:text-base" id="category"
                            >
                                <option disabled value="">Select Activity Type...</option>
                                {activities.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.category} - {a.name} ({a.points} pts)</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 md:right-5 flex items-center pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl md:text-2xl">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Form previously had an Activity Name text box, but the API expects an actual activity_id from the dropdown, so we can ignore this or just keep it decorative. 
                        Let's remove Activity Name to avoid confusion and use the dropdown. */}

                    {/* Hours and Date  */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="hours">Hours spent</label>
                            <input required value={hours} onChange={e => setHours(e.target.value)} className="w-full h-14 md:h-16 pl-5 md:pl-6 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 transition-all hover:shadow-md text-sm md:text-base" id="hours" placeholder="4" type="number" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="date">Date</label>
                            <input required value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 md:h-16 pl-5 md:pl-6 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 transition-all hover:shadow-md [color-scheme:light] dark:[color-scheme:dark] text-sm md:text-base" id="date" type="date" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="description">
                            Description
                        </label>
                        <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-5 md:p-6 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 resize-none transition-all hover:shadow-md text-sm md:text-base" id="description" placeholder="Briefly describe the activity and your role..." rows={5}></textarea>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 md:pt-10">
                        <button disabled={loading} className="w-full h-14 md:h-16 bg-primary dark:bg-white text-white dark:text-primary font-bold text-lg md:text-xl rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50" type="submit">
                            <span>{loading ? "Submitting..." : "Submit Request"}</span>
                            <span className="material-symbols-outlined text-xl md:text-2xl">send</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
