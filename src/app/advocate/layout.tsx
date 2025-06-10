'use client';
import { useState } from "react";
import Sidebar from "@/components/advocate/sideBar";
import Header from "@/components/advocate/header";

export default function AdvocateLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    return (
        <div className="flex h-screen">
            <Sidebar open={sidebarOpen}/>
            <div className="flex flex-col flex-1 relative">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 pt-[80px] px-8 py-6 overflow-y-auto bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}