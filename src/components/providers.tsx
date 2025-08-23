"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}