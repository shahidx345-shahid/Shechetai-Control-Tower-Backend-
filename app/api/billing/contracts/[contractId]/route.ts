import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    contractId: string
  }>
}

/**
 * GET /api/billing/contracts/[contractId]
 * Get contract by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { contractId } = await context.params
      
      const contract = await Database.getContractById(contractId)
      
      if (!contract) {
        return errorResponse("Contract not found", 404)
      }

      return successResponse(contract)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * PATCH /api/billing/contracts/[contractId]
 * Update contract
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req) => {
    try {
      const { contractId } = await context.params
      const body = await req.json()

      const contract = await Database.getContractById(contractId)
      if (!contract) {
        return errorResponse("Contract not found", 404)
      }

      const updatedContract = await Database.updateContract(contractId, body)

      return successResponse(updatedContract, "Contract updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * DELETE /api/billing/contracts/[contractId]
 * Cancel a contract
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { contractId } = await context.params

      const contract = await Database.getContractById(contractId)
      if (!contract) {
        return errorResponse("Contract not found", 404)
      }

      // Update status to cancelled instead of hard delete
      await Database.updateContract(contractId, { status: "cancelled" })

      return successResponse({ contractId }, "Contract cancelled successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
