import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Comprehensive error handling for file upload operations
 */

export interface UploadError {
  code: string
  message: string
  details?: any
  statusCode: number
  userMessage: string
}

export const ERROR_CODES = {
  // Validation Errors
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_NAME: 'INVALID_FILE_NAME',
  MISSING_FILE: 'MISSING_FILE',
  INVALID_REQUEST_DATA: 'INVALID_REQUEST_DATA',
  
  // Security Errors
  MALICIOUS_FILE_DETECTED: 'MALICIOUS_FILE_DETECTED',
  PATH_TRAVERSAL_ATTEMPT: 'PATH_TRAVERSAL_ATTEMPT',
  VIRUS_DETECTED: 'VIRUS_DETECTED',
  SECURITY_SCAN_FAILED: 'SECURITY_SCAN_FAILED',
  
  // Authentication/Authorization Errors
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // System Errors
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  DISK_SPACE_FULL: 'DISK_SPACE_FULL',
  DIRECTORY_NOT_WRITABLE: 'DIRECTORY_NOT_WRITABLE',
  FILE_ALREADY_EXISTS: 'FILE_ALREADY_EXISTS',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_FILES: 'TOO_MANY_FILES',
  CONCURRENT_UPLOAD_LIMIT: 'CONCURRENT_UPLOAD_LIMIT',
  
  // Network/Upload Errors
  UPLOAD_INTERRUPTED: 'UPLOAD_INTERRUPTED',
  CORRUPTION_DETECTED: 'CORRUPTION_DETECTED',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

/**
 * Create standardized upload error
 */
export function createUploadError(
  code: keyof typeof ERROR_CODES,
  message: string,
  details?: any,
  statusCode: number = 400
): UploadError {
  const userMessages: Record<string, string> = {
    [ERROR_CODES.INVALID_FILE_TYPE]: 'Please select a valid file type. Check the allowed file formats.',
    [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Please select a smaller file.',
    [ERROR_CODES.INVALID_FILE_NAME]: 'Invalid file name. Please rename your file and try again.',
    [ERROR_CODES.MISSING_FILE]: 'No file was selected. Please choose a file to upload.',
    [ERROR_CODES.INVALID_REQUEST_DATA]: 'Invalid request. Please check your input and try again.',
    
    [ERROR_CODES.MALICIOUS_FILE_DETECTED]: 'File blocked for security reasons. Please contact support if this is an error.',
    [ERROR_CODES.PATH_TRAVERSAL_ATTEMPT]: 'File blocked for security reasons.',
    [ERROR_CODES.VIRUS_DETECTED]: 'File blocked: potential security threat detected.',
    [ERROR_CODES.SECURITY_SCAN_FAILED]: 'File upload failed security checks. Please try again.',
    
    [ERROR_CODES.AUTHENTICATION_REQUIRED]: 'Please log in to upload files.',
    [ERROR_CODES.INVALID_TOKEN]: 'Session expired. Please log in again.',
    [ERROR_CODES.UNAUTHORIZED_ACCESS]: 'You do not have permission to perform this action.',
    [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation.',
    
    [ERROR_CODES.STORAGE_ERROR]: 'File storage error. Please try again later.',
    [ERROR_CODES.DATABASE_ERROR]: 'Database error. Please try again later.',
    [ERROR_CODES.DISK_SPACE_FULL]: 'Server storage is full. Please contact support.',
    [ERROR_CODES.DIRECTORY_NOT_WRITABLE]: 'Storage directory error. Please contact support.',
    [ERROR_CODES.FILE_ALREADY_EXISTS]: 'A file with this name already exists.',
    
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many upload attempts. Please wait before trying again.',
    [ERROR_CODES.TOO_MANY_FILES]: 'Too many files selected. Please upload fewer files at once.',
    [ERROR_CODES.CONCURRENT_UPLOAD_LIMIT]: 'Too many concurrent uploads. Please wait for current uploads to complete.',
    
    [ERROR_CODES.UPLOAD_INTERRUPTED]: 'Upload was interrupted. Please try again.',
    [ERROR_CODES.CORRUPTION_DETECTED]: 'File appears to be corrupted. Please try uploading again.',
    [ERROR_CODES.TIMEOUT_ERROR]: 'Upload timed out. Please try again with a smaller file.',
    
    [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.'
  }

  return {
    code,
    message,
    details,
    statusCode,
    userMessage: userMessages[code] || userMessages[ERROR_CODES.UNKNOWN_ERROR]
  }
}

/**
 * Handle and format errors for API responses
 */
export function handleUploadError(error: unknown): NextResponse {
  console.error('Upload error:', error)

  let uploadError: UploadError

  if (error instanceof ZodError) {
    uploadError = createUploadError(
      ERROR_CODES.INVALID_REQUEST_DATA,
      'Validation failed',
      error.errors.map(e => e.message),
      400
    )
  } else if (error instanceof Error) {
    // Parse specific error messages
    if (error.message.includes('Authentication required') || 
        error.message.includes('Unauthorized')) {
      uploadError = createUploadError(
        ERROR_CODES.AUTHENTICATION_REQUIRED,
        error.message,
        undefined,
        401
      )
    } else if (error.message.includes('Permission denied') || 
               error.message.includes('Insufficient permissions')) {
      uploadError = createUploadError(
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        error.message,
        undefined,
        403
      )
    } else if (error.message.includes('File too large')) {
      uploadError = createUploadError(
        ERROR_CODES.FILE_TOO_LARGE,
        error.message,
        undefined,
        413
      )
    } else if (error.message.includes('Invalid file type')) {
      uploadError = createUploadError(
        ERROR_CODES.INVALID_FILE_TYPE,
        error.message,
        undefined,
        400
      )
    } else if (error.message.includes('Malicious file') || 
               error.message.includes('Security scan failed')) {
      uploadError = createUploadError(
        ERROR_CODES.MALICIOUS_FILE_DETECTED,
        error.message,
        undefined,
        400
      )
    } else if (error.message.includes('Path traversal') || 
               error.message.includes('Invalid path')) {
      uploadError = createUploadError(
        ERROR_CODES.PATH_TRAVERSAL_ATTEMPT,
        error.message,
        undefined,
        400
      )
    } else if (error.message.includes('Storage') || 
               error.message.includes('Failed to save')) {
      uploadError = createUploadError(
        ERROR_CODES.STORAGE_ERROR,
        error.message,
        undefined,
        500
      )
    } else if (error.message.includes('Database') || 
               error.message.includes('Prisma')) {
      uploadError = createUploadError(
        ERROR_CODES.DATABASE_ERROR,
        error.message,
        undefined,
        500
      )
    } else if (error.message.includes('ENOSPC') || 
               error.message.includes('No space left')) {
      uploadError = createUploadError(
        ERROR_CODES.DISK_SPACE_FULL,
        error.message,
        undefined,
        507
      )
    } else if (error.message.includes('EACCES') || 
               error.message.includes('Permission denied')) {
      uploadError = createUploadError(
        ERROR_CODES.DIRECTORY_NOT_WRITABLE,
        error.message,
        undefined,
        500
      )
    } else if (error.message.includes('File already exists')) {
      uploadError = createUploadError(
        ERROR_CODES.FILE_ALREADY_EXISTS,
        error.message,
        undefined,
        409
      )
    } else if (error.message.includes('timeout') || 
               error.message.includes('ETIMEDOUT')) {
      uploadError = createUploadError(
        ERROR_CODES.TIMEOUT_ERROR,
        error.message,
        undefined,
        408
      )
    } else {
      uploadError = createUploadError(
        ERROR_CODES.UNKNOWN_ERROR,
        error.message,
        undefined,
        500
      )
    }
  } else {
    uploadError = createUploadError(
      ERROR_CODES.UNKNOWN_ERROR,
      'An unknown error occurred',
      error,
      500
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: uploadError.userMessage,
      code: uploadError.code,
      details: process.env.NODE_ENV === 'development' ? uploadError.details : undefined
    },
    { status: uploadError.statusCode }
  )
}

/**
 * Validate request size and rate limiting
 */
export function validateUploadLimits(
  fileCount: number,
  totalSize: number,
  maxFiles: number = 5,
  maxTotalSize: number = 100 * 1024 * 1024 // 100MB
): UploadError | null {
  if (fileCount > maxFiles) {
    return createUploadError(
      ERROR_CODES.TOO_MANY_FILES,
      `Too many files: ${fileCount}. Maximum allowed: ${maxFiles}`,
      { fileCount, maxFiles },
      400
    )
  }

  if (totalSize > maxTotalSize) {
    return createUploadError(
      ERROR_CODES.FILE_TOO_LARGE,
      `Total file size too large: ${formatBytes(totalSize)}. Maximum allowed: ${formatBytes(maxTotalSize)}`,
      { totalSize, maxTotalSize },
      413
    )
  }

  return null
}

/**
 * Rate limiting for uploads (simple in-memory implementation)
 */
const uploadAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(
  clientId: string,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): UploadError | null {
  const now = Date.now()
  const clientAttempts = uploadAttempts.get(clientId)

  if (!clientAttempts) {
    uploadAttempts.set(clientId, { count: 1, lastAttempt: now })
    return null
  }

  // Reset if window has passed
  if (now - clientAttempts.lastAttempt > windowMs) {
    uploadAttempts.set(clientId, { count: 1, lastAttempt: now })
    return null
  }

  // Check if limit exceeded
  if (clientAttempts.count >= maxAttempts) {
    return createUploadError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded: ${clientAttempts.count} attempts in ${windowMs}ms`,
      { attempts: clientAttempts.count, windowMs },
      429
    )
  }

  // Increment counter
  clientAttempts.count++
  clientAttempts.lastAttempt = now
  uploadAttempts.set(clientId, clientAttempts)

  return null
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(1)} ${sizes[i]}`
}

/**
 * Sanitize error details for logging
 */
export function sanitizeErrorForLogging(error: any): any {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    // Remove sensitive information
    const sanitized = { ...error }
    delete sanitized.password
    delete sanitized.token
    delete sanitized.authorization
    return sanitized
  }
  
  return error
}

/**
 * Log upload errors for monitoring
 */
export function logUploadError(
  operation: string,
  error: unknown,
  context?: { userId?: string; fileName?: string; fileSize?: number }
): void {
  const sanitizedError = sanitizeErrorForLogging(error)
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    error: sanitizedError,
    context
  }
  
  console.error('Upload Error:', JSON.stringify(logEntry, null, 2))
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service (e.g., Sentry, LogRocket, etc.)
  }
}