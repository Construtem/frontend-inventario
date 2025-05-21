// src/app/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  redirect('/admin/inicio'); // Cambia la ruta a la que deseas redirigir
}
// Este componente redirige a la página de inicio del admin
// cuando se accede a la ruta /admin. Esto es útil si deseas que la ruta /admin