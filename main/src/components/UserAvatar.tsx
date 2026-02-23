import React from 'react';

interface UserAvatarProps {
    name: string;
    className?: string; // Allow custom styling like size and margins
}

export default function UserAvatar({ name, className = "w-10 h-10 text-base" }: UserAvatarProps) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    // A simple hash function to assign a consistent gradient based on the name
    const hash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

    const gradients = [
        "bg-gradient-to-br from-blue-400 to-blue-600",
        "bg-gradient-to-br from-violet-400 to-violet-600",
        "bg-gradient-to-br from-indigo-400 to-emerald-500",
        "bg-gradient-to-br from-pink-400 to-rose-600",
        "bg-gradient-to-br from-amber-400 to-orange-500",
        "bg-gradient-to-br from-teal-400 to-cyan-500",
    ];

    const bgClass = gradients[hash % gradients.length];

    return (
        <div className={`flex flex-col items-center justify-center font-bold text-white rounded-full shadow-sm select-none ${bgClass} ${className}`}>
            {initial}
        </div>
    );
}
