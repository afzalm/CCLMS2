'use client'

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicSessionProvider = dynamic(() => import('next-auth/react').then(mod => mod.SessionProvider), {
  ssr: false,
});

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DynamicSessionProvider>
      {children}
    </DynamicSessionProvider>
  )
}