/**
 * Seed script to populate Firebase Firestore with sample data
 * Run: node scripts/seed-data.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore(app)

async function seedData() {
  console.log('\n🌱 Seeding Firestore Database...\n')

  try {
    // Create Teams
    console.log('📦 Creating Teams...')
    const team1Ref = await db.collection('teams').add({
      name: 'Acme Corporation',
      ownerId: 'E0LTywhNqYRzzUotvRl6MTcP6BD2',
      status: 'active',
      seatCap: 10,
      seatUsage: 3,
      billingStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Team created:', team1Ref.id)

    const team2Ref = await db.collection('teams').add({
      name: 'TechStart Inc',
      ownerId: 'E0LTywhNqYRzzUotvRl6MTcP6BD2',
      status: 'active',
      seatCap: 15,
      seatUsage: 7,
      billingStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Team created:', team2Ref.id)

    // Create Agents
    console.log('\n🤖 Creating Agents...')
    const agent1Ref = await db.collection('agents').add({
      name: 'AI Assistant Pro',
      teamId: team1Ref.id,
      status: 'active',
      seatUsage: { used: 3, cap: 10 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Agent created:', agent1Ref.id)

    const agent2Ref = await db.collection('agents').add({
      name: 'Customer Support Bot',
      teamId: team2Ref.id,
      status: 'active',
      seatUsage: { used: 7, cap: 15 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Agent created:', agent2Ref.id)

    const agent3Ref = await db.collection('agents').add({
      name: 'Research Assistant',
      teamId: team1Ref.id,
      status: 'inactive',
      seatUsage: { used: 0, cap: 5 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Agent created:', agent3Ref.id)

    // Create Billing Contracts
    console.log('\n💰 Creating Billing Contracts...')
    const contract1Ref = await db.collection('contracts').add({
      teamId: team1Ref.id,
      agentId: agent1Ref.id,
      status: 'active',
      planType: 'tier_basic',
      monthlyFee: 99,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Contract created:', contract1Ref.id)

    // Create Wallets
    console.log('\n💳 Creating Wallets...')
    const wallet1Ref = await db.collection('wallets').add({
      entityId: team1Ref.id,
      entityType: 'team',
      balance: 10000,
      currency: 'usd',
      status: 'active',
      autoRefill: {
        enabled: true,
        floor: 1000,
        refillTo: 10000,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Wallet created:', wallet1Ref.id)

    const wallet2Ref = await db.collection('wallets').add({
      entityId: team2Ref.id,
      entityType: 'team',
      balance: 5000,
      currency: 'usd',
      status: 'active',
      autoRefill: {
        enabled: false,
        floor: 500,
        refillTo: 5000,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Wallet created:', wallet2Ref.id)

    // Create Transactions
    console.log('\n📊 Creating Transactions...')
    const transaction1Ref = await db.collection('transactions').add({
      walletId: wallet1Ref.id,
      type: 'credit',
      amount: 10000,
      description: 'Initial credit',
      timestamp: new Date().toISOString(),
      status: 'completed',
    })
    console.log('✅ Transaction created:', transaction1Ref.id)

    // Create Referrals
    console.log('\n🎁 Creating Referrals...')
    const referral1Ref = await db.collection('referrals').add({
      referrerId: 'E0LTywhNqYRzzUotvRl6MTcP6BD2',
      code: 'SHECHET2024',
      status: 'active',
      rewardAmount: 12345,
      rateBps: 2000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Referral created:', referral1Ref.id)

    // Create White Labels
    console.log('\n🎨 Creating White Labels...')
    const whiteLabel1Ref = await db.collection('whiteLabels').add({
      teamId: team1Ref.id,
      domain: 'app.acmecorp.com',
      status: 'active',
      brandName: 'Acme AI',
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#0066cc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ White Label created:', whiteLabel1Ref.id)

    const whiteLabel2Ref = await db.collection('whiteLabels').add({
      teamId: team2Ref.id,
      domain: 'ai.techstart.io',
      status: 'pending_verification',
      brandName: 'TechStart AI',
      logoUrl: 'https://example.com/logo2.png',
      primaryColor: '#ff6600',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ White Label created:', whiteLabel2Ref.id)

    // Create Subscriptions
    console.log('\n📅 Creating Subscriptions...')
    const subscription1Ref = await db.collection('subscriptions').add({
      userId: 'E0LTywhNqYRzzUotvRl6MTcP6BD2',
      planId: 'tier_pro',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Subscription created:', subscription1Ref.id)

    // Create Feature Flags
    console.log('\n🚩 Creating Feature Flags...')
    const flag1Ref = await db.collection('featureFlags').add({
      name: 'enable_ai_chat',
      enabled: true,
      description: 'Enable AI chat feature',
      rolloutPercentage: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Feature Flag created:', flag1Ref.id)

    console.log('\n✨ Database seeded successfully!\n')
    console.log('📊 Summary:')
    console.log('   - 2 Teams')
    console.log('   - 3 Agents')
    console.log('   - 1 Contract')
    console.log('   - 2 Wallets')
    console.log('   - 1 Transaction')
    console.log('   - 1 Referral')
    console.log('   - 2 White Labels')
    console.log('   - 1 Subscription')
    console.log('   - 1 Feature Flag')
    console.log('\n🎉 Your database is now ready with sample data!')
    console.log('   Visit http://localhost:3000/dashboard to see the data.\n')

  } catch (error) {
    console.error('\n❌ Error seeding database:', error)
  } finally {
    process.exit(0)
  }
}

seedData()
