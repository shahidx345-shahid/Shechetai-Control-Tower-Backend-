import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { TeamDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    teamId: string
  }>
}

/**
 * GET /api/teams/[teamId]
 * Get team by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { teamId } = await context.params
      
      const team = await TeamDatabase.getById(teamId)
      
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      return successResponse(team)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * PATCH /api/teams/[teamId]
 * Update team
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req) => {
    try {
      const { teamId } = await context.params
      const body = await req.json()

      const team = await TeamDatabase.getById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const updatedTeam = await TeamDatabase.update(teamId, body)

      return successResponse(updatedTeam, "Team updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * DELETE /api/teams/[teamId]
 * Delete team (soft delete by setting status to 'deleted')
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { teamId } = await context.params

      const team = await TeamDatabase.getById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      // Soft delete
      await TeamDatabase.update(teamId, { status: "deleted" })

      return successResponse({ teamId }, "Team deleted successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
