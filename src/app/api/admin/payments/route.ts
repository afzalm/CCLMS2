import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'forbidden' }), {
      status: 403
    })
  }

  try {
    // Fetch all payments with related data
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to fetch payments' }), {
      status: 500
    })
  }
}