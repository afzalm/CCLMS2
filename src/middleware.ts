import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/jwt'

// Define protected routes patterns
const protectedRoutes = [
  '/admin',
  '/instructor',
  '/learn',
  '/profile',
  '/api/courses/create',
  '/api/courses/draft',
  '/api/instructor',
  '/api/profile',
  '/api/student'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/courses',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/courses',
  '/api/categories',
  '/api/featured-courses',
  '/api/stats',
  '/api/health'
]

// Define role-based route access
const roleBasedRoutes = {
  '/admin': ['ADMIN'],
  '/instructor': ['TRAINER', 'ADMIN'],
  '/api/instructor': ['TRAINER', 'ADMIN'],
  '/learn': ['STUDENT', 'TRAINER', 'ADMIN'],
  '/api/student': ['STUDENT', 'TRAINER', 'ADMIN']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Extract and verify token
  const token = extractTokenFromRequest(request)
  
  if (!token) {
    // Redirect to login for browser requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Return 401 for API requests
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Verify token
  const payload = await verifyAccessToken(token)
  
  if (!payload) {
    // Token is invalid, clear cookies and redirect/respond accordingly
    const response = request.headers.get('accept')?.includes('text/html')
      ? NextResponse.redirect(new URL('/auth/login', request.url))
      : NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    
    // Clear auth cookies
    response.cookies.delete('auth-token')
    response.cookies.delete('refresh-token')
    
    return response
  }

  // Check role-based access
  const requiredRoles = Object.entries(roleBasedRoutes).find(([route]) => 
    pathname === route || pathname.startsWith(route + '/')
  )?.[1]

  if (requiredRoles && !requiredRoles.includes(payload.role)) {
    // Insufficient permissions
    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  // Add user info to request headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}