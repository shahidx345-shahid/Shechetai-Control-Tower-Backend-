/**
 * Database Bridge Layer
 * Maps mock Database interface to real Firestore operations
 * This allows gradual migration of all routes to Firebase without rewriting each route
 */

import { initializeFirebaseAdmin } from "../firebase/admin"
import {
  AgentDatabase,
  TeamDatabase,
  UserDatabase,
  ContractDatabase,
  WalletDatabase,
  TransactionDatabase,
  SubscriptionDatabase,
  PaymentMethodDatabase,
  AuditLogDatabase,
  FeatureFlagDatabase,
  WhiteLabelDatabase,
  ReferralDatabase,
  TeamMemberDatabase,
  TeamInviteDatabase,
} from "./firestore"

// Initialize Firebase on import
initializeFirebaseAdmin()

/**
 * Bridge class that provides the same interface as Database mock
 * but routes all calls to real Firestore operations
 */
const DatabaseBridge = {
  // Agents
  getAgents: async (filters?: any) => {
    const all = await AgentDatabase.getAll()
    if (!filters) return all
    
    let result = all
    if (filters.teamId) result = result.filter(a => a.teamId === filters.teamId)
    if (filters.status) result = result.filter(a => a.status === filters.status)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(a => 
        a.agentId.toLowerCase().includes(search) ||
        a.name.toLowerCase().includes(search)
      )
    }
    return result
  },
  getAgent: (agentId: string) => AgentDatabase.getById(agentId),
  getAgentById: (agentId: string) => AgentDatabase.getById(agentId),
  createAgent: (data: any) => AgentDatabase.create(data),
  updateAgent: (agentId: string, data: any) => AgentDatabase.update(agentId, data),
  deleteAgent: (agentId: string) => AgentDatabase.delete(agentId),

  // Teams
  getTeams: async (filters?: any) => {
    const all = await TeamDatabase.getAll()
    if (!filters) return all
    
    let result = all
    if (filters.ownerId) result = result.filter(t => t.ownerId === filters.ownerId)
    if (filters.status) result = result.filter(t => t.status === filters.status)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(t => 
        t.teamId.toLowerCase().includes(search) ||
        t.name.toLowerCase().includes(search)
      )
    }
    return result
  },
  getTeam: (teamId: string) => TeamDatabase.getById(teamId),
  getTeamById: (teamId: string) => TeamDatabase.getById(teamId),
  createTeam: (data: any) => TeamDatabase.create(data),
  updateTeam: (teamId: string, data: any) => TeamDatabase.update(teamId, data),
  deleteTeam: (teamId: string) => TeamDatabase.delete(teamId),

  // Users
  getUsers: async (filters?: any) => {
    const all = await UserDatabase.getAll()
    if (!filters) return all
    
    let result = all
    if (filters.role) result = result.filter(u => u.role === filters.role)
    if (filters.status) result = result.filter(u => u.status === filters.status)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(u => 
        u.userId.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search)
      )
    }
    return result
  },
  getUser: (userId: string) => UserDatabase.getById(userId),
  getUserById: (userId: string) => UserDatabase.getById(userId),
  getUserByEmail: (email: string) => UserDatabase.getByEmail(email),
  createUser: (userId: string, data: any) => UserDatabase.create(userId, data),
  updateUser: (userId: string, data: any) => UserDatabase.update(userId, data),
  deleteUser: (userId: string) => UserDatabase.delete(userId),

  // Wallets
  getWallets: () => WalletDatabase.getAll(),
  getWallet: (walletId: string) => WalletDatabase.getById(walletId),
  getWalletByTeamId: (teamId: string) => WalletDatabase.getByEntity(teamId, "team"),
  createWallet: (data: any) => WalletDatabase.create(data),
  updateWallet: (walletId: string, data: any) => WalletDatabase.update(walletId, data),
  updateWalletBalance: async (walletId: string, amount: number) => {
    const wallet = await WalletDatabase.getById(walletId)
    if (!wallet) return null
    return WalletDatabase.update(walletId, { balance: (wallet.balance || 0) + amount } as any)
  },

  // Transactions
  getTransactions: async (filters?: any) => {
    const all = await TransactionDatabase.getAll()
    if (!filters) return all
    
    let result = all
    if (filters.teamId) result = result.filter(t => t.teamId === filters.teamId)
    if (filters.walletId) result = result.filter(t => t.walletId === filters.walletId)
    return result
  },
  getTransaction: (transactionId: string) => TransactionDatabase.getById(transactionId),
  createTransaction: (data: any) => TransactionDatabase.create(data),

  // Contracts
  getContracts: async (teamId?: string) => {
    const all = await ContractDatabase.getAll()
    if (!teamId) return all
    return all.filter(c => c.teamId === teamId)
  },
  getContract: (contractId: string) => ContractDatabase.getById(contractId),
  getContractById: (contractId: string) => ContractDatabase.getById(contractId),
  createContract: (data: any) => ContractDatabase.create(data),
  updateContract: (contractId: string, data: any) => ContractDatabase.update(contractId, data),

  // Subscriptions
  getSubscriptions: async (teamId?: string) => {
    const all = await SubscriptionDatabase.getAll()
    if (!teamId) return all
    return all.filter(s => s.teamId === teamId)
  },
  getSubscription: (subscriptionId: string) => SubscriptionDatabase.getById(subscriptionId),
  createSubscription: (data: any) => SubscriptionDatabase.create(data),
  updateSubscription: (subscriptionId: string, data: any) => SubscriptionDatabase.update(subscriptionId, data),

  // Payment Methods
  getPaymentMethods: async (teamId: string) => {
    const all = await PaymentMethodDatabase.getByUser(teamId)
    return all
  },
  createPaymentMethod: (data: any) => PaymentMethodDatabase.create(data),
  deletePaymentMethod: (paymentMethodId: string) => PaymentMethodDatabase.delete(paymentMethodId),

  // Audit Logs
  getAuditLogs: async (filters?: any) => {
    const { items } = await AuditLogDatabase.getAll(100, 0)
    if (!filters) return items
    
    let result = items
    if (filters.userId) result = result.filter(l => l.userId === filters.userId)
    if (filters.resource) result = result.filter(l => l.resource === filters.resource)
    return result
  },
  createAuditLog: (data: any) => AuditLogDatabase.create(data),

  // Feature Flags
  getFeatureFlags: () => FeatureFlagDatabase.getAll(),
  getFeatureFlag: (flagId: string) => FeatureFlagDatabase.getById(flagId),
  createFeatureFlag: (data: any) => FeatureFlagDatabase.create(data),
  updateFeatureFlag: (flagId: string, data: any) => FeatureFlagDatabase.update(flagId, data),

  // White Labels
  getWhiteLabels: async (teamId?: string) => {
    const all = await WhiteLabelDatabase.getAll()
    if (!teamId) return all
    return all.filter(w => w.teamId === teamId)
  },
  getWhiteLabelConfigs: async (teamId?: string) => {
    const all = await WhiteLabelDatabase.getAll()
    if (!teamId) return all
    return all.filter(w => w.teamId === teamId)
  },
  getWhiteLabel: (configId: string) => WhiteLabelDatabase.getById(configId),
  createWhiteLabel: (data: any) => WhiteLabelDatabase.create(data),
  updateWhiteLabel: (configId: string, data: any) => WhiteLabelDatabase.update(configId, data),

  // Referrals
  getReferrals: async (filters?: any) => {
    const all = await ReferralDatabase.getAll()
    if (!filters) return all
    
    let result = all
    if (filters.referrerId) result = result.filter(r => r.referrerId === filters.referrerId)
    if (filters.status) result = result.filter(r => r.status === filters.status)
    return result
  },
  getReferral: (referralId: string) => ReferralDatabase.getById(referralId),
  createReferral: (data: any) => ReferralDatabase.create(data),
  updateReferral: (referralId: string, data: any) => ReferralDatabase.update(referralId, data),

  // Team Members
  getTeamMembers: (teamId: string) => TeamMemberDatabase.getByTeam(teamId),
  addTeamMember: (data: any) => TeamMemberDatabase.create(data),
  removeTeamMember: (teamId: string, userId: string) => TeamMemberDatabase.removeByUserAndTeam(teamId, userId),

  // Team Invites
  getInvites: async (teamId?: string) => {
    if (teamId) return TeamInviteDatabase.getByTeam(teamId)
    return TeamInviteDatabase.getAll()
  },
  getInviteById: (inviteId: string) => TeamInviteDatabase.getById(inviteId),
  createInvite: (data: any) => TeamInviteDatabase.create(data),
  updateInvite: (inviteId: string, data: any) => TeamInviteDatabase.update(inviteId, data),

  // Missing methods for backward compatibility with old routes
  getInvoices: async (teamId?: string) => [],
  createInvoice: async (data: any) => ({ id: "mock", ...data }),
  getPlans: async () => [],
  createPlan: async (data: any) => ({ id: "mock", ...data }),
  deletePlan: async (planId: string) => true,
  setDefaultPaymentMethod: async (methodId: string) => ({ id: methodId, isDefault: true }),
  getUsageReports: async (teamId?: string) => [],
  createUsageReport: async (data: any) => ({ id: "mock", ...data }),
  getSettings: async (category?: string) => [],
  updateSetting: async (key: string, value: any, userId: string) => ({ key, value }),
}

export { DatabaseBridge as Database }
export default DatabaseBridge
