import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    teamId: string
  }>
}

/**
 * GET /api/teams/[teamId]/analytics
 * Get team analytics and usage statistics
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { teamId } = await context.params
      
      const team = await Database.getTeamById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const analytics = await Database.getTeamAnalytics(teamId)

      return successResponse(analytics)
    } catch (error) {
      return handleApiError(error)
    }
  })
}
