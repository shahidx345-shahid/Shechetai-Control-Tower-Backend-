import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError, parsePagination, createPaginatedResponse } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { AgentDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

/**
 * GET /api/agents
 * List all agents from backend
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)

      const { page, limit } = parsePagination(searchParams)

      const filters: { teamId?: string; status?: string; search?: string } = {}
      if (searchParams.get("teamId")) filters.teamId = searchParams.get("teamId")!
      if (searchParams.get("status")) filters.status = searchParams.get("status")!
      if (searchParams.get("search")) filters.search = searchParams.get("search")!

      const agents = await AgentDatabase.getAll()
      
      // Apply filters in-memory
      let filtered = agents
      if (filters.teamId) {
        filtered = filtered.filter(a => a.teamId === filters.teamId)
      }
      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status)
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(a => 
          a.agentId.toLowerCase().includes(search) ||
          a.name.toLowerCase().includes(search)
        )
      }
      
      const total = filtered.length
      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)

      return successResponse(createPaginatedResponse(paginated, total, page, limit))
    } catch (error) {
      console.error("Proxy Error:", error)
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/agents
 * Create a new agent via backend
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      const token = req.headers.get("authorization")

      // Validate required fields
      if (!body.name || !body.teamId) {
        return errorResponse("Missing required fields: name, teamId", 400)
      }

      const response = await fetch("https://hooks.shechet.com/_config/agents.upsertMeta", {
        method: "POST",
        headers: {
          "Authorization": token || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...body,
          status: body.status || "active"
        })
      })

      if (!response.ok) {
        // Backend failed — fall back to Firebase
        console.warn(`Backend agent create failed with ${response.status}, falling back to Firebase`)        
        const created = await AgentDatabase.create({
          name: body.name,
          teamId: body.teamId,
          status: body.status || "active",
          seatUsage: body.seatUsage || { used: 0, cap: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any)

        return successResponse(created, "Agent created in Firebase (backend unavailable)")
      }

      const data = await response.json()
      return successResponse(data, "Agent created successfully")
    } catch (error) {
      console.error("Proxy Error:", error)
      return handleApiError(error)
    }
  })
}
