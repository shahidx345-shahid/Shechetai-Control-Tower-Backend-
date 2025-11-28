/**
 * Application Configuration
 * Centralized configuration for API endpoints and environment settings
 */

// API Base URL - defaults to production backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hooks.shechet.com'

// API Endpoints
export const API_ENDPOINTS = {
    // Health & Overview
    HEALTH: '/_config/health',

    // Agents
    LIST_AGENTS: '/_config/list-agents',
    AGENT_DETAIL: '/_config/agents',
    UPSERT_AGENT: '/_config/agents.upsertMeta',

    // Teams
    TEAMS_AGENTS: '/_config/teams.agents',
    CREATE_TEAM: '/_config/teams.create',
    UPDATE_TEAM: '/_config/teams.update',

    // Billing
    BILLING_CATALOG: '/_config/billing.catalog',
    BILLING_AGENT_STATUS: '/_config/billing.agent.status',
    BILLING_CONTRACTS: '/_config/billing/contracts',

    // Credits & Wallets
    WALLET_STATUS: '/_config/credits.wallet.status',
    CONFIGURE_AUTO_REFILL: '/_config/credits.wallet.configureAutoRefill',

    // Referrals
    REFERRALS_STATUS: '/_config/referrals.status',
    CREATE_REFERRAL_CODE: '/_config/referrals.createCode',

    // White Label
    WHITE_LABEL_DOMAINS: '/_config/wl.domains.status',
    REQUEST_DOMAIN: '/_config/wl.domains.request',
    CONFIGURE_RETAIL: '/_config/wl.agent.configureRetail',
} as const

// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Helper function to build full API URL
export function getApiUrl(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`
}

// Helper function to check if we're in development
export const isDevelopment = process.env.NODE_ENV === 'development'

// Helper function to check if we're in production
export const isProduction = process.env.NODE_ENV === 'production'
