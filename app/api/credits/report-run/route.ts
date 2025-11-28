import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { getFirestore } from "firebase-admin/firestore"

initializeFirebaseAdmin()

/**
 * POST /api/credits/report-run
 * Internal endpoint - Report an agent run and debit credits from team wallet
 * This is called server-side when a per-run billing agent executes
 * NOT exposed to external API clients
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      const db = getFirestore()
      
      // Validate required fields
      if (!body.agentId || !body.teamId || !body.creditCost) {
        return errorResponse("Missing required fields: agentId, teamId, creditCost", 400)
      }

      if (body.creditCost <= 0) {
        return errorResponse("Credit cost must be positive", 400)
      }

      // Get agent to verify it's per-run billing
      const agentDoc = await db.collection("agents").doc(body.agentId).get()
      if (!agentDoc.exists) {
        return errorResponse("Agent not found", 404)
      }

      const agent = agentDoc.data()
      if (agent?.billingType !== "per_run") {
        return errorResponse("Agent is not configured for per-run billing", 400)
      }

      // Get team wallet
      const walletRef = db.collection("wallets").doc(body.teamId)
      const walletDoc = await walletRef.get()

      if (!walletDoc.exists) {
        return errorResponse("Wallet not found for team", 404)
      }

      const wallet = walletDoc.data()
      const currentBalance = wallet?.balance || 0

      // Check if sufficient balance
      if (currentBalance < body.creditCost) {
        // Check if auto-refill is enabled
        const autoRefill = wallet?.autoRefill
        
        if (autoRefill?.enabled && autoRefill?.paymentMethodId) {
          // Trigger auto-refill
          const refillAmount = autoRefill.amount || 500
          
          // TODO: Process payment with Stripe
          // For now, simulate successful refill
          
          const newBalance = currentBalance + refillAmount - body.creditCost
          
          await walletRef.update({
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          })

          // Record refill transaction
          await db.collection("transactions").add({
            walletId: body.teamId,
            teamId: body.teamId,
            type: "auto_refill",
            amount: refillAmount,
            balance: currentBalance + refillAmount,
            description: "Automatic credit refill",
            metadata: {
              trigger: "agent_run",
              agentId: body.agentId,
              previousBalance: currentBalance,
            },
            createdAt: new Date().toISOString(),
          })

          // Record debit transaction
          const transactionRef = await db.collection("transactions").add({
            walletId: body.teamId,
            teamId: body.teamId,
            agentId: body.agentId,
            type: "debit",
            amount: -body.creditCost,
            balance: newBalance,
            description: `Agent run - ${agent?.name || body.agentId}`,
            metadata: {
              agentId: body.agentId,
              runId: body.runId,
              creditCost: body.creditCost,
              autoRefillTriggered: true,
              ...body.metadata,
            },
            createdAt: new Date().toISOString(),
          })

          return successResponse({
            success: true,
            previousBalance: currentBalance,
            creditCost: body.creditCost,
            refillAmount: refillAmount,
            newBalance: newBalance,
            autoRefillTriggered: true,
            transactionId: transactionRef.id,
          }, "Credits debited successfully (auto-refill triggered)")
        }

        return errorResponse("Insufficient credits in wallet", 402)
      }

      // Debit credits from wallet
      const newBalance = currentBalance - body.creditCost
      
      await walletRef.update({
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      })

      // Check if balance dropped below threshold for future auto-refill warning
      const autoRefill = wallet?.autoRefill
      const belowThreshold = autoRefill?.enabled && newBalance < (autoRefill?.threshold || 100)

      // Create transaction record
      const transactionRef = await db.collection("transactions").add({
        walletId: body.teamId,
        teamId: body.teamId,
        agentId: body.agentId,
        type: "debit",
        amount: -body.creditCost,
        balance: newBalance,
        description: `Agent run - ${agent?.name || body.agentId}`,
        metadata: {
          agentId: body.agentId,
          runId: body.runId,
          creditCost: body.creditCost,
          ...body.metadata,
        },
        createdAt: new Date().toISOString(),
      })

      return successResponse({
        success: true,
        previousBalance: currentBalance,
        creditCost: body.creditCost,
        newBalance: newBalance,
        belowThreshold: belowThreshold,
        transactionId: transactionRef.id,
      }, "Credits debited successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "internal") // Only internal service accounts can call this
}
