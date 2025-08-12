import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    
    // In a real application, you would:
    // 1. Check if the user already exists
    // 2. Hash the password (using bcrypt or similar)
    // 3. Create the user in the database
    // 4. Generate a JWT token
    // 5. Send a welcome email
    
    // Mock user creation logic
    const existingUser = false // In real app, check database
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: validatedData.name,
      email: validatedData.email,
      role: "STUDENT",
      createdAt: new Date().toISOString()
    }
    
    // In a real app, you would generate and return a JWT token here
    const token = "mock-jwt-token-" + newUser.id
    
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      data: {
        user: newUser,
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
    
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}