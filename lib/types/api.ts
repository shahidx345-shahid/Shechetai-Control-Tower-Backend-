// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Agent Types
export interface Agent {
  agentId: string
  name: string
  teamId: string
  status: "active" | "inactive" | "suspended"
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
  seatUsage?: {
    used: number
    cap: number
  }
}

export interface AgentCreateInput {
  name: string
  teamId: string
  status?: "active" | "inactive" | "suspended"
  metadata?: Record<string, any>
}

export interface AgentUpdateInput {
  name?: string
  status?: "active" | "inactive" | "suspended"
  metadata?: Record<string, any>
}

// Team Types
export interface Team {
  teamId: string
  name: string
  ownerId: string
  status: "active" | "suspended" | "deleted"
  createdAt: string
  updatedAt: string
  seatCap: number
  seatUsage: number
  billingStatus?: string
  metadata?: Record<string, any>
}

export interface TeamCreateInput {
  name: string
  ownerId: string
  seatCap?: number
  metadata?: Record<string, any>
}

export interface TeamUpdateInput {
  name?: string
  seatCap?: number
  status?: "active" | "suspended" | "deleted"
  metadata?: Record<string, any>
}

export interface TeamMember {
  userId: string
  teamId: string
  role: "owner" | "admin" | "member"
  email: string
  joinedAt: string
  status: "active" | "invited" | "removed"
}

export interface TeamInvite {
  inviteId: string
  teamId: string
  email: string
  role: "admin" | "member"
  status: "pending" | "accepted" | "expired" | "cancelled"
  invitedBy: string
  createdAt: string
  expiresAt: string
}

// Billing & Contracts
export interface BillingContract {
  contractId: string
  teamId: string
  planType: "free" | "starter" | "pro" | "enterprise" | "custom"
  status: "active" | "cancelled" | "suspended" | "expired"
  startDate: string
  endDate?: string
  billingCycle: "monthly" | "yearly" | "custom"
  amount: number
  currency: string
  metadata?: Record<string, any>
}

export interface Invoice {
  invoiceId: string
  contractId: string
  teamId: string
  amount: number
  currency: string
  status: "pending" | "paid" | "failed" | "refunded"
  issueDate: string
  dueDate: string
  paidAt?: string
  metadata?: Record<string, any>
}

export interface ContractCreateInput {
  teamId: string
  planType: string
  billingCycle: string
  amount: number
  currency?: string
  startDate?: string
  endDate?: string
  metadata?: Record<string, any>
}

// Credits & Wallets
export interface Wallet {
  walletId: string
  teamId: string
  balance: number
  currency: "USD" | "credits"
  status: "active" | "suspended" | "frozen"
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface CreditTransaction {
  transactionId: string
  walletId: string
  teamId: string
  type: "credit" | "debit" | "refund" | "grant"
  amount: number
  balance: number
  description: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface CreditGrantInput {
  teamId: string
  amount: number
  reason: string
  metadata?: Record<string, any>
}

// Referrals
export interface ReferralProgram {
  programId: string
  name: string
  status: "active" | "inactive"
  rewardType: "credits" | "discount" | "custom"
  referrerReward: number
  refereeReward: number
  createdAt: string
  updatedAt: string
}

export interface Referral {
  referralId: string
  referrerId: string
  refereeId: string
  refereeEmail: string
  programId: string
  status: "pending" | "completed" | "rewarded" | "expired"
  createdAt: string
  completedAt?: string
  metadata?: Record<string, any>
}

// White-Label
export interface WhiteLabelConfig {
  configId: string
  teamId: string
  domain: string
  brandName: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  customCss?: string
  status: "active" | "pending" | "disabled"
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface RetailConfig {
  configId: string
  teamId: string
  publicApiKey: string
  webhookUrl?: string
  allowedOrigins: string[]
  rateLimit?: number
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

// Seats & Invites
export interface SeatAllocation {
  teamId: string
  totalSeats: number
  usedSeats: number
  availableSeats: number
  members: TeamMember[]
}

// User Types
export interface User {
  userId: string
  email: string
  name: string
  role: "super_admin" | "admin" | "user"
  status: "active" | "suspended" | "deleted"
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  metadata?: Record<string, any>
}

export interface UserCreateInput {
  email: string
  name: string
  password: string
  role?: "admin" | "user"
}

export interface UserUpdateInput {
  name?: string
  email?: string
  role?: "admin" | "user"
  status?: "active" | "suspended"
}

// Agent Analytics
export interface AgentAnalytics {
  agentId: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastUsedAt?: string
  usageByDay: Array<{ date: string; count: number }>
}

// Team Analytics
export interface TeamAnalytics {
  teamId: string
  totalAgents: number
  activeAgents: number
  totalMembers: number
  seatUtilization: number
  totalRequests: number
  monthlySpend: number
  activityLog: Array<{
    timestamp: string
    action: string
    userId: string
    details: string
  }>
}

// Subscription & Plans
export interface SubscriptionPlan {
  planId: string
  name: string
  tier: "free" | "starter" | "pro" | "enterprise"
  price: number
  currency: string
  billingCycle: "monthly" | "yearly"
  features: string[]
  limits: {
    seats: number
    agents: number
    requests: number
  }
  status: "active" | "deprecated"
}

export interface Subscription {
  subscriptionId: string
  teamId: string
  planId: string
  status: "active" | "cancelled" | "past_due" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

// Payment Methods
export interface PaymentMethod {
  paymentMethodId: string
  teamId: string
  type: "card" | "bank_account" | "paypal"
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  status: "active" | "expired" | "invalid"
  createdAt: string
}

// Audit Logs
export interface AuditLog {
  logId: string
  timestamp: string
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// System Settings
export interface SystemSettings {
  settingId: string
  key: string
  value: any
  category: "feature_flags" | "limits" | "maintenance" | "general"
  description?: string
  updatedAt: string
  updatedBy: string
}

// Feature Flags
export interface FeatureFlag {
  flagId: string
  name: string
  key: string
  enabled: boolean
  description?: string
  rolloutPercentage?: number
  enabledFor?: string[]
  createdAt: string
  updatedAt: string
}

// Usage Reports
export interface UsageReport {
  reportId: string
  teamId?: string
  period: "daily" | "weekly" | "monthly"
  startDate: string
  endDate: string
  metrics: {
    totalRequests: number
    totalAgents: number
    totalTeams: number
    totalUsers: number
    revenueGenerated: number
  }
  generatedAt: string
}

// Query Parameters
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface AgentQueryParams extends PaginationParams {
  teamId?: string
  status?: string
  search?: string
}

export interface TeamQueryParams extends PaginationParams {
  ownerId?: string
  status?: string
  search?: string
}

export interface TransactionQueryParams extends PaginationParams {
  teamId?: string
  walletId?: string
  type?: string
  startDate?: string
  endDate?: string
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
