import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{ paymentMethodId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const params = await context.params
      const { paymentMethodId } = params

      const method = await Database.setDefaultPaymentMethod(paymentMethodId)

      if (!method) {
        return NextResponse.json(
          { success: false, error: "Payment method not found" },
          { status: 404 }
        )
      }

      // Log the action
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email || "unknown",
        action: "set_default_payment_method",
        resource: "payment_method",
        resourceId: paymentMethodId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        details: `Set payment method ${paymentMethodId} as default`,
      })

      return NextResponse.json({
        success: true,
        data: method,
        message: "Default payment method updated",
      })
    } catch (error) {
      console.error("Set default payment method error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to set default payment method" },
        { status: 500 }
      )
    }
  })
}
