import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError, parsePagination, createPaginatedResponse } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/credits/transactions
 * Get credit transactions with optional filters
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const { page, limit } = parsePagination(searchParams)
      
      const filters = {
        teamId: searchParams.get("teamId") || undefined,
        walletId: searchParams.get("walletId") || undefined,
      }

      const transactions = await Database.getTransactions(filters)
      
      // Apply pagination
      const start = (page - 1) * limit
      const paginatedTransactions = transactions.slice(start, start + limit)
      
      const response = createPaginatedResponse(paginatedTransactions, transactions.length, page, limit)
      
      return successResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  })
}
