import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'image'
  },
  VIDEO: {
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    maxSize: 500 * 1024 * 1024, // 500MB
    category: 'video'
  },
  AVATAR: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    category: 'avatar'
  }
} as const

// Security configurations
export const SECURITY_CONFIG = {
  allowedDirs: ['uploads/avatars', 'uploads/thumbnails', 'uploads/videos'],
  quarantineDir: 'uploads/quarantine',
  tempDir: 'uploads/temp',
  maxFileNameLength: 100,
  maxFilesPerRequest: 5
}

// Upload result interface
export interface UploadResult {
  success: boolean
  filePath?: string
  fileName?: string
  originalName?: string
  size?: number
  mimeType?: string
  error?: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitizedName?: string
}

/**
 * Validate file extension and MIME type
 */
export function validateFileType(
  fileName: string, 
  mimeType: string, 
  allowedConfig: typeof FILE_TYPES[keyof typeof FILE_TYPES]
): ValidationResult {
  const ext = path.extname(fileName).toLowerCase()
  
  // Check extension
  if (!allowedConfig.extensions.includes(ext)) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed: ${allowedConfig.extensions.join(', ')}`
    }
  }
  
  // Check MIME type
  if (!allowedConfig.mimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${allowedConfig.mimeTypes.join(', ')}`
    }
  }
  
  return { isValid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): ValidationResult {
  if (size > maxSize) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${formatBytes(maxSize)}`
    }
  }
  
  return { isValid: true }
}

/**
 * Sanitize and validate file name
 */
export function sanitizeFileName(fileName: string): ValidationResult {
  // Remove any path traversal attempts
  const baseName = path.basename(fileName)
  
  // Check length
  if (baseName.length > SECURITY_CONFIG.maxFileNameLength) {
    return {
      isValid: false,
      error: `File name too long. Maximum: ${SECURITY_CONFIG.maxFileNameLength} characters`
    }
  }
  
  // Remove dangerous characters and replace with safe alternatives
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace dangerous chars with underscore
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/_+/g, '_') // Replace multiple underscores with single underscore
    .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots, underscores, hyphens
  
  if (!sanitized || sanitized.length === 0) {
    return {
      isValid: false,
      error: 'Invalid file name after sanitization'
    }
  }
  
  return {
    isValid: true,
    sanitizedName: sanitized
  }
}

/**
 * Generate secure file name with timestamp and random string
 */
export function generateSecureFileName(originalName: string, userId?: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const userPrefix = userId ? `${userId}_` : ''
  
  return `${userPrefix}${timestamp}_${randomString}${ext}`
}

/**
 * Ensure upload directory exists and is secure
 */
export function ensureUploadDir(dirPath: string): boolean {
  try {
    // Validate directory path
    if (!SECURITY_CONFIG.allowedDirs.some(allowed => dirPath.includes(allowed))) {
      throw new Error('Invalid upload directory')
    }
    
    const fullPath = path.join(process.cwd(), 'public', dirPath)
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 })
    }
    
    // Verify directory permissions
    fs.accessSync(fullPath, fs.constants.R_OK | fs.constants.W_OK)
    
    return true
  } catch (error) {
    console.error('Failed to create/access upload directory:', error)
    return false
  }
}

/**
 * Save file to disk with security measures
 */
export async function saveFileToDisk(
  buffer: Buffer,
  fileName: string,
  dirPath: string
): Promise<UploadResult> {
  try {
    // Ensure directory exists
    if (!ensureUploadDir(dirPath)) {
      return {
        success: false,
        error: 'Failed to create upload directory'
      }
    }
    
    const fullPath = path.join(process.cwd(), 'public', dirPath, fileName)
    
    // Prevent overwriting existing files
    if (fs.existsSync(fullPath)) {
      return {
        success: false,
        error: 'File already exists'
      }
    }
    
    // Write file with proper permissions
    await fs.promises.writeFile(fullPath, buffer, { mode: 0o644 })
    
    // Verify file was written correctly
    const stats = await fs.promises.stat(fullPath)
    if (stats.size !== buffer.length) {
      // Clean up incomplete file
      await fs.promises.unlink(fullPath)
      return {
        success: false,
        error: 'File upload corrupted'
      }
    }
    
    return {
      success: true,
      filePath: `/${dirPath}/${fileName}`,
      fileName,
      size: stats.size
    }
  } catch (error) {
    console.error('File save error:', error)
    return {
      success: false,
      error: 'Failed to save file'
    }
  }
}

/**
 * Delete file from disk
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Validate file path is within allowed directories
    if (!SECURITY_CONFIG.allowedDirs.some(allowed => filePath.includes(allowed))) {
      console.error('Attempt to delete file outside allowed directories:', filePath)
      return false
    }
    
    const fullPath = path.join(process.cwd(), 'public', filePath)
    
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath)
      return true
    }
    
    return false
  } catch (error) {
    console.error('File deletion error:', error)
    return false
  }
}

/**
 * Get file info safely
 */
export async function getFileInfo(filePath: string): Promise<{ exists: boolean; size?: number; mimeType?: string }> {
  try {
    // Validate file path
    if (!SECURITY_CONFIG.allowedDirs.some(allowed => filePath.includes(allowed))) {
      return { exists: false }
    }
    
    const fullPath = path.join(process.cwd(), 'public', filePath)
    
    if (!fs.existsSync(fullPath)) {
      return { exists: false }
    }
    
    const stats = await fs.promises.stat(fullPath)
    const ext = path.extname(filePath).toLowerCase()
    
    // Determine MIME type based on extension
    let mimeType = 'application/octet-stream'
    if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg'
    else if (ext === '.png') mimeType = 'image/png'
    else if (ext === '.webp') mimeType = 'image/webp'
    else if (ext === '.gif') mimeType = 'image/gif'
    else if (ext === '.mp4') mimeType = 'video/mp4'
    else if (ext === '.webm') mimeType = 'video/webm'
    
    return {
      exists: true,
      size: stats.size,
      mimeType
    }
  } catch (error) {
    console.error('File info error:', error)
    return { exists: false }
  }
}

/**
 * Parse multipart form data with security validation
 */
export async function parseMultipartFormData(request: NextRequest): Promise<{
  files: Map<string, { buffer: Buffer; name: string; type: string; size: number }>
  fields: Map<string, string>
  error?: string
}> {
  const files = new Map()
  const fields = new Map()
  
  try {
    const formData = await request.formData()
    let fileCount = 0
    
    for (const [name, value] of formData.entries()) {
      if (value instanceof File) {
        fileCount++
        
        // Check file count limit
        if (fileCount > SECURITY_CONFIG.maxFilesPerRequest) {
          return {
            files,
            fields,
            error: `Too many files. Maximum: ${SECURITY_CONFIG.maxFilesPerRequest}`
          }
        }
        
        // Convert file to buffer
        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        files.set(name, {
          buffer,
          name: value.name,
          type: value.type,
          size: buffer.length
        })
      } else {
        fields.set(name, value.toString())
      }
    }
    
    return { files, fields }
  } catch (error) {
    console.error('Form parsing error:', error)
    return {
      files,
      fields,
      error: 'Failed to parse form data'
    }
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(1)} ${sizes[i]}`
}

