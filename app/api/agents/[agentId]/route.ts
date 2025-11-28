import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { AgentDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    agentId: string
  }>
}

/**
 * GET /api/agents/[agentId]
 * Get agent by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { agentId } = await context.params
      
      const agent = await AgentDatabase.getById(agentId)
      
      if (!agent) {
        return errorResponse("Agent not found", 404)
      }

      return successResponse(agent)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * PATCH /api/agents/[agentId]
 * Update agent
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req) => {
    try {
      const { agentId } = await context.params
      const body = await req.json()

      const agent = await AgentDatabase.getById(agentId)
      if (!agent) {
        return errorResponse("Agent not found", 404)
      }

      const updatedAgent = await AgentDatabase.update(agentId, body)

      return successResponse(updatedAgent, "Agent updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * DELETE /api/agents/[agentId]
 * Delete agent
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { agentId } = await context.params

      const agent = await AgentDatabase.getById(agentId)
      if (!agent) {
        return errorResponse("Agent not found", 404)
      }

      await AgentDatabase.delete(agentId)

      return successResponse({ agentId }, "Agent deleted successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
