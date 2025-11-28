/**
 * Database utility functions
 * This is a mock implementation - replace with your actual database client
 * (e.g., Prisma, Drizzle, MongoDB, PostgreSQL)
 */

import { 
  Agent, Team, BillingContract, Wallet, CreditTransaction, Referral, 
  WhiteLabelConfig, TeamMember, TeamInvite, Invoice, User, AgentAnalytics,
  TeamAnalytics, SubscriptionPlan, Subscription, PaymentMethod, AuditLog,
  SystemSettings, FeatureFlag, UsageReport
} from "@/lib/types/api"

// Mock in-memory database (replace with real database)
let mockAgents: Agent[] = []
let mockTeams: Team[] = []
let mockContracts: BillingContract[] = []
let mockWallets: Wallet[] = []
let mockTransactions: CreditTransaction[] = []
let mockReferrals: Referral[] = []
let mockWhiteLabels: WhiteLabelConfig[] = []
let mockTeamMembers: TeamMember[] = []
let mockInvites: TeamInvite[] = []
let mockInvoices: Invoice[] = []
let mockUsers: User[] = []
let mockSubscriptions: Subscription[] = []
let mockPlans: SubscriptionPlan[] = []
let mockPaymentMethods: PaymentMethod[] = []
let mockAuditLogs: AuditLog[] = []
let mockSystemSettings: SystemSettings[] = []
let mockFeatureFlags: FeatureFlag[] = []
let mockUsageReports: UsageReport[] = []

