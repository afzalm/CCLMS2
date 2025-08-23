import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

// Convert secrets to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET)
const refreshSecretKey = new TextEncoder().encode(JWT_REFRESH_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Convert time string to seconds
 */
function parseTimeToSeconds(timeString: string): number {
  const unit = timeString.slice(-1)
  const value = parseInt(timeString.slice(0, -1))
  
  switch (unit) {
    case 'h': return value * 3600
    case 'd': return value * 86400
    case 'm': return value * 60
    case 's': return value
    default: return 3600 // default 1 hour
  }
}

/**
 * Generate JWT access and refresh tokens
 */
export async function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<TokenPair> {
  const accessTokenExpiry = Math.floor(Date.now() / 1000) + parseTimeToSeconds(JWT_EXPIRES_IN)
  const refreshTokenExpiry = Math.floor(Date.now() / 1000) + parseTimeToSeconds(JWT_REFRESH_EXPIRES_IN)

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpiry)
    .sign(secretKey)

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpiry)
    .sign(refreshSecretKey)

  return { accessToken, refreshToken }
}

/**
 * Verify JWT access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as JWTPayload
  } catch (error) {
    console.error('Access token verification failed:', error)
    return null
  }
}

/**
 * Verify JWT refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecretKey)
    return payload as JWTPayload
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

/**
 * Extract token from request headers or cookies
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookies
  const tokenFromCookie = request.cookies.get('auth-token')?.value
  if (tokenFromCookie) {
    return tokenFromCookie
  }

  return null
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate secure random string for token blacklisting
 */
export function generateTokenId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Cookie configuration for secure token storage
 */
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

/**
 * Validate environment variables
 */
export function validateAuthEnvironment(): void {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long')
  }
}