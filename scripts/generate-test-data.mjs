#!/usr/bin/env node

/**
 * Generate comprehensive test data for Shechetai Control Tower
 * Run: node scripts/generate-test-data.mjs
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()
const auth = getAuth()

// Helper functions
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

console.log('🚀 Starting test data generation...\n')

// 1. Create Teams
console.log('📦 Creating teams...')
const teams = [
  {
    id: 'team-acme-corp',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    ownerEmail: 'owner@acme.com',
    plan: 'enterprise',
    maxSeats: 50,
    usedSeats: 25,
    status: 'active',
    stripeCustomerId: 'cus_test_acme123',
    createdAt: Timestamp.fromDate(new Date('2024-01-15')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'team-techstart',
    name: 'TechStart Inc',
    slug: 'techstart',
    ownerEmail: 'ceo@techstart.io',
    plan: 'pro',
    maxSeats: 20,
    usedSeats: 15,
    status: 'active',
    stripeCustomerId: 'cus_test_techstart456',
    createdAt: Timestamp.fromDate(new Date('2024-03-20')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'team-innovate',
    name: 'Innovate Solutions',
    slug: 'innovate',
    ownerEmail: 'admin@innovate.com',
    plan: 'basic',
    maxSeats: 10,
    usedSeats: 7,
    status: 'active',
    stripeCustomerId: 'cus_test_innovate789',
    createdAt: Timestamp.fromDate(new Date('2024-06-10')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'team-startup',
    name: 'Startup Labs',
    slug: 'startup-labs',
    ownerEmail: 'founder@startuplabs.com',
    plan: 'free',
    maxSeats: 5,
    usedSeats: 3,
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-10-01')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'team-suspended',
    name: 'Suspended Co',
    slug: 'suspended-co',
    ownerEmail: 'contact@suspended.com',
    plan: 'basic',
    maxSeats: 10,
    usedSeats: 5,
    status: 'suspended',
    suspendedReason: 'Payment failed',
    createdAt: Timestamp.fromDate(new Date('2024-05-15')),
    updatedAt: Timestamp.now(),
  },
]

for (const team of teams) {
  await db.collection('teams').doc(team.id).set(team)
}
console.log(`✅ Created ${teams.length} teams\n`)

// 2. Create Users
console.log('👥 Creating users...')
const users = [
  {
    uid: 'user-admin-001',
    email: 'admin@shechetai.com',
    name: 'Super Admin',
    role: 'superAdmin',
    teamId: 'team-acme-corp',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-01-01')),
    lastLogin: Timestamp.now(),
  },
  {
    uid: 'user-owner-acme',
    email: 'owner@acme.com',
    name: 'John Acme',
    role: 'owner',
    teamId: 'team-acme-corp',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-01-15')),
    lastLogin: Timestamp.now(),
  },
  {
    uid: 'user-admin-acme',
    email: 'admin@acme.com',
    name: 'Sarah Admin',
    role: 'admin',
    teamId: 'team-acme-corp',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-02-01')),
    lastLogin: Timestamp.now(),
  },
  {
    uid: 'user-member-acme-1',
    email: 'member1@acme.com',
    name: 'Alice Member',
    role: 'member',
    teamId: 'team-acme-corp',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-03-15')),
    lastLogin: Timestamp.fromDate(new Date('2024-11-27')),
  },
  {
    uid: 'user-owner-tech',
    email: 'ceo@techstart.io',
    name: 'Mike Tech',
    role: 'owner',
    teamId: 'team-techstart',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-03-20')),
    lastLogin: Timestamp.now(),
  },
  {
    uid: 'user-member-tech-1',
    email: 'dev1@techstart.io',
    name: 'David Developer',
    role: 'member',
    teamId: 'team-techstart',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-04-10')),
    lastLogin: Timestamp.fromDate(new Date('2024-11-25')),
  },
  {
    uid: 'user-inactive',
    email: 'inactive@example.com',
    name: 'Inactive User',
    role: 'member',
    teamId: 'team-innovate',
    status: 'inactive',
    createdAt: Timestamp.fromDate(new Date('2024-06-15')),
    lastLogin: Timestamp.fromDate(new Date('2024-08-01')),
  },
]

for (const user of users) {
  await db.collection('users').doc(user.uid).set(user)
}
console.log(`✅ Created ${users.length} users\n`)

// 3. Create Subscription Plans
console.log('💳 Creating subscription plans...')
const plans = [
  {
    id: 'plan-free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: ['Up to 5 agents', '1,000 API calls/month', 'Basic support'],
    maxSeats: 5,
    maxAgents: 5,
    maxApiCalls: 1000,
    stripePriceId: null,
    isActive: true,
  },
  {
    id: 'plan-basic',
    name: 'Basic',
    price: 2900,
    currency: 'usd',
    interval: 'month',
    features: ['Up to 20 agents', '10,000 API calls/month', 'Email support'],
    maxSeats: 10,
    maxAgents: 20,
    maxApiCalls: 10000,
    stripePriceId: 'price_basic_monthly',
    isActive: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: 9900,
    currency: 'usd',
    interval: 'month',
    features: ['Up to 100 agents', '100,000 API calls/month', 'Priority support', 'White-label'],
    maxSeats: 20,
    maxAgents: 100,
    maxApiCalls: 100000,
    stripePriceId: 'price_pro_monthly',
    isActive: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price: 29900,
    currency: 'usd',
    interval: 'month',
    features: ['Unlimited agents', 'Unlimited API calls', 'Dedicated support', 'Custom integration'],
    maxSeats: 50,
    maxAgents: -1,
    maxApiCalls: -1,
    stripePriceId: 'price_enterprise_monthly',
    isActive: true,
  },
]

for (const plan of plans) {
  await db.collection('subscriptionPlans').doc(plan.id).set(plan)
}
console.log(`✅ Created ${plans.length} subscription plans\n`)

// 4. Create Subscriptions
console.log('📋 Creating subscriptions...')
const subscriptions = [
  {
    id: 'sub-acme-001',
    teamId: 'team-acme-corp',
    planId: 'plan-enterprise',
    status: 'active',
    currentPeriodStart: Timestamp.fromDate(new Date('2024-11-01')),
    currentPeriodEnd: Timestamp.fromDate(new Date('2024-12-01')),
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_stripe_acme123',
    amount: 29900,
    currency: 'usd',
    createdAt: Timestamp.fromDate(new Date('2024-01-15')),
  },
  {
    id: 'sub-tech-001',
    teamId: 'team-techstart',
    planId: 'plan-pro',
    status: 'active',
    currentPeriodStart: Timestamp.fromDate(new Date('2024-11-10')),
    currentPeriodEnd: Timestamp.fromDate(new Date('2024-12-10')),
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_stripe_tech456',
    amount: 9900,
    currency: 'usd',
    createdAt: Timestamp.fromDate(new Date('2024-03-20')),
  },
  {
    id: 'sub-innovate-001',
    teamId: 'team-innovate',
    planId: 'plan-basic',
    status: 'active',
    currentPeriodStart: Timestamp.fromDate(new Date('2024-11-15')),
    currentPeriodEnd: Timestamp.fromDate(new Date('2024-12-15')),
    cancelAtPeriodEnd: true,
    stripeSubscriptionId: 'sub_stripe_innovate789',
    amount: 2900,
    currency: 'usd',
    createdAt: Timestamp.fromDate(new Date('2024-06-10')),
  },
  {
    id: 'sub-suspended-001',
    teamId: 'team-suspended',
    planId: 'plan-basic',
    status: 'past_due',
    currentPeriodStart: Timestamp.fromDate(new Date('2024-10-15')),
    currentPeriodEnd: Timestamp.fromDate(new Date('2024-11-15')),
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_stripe_suspended999',
    amount: 2900,
    currency: 'usd',
    createdAt: Timestamp.fromDate(new Date('2024-05-15')),
  },
]

for (const sub of subscriptions) {
  await db.collection('subscriptions').doc(sub.id).set(sub)
}
console.log(`✅ Created ${subscriptions.length} subscriptions\n`)

// 5. Create Agents
console.log('🤖 Creating agents...')
const agentStatuses = ['active', 'inactive', 'suspended', 'training']
const agentTypes = ['customer-support', 'sales', 'technical', 'general']
const agents = []

for (let i = 1; i <= 25; i++) {
  const teamId = randomElement(['team-acme-corp', 'team-techstart', 'team-innovate', 'team-startup'])
  agents.push({
    id: `agent-${String(i).padStart(3, '0')}`,
    teamId,
    name: `Agent ${i}`,
    type: randomElement(agentTypes),
    status: randomElement(agentStatuses),
    apiKey: `sk_test_agent_${Math.random().toString(36).substring(2, 15)}`,
    totalCalls: randomNumber(0, 50000),
    successRate: randomNumber(85, 99) + Math.random(),
    avgResponseTime: randomNumber(100, 2000),
    lastUsed: Timestamp.fromDate(randomDate(new Date('2024-11-01'), new Date())),
    createdAt: Timestamp.fromDate(randomDate(new Date('2024-01-01'), new Date('2024-10-31'))),
  })
}

for (const agent of agents) {
  await db.collection('agents').doc(agent.id).set(agent)
}
console.log(`✅ Created ${agents.length} agents\n`)

// 6. Create Payment Methods
console.log('💳 Creating payment methods...')
const paymentMethods = [
  {
    id: 'pm-acme-001',
    teamId: 'team-acme-corp',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2026,
    isDefault: true,
    stripePaymentMethodId: 'pm_test_visa4242',
    createdAt: Timestamp.fromDate(new Date('2024-01-15')),
  },
  {
    id: 'pm-tech-001',
    teamId: 'team-techstart',
    type: 'card',
    brand: 'mastercard',
    last4: '5555',
    expMonth: 8,
    expYear: 2025,
    isDefault: true,
    stripePaymentMethodId: 'pm_test_mc5555',
    createdAt: Timestamp.fromDate(new Date('2024-03-20')),
  },
  {
    id: 'pm-innovate-001',
    teamId: 'team-innovate',
    type: 'card',
    brand: 'amex',
    last4: '0005',
    expMonth: 6,
    expYear: 2026,
    isDefault: true,
    stripePaymentMethodId: 'pm_test_amex0005',
    createdAt: Timestamp.fromDate(new Date('2024-06-10')),
  },
]

for (const pm of paymentMethods) {
  await db.collection('paymentMethods').doc(pm.id).set(pm)
}
console.log(`✅ Created ${paymentMethods.length} payment methods\n`)

// 7. Create Invoices
console.log('🧾 Creating invoices...')
const invoices = []
for (let i = 1; i <= 30; i++) {
  const teamId = randomElement(['team-acme-corp', 'team-techstart', 'team-innovate'])
  const statuses = ['paid', 'paid', 'paid', 'paid', 'open', 'past_due']
  const status = randomElement(statuses)
  const createdDate = randomDate(new Date('2024-01-01'), new Date())
  
  invoices.push({
    id: `inv-${String(i).padStart(4, '0')}`,
    teamId,
    subscriptionId: `sub-${teamId.split('-')[1]}-001`,
    amount: randomElement([2900, 9900, 29900]),
    currency: 'usd',
    status,
    invoiceNumber: `INV-2024-${String(i).padStart(4, '0')}`,
    invoiceDate: Timestamp.fromDate(createdDate),
    dueDate: Timestamp.fromDate(new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000)),
    paidAt: status === 'paid' ? Timestamp.fromDate(new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000)) : null,
    stripeInvoiceId: `in_test_${Math.random().toString(36).substring(2, 15)}`,
    pdfUrl: `https://invoices.stripe.com/test_${Math.random().toString(36).substring(2, 15)}`,
    createdAt: Timestamp.fromDate(createdDate),
  })
}

for (const invoice of invoices) {
  await db.collection('invoices').doc(invoice.id).set(invoice)
}
console.log(`✅ Created ${invoices.length} invoices\n`)

// 8. Create Payments
console.log('💰 Creating payments...')
const payments = []
for (let i = 1; i <= 50; i++) {
  const teamId = randomElement(['team-acme-corp', 'team-techstart', 'team-innovate'])
  const statuses = ['succeeded', 'succeeded', 'succeeded', 'failed', 'pending']
  const status = randomElement(statuses)
  const createdDate = randomDate(new Date('2024-01-01'), new Date())
  
  payments.push({
    id: `pay-${String(i).padStart(4, '0')}`,
    teamId,
    amount: randomElement([2900, 9900, 29900]),
    currency: 'usd',
    status,
    description: `Payment for ${randomElement(['subscription', 'credits', 'overage'])}`,
    paymentMethod: randomElement(['card', 'bank_transfer']),
    stripePaymentIntentId: `pi_test_${Math.random().toString(36).substring(2, 15)}`,
    createdAt: Timestamp.fromDate(createdDate),
  })
}

for (const payment of payments) {
  await db.collection('payments').doc(payment.id).set(payment)
}
console.log(`✅ Created ${payments.length} payments\n`)

// 9. Create Wallets
console.log('💼 Creating wallets...')
const wallets = [
  {
    id: 'wallet-acme',
    teamId: 'team-acme-corp',
    balance: 150000,
    currency: 'usd',
    updatedAt: Timestamp.now(),
  },
  {
    id: 'wallet-tech',
    teamId: 'team-techstart',
    balance: 50000,
    currency: 'usd',
    updatedAt: Timestamp.now(),
  },
  {
    id: 'wallet-innovate',
    teamId: 'team-innovate',
    balance: 10000,
    currency: 'usd',
    updatedAt: Timestamp.now(),
  },
]

for (const wallet of wallets) {
  await db.collection('wallets').doc(wallet.id).set(wallet)
}
console.log(`✅ Created ${wallets.length} wallets\n`)

// 10. Create Credit Transactions
console.log('🪙 Creating credit transactions...')
const creditTransactions = []
for (let i = 1; i <= 60; i++) {
  const teamId = randomElement(['team-acme-corp', 'team-techstart', 'team-innovate'])
  const types = ['purchase', 'usage', 'refund', 'bonus']
  const type = randomElement(types)
  
  creditTransactions.push({
    id: `credit-${String(i).padStart(4, '0')}`,
    teamId,
    type,
    amount: type === 'usage' ? -randomNumber(10, 1000) : randomNumber(100, 5000),
    balance: randomNumber(0, 100000),
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
    createdAt: Timestamp.fromDate(randomDate(new Date('2024-01-01'), new Date())),
  })
}

for (const tx of creditTransactions) {
  await db.collection('creditTransactions').doc(tx.id).set(tx)
}
console.log(`✅ Created ${creditTransactions.length} credit transactions\n`)

// 11. Create Invites
console.log('✉️ Creating invites...')
const invites = [
  {
    id: 'invite-001',
    teamId: 'team-acme-corp',
    email: 'newmember@acme.com',
    role: 'member',
    status: 'pending',
    invitedBy: 'user-owner-acme',
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.fromDate(new Date('2024-11-20')),
  },
  {
    id: 'invite-002',
    teamId: 'team-techstart',
    email: 'developer@techstart.io',
    role: 'member',
    status: 'accepted',
    invitedBy: 'user-owner-tech',
    acceptedAt: Timestamp.fromDate(new Date('2024-11-22')),
    expiresAt: Timestamp.fromDate(new Date('2024-11-27')),
    createdAt: Timestamp.fromDate(new Date('2024-11-15')),
  },
  {
    id: 'invite-003',
    teamId: 'team-innovate',
    email: 'expired@example.com',
    role: 'member',
    status: 'expired',
    invitedBy: 'admin@innovate.com',
    expiresAt: Timestamp.fromDate(new Date('2024-11-10')),
    createdAt: Timestamp.fromDate(new Date('2024-11-03')),
  },
]

for (const invite of invites) {
  await db.collection('invites').doc(invite.id).set(invite)
}
console.log(`✅ Created ${invites.length} invites\n`)

// 12. Create Referrals
console.log('🎁 Creating referrals...')
const referrals = [
  {
    id: 'ref-001',
    referrerId: 'user-owner-acme',
    refereeEmail: 'referred1@example.com',
    status: 'completed',
    reward: 5000,
    createdAt: Timestamp.fromDate(new Date('2024-09-15')),
    completedAt: Timestamp.fromDate(new Date('2024-09-20')),
  },
  {
    id: 'ref-002',
    referrerId: 'user-owner-tech',
    refereeEmail: 'referred2@example.com',
    status: 'pending',
    reward: 5000,
    createdAt: Timestamp.fromDate(new Date('2024-11-15')),
  },
  {
    id: 'ref-003',
    referrerId: 'user-owner-acme',
    refereeEmail: 'referred3@example.com',
    status: 'completed',
    reward: 5000,
    createdAt: Timestamp.fromDate(new Date('2024-08-01')),
    completedAt: Timestamp.fromDate(new Date('2024-08-10')),
  },
]

for (const ref of referrals) {
  await db.collection('referrals').doc(ref.id).set(ref)
}
console.log(`✅ Created ${referrals.length} referrals\n`)

// 13. Create White Label Configs
console.log('🎨 Creating white-label configs...')
const whiteLabels = [
  {
    id: 'wl-acme',
    teamId: 'team-acme-corp',
    domain: 'ai.acme.com',
    companyName: 'Acme AI',
    logoUrl: 'https://example.com/acme-logo.png',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-02-01')),
  },
  {
    id: 'wl-tech',
    teamId: 'team-techstart',
    domain: 'bot.techstart.io',
    companyName: 'TechStart Bots',
    logoUrl: 'https://example.com/tech-logo.png',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    status: 'active',
    createdAt: Timestamp.fromDate(new Date('2024-05-15')),
  },
]

for (const wl of whiteLabels) {
  await db.collection('whiteLabelConfigs').doc(wl.id).set(wl)
}
console.log(`✅ Created ${whiteLabels.length} white-label configs\n`)

// 14. Create Audit Logs
console.log('📝 Creating audit logs...')
const auditLogs = []
const actions = ['user.login', 'user.logout', 'agent.create', 'agent.delete', 'payment.success', 'subscription.created', 'team.updated']

for (let i = 1; i <= 100; i++) {
  auditLogs.push({
    id: `log-${String(i).padStart(5, '0')}`,
    userId: randomElement(['user-admin-001', 'user-owner-acme', 'user-admin-acme', 'user-owner-tech']),
    teamId: randomElement(['team-acme-corp', 'team-techstart', 'team-innovate']),
    action: randomElement(actions),
    resourceType: randomElement(['user', 'agent', 'payment', 'subscription', 'team']),
    resourceId: `resource-${randomNumber(1, 100)}`,
    ipAddress: `192.168.${randomNumber(0, 255)}.${randomNumber(1, 254)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: {},
    createdAt: Timestamp.fromDate(randomDate(new Date('2024-01-01'), new Date())),
  })
}

for (const log of auditLogs) {
  await db.collection('auditLogs').doc(log.id).set(log)
}
console.log(`✅ Created ${auditLogs.length} audit logs\n`)

// 15. Create Contracts
console.log('📄 Creating contracts...')
const contracts = [
  {
    id: 'contract-001',
    teamId: 'team-acme-corp',
    type: 'enterprise',
    startDate: Timestamp.fromDate(new Date('2024-01-15')),
    endDate: Timestamp.fromDate(new Date('2025-01-15')),
    value: 350000,
    currency: 'usd',
    status: 'active',
    terms: 'Annual enterprise contract with custom terms',
    createdAt: Timestamp.fromDate(new Date('2024-01-10')),
  },
  {
    id: 'contract-002',
    teamId: 'team-techstart',
    type: 'standard',
    startDate: Timestamp.fromDate(new Date('2024-03-20')),
    endDate: Timestamp.fromDate(new Date('2025-03-20')),
    value: 120000,
    currency: 'usd',
    status: 'active',
    terms: 'Annual pro subscription',
    createdAt: Timestamp.fromDate(new Date('2024-03-15')),
  },
]

for (const contract of contracts) {
  await db.collection('contracts').doc(contract.id).set(contract)
}
console.log(`✅ Created ${contracts.length} contracts\n`)

console.log('✨ Test data generation complete!\n')
console.log('📊 Summary:')
console.log(`   - ${teams.length} teams`)
console.log(`   - ${users.length} users`)
console.log(`   - ${plans.length} subscription plans`)
console.log(`   - ${subscriptions.length} subscriptions`)
console.log(`   - ${agents.length} agents`)
console.log(`   - ${paymentMethods.length} payment methods`)
console.log(`   - ${invoices.length} invoices`)
console.log(`   - ${payments.length} payments`)
console.log(`   - ${wallets.length} wallets`)
console.log(`   - ${creditTransactions.length} credit transactions`)
console.log(`   - ${invites.length} invites`)
console.log(`   - ${referrals.length} referrals`)
console.log(`   - ${whiteLabels.length} white-label configs`)
console.log(`   - ${auditLogs.length} audit logs`)
console.log(`   - ${contracts.length} contracts`)
console.log('\n🎉 Done! You can now test all features.')

process.exit(0)
