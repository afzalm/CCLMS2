'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          CourseCompass
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/courses" className="hover:underline">
            Courses
          </Link>
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/dashboard/admin" className="hover:underline">
                Admin
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}