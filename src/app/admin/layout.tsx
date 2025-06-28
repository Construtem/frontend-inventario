"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/admin/sideBar";
import Header from "@/components/admin/header";
import { useSearchParams } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userReady, setUserReady] = useState(false); // ✅
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasUser = localStorage.getItem("user");

    if (!hasUser) {
      const name = searchParams.get("name");
      const email = searchParams.get("email");
      const photoURL = searchParams.get("photoURL");
      const rol = searchParams.get("rol");

      if (name && email && rol) {
        const userData = { name, email, photoURL, rol };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ Usuario guardado en localStorage:", userData);
      }
    } else {
      console.log("👀 Usuario ya en localStorage:", hasUser);
    }

    setUserReady(true); // ✅ cuando termina de revisar
  }, [searchParams]);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  if (!userReady) return null; // ⏳ espera a que cargue

  return (
    <>
      <Header onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />
      <div
        style={{
          marginLeft: sidebarOpen ? "180px" : "0",
          transition: "margin-left 0.3s",
          padding: "20px",
        }}
      >
        {children}
      </div>
    </>
  );
}
