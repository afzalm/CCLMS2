import { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface InstructorUser {
  id: string
  email: string
  name: string
  role: 'TRAINER' | 'ADMIN'
}

/**
 * Middleware to verify instructor access for protected routes
 * Returns instructor user if valid, throws error if not authorized
 */
export async function verifyInstructorAccess(request: NextRequest): Promise<InstructorUser> {
  // Check for Authorization header first
  const authHeader = request.headers.get('authorization')
  let token = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    // Fallback to cookie-based auth
    token = request.cookies.get('token')?.value
  }

  if (!token) {
    throw new Error('Authentication required')
  }

  try {
    // Verify the JWT token
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token')
    }

    // Get user from database and verify instructor role
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

    if (user.role !== 'TRAINER' && user.role !== 'ADMIN') {
      throw new Error('Instructor access required')
    }

    return user as InstructorUser
  } catch (error) {
    throw new Error('Authorization failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}