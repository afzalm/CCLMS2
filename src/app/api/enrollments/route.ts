import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  const { courseId } = await req.json()

  // Check if the user is already enrolled in the course
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: session.user.id,
        courseId: courseId,
      },
    },
  });

  if (existingEnrollment) {
    return new NextResponse(JSON.stringify({ error: 'already enrolled' }), {
      status: 400
    })
  }

  // Create the enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      student: {
        connect: {
          id: session.user.id
        }
      },
      course: {
        connect: {
          id: courseId
        }
      }
    }
  })

  return NextResponse.json(enrollment)
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: session.user.id
    },
    include: {
      course: true
    }
  })

  return NextResponse.json(enrollments)
}