import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * POST /api/credits/grant
 * Grant credits to a team's wallet (Super Admin only)
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.teamId || body.amount === undefined || !body.reason) {
        return errorResponse("Missing required fields: teamId, amount, reason", 400)
      }

      if (body.amount <= 0) {
        return errorResponse("Amount must be positive", 400)
      }

      // Check if team exists
      const team = await Database.getTeamById(body.teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      // Get or create wallet
      let wallet = await Database.getWalletByTeamId(body.teamId)
      if (!wallet) {
        wallet = await Database.createWallet({
          teamId: body.teamId,
          balance: 0,
          currency: "credits",
          status: "active",
        })
      }

      // Get wallet ID (handle both walletId and id fields)
      const walletId = (wallet as any).walletId || (wallet as any).id
      if (!walletId) {
        return errorResponse("Invalid wallet ID", 500)
      }

      // Update wallet balance
      const updatedWallet = await Database.updateWalletBalance(walletId, body.amount)
      if (!updatedWallet) {
        return errorResponse("Failed to update wallet", 500)
      }

      // Create transaction record
      const transaction = await Database.createTransaction({
        walletId: walletId,
        teamId: body.teamId,
        type: "grant",
        amount: body.amount,
        balance: updatedWallet.balance || (wallet.balance || 0) + body.amount,
        description: body.reason,
        metadata: {
          ...body.metadata,
          grantedBy: authContext.userId,
        },
      })

      return successResponse({
        wallet: updatedWallet,
        transaction,
      }, "Credits granted successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
