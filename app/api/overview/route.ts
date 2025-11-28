import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/overview
 * Get platform overview statistics from Firestore
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      // Get counts from Firestore
      const agents = await Database.getAgents()
      const teams = await Database.getTeams()
      const users = await Database.getUsers()

      const data = {
        totalAgents: agents?.length || 0,
        totalTeams: teams?.length || 0,
        totalUsers: users?.length || 0,
        systemHealth: "Operational",
        timestamp: new Date().toISOString()
      }

      return successResponse(data)
    } catch (error) {
      console.error("Overview Error:", error)
      return handleApiError(error)
    }
  })
}
