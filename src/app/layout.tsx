// src/app/layout.tsx

export const metadata = {
  title: 'Mi App',
  description: 'Dashboard admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
}
