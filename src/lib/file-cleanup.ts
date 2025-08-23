import { db } from '@/lib/db'
import { deleteFile, getFileInfo } from '@/lib/file-upload'
import { db } from '@/lib/db'
import path from 'path'
import fs from 'fs'

/**
 * File cleanup and garbage collection utilities
 */

export interface CleanupResult {
  totalFiles: number
  deletedFiles: number
  failedDeletions: number
  bytesFreed: number
  errors: string[]
}

/**
 * Clean up orphaned files that exist on disk but not in database
 */
export async function cleanupOrphanedFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalFiles: 0,
    deletedFiles: 0,
    failedDeletions: 0,
    bytesFreed: 0,
    errors: []
  }

  try {
    const uploadDirs = ['uploads/avatars', 'uploads/thumbnails', 'uploads/videos']
    
    for (const uploadDir of uploadDirs) {
      const fullDirPath = path.join(process.cwd(), 'public', uploadDir)
      
      if (!fs.existsSync(fullDirPath)) {
        continue
      }

      const files = fs.readdirSync(fullDirPath)
      
      for (const fileName of files) {
        if (fileName.startsWith('.')) continue // Skip hidden files
        
        result.totalFiles++
        const filePath = `${uploadDir}/${fileName}`
        
        // Check if file is referenced in database
        const isReferenced = await isFileReferenced(filePath)
        
        if (!isReferenced) {
          // File is orphaned, delete it
          try {
            const stats = fs.statSync(path.join(fullDirPath, fileName))
            const fileSize = stats.size
            
            const deleted = await deleteFile(filePath)
            if (deleted) {
              result.deletedFiles++
              result.bytesFreed += fileSize
            } else {
              result.failedDeletions++
              result.errors.push(`Failed to delete orphaned file: ${filePath}`)
            }
          } catch (error) {
            result.failedDeletions++
            result.errors.push(`Error deleting ${filePath}: ${error}`)
          }
        }
      }
    }
    
  } catch (error) {
    result.errors.push(`General cleanup error: ${error}`)
  }

  return result
}

/**
 * Clean up soft-deleted files from database and disk
 */
export async function cleanupSoftDeletedFiles(olderThanDays: number = 7): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalFiles: 0,
    deletedFiles: 0,
    failedDeletions: 0,
    bytesFreed: 0,
    errors: []
  }

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Find soft-deleted files older than cutoff
    const softDeletedFiles = await db.uploadedFile.findMany({
      where: {
        isActive: false,
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    })

    for (const file of softDeletedFiles) {
      result.totalFiles++
      
      try {
        // Delete from disk
        const deleted = await deleteFile(file.filePath.substring(1)) // Remove leading slash
        if (deleted) {
          result.bytesFreed += file.fileSize
        }

        // Delete from database
        await db.uploadedFile.delete({
          where: { id: file.id }
        })
        
        result.deletedFiles++
      } catch (error) {
        result.failedDeletions++
        result.errors.push(`Error deleting file ${file.fileName}: ${error}`)
      }
    }
    
  } catch (error) {
    result.errors.push(`Soft deletion cleanup error: ${error}`)
  }

  return result
}

/**
 * Clean up temporary upload files
 */
export async function cleanupTempFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalFiles: 0,
    deletedFiles: 0,
    failedDeletions: 0,
    bytesFreed: 0,
    errors: []
  }

  try {
    const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp')
    
    if (!fs.existsSync(tempDir)) {
      return result
    }

    const files = fs.readdirSync(tempDir)
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
    
    for (const fileName of files) {
      result.totalFiles++
      const filePath = path.join(tempDir, fileName)
      
      try {
        const stats = fs.statSync(filePath)
        
        // Delete files older than 24 hours
        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath)
          result.deletedFiles++
          result.bytesFreed += stats.size
        }
      } catch (error) {
        result.failedDeletions++
        result.errors.push(`Error deleting temp file ${fileName}: ${error}`)
      }
    }
    
  } catch (error) {
    result.errors.push(`Temp file cleanup error: ${error}`)
  }

  return result
}

