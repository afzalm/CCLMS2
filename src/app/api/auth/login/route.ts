import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // In a real application, you would:
    // 1. Check if the user exists in the database
    // 2. Verify the password (using bcrypt or similar)
    // 3. Generate a JWT token
    // 4. Return the token and user data
    
    // Mock authentication logic
    const mockUsers = [
      {
        id: "1",
        email: "student@example.com",
        name: "John Student",
        role: "STUDENT",
        avatar: "/api/placeholder/100/100"
      },
      {
        id: "2",
        email: "instructor@example.com",
        name: "Jane Instructor",
        role: "INSTRUCTOR",
        avatar: "/api/placeholder/100/100"
      },
      {
        id: "3",
        email: "admin@example.com",
        name: "Admin User",
        role: "ADMIN",
        avatar: "/api/placeholder/100/100"
      }
    ]
    
    const user = mockUsers.find(u => u.email === validatedData.email)
    
    if (!user || validatedData.password !== "password") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // In a real app, you would generate and return a JWT token here
    const token = "mock-jwt-token-" + user.id
    
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}