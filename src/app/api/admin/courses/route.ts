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
    // Fetch courses that are pending approval (status = 'PENDING')
    const courses = await prisma.course.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to fetch courses' }), {
      status: 500
    })
  }
}

export async function PUT(req: Request) {
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
    const { id, status } = await req.json()
    
    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return new NextResponse(JSON.stringify({ error: 'invalid status' }), {
        status: 400
      })
    }
    
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { 
        status,
        publishedAt: status === 'APPROVED' ? new Date() : null
      }
    })
    
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to update course' }), {
      status: 500
    })
  }
}