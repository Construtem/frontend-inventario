// app/auth/callback/page.tsx
// Este es un Server Component por defecto, ya no necesita "use client" aquí.

import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient'; // Importa el nuevo componente cliente

export default function AuthCallbackPage() {
  return (
    // Envuelve el componente cliente que usa useSearchParams en Suspense
    // El 'fallback' se mostrará mientras el componente cliente se hidrata
    <Suspense fallback={
      // Puedes usar aquí el mismo LoadingSpinner o un mensaje simple
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando autenticación...</p>
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  );
}
