'use client';

import React, { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  trainer: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

const CourseApproval = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleApproveReject = async (courseId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: courseId, status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} course`);
      }

      // Remove the course from the local state
      setCourses(courses.filter(course => course.id !== courseId));
      alert(`Course ${status.toLowerCase()} successfully`);
    } catch (err) {
      console.error(`Error ${status.toLowerCase()}ing course:`, err);
      alert(`Failed to ${status.toLowerCase()} course`);
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Course Approval</h1>
      {courses.length === 0 ? (
        <p>No courses pending approval.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Trainer</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.description || 'N/A'}</td>
                <td>{course.trainer.name || course.trainer.email}</td>
                <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleApproveReject(course.id, 'APPROVED')}
                    style={{ marginRight: '10px' }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleApproveReject(course.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CourseApproval;