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
 * POST /api/invites/[inviteId]/decline
 * Decline a team invite
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { inviteId } = await context.params
    
    // Get invite details
    const invite = await Database.getInviteById(inviteId)
    
    if (!invite) {
      return errorResponse("Invite not found", 404)
    }

    // Check if invite is still pending
    if (invite.status !== "pending") {
      return errorResponse("Invite has already been used or cancelled", 400)
    }

    // Update invite status
    await Database.updateInvite(inviteId, {
      status: "declined",
      declinedAt: new Date().toISOString(),
    })

    return successResponse({ inviteId }, "Invite declined")
  } catch (error) {
    return handleApiError(error)
  }
}
