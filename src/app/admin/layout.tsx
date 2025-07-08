// Tu archivo de layout actual (ej. /components/admin/AdminLayout.js)
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // O from "next/router"
import Sidebar from "@/components/admin/sideBar";
import Header from "@/components/admin/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuth, setIsAuth] = useState(false); // Estado para saber si está autenticado
  const router = useRouter();

  useEffect(() => {
    // Solo revisa si existe el item 'user' en localStorage
    const user = localStorage.getItem("user");

    if (user) {
      setIsAuth(true); // Si existe, el usuario está autenticado. Puede ver el contenido.
    } else {
      // Si NO existe, redirige al login principal porque no ha pasado por el flujo correcto
      window.location.href = 'https://login.tssw.cl'; // Redirige a la página de login
    }
  }, []); // Se ejecuta solo una vez al cargar el layout

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  // Mientras se verifica, no muestres nada para evitar parpadeos (FOUC)
  if (!isAuth) {
    return null; // O un componente de carga global
  }

  // Si está autenticado, muestra el layout y el contenido de la página
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