// app/auth/callback/AuthCallbackClient.tsx
'use client'; // ¡IMPORTANTE! Marca este componente como Client Component

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

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ useSearchParams ahora está dentro de un Client Component

  useEffect(() => {
    const firebaseToken = searchParams.get('token');

    if (!firebaseToken) {
      console.error("Callback llamado sin token. Redirigiendo al login.");
      window.location.href = 'https://login.tssw.cl';
      return;
    }

    const verifyAndLogin = async (token: string) => {
      try {
        const response = await fetch('https://api-inventario.tssw.cl/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`La validación del token falló. Status: ${response.status}. Mensaje: ${errorData}`);
        }

        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        router.replace('/admin/inicio');

      } catch (error) {
        console.error("Error durante la autenticación:", error);
        router.replace('/auth/error?message=' + encodeURIComponent(String(error)));
      }
    };

    verifyAndLogin(firebaseToken);

  }, [searchParams, router]); // Dependencias del efecto

  // Muestra el spinner mientras se procesa el token
  return <LoadingSpinner />;
}
