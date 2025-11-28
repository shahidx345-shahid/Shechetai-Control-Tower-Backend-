import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    paymentMethodId: string
  }>
}

/**
 * DELETE /api/payment-methods/[paymentMethodId]
 * Remove a payment method
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { paymentMethodId } = await context.params

      const success = await Database.deletePaymentMethod(paymentMethodId)
      
      if (!success) {
        return errorResponse("Payment method not found", 404)
      }

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "payment_method_removed",
        resource: "payment_method",
        resourceId: paymentMethodId,
        details: {},
      })

      return successResponse({ paymentMethodId }, "Payment method removed successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
