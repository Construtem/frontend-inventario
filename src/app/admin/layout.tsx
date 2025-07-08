"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/admin/sideBar";
import Header from "@/components/admin/header";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userReady, setUserReady] = useState(false); // ✅

  useEffect(() => {
    const hasUser = localStorage.getItem("user");

    if (!hasUser) {
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get("name");
      const email = urlParams.get("email");
      const photoURL = urlParams.get("photoURL");
      const rol = urlParams.get("rol");

      if (name && email && rol) {
        const userData = { name, email, photoURL, rol };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ Usuario guardado en localStorage:", userData);
      }
    } else {
      console.log("👀 Usuario ya en localStorage:", hasUser);
    }
    setUserReady(true); // ✅ cuando termina de revisar
  }, []);

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
