/**
 * Script to create initial Super Admin user in Firebase
 * Run: node scripts/create-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import * as readline from 'readline'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
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

const auth = getAuth(app)
const db = getFirestore(app)

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createSuperAdmin() {
  console.log('\n🔧 Shechetai Control Tower - Create Super Admin\n')

  try {
    // Get user input
    const email = await question('Enter admin email: ')
    const password = await question('Enter admin password (min 6 characters): ')
    const name = await question('Enter admin name: ')

    if (!email || !password || !name) {
      console.error('❌ All fields are required!')
      process.exit(1)
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!')
      process.exit(1)
    }

    console.log('\n⏳ Creating Firebase Auth user...')

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: email.trim(),
      password: password,
      displayName: name.trim(),
      emailVerified: true,
    })

    console.log('✅ Firebase Auth user created:', userRecord.uid)

    // Create Firestore user document
    console.log('⏳ Creating Firestore user document...')

    await db.collection('users').doc(userRecord.uid).set({
      email: email.trim(),
      name: name.trim(),
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      metadata: {
        createdBy: 'admin-script',
      },
    })

    console.log('✅ Firestore user document created')

    // Set custom claims for role
    console.log('⏳ Setting custom user claims...')

    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'super_admin',
      isSuperAdmin: true,
    })

    console.log('✅ Custom claims set')

    console.log('\n✨ Super Admin created successfully!\n')
    console.log('📧 Email:', email)
    console.log('🆔 User ID:', userRecord.uid)
    console.log('👤 Name:', name)
    console.log('🔑 Role: super_admin')
    console.log('\nYou can now sign in with these credentials.\n')
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message)
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 This email already exists. Use a different email or delete the existing user first.')
    }
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Run the script
createSuperAdmin()
