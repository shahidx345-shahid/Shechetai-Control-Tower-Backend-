import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    subscriptionId: string
  }>
}

/**
 * POST /api/subscriptions/[subscriptionId]/cancel
 * Cancel a subscription
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { subscriptionId } = await context.params
      const body = await req.json()

      const subscription = await Database.getSubscription(subscriptionId)
      if (!subscription) {
        return errorResponse("Subscription not found", 404)
      }

      const cancelAtPeriodEnd = body.cancelAtPeriodEnd !== false

      const updatedSubscription = await Database.updateSubscription(subscriptionId, {
        status: cancelAtPeriodEnd ? subscription.status : "cancelled",
        cancelAtPeriodEnd,
      })

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "subscription_cancelled",
        resource: "subscription",
        resourceId: subscriptionId,
        details: { 
          teamId: subscription.teamId,
          cancelAtPeriodEnd,
          reason: body.reason || "No reason provided",
        },
      })

      return successResponse(
        updatedSubscription, 
        cancelAtPeriodEnd 
          ? "Subscription will be cancelled at period end" 
          : "Subscription cancelled immediately"
      )
    } catch (error) {
      return handleApiError(error)
    }
  })
}
