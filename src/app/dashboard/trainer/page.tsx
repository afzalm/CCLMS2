'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function TrainerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    trainerId: string;
  }
  
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user?.role !== "TRAINER") {
      router.push("/unauthorized")
      return
    }

    // Fetch courses for the trainer
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses")
        const data = await res.json()
        // Filter courses by trainer ID
        const trainerCourses = data.filter((course: Course) => course.trainerId === session.user.id)
        setCourses(trainerCourses)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      }
    }

    fetchCourses()
  }, [session, status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trainer Dashboard</h1>
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/trainer/create-course")}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Create New Course
        </button>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        {courses.length > 0 ? (
          <ul className="space-y-2">
            {courses.map((course: Course) => (
              <li key={course.id} className="border-b pb-2">
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.description}</p>
                <p className="text-sm">Price: ${course.price}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/trainer/courses/${course.id}/students`)}
                    className="text-primary hover:underline"
                  >
                    Manage Students
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/trainer/courses/${course.id}/analytics`)}
                    className="text-primary hover:underline"
                  >
                    View Analytics
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not created any courses yet.</p>
        )}
      </div>
    </div>
  )
}