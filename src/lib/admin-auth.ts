import { NextRequest } from 'next/server'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'ADMIN'
}

/**
 * Middleware to verify admin access for protected routes
 * Returns admin user if valid, throws error if not authorized
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AdminUser> {
  // Use the same token extraction logic as middleware
  const token = extractTokenFromRequest(request)

  if (!token) {
    throw new Error('Authentication required')
  }

  try {
    // Verify the JWT token
    const decoded = await verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token')
    }

    // Get user from database and verify admin role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.role !== 'ADMIN') {
      throw new Error('Admin access required')
    }

    return user as AdminUser
  } catch (error) {
    throw new Error('Authorization failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

/**
 * Alternative method to check admin role from headers (for when user data is passed)
 */
export function checkAdminRole(request: NextRequest): boolean {
  const userRole = request.headers.get('x-user-role')
  return userRole === 'ADMIN'
}

/**
 * Get admin user from localStorage data passed via headers
 */
export function getAdminFromHeaders(request: NextRequest): AdminUser | null {
  try {
    const userData = request.headers.get('x-user-data')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role === 'ADMIN') {
        return user
      }
    }
    return null
  } catch {
    return null
  }
}