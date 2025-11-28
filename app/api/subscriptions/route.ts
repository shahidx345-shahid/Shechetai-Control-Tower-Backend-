import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { SubscriptionDatabase, SubscriptionDatabase as SubDB, TeamDatabase, AuditLogDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

/**
 * GET /api/subscriptions
 * Get subscriptions with optional team filter
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamId = searchParams.get("teamId") || undefined

      let subscriptions = await SubscriptionDatabase.getAll()
      
      if (teamId) {
        subscriptions = subscriptions.filter(s => s.teamId === teamId)
      }
      
      return successResponse(subscriptions)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/subscriptions
 * Create a new subscription for a team
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.teamId || !body.planId) {
        return errorResponse("Missing required fields: teamId, planId", 400)
      }

      // Check if team exists
      const team = await TeamDatabase.getById(body.teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      // For now, create subscription without plan validation (plans could be in separate service)
      // const plan = await Database.getPlanById(body.planId)
      // if (!plan) {
      //   return errorResponse("Plan not found", 404)
      // }

      // Calculate period dates
      const currentPeriodStart = new Date().toISOString()
      const currentPeriodEnd = new Date()
      // Assume monthly by default
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

      const subscription = await SubscriptionDatabase.create({
        teamId: body.teamId,
        planId: body.planId,
        status: body.status || "active",
        currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        trialEnd: body.trialEnd,
        cancelAtPeriodEnd: false,
        userId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)

      // Create audit log
      await AuditLogDatabase.create({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "subscription_created",
        resource: "subscription",
        resourceId: subscription.subscriptionId || "",
        details: { teamId: body.teamId, planId: body.planId },
        timestamp: new Date().toISOString(),
      } as any)

      return successResponse(subscription, "Subscription created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
