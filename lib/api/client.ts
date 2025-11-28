/**
 * API Client for Control Tower Frontend
 * Type-safe API client for making requests to backend endpoints
 */

import {
  ApiResponse,
  PaginatedResponse,
  Agent,
  Team,
  BillingContract,
  Wallet,
  CreditTransaction,
  WhiteLabelConfig,
  Referral,
  TeamMember,
  TeamInvite,
  Invoice,
  PaginationParams,
  AgentCreateInput,
  AgentUpdateInput,
  TeamCreateInput,
  TeamUpdateInput,
  ContractCreateInput,
  CreditGrantInput,
} from "@/lib/types/api"
import { getCurrentUserToken } from "@/lib/firebase/client"
import { API_BASE_URL } from "@/lib/config"
import { fetchWithRetry } from "@/lib/utils/network"

class ApiClient {
  private apiKey: string | null = null

  setApiKey(key: string) {
    this.apiKey = key
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useRetry: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Add Firebase authentication
    try {
      const token = await getCurrentUserToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      } else if (this.apiKey) {
        // Fallback to API key if no Firebase token
        headers["x-api-key"] = this.apiKey
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error)
    }

    // Merge with provided headers
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    try {
      // Use retry logic for resilience
      const fetchFn = useRetry ? fetchWithRetry : fetch
      const response = await fetchFn(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Overview
  async getOverview() {
    return this.request<any>("/api/overview")
  }

  // Agents
  async getAgents(params?: PaginationParams & { teamId?: string; status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.teamId) queryParams.set("teamId", params.teamId)
    if (params?.status) queryParams.set("status", params.status)
    if (params?.search) queryParams.set("search", params.search)

    const queryString = queryParams.toString()
    return this.request<any>(`/api/agents${queryString ? `?${queryString}` : ''}`)
  }

  async getAgent(agentId: string) {
    return this.request<Agent>(`/api/agents/${agentId}`)
  }

  async createAgent(data: AgentCreateInput) {
    return this.request<Agent>("/api/agents", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAgent(agentId: string, data: AgentUpdateInput) {
    return this.request<Agent>(`/api/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteAgent(agentId: string) {
    return this.request<{ agentId: string }>(`/api/agents/${agentId}`, {
      method: "DELETE",
    })
  }

  // Teams
  async getTeams(params?: PaginationParams & { ownerId?: string; status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.ownerId) queryParams.set("ownerId", params.ownerId)
    if (params?.status) queryParams.set("status", params.status)
    if (params?.search) queryParams.set("search", params.search)

    const queryString = queryParams.toString()
    return this.request<any>(`/api/teams${queryString ? `?${queryString}` : ''}`)
  }

  async getTeam(teamId: string) {
    return this.request<Team>(`/api/teams/${teamId}`)
  }

  async createTeam(data: TeamCreateInput) {
    return this.request<Team>("/api/teams", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTeam(teamId: string, data: TeamUpdateInput) {
    return this.request<Team>(`/api/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteTeam(teamId: string) {
    return this.request<{ teamId: string }>(`/api/teams/${teamId}`, {
      method: "DELETE",
    })
  }

  // Team Members
  async getTeamMembers(teamId: string) {
    return this.request<{
      teamId: string
      totalSeats: number
      usedSeats: number
      availableSeats: number
      members: TeamMember[]
    }>(`/api/teams/${teamId}/members`)
  }

  async addTeamMember(teamId: string, data: { userId: string; email: string; role?: string }) {
    return this.request<TeamMember>(`/api/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async removeTeamMember(teamId: string, userId: string) {
    return this.request<{ teamId: string; userId: string }>(`/api/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    })
  }

  // Team Invites
  async getTeamInvites(teamId: string) {
    return this.request<TeamInvite[]>(`/api/teams/${teamId}/invites`)
  }

  async createTeamInvite(teamId: string, data: { email: string; role?: string }) {
    return this.request<TeamInvite>(`/api/teams/${teamId}/invites`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Billing & Contracts
  async getContracts(params?: PaginationParams & { teamId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.teamId) queryParams.set("teamId", params.teamId)

    const queryString = queryParams.toString()
    return this.request<PaginatedResponse<BillingContract>>(`/api/billing/contracts${queryString ? `?${queryString}` : ''}`)
  }

  async getContract(contractId: string) {
    return this.request<BillingContract>(`/api/billing/contracts/${contractId}`)
  }

  async createContract(data: ContractCreateInput) {
    return this.request<BillingContract>("/api/billing/contracts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateContract(contractId: string, data: Partial<BillingContract>) {
    return this.request<BillingContract>(`/api/billing/contracts/${contractId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async cancelContract(contractId: string) {
    return this.request<{ contractId: string }>(`/api/billing/contracts/${contractId}`, {
      method: "DELETE",
    })
  }

  // Invoices
  async getInvoices(teamId?: string) {
    const queryParams = teamId ? `?teamId=${teamId}` : ""
    return this.request<Invoice[]>(`/api/billing/invoices${queryParams}`)
  }

  async createInvoice(data: Omit<Invoice, "invoiceId">) {
    return this.request<Invoice>("/api/billing/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Wallets
  async getWallet(teamId: string) {
    return this.request<Wallet>(`/api/wallets?teamId=${teamId}`)
  }

  async createWallet(data: { teamId: string; balance?: number; currency?: string }) {
    return this.request<Wallet>("/api/wallets", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Credits
  async grantCredits(data: CreditGrantInput) {
    return this.request<{ wallet: Wallet; transaction: CreditTransaction }>("/api/credits/grant", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getTransactions(params?: PaginationParams & { teamId?: string; walletId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.teamId) queryParams.set("teamId", params.teamId)
    if (params?.walletId) queryParams.set("walletId", params.walletId)

    const queryString = queryParams.toString()
    return this.request<PaginatedResponse<CreditTransaction>>(`/api/credits/transactions${queryString ? `?${queryString}` : ''}`)
  }

  // White-Label
  async getWhiteLabelConfigs(teamId?: string) {
    const queryParams = teamId ? `?teamId=${teamId}` : ""
    return this.request<WhiteLabelConfig[]>(`/api/white-label${queryParams}`)
  }

  async getWhiteLabelConfig(configId: string) {
    return this.request<WhiteLabelConfig>(`/api/white-label/${configId}`)
  }

  async createWhiteLabelConfig(data: Omit<WhiteLabelConfig, "configId" | "createdAt" | "updatedAt">) {
    return this.request<WhiteLabelConfig>("/api/white-label", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateWhiteLabelConfig(configId: string, data: Partial<WhiteLabelConfig>) {
    return this.request<WhiteLabelConfig>(`/api/white-label/${configId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteWhiteLabelConfig(configId: string) {
    return this.request<{ configId: string }>(`/api/white-label/${configId}`, {
      method: "DELETE",
    })
  }

  // Referrals
  async getReferrals(params?: { referrerId?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.referrerId) queryParams.set("referrerId", params.referrerId)
    if (params?.status) queryParams.set("status", params.status)

    return this.request<Referral[]>(`/api/referrals?${queryParams}`)
  }

  async createReferral(data: Omit<Referral, "referralId" | "createdAt">) {
    return this.request<Referral>("/api/referrals", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Users
  async getUsers(params?: PaginationParams & { role?: string; status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.role) queryParams.set("role", params.role)
    if (params?.status) queryParams.set("status", params.status)
    if (params?.search) queryParams.set("search", params.search)

    const queryString = queryParams.toString()
    return this.request<any>(`/api/users${queryString ? `?${queryString}` : ''}`)
  }

  async getUser(userId: string) {
    return this.request<any>(`/api/users/${userId}`)
  }

  async createUser(data: any) {
    return this.request<any>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUser(userId: string, data: any) {
    return this.request<any>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(userId: string) {
    return this.request<any>(`/api/users/${userId}`, {
      method: "DELETE",
    })
  }

  async suspendUser(userId: string, reason?: string) {
    return this.request<any>(`/api/users/${userId}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }

  async activateUser(userId: string) {
    return this.request<any>(`/api/users/${userId}/activate`, {
      method: "POST",
    })
  }

  // Agent Analytics
  async getAgentAnalytics(agentId: string) {
    return this.request<any>(`/api/agents/${agentId}/analytics`)
  }

  // Team Analytics
  async getTeamAnalytics(teamId: string) {
    return this.request<any>(`/api/teams/${teamId}/analytics`)
  }

  // Subscriptions
  async getSubscriptions(teamId?: string) {
    const queryParams = teamId ? `?teamId=${teamId}` : ""
    return this.request<any>(`/api/subscriptions${queryParams}`)
  }

  async createSubscription(data: any) {
    return this.request<any>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true, reason?: string) {
    return this.request<any>(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancelAtPeriodEnd, reason }),
    })
  }

  // Plans
  async getSubscriptionPlans() {
    return this.request<any>("/api/subscriptions/plans")
  }

  async createSubscriptionPlan(data: any) {
    return this.request<any>("/api/subscriptions/plans", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteSubscriptionPlan(planId: string) {
    return this.request<any>(`/api/subscriptions/plans/${planId}`, {
      method: "DELETE",
    })
  }

  // Payment Methods
  async getPaymentMethods(teamId?: string) {
    const queryParams = teamId ? `?teamId=${teamId}` : ""
    return this.request<any>(`/api/payment-methods${queryParams}`)
  }

  async addPaymentMethod(data: any) {
    return this.request<any>("/api/payment-methods", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deletePaymentMethod(paymentMethodId: string) {
    return this.request<any>(`/api/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
    })
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    return this.request<any>(`/api/payment-methods/${paymentMethodId}/default`, {
      method: "POST",
    })
  }

  // Audit Logs
  async getAuditLogs(params?: PaginationParams & { userId?: string; resource?: string; startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.userId) queryParams.set("userId", params.userId)
    if (params?.resource) queryParams.set("resource", params.resource)
    if (params?.startDate) queryParams.set("startDate", params.startDate)
    if (params?.endDate) queryParams.set("endDate", params.endDate)

    const queryString = queryParams.toString()
    return this.request<any>(`/api/audit-logs${queryString ? `?${queryString}` : ''}`)
  }

  // Feature Flags
  async getFeatureFlags() {
    return this.request<any>("/api/admin/feature-flags")
  }

  async createFeatureFlag(data: any) {
    return this.request<any>("/api/admin/feature-flags", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateFeatureFlag(flagId: string, data: any) {
    return this.request<any>(`/api/admin/feature-flags/${flagId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // System Settings
  async getAdminSettings(category?: string) {
    const queryParams = category ? `?category=${category}` : ""
    return this.request<any>(`/api/admin/settings${queryParams}`)
  }

  async updateAdminSettings(settings: any) {
    return this.request<any>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  }

  // Reports
  async getUsageReport(startDate?: string, endDate?: string) {
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.set("startDate", startDate)
    if (endDate) queryParams.set("endDate", endDate)
    
    const queryString = queryParams.toString()
    return this.request<any>(`/api/reports/usage${queryString ? `?${queryString}` : ''}`)
  }

  async generateUsageReport(data: any) {
    return this.request<any>("/api/reports/usage", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing or multiple instances
export { ApiClient }
