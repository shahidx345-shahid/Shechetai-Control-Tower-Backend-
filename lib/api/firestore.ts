/**
 * Firebase Firestore Database Layer
 * Replaces mock in-memory database with real Firestore operations
 */

import { getFirebaseDb } from "../firebase/admin"
import {
  Agent, Team, BillingContract, Wallet, CreditTransaction, Referral,
  WhiteLabelConfig, TeamMember, TeamInvite, Invoice, User, AgentAnalytics,
  TeamAnalytics, SubscriptionPlan, Subscription, PaymentMethod, AuditLog,
  SystemSettings, FeatureFlag, UsageReport
} from "@/lib/types/api"

/**
 * Generic Firestore CRUD operations
 */
export class FirestoreDatabase {
  private static db = getFirebaseDb()

  /**
   * Get all documents from a collection
   */
  static async getAll<T>(collection: string): Promise<T[]> {
    const snapshot = await this.db.collection(collection).get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
  }

  /**
   * Get documents with filtering
   */
  static async query<T>(
    collection: string,
    filters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }>
  ): Promise<T[]> {
    let query: FirebaseFirestore.Query = this.db.collection(collection)

    filters.forEach(filter => {
      query = query.where(filter.field, filter.op, filter.value)
    })

    const snapshot = await query.get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
  }

  /**
   * Get a single document by ID
   */
  static async getById<T>(collection: string, id: string): Promise<T | null> {
    const doc = await this.db.collection(collection).doc(id).get()
    return doc.exists ? ({ id: doc.id, ...doc.data() } as T) : null
  }

  /**
   * Create a new document
   */
  static async create<T>(collection: string, data: Omit<T, 'id'>): Promise<T> {
    // Remove undefined values to avoid Firestore errors
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)

    const docRef = await this.db.collection(collection).add({
      ...cleanData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const doc = await docRef.get()
    return { id: doc.id, ...doc.data() } as T
  }

  /**
   * Create document with custom ID
   */
  static async createWithId<T>(collection: string, id: string, data: Omit<T, 'id'>): Promise<T> {
    // Remove undefined values to avoid Firestore errors
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)

    await this.db.collection(collection).doc(id).set({
      ...cleanData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const doc = await this.db.collection(collection).doc(id).get()
    return { id: doc.id, ...doc.data() } as T
  }

  /**
   * Update a document
   */
  static async update<T>(collection: string, id: string, data: Partial<T>): Promise<T | null> {
    const docRef = this.db.collection(collection).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) return null

    // Remove undefined values to avoid Firestore errors
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)

    await docRef.update({
      ...cleanData,
      updatedAt: new Date().toISOString(),
    })

    const updated = await docRef.get()
    return { id: updated.id, ...updated.data() } as T
  }

  /**
   * Delete a document
   */
  static async delete(collection: string, id: string): Promise<boolean> {
    try {
      await this.db.collection(collection).doc(id).delete()
      return true
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error)
      return false
    }
  }

  /**
   * Paginated query
   */
  static async getPaginated<T>(
    collection: string,
    limit: number,
    offset: number,
    filters?: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }>
  ): Promise<{ items: T[]; total: number }> {
    let query: FirebaseFirestore.Query = this.db.collection(collection)

    if (filters) {
      filters.forEach(filter => {
        query = query.where(filter.field, filter.op, filter.value)
      })
    }

    // Get total count
    const totalSnapshot = await query.get()
    const total = totalSnapshot.size

    // Get paginated results
    const snapshot = await query.offset(offset).limit(limit).get()
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))

    return { items, total }
  }
}

/**
 * Agent operations
 */
export class AgentDatabase {
  private static collection = "agents"

  static async getAll(): Promise<Agent[]> {
    return FirestoreDatabase.getAll<Agent>(this.collection)
  }

  static async getById(agentId: string): Promise<Agent | null> {
    return FirestoreDatabase.getById<Agent>(this.collection, agentId)
  }

  static async getByTeam(teamId: string): Promise<Agent[]> {
    return FirestoreDatabase.query<Agent>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
  }

  static async create(data: Omit<Agent, 'agentId'>): Promise<Agent> {
    return FirestoreDatabase.create<Agent>(this.collection, data as any)
  }

  static async update(agentId: string, data: Partial<Agent>): Promise<Agent | null> {
    return FirestoreDatabase.update<Agent>(this.collection, agentId, data)
  }

