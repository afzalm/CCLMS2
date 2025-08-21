'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Enroll() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courseId, setCourseId] = useState('')

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
      }),
    })

    if (res.ok) {
      router.push('/my-courses')
    } else {
      const data = await res.json()
      if (data.error === 'already enrolled') {
        alert('You are already enrolled in this course.')
      } else {
        console.error('Failed to enroll in course')
      }
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Enroll in Course</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="courseId" className="block text-sm font-medium mb-1">
            Course ID
          </label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Enroll
        </button>
      </form>
    </div>
  )
}