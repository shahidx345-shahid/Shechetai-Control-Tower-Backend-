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
 * POST /api/invites/[inviteId]/accept
 * Accept a team invite
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

    // Check if invite has expired
    if (new Date(invite.expiresAt) < new Date()) {
      return errorResponse("Invite has expired", 400)
    }

    // Get user ID from request (if authenticated) or create new user
    // For now, we'll update the invite status and add member in a simplified way
    let userId = null
    
    // Try to get user ID from auth header
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const admin = (await import("firebase-admin")).default
        const token = authHeader.substring(7)
        const decodedToken = await admin.auth().verifyIdToken(token)
        userId = decodedToken.uid
      } catch (e) {
        console.log("No valid auth token, will create user if needed")
      }
    }

    // If no authenticated user, check if user exists by email
    if (!userId) {
      const users = await Database.getUsers()
      const existingUser = users.find(u => u.email === invite.email)
      
      if (existingUser) {
        userId = (existingUser as any).id || existingUser.userId
      } else {
        // Create new user with auto-generated ID
        const tempUserId = `user_${Date.now()}`
        const newUser = await Database.createUser(tempUserId, {
          email: invite.email,
          name: invite.email.split("@")[0], // Use email prefix as default name
          role: "user",
        })
        userId = (newUser as any).id || newUser.userId
      }
    }

    // Add user as team member
    await Database.addTeamMember({
      teamId: invite.teamId,
      userId: userId,
      role: invite.role,
      email: invite.email,
    })

    // Update invite status
    await Database.updateInvite(inviteId, {
      status: "accepted",
      acceptedAt: new Date().toISOString(),
      acceptedBy: userId,
    })

    return successResponse(
      { inviteId, teamId: invite.teamId, userId },
      "Invite accepted successfully"
    )
  } catch (error) {
    return handleApiError(error)
  }
}
