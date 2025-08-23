import { validateUploadFile, FILE_TYPES, formatBytes } from '@/lib/file-upload'
import { db } from '@/lib/db'
import path from 'path'
import fs from 'fs'

/**
 * Comprehensive file upload validation and testing utilities
 */

export interface ValidationTest {
  name: string
  description: string
  passed: boolean
  error?: string
  details?: any
}

export interface SystemValidationResult {
  overallStatus: 'PASS' | 'FAIL' | 'WARNING'
  tests: ValidationTest[]
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    warnings: number
  }
}

/**
 * Run comprehensive system validation tests
 */
export async function runSystemValidation(): Promise<SystemValidationResult> {
  const tests: ValidationTest[] = []
  
  // Test 1: Upload directories exist and are writable
  tests.push(await testUploadDirectories())
  
  // Test 2: File type validation
  tests.push(await testFileTypeValidation())
  
  // Test 3: File size validation
  tests.push(await testFileSizeValidation())
  
  // Test 4: Security validation (malicious files)
  tests.push(await testSecurityValidation())
  
  // Test 5: Database connectivity and schema
  tests.push(await testDatabaseConnection())
  
  // Test 6: File path security
  tests.push(await testPathTraversalProtection())
  
  // Test 7: Concurrent upload handling
  tests.push(await testConcurrentUploads())
  
  // Test 8: Memory usage validation
  tests.push(await testMemoryUsage())

  const summary = {
    totalTests: tests.length,
    passedTests: tests.filter(t => t.passed).length,
    failedTests: tests.filter(t => !t.passed).length,
    warnings: tests.filter(t => t.name.includes('WARNING')).length
  }

  const overallStatus = summary.failedTests > 0 ? 'FAIL' : 
                       summary.warnings > 0 ? 'WARNING' : 'PASS'

  return {
    overallStatus,
    tests,
    summary
  }
}

/**
 * Test upload directories
 */
