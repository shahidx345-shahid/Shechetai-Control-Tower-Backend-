import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * POST /api/credits/purchase-pack
 * Team owner purchases a credit pack and adds credits to wallet
 * This is for per-run billing agents only
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.teamId || !body.amount || !body.paymentMethodId) {
        return errorResponse("Missing required fields: teamId, amount, paymentMethodId", 400)
      }

      if (body.amount <= 0) {
        return errorResponse("Amount must be positive", 400)
      }

      // Check if team exists
      const team = await Database.getTeamById(body.teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      // Verify user is team owner
      if (team.ownerId !== authContext.userId && authContext.role !== "super_admin") {
        return errorResponse("Only team owner can purchase credit packs", 403)
      }

      // Get or create wallet for team
      let wallet = await Database.getWalletByTeamId(body.teamId)
      if (!wallet) {
        wallet = await Database.createWallet({
          teamId: body.teamId,
          balance: 0,
          currency: "credits",
          status: "active",
        })
      }

      // Get wallet ID
      const walletId = (wallet as any).walletId || (wallet as any).id
      if (!walletId) {
        return errorResponse("Invalid wallet ID", 500)
      }

      // TODO: Process payment with Stripe using paymentMethodId
      // For now, we'll simulate successful payment

      // Calculate credits based on pack (e.g., $10 = 100 credits)
      const creditsToAdd = body.credits || body.amount * 10

      // Update wallet balance
      const updatedWallet = await Database.updateWalletBalance(walletId, creditsToAdd)
      if (!updatedWallet) {
        return errorResponse("Failed to update wallet", 500)
      }

      // Create transaction record
      const transaction = await Database.createTransaction({
        walletId: walletId,
        teamId: body.teamId,
        type: "purchase",
        amount: creditsToAdd,
        balance: updatedWallet.balance || (wallet.balance || 0) + creditsToAdd,
        description: `Credit pack purchase - ${body.packName || 'Custom'}`,
        metadata: {
          packName: body.packName,
          paymentAmount: body.amount,
          paymentMethodId: body.paymentMethodId,
          purchasedBy: authContext.userId,
        },
      })

      return successResponse({
        wallet: updatedWallet,
        transaction,
        creditsAdded: creditsToAdd,
      }, "Credit pack purchased successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
