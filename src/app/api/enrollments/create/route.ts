import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema for enrollment creation
const createEnrollmentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseIds: z.array(z.string()).min(1, "At least one course ID is required"),
  paymentId: z.string().optional(),
  paymentMethod: z.enum(["stripe", "upi"]).optional(),
  amount: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the input
    const validatedData = createEnrollmentSchema.parse(body)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if courses exist
    const courses = await prisma.course.findMany({
      where: { 
        id: { in: validatedData.courseIds },
        status: 'PUBLISHED'
      },
      select: { id: true, title: true, price: true, trainerId: true }
    })

    if (courses.length !== validatedData.courseIds.length) {
      return NextResponse.json(
        { error: "One or more courses not found or not published" },
        { status: 400 }
      )
    }

    // Check for existing enrollments to prevent duplicates
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: validatedData.userId,
        courseId: { in: validatedData.courseIds }
      },
      select: { courseId: true }
    })

    const existingCourseIds = existingEnrollments.map(e => e.courseId)
    const newCourseIds = validatedData.courseIds.filter(id => !existingCourseIds.includes(id))

    if (newCourseIds.length === 0) {
      return NextResponse.json(
        { error: "User is already enrolled in all specified courses" },
        { status: 400 }
      )
    }

    // Create enrollments for new courses
    const newEnrollments = await Promise.all(
      newCourseIds.map(courseId =>
        prisma.enrollment.create({
          data: {
            studentId: validatedData.userId,
            courseId: courseId,
            status: 'ACTIVE',
            progress: 0,
            enrolledAt: new Date()
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                trainer: {
                  select: { name: true }
                }
              }
            }
          }
        })
      )
    )

    // Create payment record if payment details provided
    if (validatedData.paymentId && validatedData.paymentMethod && validatedData.amount) {
      await prisma.payment.create({
        data: {
          amount: validatedData.amount,
          currency: validatedData.paymentMethod === 'upi' ? 'INR' : 'USD',
          paymentMethod: validatedData.paymentMethod.toUpperCase(),
          status: 'COMPLETED',
          transactionId: validatedData.paymentId,
          studentId: validatedData.userId,
          // Link to the first course (in a real app, you might want a separate OrderItems table)
          courseId: newCourseIds[0]
        }
      })
    }

    // Format response
    const enrolledCourses = newEnrollments.map(enrollment => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      instructor: enrollment.course.trainer.name,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress
    }))

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${newEnrollments.length} course(s)`,
      data: {
        enrollments: enrolledCourses,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        skippedCourses: existingCourseIds.length > 0 ? existingCourseIds : undefined
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Enrollment creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}