import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    teamId: string
    userId: string
  }>
}

/**
 * DELETE /api/teams/[teamId]/members/[userId]
 * Remove a member from a team
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { teamId, userId } = await context.params

      const team = await Database.getTeamById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const success = await Database.removeTeamMember(teamId, userId)
      if (!success) {
        return errorResponse("Member not found", 404)
      }

      // Update team seat usage
      const members = await Database.getTeamMembers(teamId)
      const activeMembers = members.filter(m => m.status === "active").length
      
      await Database.updateTeam(teamId, {
        seatUsage: activeMembers,
      })

      return successResponse({ teamId, userId }, "Member removed successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
