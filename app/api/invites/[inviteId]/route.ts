import { NextRequest } from "next/server"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    inviteId: string
  }>
}

/**
 * GET /api/invites/[inviteId]
 * Get invite details by ID (public endpoint for invite acceptance)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { inviteId } = await context.params
    
    const invite = await Database.getInviteById(inviteId)
    
    if (!invite) {
      return errorResponse("Invite not found", 404)
    }

    return successResponse(invite)
  } catch (error) {
    return handleApiError(error)
  }
}
