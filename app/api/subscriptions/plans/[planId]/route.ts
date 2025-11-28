import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{ planId: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const params = await context.params
      const { planId } = params

      const success = await Database.deletePlan(planId)

      if (!success) {
        return NextResponse.json(
          { success: false, error: "Plan not found" },
          { status: 404 }
        )
      }

      // Log the action
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email || "unknown",
        action: "delete_plan",
        resource: "subscription_plan",
        resourceId: planId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        details: `Deleted plan ${planId}`,
      })

      return NextResponse.json({
        success: true,
        data: { planId },
        message: "Plan deleted successfully",
      })
    } catch (error) {
      console.error("Delete plan error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to delete plan" },
        { status: 500 }
      )
    }
  })
}