/**
 * Check if a file path is referenced in the database
 */
async function isFileReferenced(filePath: string): Promise<boolean> {
  try {
    // Check in UploadedFile model
    const uploadedFile = await db.uploadedFile.findFirst({
      where: {
        filePath: `/${filePath}`,
        isActive: true
      }
    })
    
    if (uploadedFile) return true

    // Check legacy references in User model (avatar)
    const userWithAvatar = await db.user.findFirst({
      where: {
        avatar: `/${filePath}`
      }
    })
    
    if (userWithAvatar) return true

    // Check legacy references in Course model (thumbnail)
    const courseWithThumbnail = await db.course.findFirst({
      where: {
        thumbnail: `/${filePath}`
      }
    })
    
    if (courseWithThumbnail) return true

    // Check legacy references in Lesson model (videoUrl)
    const lessonWithVideo = await db.lesson.findFirst({
      where: {
        videoUrl: `/${filePath}`
      }
    })
    
    if (lessonWithVideo) return true

    return false
  } catch (error) {
    console.error('Error checking file reference:', error)
    return true // Assume referenced to be safe
  }
}

/**
 * Get file usage statistics
 */
export async function getFileUsageStats(): Promise<{
  totalFiles: number
  totalSize: number
  byCategory: Record<string, { count: number; size: number }>
  activeFiles: number
  inactiveFiles: number
}> {
  try {
    const files = await db.uploadedFile.findMany()
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
      byCategory: {} as Record<string, { count: number; size: number }>,
      activeFiles: files.filter(f => f.isActive).length,
      inactiveFiles: files.filter(f => !f.isActive).length
    }

    // Group by category
    for (const file of files) {
      if (!stats.byCategory[file.category]) {
        stats.byCategory[file.category] = { count: 0, size: 0 }
      }
      stats.byCategory[file.category].count++
      stats.byCategory[file.category].size += file.fileSize
    }

    return stats
  } catch (error) {
    console.error('Error getting file usage stats:', error)
    return {
      totalFiles: 0,
      totalSize: 0,
      byCategory: {},
      activeFiles: 0,
      inactiveFiles: 0
    }
  }
}

/**
 * Validate file integrity (check if files exist on disk)
 */
export async function validateFileIntegrity(): Promise<{
  totalFiles: number
  validFiles: number
  missingFiles: string[]
  invalidFiles: string[]
}> {
  const result = {
    totalFiles: 0,
    validFiles: 0,
    missingFiles: [] as string[],
    invalidFiles: [] as string[]
  }

  try {
    const files = await db.uploadedFile.findMany({
      where: { isActive: true }
    })

    result.totalFiles = files.length

    for (const file of files) {
      try {
        const fileInfo = await getFileInfo(file.filePath.substring(1))
        
        if (fileInfo.exists) {
          // Check if file size matches
          if (fileInfo.size === file.fileSize) {
            result.validFiles++
          } else {
            result.invalidFiles.push(`${file.filePath} (size mismatch: expected ${file.fileSize}, got ${fileInfo.size})`)
          }
        } else {
          result.missingFiles.push(file.filePath)
        }
      } catch (error) {
        result.invalidFiles.push(`${file.filePath} (validation error: ${error})`)
      }
    }
  } catch (error) {
    console.error('Error validating file integrity:', error)
  }

  return result
}

/**
 * Run comprehensive cleanup (combines all cleanup operations)
 */
export async function runComprehensiveCleanup(): Promise<{
  orphanedFiles: CleanupResult
  softDeleted: CleanupResult
  tempFiles: CleanupResult
  totalBytesFreed: number
}> {
  const orphanedFiles = await cleanupOrphanedFiles()
  const softDeleted = await cleanupSoftDeletedFiles()
  const tempFiles = await cleanupTempFiles()

  return {
    orphanedFiles,
    softDeleted,
    tempFiles,
    totalBytesFreed: orphanedFiles.bytesFreed + softDeleted.bytesFreed + tempFiles.bytesFreed
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