// Initialize with some mock data
function initializeMockData() {
  mockUsers = [
    {
      userId: "user_001",
      email: "admin@shechetai.com",
      name: "Super Admin",
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
    {
      userId: "user_002",
      email: "john@acme.com",
      name: "John Doe",
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  mockTeams = [
    {
      teamId: "team_123",
      name: "Acme Corp",
      ownerId: "user_001",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seatCap: 10,
      seatUsage: 3,
      billingStatus: "active",
    },
    {
      teamId: "team_124",
      name: "TechStart Inc",
      ownerId: "user_002",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seatCap: 15,
      seatUsage: 7,
      billingStatus: "active",
    },
  ]

  mockAgents = [
    {
      agentId: "agent_001",
      name: "AI Assistant Pro",
      teamId: "team_123",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seatUsage: { used: 3, cap: 10 },
    },
    {
      agentId: "agent_002",
      name: "Customer Support Bot",
      teamId: "team_124",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seatUsage: { used: 7, cap: 15 },
    },
  ]

  mockWallets = [
    {
      walletId: "wallet_001",
      teamId: "team_123",
      balance: 1000,
      currency: "credits",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  mockPlans = [
    {
      planId: "plan_free",
      name: "Free Plan",
      tier: "free",
      price: 0,
      currency: "USD",
      billingCycle: "monthly",
      features: ["1 agent", "100 requests/month"],
      limits: { seats: 1, agents: 1, requests: 100 },
      status: "active",
    },
    {
      planId: "plan_pro",
      name: "Pro Plan",
      tier: "pro",
      price: 99,
      currency: "USD",
      billingCycle: "monthly",
      features: ["10 agents", "Unlimited requests", "Priority support"],
      limits: { seats: 10, agents: 10, requests: -1 },
      status: "active",
    },
  ]

  mockFeatureFlags = [
    {
      flagId: "flag_001",
      name: "White Label",
      key: "white_label_enabled",
      enabled: true,
      description: "Enable white-label functionality",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

// Initialize data
initializeMockData()

/**
 * Database class with common CRUD operations
 * Replace this with your actual ORM or database client
 */
export class Database {
  // Agent operations
  static async getAgents(filters?: { teamId?: string; status?: string; search?: string }) {
    let result = [...mockAgents]
    
    if (filters?.teamId) {
      result = result.filter(a => a.teamId === filters.teamId)
    }
    if (filters?.status) {
      result = result.filter(a => a.status === filters.status)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(a => 
        a.agentId.toLowerCase().includes(search) ||
        a.name.toLowerCase().includes(search)
      )
    }
    
    return result
  }

  static async getAgentById(agentId: string) {
    return mockAgents.find(a => a.agentId === agentId) || null
  }

  static async getAgent(agentId: string) {
    return this.getAgentById(agentId)
  }

  static async createAgent(data: Omit<Agent, "agentId" | "createdAt" | "updatedAt">) {
    const agent: Agent = {
      ...data,
      agentId: `agent_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockAgents.push(agent)
    return agent
  }

  static async updateAgent(agentId: string, data: Partial<Agent>) {
    const index = mockAgents.findIndex(a => a.agentId === agentId)
    if (index === -1) return null
    
    mockAgents[index] = {
      ...mockAgents[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockAgents[index]
  }

  static async deleteAgent(agentId: string) {
    const index = mockAgents.findIndex(a => a.agentId === agentId)
    if (index === -1) return false
    
    mockAgents.splice(index, 1)
    return true
  }

  // Team operations
  static async getTeams(filters?: { ownerId?: string; status?: string; search?: string }) {
    let result = [...mockTeams]
    
    if (filters?.ownerId) {
      result = result.filter(t => t.ownerId === filters.ownerId)
    }
    if (filters?.status) {
      result = result.filter(t => t.status === filters.status)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(t => 
        t.teamId.toLowerCase().includes(search) ||
        t.name.toLowerCase().includes(search)
      )
    }
    
    return result
  }

  static async getTeamById(teamId: string) {
    return mockTeams.find(t => t.teamId === teamId) || null
  }

  static async getTeam(teamId: string) {
    return this.getTeamById(teamId)
  }

  static async createTeam(data: Omit<Team, "teamId" | "createdAt" | "updatedAt" | "seatUsage">) {
    const team: Team = {
      ...data,
      teamId: `team_${Date.now()}`,
      seatUsage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockTeams.push(team)
    return team
  }

  static async updateTeam(teamId: string, data: Partial<Team>) {
    const index = mockTeams.findIndex(t => t.teamId === teamId)
    if (index === -1) return null
    
    mockTeams[index] = {
      ...mockTeams[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockTeams[index]
  }

  static async deleteTeam(teamId: string) {
    const index = mockTeams.findIndex(t => t.teamId === teamId)
    if (index === -1) return false
    
    mockTeams.splice(index, 1)
    return true
  }

  // Wallet operations
  static async getWalletByTeamId(teamId: string) {
    return mockWallets.find(w => w.teamId === teamId) || null
  }

  static async createWallet(data: Omit<Wallet, "walletId" | "createdAt" | "updatedAt">) {
    const wallet: Wallet = {
      ...data,
      walletId: `wallet_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockWallets.push(wallet)
    return wallet
  }

  static async updateWalletBalance(walletId: string, amount: number) {
    const wallet = mockWallets.find(w => w.walletId === walletId)
    if (!wallet) return null
    
    wallet.balance += amount
    wallet.updatedAt = new Date().toISOString()
    return wallet
  }

  // Transaction operations
  static async createTransaction(data: Omit<CreditTransaction, "transactionId" | "createdAt">) {
    const transaction: CreditTransaction = {
      ...data,
      transactionId: `txn_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockTransactions.push(transaction)
    return transaction
  }

  static async getTransactions(filters?: { teamId?: string; walletId?: string }) {
    let result = [...mockTransactions]
    
    if (filters?.teamId) {
      result = result.filter(t => t.teamId === filters.teamId)
    }
    if (filters?.walletId) {
      result = result.filter(t => t.walletId === filters.walletId)
    }
    
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Contract operations
  static async getContracts(teamId?: string) {
    if (teamId) {
      return mockContracts.filter(c => c.teamId === teamId)
    }
    return mockContracts
  }

  static async getContractById(contractId: string) {
    return mockContracts.find(c => c.contractId === contractId) || null
  }

  static async createContract(data: Omit<BillingContract, "contractId">) {
    const contract: BillingContract = {
      ...data,
      contractId: `contract_${Date.now()}`,
    }
    mockContracts.push(contract)
    return contract
  }

  static async updateContract(contractId: string, data: Partial<BillingContract>) {
    const index = mockContracts.findIndex(c => c.contractId === contractId)
    if (index === -1) return null
    
    mockContracts[index] = {
      ...mockContracts[index],
      ...data,
    }
    return mockContracts[index]
  }

  // Referral operations
  static async getReferrals(filters?: { referrerId?: string; status?: string }) {
    let result = [...mockReferrals]
    
    if (filters?.referrerId) {
      result = result.filter(r => r.referrerId === filters.referrerId)
    }
    if (filters?.status) {
      result = result.filter(r => r.status === filters.status)
    }
    
    return result
  }

  static async createReferral(data: Omit<Referral, "referralId" | "createdAt">) {
    const referral: Referral = {
      ...data,
      referralId: `ref_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockReferrals.push(referral)
    return referral
  }

  // White-label operations
  static async getWhiteLabelConfigs(teamId?: string) {
    if (teamId) {
      return mockWhiteLabels.filter(w => w.teamId === teamId)
    }
    return mockWhiteLabels
  }

  static async getWhiteLabelById(configId: string) {
    return mockWhiteLabels.find(w => w.configId === configId) || null
  }

  static async getWhiteLabel(configId: string) {
    return this.getWhiteLabelById(configId)
  }

  static async createWhiteLabel(data: Omit<WhiteLabelConfig, "configId" | "createdAt" | "updatedAt">) {
    const config: WhiteLabelConfig = {
      ...data,
      configId: `wl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockWhiteLabels.push(config)
    return config
  }

  static async updateWhiteLabel(configId: string, data: Partial<WhiteLabelConfig>) {
    const index = mockWhiteLabels.findIndex(w => w.configId === configId)
    if (index === -1) return null
    
    mockWhiteLabels[index] = {
      ...mockWhiteLabels[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockWhiteLabels[index]
  }

  static async deleteWhiteLabel(configId: string) {
    const index = mockWhiteLabels.findIndex(w => w.configId === configId)
    if (index === -1) return false
    
    mockWhiteLabels.splice(index, 1)
    return true
  }

  // Team member operations
  static async getTeamMembers(teamId: string) {
    return mockTeamMembers.filter(m => m.teamId === teamId)
  }

  static async addTeamMember(data: TeamMember) {
    mockTeamMembers.push(data)
    return data
  }

  static async removeTeamMember(teamId: string, userId: string) {
    const index = mockTeamMembers.findIndex(m => m.teamId === teamId && m.userId === userId)
    if (index === -1) return false
    
    mockTeamMembers.splice(index, 1)
    return true
  }

  // Invite operations
  static async getInvites(teamId?: string) {
    if (teamId) {
      return mockInvites.filter(i => i.teamId === teamId)
    }
    return mockInvites
  }

  static async getInvite(inviteId: string) {
    return mockInvites.find(i => i.inviteId === inviteId) || null
  }

  static async createInvite(data: Omit<TeamInvite, "inviteId" | "createdAt">) {
    const invite: TeamInvite = {
      ...data,
      inviteId: `invite_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockInvites.push(invite)
    return invite
  }

  static async updateInvite(inviteId: string, data: Partial<TeamInvite>) {
    const index = mockInvites.findIndex(i => i.inviteId === inviteId)
    if (index === -1) return null
    
    mockInvites[index] = {
      ...mockInvites[index],
      ...data,
    }
    return mockInvites[index]
  }

  // Invoice operations
  static async getInvoices(teamId?: string) {
    if (teamId) {
      return mockInvoices.filter(i => i.teamId === teamId)
    }
    return mockInvoices
  }

  static async createInvoice(data: Omit<Invoice, "invoiceId">) {
    const invoice: Invoice = {
      ...data,
      invoiceId: `inv_${Date.now()}`,
    }
    mockInvoices.push(invoice)
    return invoice
  }

  // User operations
  static async getUsers(filters?: { role?: string; status?: string; search?: string }) {
    let result = [...mockUsers]
    
    if (filters?.role) {
      result = result.filter(u => u.role === filters.role)
    }
    if (filters?.status) {
      result = result.filter(u => u.status === filters.status)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(u => 
        u.userId.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search)
      )
    }
    
    return result
  }

  static async getUserById(userId: string) {
    return mockUsers.find(u => u.userId === userId) || null
  }

  static async getUser(userId: string) {
    return this.getUserById(userId)
  }

  static async getUserByEmail(email: string) {
    return mockUsers.find(u => u.email === email) || null
  }

  static async createUser(data: Omit<User, "userId" | "createdAt" | "updatedAt">) {
    const user: User = {
      ...data,
      userId: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockUsers.push(user)
    return user
  }

  static async updateUser(userId: string, data: Partial<User>) {
    const index = mockUsers.findIndex(u => u.userId === userId)
    if (index === -1) return null
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockUsers[index]
  }

  static async deleteUser(userId: string) {
    const index = mockUsers.findIndex(u => u.userId === userId)
    if (index === -1) return false
    
    mockUsers[index].status = "deleted"
    return true
  }

  // Subscription operations
  static async getSubscriptions(teamId?: string) {
    if (teamId) {
      return mockSubscriptions.filter(s => s.teamId === teamId)
    }
    return mockSubscriptions
  }

  static async getSubscriptionById(subscriptionId: string) {
    return mockSubscriptions.find(s => s.subscriptionId === subscriptionId) || null
  }

  static async getSubscription(subscriptionId: string) {
    return this.getSubscriptionById(subscriptionId)
  }

  static async createSubscription(data: Omit<Subscription, "subscriptionId" | "createdAt" | "updatedAt">) {
    const subscription: Subscription = {
      ...data,
      subscriptionId: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockSubscriptions.push(subscription)
    return subscription
  }

  static async updateSubscription(subscriptionId: string, data: Partial<Subscription>) {
    const index = mockSubscriptions.findIndex(s => s.subscriptionId === subscriptionId)
    if (index === -1) return null
    
    mockSubscriptions[index] = {
      ...mockSubscriptions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockSubscriptions[index]
  }

  // Plan operations
  static async getPlans() {
    return mockPlans.filter(p => p.status === "active")
  }

  static async getPlanById(planId: string) {
    return mockPlans.find(p => p.planId === planId) || null
  }

  static async createPlan(data: Omit<SubscriptionPlan, "planId">) {
    const plan: SubscriptionPlan = {
      ...data,
      planId: `plan_${Date.now()}`,
    }
    mockPlans.push(plan)
    return plan
  }

  static async updatePlan(planId: string, data: Partial<SubscriptionPlan>) {
    const index = mockPlans.findIndex(p => p.planId === planId)
    if (index === -1) return null
    
    mockPlans[index] = {
      ...mockPlans[index],
      ...data,
    }
    return mockPlans[index]
  }

  static async deletePlan(planId: string) {
    const index = mockPlans.findIndex(p => p.planId === planId)
    if (index === -1) return false
    
    mockPlans.splice(index, 1)
    return true
  }

  // Payment Method operations
  static async getPaymentMethods(teamId?: string) {
    if (teamId) {
      return mockPaymentMethods.filter(pm => pm.teamId === teamId)
    }
    return mockPaymentMethods
  }

  static async createPaymentMethod(data: Omit<PaymentMethod, "paymentMethodId" | "createdAt">) {
    const paymentMethod: PaymentMethod = {
      ...data,
      paymentMethodId: `pm_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockPaymentMethods.push(paymentMethod)
    return paymentMethod
  }

  static async deletePaymentMethod(paymentMethodId: string) {
    const index = mockPaymentMethods.findIndex(pm => pm.paymentMethodId === paymentMethodId)
    if (index === -1) return false
    
    mockPaymentMethods.splice(index, 1)
    return true
  }

  static async setDefaultPaymentMethod(paymentMethodId: string) {
    const method = mockPaymentMethods.find(pm => pm.paymentMethodId === paymentMethodId)
    if (!method) return null
    
    // Remove default from all other payment methods for the same team
    mockPaymentMethods.forEach(pm => {
      if (pm.teamId === method.teamId) {
        pm.isDefault = false
      }
    })
    
    // Set this one as default
    method.isDefault = true
    return method
  }

  // Audit Log operations
  static async createAuditLog(data: Omit<AuditLog, "logId" | "timestamp">) {
    const log: AuditLog = {
      ...data,
      logId: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    mockAuditLogs.push(log)
    return log
  }

  static async getAuditLogs(filters?: { userId?: string; resource?: string; startDate?: string; endDate?: string }) {
    let result = [...mockAuditLogs]
    
    if (filters?.userId) {
      result = result.filter(l => l.userId === filters.userId)
    }
    if (filters?.resource) {
      result = result.filter(l => l.resource === filters.resource)
    }
    if (filters?.startDate) {
      result = result.filter(l => new Date(l.timestamp) >= new Date(filters.startDate!))
    }
    if (filters?.endDate) {
      result = result.filter(l => new Date(l.timestamp) <= new Date(filters.endDate!))
    }
    
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // System Settings operations
  static async getSettings(category?: string) {
    if (category) {
      return mockSystemSettings.filter(s => s.category === category)
    }
    return mockSystemSettings
  }

  static async getSettingByKey(key: string) {
    return mockSystemSettings.find(s => s.key === key) || null
  }

  static async updateSetting(key: string, value: any, updatedBy: string) {
    const index = mockSystemSettings.findIndex(s => s.key === key)
    
    if (index === -1) {
      const setting: SystemSettings = {
        settingId: `setting_${Date.now()}`,
        key,
        value,
        category: "general",
        updatedAt: new Date().toISOString(),
        updatedBy,
      }
      mockSystemSettings.push(setting)
      return setting
    }
    
    mockSystemSettings[index] = {
      ...mockSystemSettings[index],
      value,
      updatedAt: new Date().toISOString(),
      updatedBy,
    }
    return mockSystemSettings[index]
  }

  // Feature Flag operations
  static async getFeatureFlags() {
    return mockFeatureFlags
  }

  static async getFeatureFlagByKey(key: string) {
    return mockFeatureFlags.find(f => f.key === key) || null
  }

  static async getFeatureFlag(key: string) {
    return this.getFeatureFlagByKey(key)
  }

  static async updateFeatureFlag(flagId: string, data: Partial<FeatureFlag>) {
    const index = mockFeatureFlags.findIndex(f => f.flagId === flagId)
    if (index === -1) return null
    
    mockFeatureFlags[index] = {
      ...mockFeatureFlags[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockFeatureFlags[index]
  }

  static async createFeatureFlag(data: Omit<FeatureFlag, "flagId" | "createdAt" | "updatedAt">) {
    const flag: FeatureFlag = {
      ...data,
      flagId: `flag_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockFeatureFlags.push(flag)
    return flag
  }

  // Agent Analytics operations
  static async getAgentAnalytics(agentId: string): Promise<AgentAnalytics> {
    // Mock analytics data
    return {
      agentId,
      totalRequests: Math.floor(Math.random() * 10000),
      successfulRequests: Math.floor(Math.random() * 9000),
      failedRequests: Math.floor(Math.random() * 1000),
      averageResponseTime: Math.random() * 500,
      lastUsedAt: new Date().toISOString(),
      usageByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 100),
      })),
    }
  }

  // Team Analytics operations
  static async getTeamAnalytics(teamId: string): Promise<TeamAnalytics> {
    const team = await this.getTeamById(teamId)
    const agents = await this.getAgents({ teamId })
    const members = await this.getTeamMembers(teamId)
    
    return {
      teamId,
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === "active").length,
      totalMembers: members.length,
      seatUtilization: team ? (members.length / team.seatCap) * 100 : 0,
      totalRequests: Math.floor(Math.random() * 50000),
      monthlySpend: Math.random() * 5000,
      activityLog: [],
    }
  }

  // Usage Report operations
  static async createUsageReport(data: Omit<UsageReport, "reportId" | "generatedAt">) {
    const report: UsageReport = {
      ...data,
      reportId: `report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
    }
    mockUsageReports.push(report)
    return report
  }

  static async getUsageReports(teamId?: string) {
    if (teamId) {
      return mockUsageReports.filter(r => r.teamId === teamId)
    }
    return mockUsageReports
  }
}
