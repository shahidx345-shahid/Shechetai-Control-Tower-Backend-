import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/subscriptions/plans
 * List all available subscription plans
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const plans = await Database.getPlans()
      
      return successResponse(plans)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/subscriptions/plans
 * Create a new subscription plan (Super Admin only)
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.name || !body.tier || body.price === undefined) {
        return errorResponse("Missing required fields: name, tier, price", 400)
      }

      const plan = await Database.createPlan({
        name: body.name,
        tier: body.tier,
        price: body.price,
        currency: body.currency || "USD",
        billingCycle: body.billingCycle || "monthly",
        features: body.features || [],
        limits: body.limits || { seats: 1, agents: 1, requests: 100 },
        status: body.status || "active",
      })

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "plan_created",
        resource: "subscription_plan",
        resourceId: plan.planId,
        details: { name: plan.name, tier: plan.tier, price: plan.price },
      })

      return successResponse(plan, "Plan created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
