import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    agentId: string
  }>
}

/**
 * GET /api/agents/[agentId]/analytics
 * Get agent usage analytics
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { agentId } = await context.params
      
      const agent = await Database.getAgentById(agentId)
      if (!agent) {
        return errorResponse("Agent not found", 404)
      }

      const analytics = await Database.getAgentAnalytics(agentId)

      return successResponse(analytics)
    } catch (error) {
      return handleApiError(error)
    }
  })
}
