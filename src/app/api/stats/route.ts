import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get platform statistics
    const [
      totalStudents,
      totalCourses,
      totalInstructors,
      totalEnrollments
    ] = await Promise.all([
      // Total students (users with STUDENT role)
      db.user.count({
        where: {
          role: 'STUDENT'
        }
      }),
      // Total published courses
      db.course.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      // Total instructors (users with TRAINER role who have published courses)
      db.user.count({
        where: {
          role: 'TRAINER',
          courses: {
            some: {
              status: 'PUBLISHED'
            }
          }
        }
      }),
      // Total enrollments
      db.enrollment.count()
    ])

    // Calculate success rate (completed enrollments / total enrollments)
    const completedEnrollments = await db.enrollment.count({
      where: {
        status: 'COMPLETED'
      }
    })
    
    const successRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0

    const stats = [
      {
        icon: 'Users',
        label: 'Active Students',
        value: totalStudents > 1000 ? `${Math.round(totalStudents / 1000)}K+` : totalStudents.toString(),
        color: 'text-blue-600'
      },
      {
        icon: 'BookOpen',
        label: 'Courses Available',
        value: totalCourses > 100 ? `${Math.round(totalCourses / 100)}00+` : totalCourses.toString(),
        color: 'text-green-600'
      },
      {
        icon: 'Award',
        label: 'Expert Instructors',
        value: totalInstructors > 100 ? `${Math.round(totalInstructors / 100)}00+` : totalInstructors.toString(),
        color: 'text-purple-600'
      },
      {
        icon: 'TrendingUp',
        label: 'Success Rate',
        value: `${successRate}%`,
        color: 'text-orange-600'
      }
    ]

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}