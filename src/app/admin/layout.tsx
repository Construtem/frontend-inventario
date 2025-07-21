"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/admin/sideBar";
import Header from "@/components/admin/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const frontLoginUrl = process.env.NEXT_PUBLIC_FRONT_LOGIN || "https://login.tssw.cl";

  // Cambiar este flag a true para desarrollo local
  const isDevelopment = true;

  useEffect(() => {
    if (isDevelopment) {
      // ---------------- MODO DESARROLLO LOCAL ----------------
      if (!localStorage.getItem("user")) {
        const mockUser = {
          uid: "123456",
          nombre: "Usuario Ficticio",
          correo: "prueba@utem.cl",
          rol: "Administrador",
        };

        localStorage.setItem("user", JSON.stringify(mockUser));
        console.log("✅ Usuario ficticio guardado en localStorage");
      }
      setIsAuth(true);
    } else {
      // ---------------- MODO PRODUCCIÓN ----------------
      const user = localStorage.getItem("user");
      if (user) {
        setIsAuth(true);
      } else {
        window.location.href = frontLoginUrl;
      }
    }
  }, [frontLoginUrl, isDevelopment]);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  // Mientras se verifica la autenticación
  if (!isAuth) {
    return null; // o un componente tipo loading spinner
  }

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