  static async delete(agentId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, agentId)
  }

  static async getAnalytics(agentId: string): Promise<AgentAnalytics> {
    // TODO: Implement real analytics tracking
    return {
      agentId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      usageByDay: []
    }
  }
}

/**
 * Team operations
 */
export class TeamDatabase {
  private static collection = "teams"

  static async getAll(): Promise<Team[]> {
    return FirestoreDatabase.getAll<Team>(this.collection)
  }

  static async getById(teamId: string): Promise<Team | null> {
    return FirestoreDatabase.getById<Team>(this.collection, teamId)
  }

  static async getByOwner(ownerId: string): Promise<Team[]> {
    return FirestoreDatabase.query<Team>(this.collection, [
      { field: "ownerId", op: "==", value: ownerId }
    ])
  }

  static async create(data: Omit<Team, 'teamId'>): Promise<Team> {
    return FirestoreDatabase.create<Team>(this.collection, data as any)
  }

  static async update(teamId: string, data: Partial<Team>): Promise<Team | null> {
    return FirestoreDatabase.update<Team>(this.collection, teamId, data)
  }

  static async delete(teamId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, teamId)
  }

  static async getAnalytics(teamId: string): Promise<TeamAnalytics> {
    // TODO: Implement real analytics tracking
    return {
      teamId,
      totalAgents: 0,
      activeAgents: 0,
      totalMembers: 0,
      seatUtilization: 0,
      totalRequests: 0,
      monthlySpend: 0,
      activityLog: []
    }
  }
}

/**
 * User operations
 */
export class UserDatabase {
  private static collection = "users"

  static async getAll(): Promise<User[]> {
    return FirestoreDatabase.getAll<User>(this.collection)
  }

  static async getById(userId: string): Promise<User | null> {
    return FirestoreDatabase.getById<User>(this.collection, userId)
  }

  static async getByEmail(email: string): Promise<User | null> {
    const users = await FirestoreDatabase.query<User>(this.collection, [
      { field: "email", op: "==", value: email }
    ])
    return users.length > 0 ? users[0] : null
  }

  static async getByTeam(teamId: string): Promise<User[]> {
    return FirestoreDatabase.query<User>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
  }

  static async create(userId: string, data: Omit<User, 'userId'>): Promise<User> {
    return FirestoreDatabase.createWithId<User>(this.collection, userId, data as any)
  }

  static async update(userId: string, data: Partial<User>): Promise<User | null> {
    return FirestoreDatabase.update<User>(this.collection, userId, data)
  }

  static async delete(userId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, userId)
  }
}

/**
 * Billing Contract operations
 */
export class ContractDatabase {
  private static collection = "contracts"

  static async getAll(): Promise<BillingContract[]> {
    return FirestoreDatabase.getAll<BillingContract>(this.collection)
  }

  static async getById(contractId: string): Promise<BillingContract | null> {
    return FirestoreDatabase.getById<BillingContract>(this.collection, contractId)
  }

  static async getByTeam(teamId: string): Promise<BillingContract[]> {
    return FirestoreDatabase.query<BillingContract>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
  }

  static async getByTeamId(teamId: string): Promise<BillingContract[]> {
    return this.getByTeam(teamId)
  }

  static async create(data: Omit<BillingContract, 'contractId'>): Promise<BillingContract> {
    return FirestoreDatabase.create<BillingContract>(this.collection, data as any)
  }

  static async update(contractId: string, data: Partial<BillingContract>): Promise<BillingContract | null> {
    return FirestoreDatabase.update<BillingContract>(this.collection, contractId, data)
  }
}

/**
 * Wallet operations
 */
export class WalletDatabase {
  private static collection = "wallets"
  private static db = getFirebaseDb()

  static async getAll(): Promise<Wallet[]> {
    return FirestoreDatabase.getAll<Wallet>(this.collection)
  }

  /**
   * Get wallet by ID (teamId is used as document ID)
   */
  static async getById(teamId: string): Promise<Wallet | null> {
    return FirestoreDatabase.getById<Wallet>(this.collection, teamId)
  }

  /**
   * Get wallet by team ID (same as getById since teamId is the document ID)
   */
  static async getByTeamId(teamId: string): Promise<Wallet | null> {
    return this.getById(teamId)
  }