/**
 * Validate file against virus scanning (placeholder for future implementation)
 */
export async function scanFileForViruses(buffer: Buffer): Promise<{ isSafe: boolean; reason?: string }> {
  // TODO: Implement actual virus scanning with ClamAV or similar
  // For now, just check for suspicious file headers
  
  const header = buffer.subarray(0, 10).toString('hex')
  
  // Check for executable file signatures that shouldn't be in uploads
  const dangerousSignatures = [
    '4d5a', // Windows PE executable
    '7f454c46', // ELF executable
    'd0cf11e0a1b11ae1', // Microsoft Office documents (potential macro threats)
  ]
  
  for (const signature of dangerousSignatures) {
    if (header.startsWith(signature)) {
      return {
        isSafe: false,
        reason: 'Potentially dangerous file type detected'
      }
    }
  }
  
  return { isSafe: true }
}

/**
 * Comprehensive file validation
 */
export async function validateUploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  fileConfig: typeof FILE_TYPES[keyof typeof FILE_TYPES]
): Promise<ValidationResult> {
  // Validate file type
  const typeValidation = validateFileType(fileName, mimeType, fileConfig)
  if (!typeValidation.isValid) return typeValidation
  
  // Validate file size
  const sizeValidation = validateFileSize(buffer.length, fileConfig.maxSize)
  if (!sizeValidation.isValid) return sizeValidation
  
  // Sanitize file name
  const nameValidation = sanitizeFileName(fileName)
  if (!nameValidation.isValid) return nameValidation
  
  // Scan for viruses/malware
  const virusCheck = await scanFileForViruses(buffer)
  if (!virusCheck.isSafe) {
    return {
      isValid: false,
      error: virusCheck.reason || 'File failed security scan'
    }
  }
  
  return {
    isValid: true,
    sanitizedName: nameValidation.sanitizedName
  }
}