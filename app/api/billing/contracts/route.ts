import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError, parsePagination, createPaginatedResponse } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/billing/contracts
 * List all billing contracts with optional filters
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const { page, limit } = parsePagination(searchParams)
      const teamId = searchParams.get("teamId") || undefined

      const contracts = await Database.getContracts(teamId)
      
      // Apply pagination
      const start = (page - 1) * limit
      const paginatedContracts = contracts.slice(start, start + limit)
      
      const response = createPaginatedResponse(paginatedContracts, contracts.length, page, limit)
      
      return successResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/billing/contracts
 * Create a new billing contract
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.teamId || !body.planType || !body.billingCycle || body.amount === undefined) {
        return errorResponse("Missing required fields: teamId, planType, billingCycle, amount", 400)
      }

      // Check if team exists
      const team = await Database.getTeamById(body.teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const contract = await Database.createContract({
        teamId: body.teamId,
        planType: body.planType,
        billingCycle: body.billingCycle,
        amount: body.amount,
        currency: body.currency || "USD",
        status: body.status || "active",
        startDate: body.startDate || new Date().toISOString(),
        endDate: body.endDate,
        metadata: body.metadata,
      })

      return successResponse(contract, "Contract created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
