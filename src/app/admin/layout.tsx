// src/app/admin/layout.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/admin/sideBar';
import Header from '@/components/admin/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <>
      <Header onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />
      <div
        style={{
          marginLeft: sidebarOpen ? '180px' : '0',
          transition: 'margin-left 0.3s',
          padding: '20px',
        }}
      >
        {children}
      </div>
    </>
  );
}
