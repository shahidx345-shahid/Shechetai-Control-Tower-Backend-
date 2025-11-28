import { NextResponse } from "next/server"
import { ApiResponse } from "@/lib/types/api"

/**
 * Standard error handler for API routes
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>)
}

/**
 * Error response helper
 */
export function errorResponse(error: string | Error, statusCode = 400): NextResponse {
  const message = typeof error === "string" ? error : error.message

  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status: statusCode }
  )
}

/**
 * Handle API errors uniformly
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode)
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse("An unexpected error occurred", 500)
}

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter((field) => !data[field])

  if (missing.length > 0) {
    return { valid: false, missing: missing as string[] }
  }

  return { valid: true }
}

/**
 * Parse pagination parameters
 */
export function parsePagination(searchParams: URLSearchParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))

  return { page, limit }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
