import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { getFirestore } from "firebase-admin/firestore"

initializeFirebaseAdmin()

/**
 * POST /api/credits/configure-auto-refill
 * Configure automatic credit refill for per-run billing agents
 * When balance drops below threshold, automatically purchase credits
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      const db = getFirestore()
      
      // Validate required fields
      if (!body.teamId) {
        return errorResponse("Missing required field: teamId", 400)
      }

      // Check if team exists
      const teamDoc = await db.collection("teams").doc(body.teamId).get()
      if (!teamDoc.exists) {
        return errorResponse("Team not found", 404)
      }

      const team = teamDoc.data()

      // Verify user is team owner
      if (team?.ownerId !== authContext.userId && authContext.role !== "super_admin") {
        return errorResponse("Only team owner can configure auto-refill", 403)
      }

      // Validate auto-refill settings
      const autoRefillSettings = {
        enabled: body.enabled !== undefined ? body.enabled : true,
        threshold: body.threshold || 100, // Refill when balance drops below this
        amount: body.amount || 500, // Amount of credits to add on refill
        paymentMethodId: body.paymentMethodId || team?.defaultPaymentMethodId,
      }

      if (autoRefillSettings.enabled && !autoRefillSettings.paymentMethodId) {
        return errorResponse("Payment method required for auto-refill", 400)
      }

      if (autoRefillSettings.threshold <= 0 || autoRefillSettings.amount <= 0) {
        return errorResponse("Threshold and amount must be positive", 400)
      }

      // Get or create wallet
      const walletRef = db.collection("wallets").doc(body.teamId)
      const walletDoc = await walletRef.get()

      if (!walletDoc.exists) {
        // Create wallet with auto-refill settings
        await walletRef.set({
          teamId: body.teamId,
          balance: 0,
          currency: "credits",
          status: "active",
          autoRefill: autoRefillSettings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } else {
        // Update existing wallet with auto-refill settings
        await walletRef.update({
          autoRefill: autoRefillSettings,
          updatedAt: new Date().toISOString(),
        })
      }

      const updatedWallet = await walletRef.get()

      return successResponse({
        wallet: {
          id: updatedWallet.id,
          ...updatedWallet.data(),
        },
        autoRefillSettings,
      }, "Auto-refill configured successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * GET /api/credits/configure-auto-refill
 * Get current auto-refill configuration for a team
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamId = searchParams.get("teamId")
      
      if (!teamId) {
        return errorResponse("Missing teamId parameter", 400)
      }

      const db = getFirestore()
      const walletDoc = await db.collection("wallets").doc(teamId).get()

      if (!walletDoc.exists) {
        return successResponse({
          enabled: false,
          threshold: 100,
          amount: 500,
          paymentMethodId: null,
        }, "No auto-refill configured")
      }

      const wallet = walletDoc.data()
      const autoRefillSettings = wallet?.autoRefill || {
        enabled: false,
        threshold: 100,
        amount: 500,
        paymentMethodId: null,
      }

      return successResponse(autoRefillSettings)
    } catch (error) {
      return handleApiError(error)
    }
  })
}
