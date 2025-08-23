/**
 * Test utility for debugging enrollment and purchase flow
 * This file helps simulate and test the course purchase process
 */

// Test function to simulate a successful course purchase
export async function simulateCoursePurchase(userId: string, courseIds: string[], paymentMethod: 'stripe' | 'upi' = 'stripe') {
  console.log('🧪 Simulating course purchase...', { userId, courseIds, paymentMethod })
  
  try {
    // Simulate enrollment creation
    const enrollmentResponse = await fetch('/api/enrollments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        courseIds: courseIds,
        paymentId: `test_${paymentMethod}_${Date.now()}`,
        paymentMethod: paymentMethod,
        amount: paymentMethod === 'upi' ? 8300 : 99.99 // Example amounts
      })
    })

    const enrollmentData = await enrollmentResponse.json()
    
    if (enrollmentResponse.ok) {
      console.log('✅ Enrollment successful:', enrollmentData)
      return {
        success: true,
        data: enrollmentData,
        message: 'Course purchase simulated successfully'
      }
    } else {
      console.error('❌ Enrollment failed:', enrollmentData)
      return {
        success: false,
        error: enrollmentData,
        message: 'Course purchase simulation failed'
      }
    }
  } catch (error) {
    console.error('❌ Enrollment error:', error)
    return {
      success: false,
      error: error,
      message: 'Course purchase simulation threw an error'
    }
  }
}

// Test function to verify student dashboard shows enrolled courses
export async function verifyStudentDashboard(userId: string) {
  console.log('🔍 Verifying student dashboard for user:', userId)
  
  try {
    const response = await fetch(`/api/student/dashboard?userId=${userId}`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Dashboard data retrieved:', {
        enrolledCourses: data.data.enrolledCourses.length,
        stats: data.data.stats,
        courses: data.data.enrolledCourses.map((c: any) => ({ id: c.id, title: c.title, progress: c.progress }))
      })
      return {
        success: true,
        data: data.data,
        message: 'Dashboard verification successful'
      }
    } else {
      console.error('❌ Dashboard verification failed:', data)
      return {
        success: false,
        error: data,
        message: 'Dashboard verification failed'
      }
    }
  } catch (error) {
    console.error('❌ Dashboard verification error:', error)
    return {
      success: false,
      error: error,
      message: 'Dashboard verification threw an error'
    }
  }
}

// Test function to check if courses are properly published and available
export async function verifyCourseAvailability(courseIds: string[]) {
  console.log('📚 Verifying course availability:', courseIds)
  
  try {
    const response = await fetch('/api/courses')
    const courses = await response.json()
    
    if (response.ok) {
      const availableCourses = courses.filter((course: any) => 
        courseIds.includes(course.id) && course.status === 'PUBLISHED'
      )
      
      console.log('✅ Available courses:', availableCourses.map((c: any) => ({ id: c.id, title: c.title, status: c.status })))
      return {
        success: true,
        availableCourses,
        message: `${availableCourses.length}/${courseIds.length} courses are available`
      }
    } else {
      console.error('❌ Course availability check failed:', courses)
      return {
        success: false,
        error: courses,
        message: 'Course availability check failed'
      }
    }
  } catch (error) {
    console.error('❌ Course availability error:', error)
    return {
      success: false,
      error: error,
      message: 'Course availability check threw an error'
    }
  }
}

// Complete test workflow
export async function testCompleteEnrollmentFlow(userId: string, courseIds: string[]) {
  console.log('🚀 Starting complete enrollment flow test...')
  
  // Step 1: Verify courses are available
  const courseCheck = await verifyCourseAvailability(courseIds)
  if (!courseCheck.success) {
    return { success: false, step: 'course_availability', error: courseCheck }
  }
  
  // Step 2: Simulate purchase
  const purchaseResult = await simulateCoursePurchase(userId, courseIds)
  if (!purchaseResult.success) {
    return { success: false, step: 'purchase_simulation', error: purchaseResult }
  }
  
  // Step 3: Verify dashboard shows enrolled courses
  const dashboardCheck = await verifyStudentDashboard(userId)
  if (!dashboardCheck.success) {
    return { success: false, step: 'dashboard_verification', error: dashboardCheck }
  }
  
  console.log('🎉 Complete enrollment flow test PASSED!')
  return {
    success: true,
    message: 'Complete enrollment flow test passed',
    results: {
      courseCheck,
      purchaseResult,
      dashboardCheck
    }
  }
}

// Helper function to get test user ID
export function getTestUserId(): string | null {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        return user.id
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }
  }
  return null
}

// Browser console helper - allows testing from browser console
if (typeof window !== 'undefined') {
  (window as any).testEnrollment = {
    simulateCoursePurchase,
    verifyStudentDashboard,
    verifyCourseAvailability,
    testCompleteEnrollmentFlow,
    getTestUserId,
    
    // Quick test with example data
    quickTest: async () => {
      const userId = getTestUserId()
      if (!userId) {
        console.error('❌ No user found in localStorage. Please log in first.')
        return
      }
      
      // Use first available course for testing
      const courseIds = ['1'] // You can adjust this to match actual course IDs
      
      return await testCompleteEnrollmentFlow(userId, courseIds)
    }
  }
  
  console.log('🔧 Enrollment test utilities loaded. Use window.testEnrollment.quickTest() to run a quick test.')
}