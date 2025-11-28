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
 * GET /api/teams/[teamId]/members
 * Get all members of a team
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { teamId } = await context.params
      
      const team = await Database.getTeamById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const members = await Database.getTeamMembers(teamId)
      
      return successResponse({
        teamId,
        totalSeats: team.seatCap,
        usedSeats: members.filter(m => m.status === "active").length,
        availableSeats: team.seatCap - members.filter(m => m.status === "active").length,
        members,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/teams/[teamId]/members
 * Add a member to a team
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req) => {
    try {
      const { teamId } = await context.params
      const body = await req.json()

      if (!body.userId || !body.email) {
        return errorResponse("Missing required fields: userId, email", 400)
      }

      const team = await Database.getTeamById(teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      // Check seat capacity
      const members = await Database.getTeamMembers(teamId)
      const activeMembers = members.filter(m => m.status === "active").length
      
      if (activeMembers >= team.seatCap) {
        return errorResponse("Team has reached maximum seat capacity", 400)
      }

      const member = await Database.addTeamMember({
        userId: body.userId,
        teamId,
        email: body.email,
        role: body.role || "member",
        status: "active",
        joinedAt: new Date().toISOString(),
      })

      // Update team seat usage
      await Database.updateTeam(teamId, {
        seatUsage: activeMembers + 1,
      })

      return successResponse(member, "Member added successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