async function testUploadDirectories(): Promise<ValidationTest> {
  try {
    const requiredDirs = [
      'public/uploads',
      'public/uploads/avatars',
      'public/uploads/thumbnails', 
      'public/uploads/videos'
    ]

    for (const dir of requiredDirs) {
      const fullPath = path.join(process.cwd(), dir)
      
      if (!fs.existsSync(fullPath)) {
        return {
          name: 'Upload Directories',
          description: 'Check if upload directories exist and are accessible',
          passed: false,
          error: `Directory does not exist: ${dir}`
        }
      }

      // Test write permissions
      try {
        const testFile = path.join(fullPath, '.write-test')
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
      } catch (error) {
        return {
          name: 'Upload Directories',
          description: 'Check if upload directories exist and are accessible',
          passed: false,
          error: `Directory not writable: ${dir}`
        }
      }
    }

    return {
      name: 'Upload Directories',
      description: 'Check if upload directories exist and are accessible',
      passed: true,
      details: { directories: requiredDirs }
    }
  } catch (error) {
    return {
      name: 'Upload Directories',
      description: 'Check if upload directories exist and are accessible',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Test file type validation
 */
async function testFileTypeValidation(): Promise<ValidationTest> {
  try {
    const testCases = [
      // Valid files
      { name: 'test.jpg', type: 'image/jpeg', config: FILE_TYPES.IMAGE, shouldPass: true },
      { name: 'test.png', type: 'image/png', config: FILE_TYPES.AVATAR, shouldPass: true },
      { name: 'test.mp4', type: 'video/mp4', config: FILE_TYPES.VIDEO, shouldPass: true },
      
      // Invalid files
      { name: 'test.exe', type: 'application/x-executable', config: FILE_TYPES.IMAGE, shouldPass: false },
      { name: 'test.pdf', type: 'application/pdf', config: FILE_TYPES.VIDEO, shouldPass: false },
      { name: 'script.js', type: 'application/javascript', config: FILE_TYPES.AVATAR, shouldPass: false }
    ]

    for (const testCase of testCases) {
      const buffer = Buffer.from('test content')
      const result = await validateUploadFile(buffer, testCase.name, testCase.type, testCase.config)
      
      if (result.isValid !== testCase.shouldPass) {
        return {
          name: 'File Type Validation',
          description: 'Test file type validation logic',
          passed: false,
          error: `File type validation failed for ${testCase.name}: expected ${testCase.shouldPass}, got ${result.isValid}`
        }
      }
    }

    return {
      name: 'File Type Validation',
      description: 'Test file type validation logic',
      passed: true,
      details: { testCases: testCases.length }
    }
  } catch (error) {
    return {
      name: 'File Type Validation',
      description: 'Test file type validation logic',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Test file size validation
 */
async function testFileSizeValidation(): Promise<ValidationTest> {
  try {
    const testCases = [
      // Valid sizes
      { size: 1024, maxSize: FILE_TYPES.AVATAR.maxSize, shouldPass: true },
      { size: FILE_TYPES.IMAGE.maxSize - 1, maxSize: FILE_TYPES.IMAGE.maxSize, shouldPass: true },
      
      // Invalid sizes
      { size: FILE_TYPES.AVATAR.maxSize + 1, maxSize: FILE_TYPES.AVATAR.maxSize, shouldPass: false },
      { size: FILE_TYPES.VIDEO.maxSize + 1000000, maxSize: FILE_TYPES.VIDEO.maxSize, shouldPass: false }
    ]

    for (const testCase of testCases) {
      const buffer = Buffer.alloc(testCase.size, 'a')
      const result = await validateUploadFile(buffer, 'test.jpg', 'image/jpeg', {
        ...FILE_TYPES.IMAGE,
        maxSize: testCase.maxSize
      })
      
      if (result.isValid !== testCase.shouldPass) {
        return {
          name: 'File Size Validation',
          description: 'Test file size validation logic',
          passed: false,
          error: `Size validation failed for ${formatBytes(testCase.size)}: expected ${testCase.shouldPass}, got ${result.isValid}`
        }
      }
    }

    return {
      name: 'File Size Validation',
      description: 'Test file size validation logic',
      passed: true,
      details: { testCases: testCases.length }
    }
  } catch (error) {
    return {
      name: 'File Size Validation',
      description: 'Test file size validation logic',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Test security validation
 */
async function testSecurityValidation(): Promise<ValidationTest> {
  try {
    // Test malicious file signatures
    const maliciousFiles = [
      { name: 'malware.exe', header: Buffer.from('4d5a9000', 'hex') }, // PE executable
      { name: 'script.php', header: Buffer.from('<?php eval($_POST[') },
      { name: 'virus.bat', header: Buffer.from('@echo off\ndel /s /q C:\\') }
    ]

    for (const maliciousFile of maliciousFiles) {
      const buffer = Buffer.concat([maliciousFile.header, Buffer.alloc(1000, 'a')])
      const result = await validateUploadFile(buffer, maliciousFile.name, 'image/jpeg', FILE_TYPES.IMAGE)
      
      if (result.isValid) {
        return {
          name: 'Security Validation',
          description: 'Test security validation against malicious files',
          passed: false,
          error: `Malicious file passed validation: ${maliciousFile.name}`
        }
      }
    }

    return {
      name: 'Security Validation',
      description: 'Test security validation against malicious files',
      passed: true,
      details: { maliciousFilesBlocked: maliciousFiles.length }
    }
  } catch (error) {
    return {
      name: 'Security Validation',
      description: 'Test security validation against malicious files',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseConnection(): Promise<ValidationTest> {
  try {
    // Test basic database connectivity
    await db.$queryRaw`SELECT 1`
    
    // Test UploadedFile model operations
    const testFile = await db.uploadedFile.create({
      data: {
        originalName: 'test-validation.jpg',
        fileName: 'test_validation_' + Date.now() + '.jpg',
        filePath: '/uploads/test/validation.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        category: 'AVATAR',
        uploadedBy: 'test-user-id',
        entityType: 'TEST',
        entityId: 'test-entity'
      }
    })

    // Clean up test data
    await db.uploadedFile.delete({
      where: { id: testFile.id }
    })

    return {
      name: 'Database Connection',
      description: 'Test database connectivity and UploadedFile model operations',
      passed: true,
      details: { testFileId: testFile.id }
    }
  } catch (error) {
    return {
      name: 'Database Connection',
      description: 'Test database connectivity and UploadedFile model operations',
      passed: false,
      error: `Database test failed: ${error}`
    }
  }
}

/**
 * Test path traversal protection
 */
async function testPathTraversalProtection(): Promise<ValidationTest> {
  try {
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32\\config\\sam',
      '/etc/shadow',
      'C:\\Windows\\System32\\config\\sam',
      '....//....//....//etc/passwd'
    ]

    for (const maliciousPath of maliciousPaths) {
      const buffer = Buffer.from('test content')
      const result = await validateUploadFile(buffer, maliciousPath, 'image/jpeg', FILE_TYPES.IMAGE)
      
      if (result.isValid) {
        return {
          name: 'Path Traversal Protection',
          description: 'Test protection against path traversal attacks',
          passed: false,
          error: `Path traversal attack passed validation: ${maliciousPath}`
        }
      }
    }

    return {
      name: 'Path Traversal Protection',
      description: 'Test protection against path traversal attacks',
      passed: true,
      details: { maliciousPathsBlocked: maliciousPaths.length }
    }
  } catch (error) {
    return {
      name: 'Path Traversal Protection',
      description: 'Test protection against path traversal attacks',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Test concurrent upload handling
 */
async function testConcurrentUploads(): Promise<ValidationTest> {
  try {
    const concurrentUploads = 5
    const buffer = Buffer.alloc(1024, 'a')
    
    const uploadPromises = Array.from({ length: concurrentUploads }, (_, i) => 
      validateUploadFile(buffer, `test${i}.jpg`, 'image/jpeg', FILE_TYPES.IMAGE)
    )

    const results = await Promise.all(uploadPromises)
    const failedUploads = results.filter(r => !r.isValid)

    if (failedUploads.length > 0) {
      return {
        name: 'Concurrent Upload Handling WARNING',
        description: 'Test system behavior under concurrent upload load',
        passed: true,
        error: `Some concurrent uploads failed: ${failedUploads.length}/${concurrentUploads}`,
        details: { concurrentUploads, failedUploads: failedUploads.length }
      }
    }

    return {
      name: 'Concurrent Upload Handling',
      description: 'Test system behavior under concurrent upload load',
      passed: true,
      details: { concurrentUploads, allPassed: true }
    }
  } catch (error) {
    return {
      name: 'Concurrent Upload Handling',
      description: 'Test system behavior under concurrent upload load',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Test memory usage
 */
async function testMemoryUsage(): Promise<ValidationTest> {
  try {
    const initialMemory = process.memoryUsage()
    
    // Test with large file (simulate max video size)
    const largeBuffer = Buffer.alloc(50 * 1024 * 1024, 'a') // 50MB
    await validateUploadFile(largeBuffer, 'large-test.mp4', 'video/mp4', FILE_TYPES.VIDEO)
    
    const finalMemory = process.memoryUsage()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
    
    // Warning if memory usage increases significantly
    if (memoryIncrease > 100 * 1024 * 1024) { // 100MB threshold
      return {
        name: 'Memory Usage WARNING',
        description: 'Test memory usage during large file validation',
        passed: true,
        error: `High memory usage detected: ${formatBytes(memoryIncrease)}`,
        details: { 
          memoryIncrease: formatBytes(memoryIncrease),
          initialHeap: formatBytes(initialMemory.heapUsed),
          finalHeap: formatBytes(finalMemory.heapUsed)
        }
      }
    }

    return {
      name: 'Memory Usage',
      description: 'Test memory usage during large file validation',
      passed: true,
      details: { 
        memoryIncrease: formatBytes(memoryIncrease),
        initialHeap: formatBytes(initialMemory.heapUsed),
        finalHeap: formatBytes(finalMemory.heapUsed)
      }
    }
  } catch (error) {
    return {
      name: 'Memory Usage',
      description: 'Test memory usage during large file validation',
      passed: false,
      error: `Test failed: ${error}`
    }
  }
}

/**
 * Format validation result for console output
 */
export function formatValidationReport(result: SystemValidationResult): string {
  let report = '\n═══════════════════════════════════════════════════════\n'
  report += `          SECURE FILE UPLOAD SYSTEM VALIDATION\n`
  report += '═══════════════════════════════════════════════════════\n\n'
  
  report += `Overall Status: ${result.overallStatus}\n`
  report += `Tests Passed: ${result.summary.passedTests}/${result.summary.totalTests}\n`
  report += `Warnings: ${result.summary.warnings}\n`
  report += `Failures: ${result.summary.failedTests}\n\n`
  
  report += 'Test Results:\n'
  report += '─────────────────────────────────────────────────────────\n'
  
  for (const test of result.tests) {
    const status = test.passed ? '✅ PASS' : '❌ FAIL'
    report += `${status} | ${test.name}\n`
    report += `      ${test.description}\n`
    
    if (test.error) {
      report += `      Error: ${test.error}\n`
    }
    
    if (test.details) {
      report += `      Details: ${JSON.stringify(test.details)}\n`
    }
    
    report += '\n'
  }
  
  report += '═══════════════════════════════════════════════════════\n'
  
  return report
}