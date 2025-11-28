import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError, parsePagination, createPaginatedResponse } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { TeamDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

/**
 * GET /api/teams
 * List all teams with optional filters
 */
/**
 * GET /api/teams
 * List teams from backend
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)

      // Parse pagination and filters
      const { page, limit } = parsePagination(searchParams)

      const filters: { ownerId?: string; status?: string; search?: string } = {}
      if (searchParams.get("ownerId")) filters.ownerId = searchParams.get("ownerId")!
      if (searchParams.get("status")) filters.status = searchParams.get("status")!
      if (searchParams.get("search")) filters.search = searchParams.get("search")!

      // Use Firebase Firestore for teams
      const teams = await TeamDatabase.getAll()
      
      // Apply filters in-memory (since Firestore doesn't support complex filtering easily)
      let filtered = teams
      if (filters.ownerId) {
        filtered = filtered.filter(t => t.ownerId === filters.ownerId)
      }
      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status)
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(t => 
          t.teamId.toLowerCase().includes(search) ||
          t.name.toLowerCase().includes(search)
        )
      }

      const total = filtered.length
      const start = (page - 1) * limit
      const end = start + limit
      const paginated = filtered.slice(start, end)

      return successResponse(createPaginatedResponse(paginated, total, page, limit))
    } catch (error) {
      console.error("Proxy Error (Teams):", error)
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/teams
 * Create a new team via backend
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      const token = req.headers.get("authorization")

      // Validate required fields
      if (!body.name || !body.ownerId) {
        return errorResponse("Missing required fields: name, ownerId", 400)
      }

      const response = await fetch("https://hooks.shechet.com/_config/teams.create", {
        method: "POST",
        headers: {
          "Authorization": token || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...body,
          seatCap: body.seatCap || 5,
          status: body.status || "active"
        })
      })

      if (!response.ok) {
        // Backend failed — fall back to local Firebase mock so UI can continue in dev
        console.warn(`Backend team create failed with ${response.status}, falling back to Firebase`)        
        const created = await TeamDatabase.create({
          name: body.name,
          ownerId: body.ownerId,
          seatCap: body.seatCap || 5,
          status: body.status || "active",
          seatUsage: 0,
          billingStatus: "active",
        } as any)

        return successResponse(created, "Team created in Firebase (backend unavailable)")
      }

      const data = await response.json()
      return successResponse(data, "Team created successfully")
    } catch (error) {
      console.error("Proxy Error:", error)
      return handleApiError(error)
    }
  })
}
