"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api/client"
import { getCurrentUser, getCurrentUserToken } from "@/lib/firebase/client"

export default function TestApiPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, success: boolean, data: any) => {
    setTestResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }])
  }

  const runTests = async () => {
    setTestResults([])
    setLoading(true)

    try {
      // Test 1: Check Firebase Auth
      const user = getCurrentUser()
      addResult("Firebase Auth", !!user, { email: user?.email, uid: user?.uid })

      // Test 2: Get Firebase Token
      const token = await getCurrentUserToken()
      addResult("Firebase Token", !!token, { tokenLength: token?.length })

      // Test 3: Fetch Agents
      try {
        const agentsResponse = await apiClient.getAgents()
        addResult("GET /api/agents", agentsResponse.success, agentsResponse)
      } catch (error: any) {
        addResult("GET /api/agents", false, { error: error.message })
      }

      // Test 4: Fetch Teams
      try {
        const teamsResponse = await apiClient.getTeams()
        addResult("GET /api/teams", teamsResponse.success, teamsResponse)
      } catch (error: any) {
        addResult("GET /api/teams", false, { error: error.message })
      }

      // Test 5: Fetch Overview
      try {
        const overviewResponse = await apiClient.getOverview()
        addResult("GET /api/overview", overviewResponse.success, overviewResponse)
      } catch (error: any) {
        addResult("GET /api/overview", false, { error: error.message })
      }

    } catch (error: any) {
      addResult("Test Suite", false, { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">API Test Page</h1>
        <p className="text-muted-foreground">
          Test your API endpoints and authentication
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Running Tests..." : "Run API Tests"}
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.success
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{result.test}</h3>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  result.success
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {result.success ? "✓ PASS" : "✗ FAIL"}
              </span>
            </div>
            <pre className="text-xs text-muted-foreground overflow-auto p-3 bg-black/20 rounded">
              {JSON.stringify(result.data, null, 2)}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {testResults.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Click "Run API Tests" to start testing your endpoints</p>
        </div>
      )}
    </div>
  )
}
