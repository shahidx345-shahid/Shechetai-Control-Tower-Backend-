/**
 * File Upload Service
 * Supports local storage, AWS S3, Firebase Storage, and Cloudinary
 */

'use client'

import { useState } from 'react'

export interface UploadOptions {
  maxSize?: number // in bytes, default 5MB
  allowedTypes?: string[] // e.g., ['image/png', 'image/jpeg', 'application/pdf']
  multiple?: boolean
  folder?: string // Upload folder/prefix
}

export interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  key: string
  uploadedAt: Date
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'],
  multiple: false,
  folder: 'uploads',
}

/**
 * Validate file before upload
 */
function validateFile(file: File, options: UploadOptions): { valid: boolean; error?: string } {
  const { maxSize, allowedTypes } = { ...DEFAULT_OPTIONS, ...options }

  // Check file size
  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Generate unique filename
 */
function generateFileName(originalName: string, folder?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  
  const fileName = `${nameWithoutExt}-${timestamp}-${random}.${extension}`
  return folder ? `${folder}/${fileName}` : fileName
}

/**
 * Upload file to server
 */
async function uploadToServer(file: File, options: UploadOptions): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', options.folder || DEFAULT_OPTIONS.folder!)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return await response.json()
}

/**
 * React hook for file uploads
 */
export function useFileUpload(options: UploadOptions = {}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setError(null)
    setProgress(0)

    const fileArray = Array.from(files)
    const results: UploadedFile[] = []

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]

        // Validate file
        const validation = validateFile(file, options)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Upload file
        const uploaded = await uploadToServer(file, options)
        results.push(uploaded)

        // Update progress
        setProgress(((i + 1) / fileArray.length) * 100)
      }

      setUploadedFiles((prev) => [...prev, ...results])
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw err
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (key: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.key !== key))
  }

  const clearFiles = () => {
    setUploadedFiles([])
    setError(null)
    setProgress(0)
  }

  return {
    uploadFiles,
    removeFile,
    clearFiles,
    uploading,
    progress,
    error,
    uploadedFiles,
  }
}

/**
 * Direct upload function (without hook)
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file, options)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Upload file
  return await uploadToServer(file, options)
}

/**
 * Upload multiple files
 */
export async function uploadFiles(files: FileList | File[], options: UploadOptions = {}): Promise<UploadedFile[]> {
  const fileArray = Array.from(files)
  const results: UploadedFile[] = []

  for (const file of fileArray) {
    const uploaded = await uploadFile(file, options)
    results.push(uploaded)
  }

  return results
}

/**
 * Delete uploaded file
 */
export async function deleteFile(key: string): Promise<void> {
  const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Delete failed')
  }
}

/**
 * Get file URL
 */
export function getFileUrl(key: string): string {
  return `/api/upload/${encodeURIComponent(key)}`
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if file is image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const ext = getFileExtension(filename)
  return imageExtensions.includes(ext)
}

/**
 * Check if file is PDF
 */
export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf'
}

/**
 * Get file icon based on type
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename)

  if (isImageFile(filename)) return '🖼️'
  if (isPdfFile(filename)) return '📄'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['xls', 'xlsx'].includes(ext)) return '📊'
  if (['zip', 'rar', '7z'].includes(ext)) return '📦'
  if (['mp4', 'avi', 'mov'].includes(ext)) return '🎥'
  if (['mp3', 'wav', 'ogg'].includes(ext)) return '🎵'

  return '📎'
}
