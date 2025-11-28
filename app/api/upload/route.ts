/**
 * File Upload API Endpoint
 * POST /api/upload - Upload file
 * DELETE /api/upload?key=xxx - Delete file
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { withAuth } from '@/lib/api/middleware'

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * POST - Upload file
 */
async function handleUpload(req: NextRequest) {
  try {
    await ensureUploadDir()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const nameWithoutExt = file.name
      .replace(`.${extension}`, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
    const fileName = `${nameWithoutExt}-${timestamp}-${random}.${extension}`

    // Create folder path
    const folderPath = join(UPLOAD_DIR, folder)
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true })
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(folderPath, fileName)
    await writeFile(filePath, buffer)

    // Return file info
    const key = `${folder}/${fileName}`
    const url = `/uploads/${key}`

    return NextResponse.json({
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      key,
      uploadedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete file
 */
async function handleDelete(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      )
    }

    // Delete file
    const filePath = join(UPLOAD_DIR, key)
    
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}

// Apply authentication middleware and handle requests
export async function POST(req: NextRequest) {
  return withAuth(req, handleUpload)
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, handleDelete)
}
