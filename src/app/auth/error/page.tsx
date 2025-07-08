// app/auth/error/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Ha ocurrido un error desconocido.";

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#b91c1c" }}>
        ❌ Error de autenticación
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#374151" }}>{decodeURIComponent(message)}</p>
    </div>
  );
}
