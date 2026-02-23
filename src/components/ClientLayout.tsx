"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname?.startsWith('/auth/') || pathname === '/register';

    return (
        <div className="flex min-h-screen">
            <Navigation />
            <main className={`flex-1 overflow-x-hidden pb-20 md:pb-0 ${isAuthPage ? '' : 'md:ml-64'}`}>
                {children}
            </main>
        </div>
    );
}
