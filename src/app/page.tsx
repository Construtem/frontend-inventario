// src/app/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  redirect('/auth/login'); // Redirige a la vista de logeo, si se quiere cambiar la vista a vendendor se coloca 

  //advocate/inicio
}
// Este componente redirige a la página de inicio del admin
// cuando se accede a la ruta /admin. Esto es útil si deseas que la ruta /admin