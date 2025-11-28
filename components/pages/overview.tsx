"use client"

import { useState, useEffect } from "react"
import { Search, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { getCurrentUserToken } from "@/lib/firebase/client"

export default function OverviewPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({ agents: 0, teams: 0, loading: true })

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const token = await getCurrentUserToken()
        if (!token) return

        const response = await fetch('/api/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          setStats({
            agents: data.data?.totalAgents || 0,
            teams: data.data?.totalTeams || 0,
            loading: false
          })
        }
      } catch (error) {
        console.error('Error fetching overview:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchOverviewData()
  }, [])

  const healthMetrics = [
    {
      label: "System Health",
      value: "Operational",
      icon: CheckCircle,
      color: "green",
      status: "All systems operational",
    },
    { label: "Active Agents", value: stats.loading ? "..." : stats.agents.toString(), icon: AlertCircle, color: "cyan", status: "Real-time data" },
    { label: "Teams", value: stats.loading ? "..." : stats.teams.toString(), icon: AlertCircle, color: "teal", status: "Real-time data" },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Overview</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Health status and quick navigation to platform resources
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              style={{
                animation: `fadeInUp 0.4s ease - out ${index * 0.1}s both`,
              }}
              className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-sm sm:text-base text-card-foreground">{metric.label}</h3>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{metric.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">{metric.status}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Last update: just now
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Search */}
      <div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <h2 className="text-base sm:text-lg font-semibold text-card-foreground mb-2">Quick Search</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">Find and jump directly to teams or agents</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter teamId or agentId..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-input border border-border rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </div>
        {searchQuery && (
          <div
            className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs sm:text-sm text-muted-foreground animate-fade-in"
            style={{ animation: `fadeIn 0.2s ease - out` }}
          >
            <p className="font-semibold text-foreground mb-1">Search Results</p>
            Searching for: <span className="font-mono text-primary font-semibold">{searchQuery}</span>
          </div>
        )}
      </div>
    </div>
  )
}