  /**
   * Get wallet by entity (legacy support)
   */
  static async getByEntity(entityId: string, entityType: "team" | "user"): Promise<Wallet | null> {
    if (entityType === "team") {
      return this.getByTeamId(entityId)
    }
    const wallets = await FirestoreDatabase.query<Wallet>(this.collection, [
      { field: "entityId", op: "==", value: entityId },
      { field: "entityType", op: "==", value: entityType }
    ])
    return wallets.length > 0 ? wallets[0] : null
  }

  /**
   * Create wallet using teamId as document ID
   */
  static async create(data: Omit<Wallet, 'walletId'>): Promise<Wallet> {
    const teamId = (data as any).teamId
    if (!teamId) {
      throw new Error("teamId is required to create a wallet")
    }

    const walletData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await this.db.collection(this.collection).doc(teamId).set(walletData)

    const doc = await this.db.collection(this.collection).doc(teamId).get()
    return { id: doc.id, walletId: doc.id, ...doc.data() } as unknown as Wallet
  }

  /**
   * Update wallet (teamId is the document ID)
   */
  static async update(teamId: string, data: Partial<Wallet>): Promise<Wallet | null> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await this.db.collection(this.collection).doc(teamId).update(updateData)

    const doc = await this.db.collection(this.collection).doc(teamId).get()
    return doc.exists ? { id: doc.id, walletId: doc.id, ...doc.data() } as unknown as Wallet : null
  }

  /**
   * Update wallet balance (add or subtract)
   */
  static async updateBalance(teamId: string, amount: number): Promise<Wallet | null> {
    const walletRef = this.db.collection(this.collection).doc(teamId)
    const doc = await walletRef.get()

    if (!doc.exists) {
      return null
    }

    const currentBalance = (doc.data()?.balance || 0) as number
    const newBalance = currentBalance + amount

    await walletRef.update({
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    })

    const updated = await walletRef.get()
    return { id: updated.id, walletId: updated.id, ...updated.data() } as unknown as Wallet
  }
}

/**
 * Credit Transaction operations
 */
export class TransactionDatabase {
  private static collection = "creditTransactions"

  static async getAll(): Promise<CreditTransaction[]> {
    return FirestoreDatabase.getAll<CreditTransaction>(this.collection)
  }

  static async getById(transactionId: string): Promise<CreditTransaction | null> {
    return FirestoreDatabase.getById<CreditTransaction>(this.collection, transactionId)
  }

  static async getByWallet(walletId: string): Promise<CreditTransaction[]> {
    return FirestoreDatabase.query<CreditTransaction>(this.collection, [
      { field: "walletId", op: "==", value: walletId }
    ])
  }

  static async create(data: Omit<CreditTransaction, 'transactionId'>): Promise<CreditTransaction> {
    return FirestoreDatabase.create<CreditTransaction>(this.collection, data as any)
  }
}

/**
 * Subscription operations
 */
export class SubscriptionDatabase {
  private static collection = "subscriptions"

  static async getAll(): Promise<Subscription[]> {
    return FirestoreDatabase.getAll<Subscription>(this.collection)
  }

  static async getById(subscriptionId: string): Promise<Subscription | null> {
    return FirestoreDatabase.getById<Subscription>(this.collection, subscriptionId)
  }

  static async getByUser(userId: string): Promise<Subscription[]> {
    return FirestoreDatabase.query<Subscription>(this.collection, [
      { field: "userId", op: "==", value: userId }
    ])
  }

  static async getByTeamId(teamId: string): Promise<Subscription[]> {
    return FirestoreDatabase.query<Subscription>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
  }

  static async create(data: Omit<Subscription, 'subscriptionId'>): Promise<Subscription> {
    return FirestoreDatabase.create<Subscription>(this.collection, data as any)
  }

  static async update(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription | null> {
    return FirestoreDatabase.update<Subscription>(this.collection, subscriptionId, data)
  }
}

/**
 * Payment Method operations
 */
export class PaymentMethodDatabase {
  private static collection = "payment-methods"

  static async getByUser(userId: string): Promise<PaymentMethod[]> {
    return FirestoreDatabase.query<PaymentMethod>(this.collection, [
      { field: "userId", op: "==", value: userId }
    ])
  }

  static async getById(paymentMethodId: string): Promise<PaymentMethod | null> {
    return FirestoreDatabase.getById<PaymentMethod>(this.collection, paymentMethodId)
  }

