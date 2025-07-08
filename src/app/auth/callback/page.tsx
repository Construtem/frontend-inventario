// app/auth/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Un componente simple de carga para mostrar mientras se procesa
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>Autenticando, por favor espera...</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);


export default function AuthCallbackPage() {
  const router = useRouter();
  // ✅ Hook para leer los parámetros de la URL de forma segura
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extrae el token usando el hook
    const firebaseToken = searchParams.get('token');

    // 1. Asegurarse de que el token existe
    if (!firebaseToken) {
      console.error("Callback llamado sin token. Redirigiendo al login.");
      // Si no hay token, no debería estar aquí. Redirige fuera.
      // Reemplaza con la URL de tu login principal
      window.location.href = 'https://login.tssw.cl'; 
      return; // Detiene la ejecución del efecto
    }

    const verifyAndLogin = async (token: string) => {
      try {
        // 2. Llama a tu backend de Go para verificarlo
        const response = await fetch('https://api-inventario.tssw.cl/auth/verify', { // 🚨 Asegúrate que la URL y puerto de tu back-inventario sean correctos
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Captura el error del backend para más detalles
          const errorData = await response.text();
          throw new Error(`La validación del token falló. Status: ${response.status}. Mensaje: ${errorData}`);
        }

        const userData = await response.json();

        // 3. Guarda los datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // 4. Redirige a la página principal, limpiando la URL.
        router.replace('/admin/inicio'); // O a la ruta que prefieras

      } catch (error) {
        console.error("Error durante la autenticación:", error);
        // Si algo falla, envía al usuario a una página de error
        router.replace('/auth/error?message=' + encodeURIComponent(String(error)));
      }
    };

    // Llama a la función principal
    verifyAndLogin(firebaseToken);

  }, [searchParams, router]); // El efecto se ejecuta cuando los parámetros o el router estén listos

  // Muestra un mensaje/spinner de carga mientras se procesa el token
  return <LoadingSpinner />;
}