"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function ProfileScreen() {
    const { token, logout, user } = useAuth();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ phone_number: '', department: '', name: '' });
    const [saving, setSaving] = useState(false);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!token || !user?.role) return;

        const endpoint = isAdmin ? '/api/admins/me' : '/api/students/me';

        fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setUserInfo(data);
                setEditData({
                    phone_number: data.phone_number || '',
                    department: data.department || '',
                    name: data.name || ''
                });
            })
            .catch(console.error);
    }, [token, user?.role, isAdmin]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const endpoint = isAdmin ? '/api/admins/me' : '/api/students/me';
            const payload = isAdmin ? { name: editData.name } : { phone_number: editData.phone_number, department: editData.department };

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setUserInfo({ ...userInfo, ...payload });
                setIsEditing(false);
            } else {
                console.error("Failed to save profile");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const name = userInfo?.name || user?.name || (isAdmin ? "Admin" : "Student");
    const email = userInfo?.email || "N/A";
    const usn = userInfo?.usn || "N/A";
    const phoneNumber = userInfo?.phone_number || "Not set";
    const department = userInfo?.department || "Not set";
    const totalPoints = userInfo?.total_points || 0;
    const completedCount = userInfo?.completed_activities || 0;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header / Avatar Section */}
            <div className="flex flex-col items-center pt-10 md:pt-16 pb-8 px-6 bg-gradient-to-b from-white to-background-light dark:from-[#202020] dark:to-background-dark">
                <div className="relative group">
                    <UserAvatar name={name} className="w-32 h-32 md:w-40 md:h-40 text-5xl md:text-6xl" />
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="absolute bottom-0 right-0 bg-primary text-white p-2 md:p-3 rounded-full shadow-lg hover:scale-105 transition-transform z-10"
                    >
                        <span className="material-symbols-outlined text-[18px] md:text-[22px]">
                            {isEditing ? 'close' : 'edit'}
                        </span>
                    </button>
                </div>
                <div className="mt-4 text-center">
                    {isEditing && isAdmin ? (
                        <input
                            type="text"
                            value={editData.name}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                            className="bg-transparent border-b-2 border-primary focus:outline-none dark:text-white text-2xl md:text-3xl font-bold tracking-tight pb-1text-center mt-2 placeholder-gray-400"
                            placeholder="Enter Name"
                        />
                    ) : (
                        <h1 className="text-primary dark:text-white text-2xl md:text-3xl font-bold tracking-tight">{name}</h1>
                    )}

                    {!isAdmin && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mt-1">{department}</p>
                    )}
                    {isAdmin && (
                        <span className="inline-block bg-black text-white text-xs font-bold px-2 py-1 rounded mt-2 uppercase tracking-wide shadow-sm">Administrator</span>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 px-6 md:px-10 pb-24 space-y-8 max-w-4xl mx-auto w-full ${isAdmin ? 'max-w-xl' : ''}`}>
                <div className={`grid grid-cols-1 ${isAdmin ? '' : 'md:grid-cols-2'} gap-8`}>

                    {/* Info Cards Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg md:text-xl font-bold text-primary dark:text-white mb-4 px-1">Personal Info</h3>

                        {!isAdmin && (
                            <div className="flex items-center p-4 bg-[#F8F9FA] dark:bg-[#2a2a2a] rounded-2xl shadow-sm transition-all hover:shadow-md">
                                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#333] flex items-center justify-center text-primary dark:text-white shadow-sm">
                                    <span className="material-symbols-outlined">badge</span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">USN</p>
                                    <p className="text-sm md:text-base font-semibold text-primary dark:text-white mt-0.5">{usn}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center p-4 bg-[#F8F9FA] dark:bg-[#2a2a2a] rounded-2xl shadow-sm transition-all hover:shadow-md">
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#333] flex items-center justify-center text-primary dark:text-white shadow-sm">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <div className="ml-4 flex-1 overflow-hidden">
                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</p>
                                <p className="text-sm md:text-base font-semibold text-primary dark:text-white mt-0.5 truncate">{email}</p>
                            </div>
                        </div>

                        {!isAdmin && (
                            <>
                                <div className="flex items-center p-4 bg-[#F8F9FA] dark:bg-[#2a2a2a] rounded-2xl shadow-sm transition-all hover:shadow-md">
                                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#333] flex items-center justify-center text-primary dark:text-white shadow-sm">
                                        <span className="material-symbols-outlined">call</span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.phone_number}
                                                onChange={e => setEditData({ ...editData, phone_number: e.target.value })}
                                                className="w-full bg-transparent border-b border-primary focus:outline-none dark:text-white py-1 mt-0.5"
                                                placeholder="Enter phone number"
                                            />
                                        ) : (
                                            <p className="text-sm md:text-base font-semibold text-primary dark:text-white mt-0.5">{phoneNumber}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-[#F8F9FA] dark:bg-[#2a2a2a] rounded-2xl shadow-sm transition-all hover:shadow-md">
                                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#333] flex items-center justify-center text-primary dark:text-white shadow-sm">
                                        <span className="material-symbols-outlined">school</span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.department}
                                                onChange={e => setEditData({ ...editData, department: e.target.value })}
                                                className="w-full bg-transparent border-b border-primary focus:outline-none dark:text-white py-1 mt-0.5"
                                                placeholder="Enter department"
                                            />
                                        ) : (
                                            <p className="text-sm md:text-base font-semibold text-primary dark:text-white mt-0.5">{department}</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Activity Stats & Actions Section (Students Only) */}
                    <div className="space-y-4">
                        {!isAdmin && (
                            <>
                                <h3 className="text-lg md:text-xl font-bold text-primary dark:text-white mb-4 px-1">Activity Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary text-white rounded-2xl p-5 md:p-6 flex flex-col justify-between h-32 md:h-40 relative overflow-hidden shadow-soft group">
                                        <div className="absolute -right-4 -top-4 w-20 h-20 md:w-28 md:h-28 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                                        <span className="material-symbols-outlined text-white/80 text-2xl md:text-3xl relative z-10">star</span>
                                        <div className="relative z-10">
                                            <p className="text-4xl md:text-5xl font-bold tracking-tight">{totalPoints}</p>
                                            <p className="text-xs md:text-sm font-medium text-white/70 mt-1">Total Points</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#F8F9FA] dark:bg-[#2a2a2a] text-primary dark:text-white rounded-2xl p-5 md:p-6 flex flex-col justify-between h-32 md:h-40 shadow-soft border border-slate-100 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-slate-400 text-2xl md:text-3xl">assignment_turned_in</span>
                                        <div>
                                            <p className="text-4xl md:text-5xl font-bold tracking-tight">{completedCount}</p>
                                            <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Activities Completed</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={`flex flex-col gap-4 ${isAdmin ? 'pt-2' : 'pt-6 md:pt-10'}`}>
                            {isEditing ? (
                                <button disabled={saving} onClick={handleSave} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 md:py-5 rounded-xl md:rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-[0.98]">
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="w-full bg-primary hover:bg-gray-900 text-white font-semibold py-4 md:py-5 rounded-xl md:rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-[0.98]">
                                    Edit Profile
                                </button>
                            )}
                            <button onClick={logout} className="w-full text-slate-500 dark:text-slate-400 font-medium py-2 md:py-3 text-sm md:text-base hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer">
                                Logout
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