  static async create(data: Omit<PaymentMethod, 'paymentMethodId'>): Promise<PaymentMethod> {
    return FirestoreDatabase.create<PaymentMethod>(this.collection, data as any)
  }

  static async delete(paymentMethodId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, paymentMethodId)
  }

  static async setDefault(paymentMethodId: string): Promise<PaymentMethod | null> {
    return FirestoreDatabase.update<PaymentMethod>(this.collection, paymentMethodId, { isDefault: true })
  }
}

/**
 * Audit Log operations
 */
export class AuditLogDatabase {
  private static collection = "auditLogs"

  static async create(data: Omit<AuditLog, 'logId'>): Promise<AuditLog> {
    return FirestoreDatabase.create<AuditLog>(this.collection, data as any)
  }

  static async getAll(limit: number = 100, offset: number = 0): Promise<{ items: AuditLog[]; total: number }> {
    return FirestoreDatabase.getPaginated<AuditLog>(this.collection, limit, offset)
  }

  static async getByUser(userId: string): Promise<AuditLog[]> {
    return FirestoreDatabase.query<AuditLog>(this.collection, [
      { field: "userId", op: "==", value: userId }
    ])
  }
}

/**
 * Feature Flag operations
 */
export class FeatureFlagDatabase {
  private static collection = "featureFlags"

  static async getAll(): Promise<FeatureFlag[]> {
    return FirestoreDatabase.getAll<FeatureFlag>(this.collection)
  }

  static async getById(flagId: string): Promise<FeatureFlag | null> {
    return FirestoreDatabase.getById<FeatureFlag>(this.collection, flagId)
  }

  static async create(data: Omit<FeatureFlag, 'flagId'>): Promise<FeatureFlag> {
    return FirestoreDatabase.create<FeatureFlag>(this.collection, data as any)
  }

  static async update(flagId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    return FirestoreDatabase.update<FeatureFlag>(this.collection, flagId, data)
  }

  static async delete(flagId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, flagId)
  }
}

/**
 * White Label Config operations
 */
export class WhiteLabelDatabase {
  private static collection = "whiteLabelConfigs"

  static async getAll(): Promise<WhiteLabelConfig[]> {
    return FirestoreDatabase.getAll<WhiteLabelConfig>(this.collection)
  }

  static async getById(configId: string): Promise<WhiteLabelConfig | null> {
    return FirestoreDatabase.getById<WhiteLabelConfig>(this.collection, configId)
  }

  static async getByTeamId(teamId: string): Promise<WhiteLabelConfig[]> {
    return FirestoreDatabase.query<WhiteLabelConfig>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
  }

  static async create(data: Omit<WhiteLabelConfig, 'configId'>): Promise<WhiteLabelConfig> {
    return FirestoreDatabase.create<WhiteLabelConfig>(this.collection, data as any)
  }

  static async update(configId: string, data: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig | null> {
    return FirestoreDatabase.update<WhiteLabelConfig>(this.collection, configId, data)
  }

  static async delete(configId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, configId)
  }
}

/**
 * Referral operations
 */
export class ReferralDatabase {
  private static collection = "referrals"

  static async getAll(): Promise<Referral[]> {
    return FirestoreDatabase.getAll<Referral>(this.collection)
  }

  static async getById(referralId: string): Promise<Referral | null> {
    return FirestoreDatabase.getById<Referral>(this.collection, referralId)
  }

  static async getByReferrer(referrerId: string): Promise<Referral[]> {
    return FirestoreDatabase.query<Referral>(this.collection, [
      { field: "referrerId", op: "==", value: referrerId }
    ])
  }

  static async create(data: Omit<Referral, 'referralId'>): Promise<Referral> {
    return FirestoreDatabase.create<Referral>(this.collection, data as any)
  }

  static async update(referralId: string, data: Partial<Referral>): Promise<Referral | null> {
    return FirestoreDatabase.update<Referral>(this.collection, referralId, data)
  }
}

/**
 * Team Members Database
 */
export class TeamMemberDatabase {
  private static collection = "teamMembers"

  static async getAll(): Promise<TeamMember[]> {
    return FirestoreDatabase.getAll<TeamMember>(this.collection)
  }

  static async getByTeam(teamId: string): Promise<TeamMember[]> {
    return FirestoreDatabase.query<TeamMember>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
  }

  static async getById(memberId: string): Promise<TeamMember | null> {
    return FirestoreDatabase.getById<TeamMember>(this.collection, memberId)
  }

