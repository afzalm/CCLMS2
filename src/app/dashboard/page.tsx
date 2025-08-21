'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    createdAt: string;
  }
  
  interface Enrollment {
    id: string;
    courseId: string;
    studentId: string;
    createdAt: string;
    course: Course;
  }
  
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Redirect based on user role
    if (session?.user?.role === "ADMIN") {
      router.push("/dashboard/admin")
      return
    } else if (session?.user?.role === "TRAINER") {
      router.push("/dashboard/trainer")
      return
    } else if (session?.user?.role === "STUDENT") {
      // Continue with student dashboard
      // Fetch courses and enrollments
      const fetchData = async () => {
        try {
          const coursesRes = await fetch("/api/courses")
          const coursesData = await coursesRes.json()
          setCourses(coursesData)

          const enrollmentsRes = await fetch("/api/enrollments")
          const enrollmentsData = await enrollmentsRes.json()
          setEnrollments(enrollmentsData)
        } catch (error) {
          console.error("Failed to fetch data:", error)
        }
      }

      fetchData()
    } else {
      // Unknown role
      router.push("/unauthorized")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  // Only render student dashboard content if the user is a student
  if (session?.user?.role !== "STUDENT") {
    return <div>Redirecting...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">My Enrollments</h2>
          {enrollments.length > 0 ? (
            <ul className="space-y-2">
              {enrollments.map((enrollment: Enrollment) => (
                <li key={enrollment.id} className="border-b pb-2">
                  <h3 className="font-medium">{enrollment.course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Enrolled on: {new Date(enrollment.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => router.push(`/courses/${enrollment.course.id}`)}
                    className="mt-2 text-primary hover:underline"
                  >
                    View Course
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not enrolled in any courses yet.</p>
          )}
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Browse Courses</h2>
          {courses.length > 0 ? (
            <ul className="space-y-2">
              {courses.map((course: Course) => (
                <li key={course.id} className="border-b pb-2">
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                  <p className="text-sm">Price: ${course.price}</p>
                  <button
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="mt-2 text-primary hover:underline"
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}