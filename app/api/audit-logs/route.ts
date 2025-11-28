import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, handleApiError, parsePagination, createPaginatedResponse } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/audit-logs
 * Get audit logs with filtering options
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const { page, limit } = parsePagination(searchParams)
      
      const filters = {
        userId: searchParams.get("userId") || undefined,
        resource: searchParams.get("resource") || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
      }

      const logs = await Database.getAuditLogs(filters)
      
      // Apply pagination
      const start = (page - 1) * limit
      const paginatedLogs = logs.slice(start, start + limit)
      
      const response = createPaginatedResponse(paginatedLogs, logs.length, page, limit)
      
      return successResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