  static async create(data: any): Promise<TeamMember> {
    return FirestoreDatabase.create<TeamMember>(this.collection, data as any)
  }

  static async update(memberId: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    return FirestoreDatabase.update<TeamMember>(this.collection, memberId, data)
  }

  static async delete(memberId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, memberId)
  }

  static async removeByUserAndTeam(teamId: string, userId: string): Promise<boolean> {
    const db = getFirebaseDb()
    const snapshot = await db.collection(this.collection)
      .where("teamId", "==", teamId)
      .where("userId", "==", userId)
      .get()

    if (snapshot.empty) return false

    await snapshot.docs[0].ref.delete()
    return true
  }
}

/**
 * Team Invites Database
 */
export class TeamInviteDatabase {
  private static collection = "teamInvites"

  static async getAll(): Promise<TeamInvite[]> {
    const results = await FirestoreDatabase.getAll<TeamInvite>(this.collection)
    // Add inviteId for backward compatibility
    return results.map(r => ({ ...r, inviteId: (r as any).id } as TeamInvite))
  }

  static async getByTeam(teamId: string): Promise<TeamInvite[]> {
    const results = await FirestoreDatabase.query<TeamInvite>(this.collection, [
      { field: "teamId", op: "==", value: teamId }
    ])
    // Add inviteId for backward compatibility
    return results.map(r => ({ ...r, inviteId: (r as any).id } as TeamInvite))
  }

  // Alias for backward compatibility with database-bridge
  static async getByTeamId(teamId: string): Promise<TeamInvite[]> {
    return this.getByTeam(teamId)
  }

  static async getById(inviteId: string): Promise<TeamInvite | null> {
    const result = await FirestoreDatabase.getById<TeamInvite>(this.collection, inviteId)
    if (!result) return null
    // Add inviteId for backward compatibility
    return { ...result, inviteId: (result as any).id } as TeamInvite
  }

  static async create(data: any): Promise<TeamInvite> {
    const result = await FirestoreDatabase.create<TeamInvite>(this.collection, data as any)
    // Add inviteId for backward compatibility
    return { ...result, inviteId: (result as any).id } as TeamInvite
  }

  static async update(inviteId: string, data: Partial<TeamInvite>): Promise<TeamInvite | null> {
    return FirestoreDatabase.update<TeamInvite>(this.collection, inviteId, data)
  }

  static async delete(inviteId: string): Promise<boolean> {
    return FirestoreDatabase.delete(this.collection, inviteId)
  }
}

// Re-export for backward compatibility with existing code
export const Database = {
  // Agents
  getAgents: AgentDatabase.getAll,
  getAgent: AgentDatabase.getById,
  createAgent: AgentDatabase.create,
  updateAgent: AgentDatabase.update,
  deleteAgent: AgentDatabase.delete,

  // Teams
  getTeams: TeamDatabase.getAll,
  getTeam: TeamDatabase.getById,
  createTeam: TeamDatabase.create,
  updateTeam: TeamDatabase.update,
  deleteTeam: TeamDatabase.delete,

  // Users
  getUsers: UserDatabase.getAll,
  getUser: UserDatabase.getById,
  createUser: UserDatabase.create,
  updateUser: UserDatabase.update,
  deleteUser: UserDatabase.delete,

  // Contracts
  getContracts: ContractDatabase.getAll,
  getContract: ContractDatabase.getById,
  createContract: ContractDatabase.create,
  updateContract: ContractDatabase.update,

  // Wallets
  getWallets: WalletDatabase.getAll,
  getWallet: WalletDatabase.getById,
  createWallet: WalletDatabase.create,
  updateWallet: WalletDatabase.update,

  // Transactions
  getTransactions: TransactionDatabase.getAll,
  getTransaction: TransactionDatabase.getById,
  createTransaction: TransactionDatabase.create,

  // White Labels
  getWhiteLabels: WhiteLabelDatabase.getAll,
  getWhiteLabel: WhiteLabelDatabase.getById,
  createWhiteLabel: WhiteLabelDatabase.create,
  updateWhiteLabel: WhiteLabelDatabase.update,
  deleteWhiteLabel: WhiteLabelDatabase.delete,

  // Referrals
  getReferrals: ReferralDatabase.getAll,
  getReferral: ReferralDatabase.getById,
  createReferral: ReferralDatabase.create,
  updateReferral: ReferralDatabase.update,
}
