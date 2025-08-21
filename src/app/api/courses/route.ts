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

  const { title, description, price, category, level } = await req.json()

  const course = await prisma.course.create({
    data: {
      title,
      description,
      price,
      category,
      level,
      trainer: {
        connect: {
          id: session.user.id
        }
      }
    }
  })

  return NextResponse.json(course)
}

export async function GET() {
  const courses = await prisma.course.findMany()
  return NextResponse.json(courses)
}