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

  const { lessonId, watchTime, completed } = await req.json()

  // Check if progress already exists for this lesson and student
  let progress = await prisma.progress.findUnique({
    where: {
      studentId_lessonId: {
        studentId: session.user.id,
        lessonId: lessonId,
      },
    },
  });

  if (progress) {
    // Update existing progress
    progress = await prisma.progress.update({
      where: {
        id: progress.id,
      },
      data: {
        watchTime,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
  } else {
    // Create new progress
    progress = await prisma.progress.create({
      data: {
        studentId: session.user.id,
        lessonId,
        watchTime,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
  }

  return NextResponse.json(progress)
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return new NextResponse(JSON.stringify({ error: 'courseId is required' }), {
      status: 400
    })
  }

  const progress = await prisma.progress.findMany({
    where: {
      studentId: session.user.id,
      lesson: {
        courseId: courseId,
      },
    },
    include: {
      lesson: true,
    },
  })

  return NextResponse.json(progress)
}