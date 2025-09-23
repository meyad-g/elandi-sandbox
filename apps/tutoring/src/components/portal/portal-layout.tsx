'use client';

import { ReactNode } from 'react';

interface PortalLayoutProps {
  children: ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
