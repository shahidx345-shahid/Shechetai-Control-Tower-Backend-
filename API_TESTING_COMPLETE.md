# 🧪 Complete API Testing Documentation

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [All Endpoints](#all-endpoints)
- [Testing Examples](#testing-examples)
- [Postman Collection](#postman-collection)
- [cURL Examples](#curl-examples)
- [Response Codes](#response-codes)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Development server running on `http://localhost:3000`
- API Key: `shechetai_super_secret_key_2025` (from `.env.local`)

### Test Your First API (30 seconds)

**Using Postman:**
1. Open Postman
2. Create new request: `GET http://localhost:3000/api/overview` (or `http://localhost:3001` if port 3000 is in use)
3. Add Header:
   - Key: `x-api-key`
   - Value: `shechetai_super_secret_key_2025`
4. Click **Send**
5. ✅ Success! You should see platform statistics

**Using cURL:**
```bash
curl http://localhost:3000/api/overview \
  -H "x-api-key: shechetai_super_secret_key_2025"
```

---

## 🔐 Authentication

All APIs require authentication using **API Key** in request headers.

### Header Format
```
x-api-key: shechetai_super_secret_key_2025
```

### Alternative: Bearer Token (Optional)
For user-specific testing, you can use Firebase ID tokens:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

To get Firebase token:
1. Login at `http://localhost:3000`
2. Open browser console (F12)
3. Run: `firebase.auth().currentUser.getIdToken().then(t => console.log(t))`
4. Copy the token

---

## 📚 All Endpoints

### Base URL
```
http://localhost:3000/api
```

---

## 1. 🏠 Overview & Dashboard

### GET /api/overview
Get platform statistics

**Request:**
```bash
GET http://localhost:3000/api/overview
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalAgents": 25,
    "totalTeams": 5,
    "totalUsers": 7,
    "systemHealth": "Operational",
    "timestamp": "2025-11-28T10:00:00Z"
  }
}
```

---

## 2. 👥 Users Management

### GET /api/users
List all users with pagination and filters

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `role` (string: 'admin' | 'member' | 'owner')
- `status` (string: 'active' | 'inactive' | 'suspended')
- `search` (string: search by name or email)

**Request:**
```bash
GET http://localhost:3000/api/users?page=1&limit=10&status=active
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "uid": "user-001",
        "email": "admin@shechetai.com",
        "name": "Super Admin",
        "role": "superAdmin",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLogin": "2025-11-28T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 7,
      "totalPages": 1
    }
  }
}
```

### POST /api/users
Create a new user

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "John Doe",
  "role": "member",
  "teamId": "team-001"
}
```

**Request:**
```bash
POST http://localhost:3000/api/users
Headers:
  x-api-key: shechetai_super_secret_key_2025
  Content-Type: application/json
Body:
  { "email": "newuser@example.com", "name": "John Doe", "role": "member" }
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "uid": "user-new-001",
    "email": "newuser@example.com",
    "name": "John Doe",
    "role": "member",
    "status": "active",
    "createdAt": "2025-11-28T10:00:00Z"
  }
}
```

### GET /api/users/:userId
Get user details

**Request:**
```bash
GET http://localhost:3000/api/users/user-001
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

### PATCH /api/users/:userId
Update user

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "admin"
}
```

### DELETE /api/users/:userId
Delete user

**Request:**
```bash
DELETE http://localhost:3000/api/users/user-001
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

### POST /api/users/:userId/suspend
Suspend user account

**Request Body:**
```json
{
  "reason": "Policy violation"
}
```

### POST /api/users/:userId/activate
Activate suspended user

---

## 3. 🤖 Agents

### GET /api/agents
List all agents

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `teamId` (string)
- `status` (string: 'active' | 'inactive' | 'suspended' | 'training')
- `type` (string: 'customer-support' | 'sales' | 'technical' | 'general')

**Request:**
```bash
GET http://localhost:3000/api/agents?page=1&limit=10
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "agent-001",
        "teamId": "team-acme-corp",
        "name": "Agent 1",
        "type": "customer-support",
        "status": "active",
        "apiKey": "sk_test_agent_xxxxx",
        "totalCalls": 15234,
        "successRate": 96.5,
        "avgResponseTime": 450,
        "lastUsed": "2025-11-28T09:45:00Z",
        "createdAt": "2024-03-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### POST /api/agents
Create new agent

**Request Body:**
```json
{
  "name": "Customer Support Bot",
  "type": "customer-support",
  "teamId": "team-001",
  "status": "active"
}
```

### GET /api/agents/:agentId
Get agent details

### PATCH /api/agents/:agentId
Update agent

### DELETE /api/agents/:agentId
Delete agent

---

## 4. 👨‍👩‍👧‍👦 Teams

### GET /api/teams
List all teams

**Request:**
```bash
GET http://localhost:3000/api/teams
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "team-acme-corp",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "ownerEmail": "owner@acme.com",
      "plan": "enterprise",
      "maxSeats": 50,
      "usedSeats": 25,
      "status": "active",
      "stripeCustomerId": "cus_test_acme123",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2025-11-28T10:00:00Z"
    }
  ]
}
```

### POST /api/teams
Create new team

**Request Body:**
```json
{
  "name": "New Team",
  "slug": "new-team",
  "ownerEmail": "owner@newteam.com",
  "plan": "basic",
  "maxSeats": 10
}
```

### GET /api/teams/:teamId
Get team details

### PATCH /api/teams/:teamId
Update team

### DELETE /api/teams/:teamId
Delete team

### GET /api/teams/:teamId/analytics
Get team analytics

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "teamId": "team-001",
    "totalAgents": 10,
    "activeAgents": 8,
    "totalApiCalls": 50000,
    "successRate": 95.5,
    "avgResponseTime": 350,
    "creditsUsed": 2500,
    "period": "2025-11"
  }
}
```

---

## 5. 💳 Subscriptions

### GET /api/subscriptions
List all subscriptions

**Request:**
```bash
GET http://localhost:3000/api/subscriptions
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-acme-001",
      "teamId": "team-acme-corp",
      "planId": "plan-enterprise",
      "status": "active",
      "currentPeriodStart": "2024-11-01T00:00:00Z",
      "currentPeriodEnd": "2024-12-01T00:00:00Z",
      "cancelAtPeriodEnd": false,
      "stripeSubscriptionId": "sub_stripe_acme123",
      "amount": 29900,
      "currency": "usd",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /api/subscriptions
Create subscription

**Request Body:**
```json
{
  "teamId": "team-001",
  "planId": "plan-pro",
  "paymentMethodId": "pm-001"
}
```

### GET /api/subscriptions/:subscriptionId
Get subscription details

### PATCH /api/subscriptions/:subscriptionId
Update subscription

### DELETE /api/subscriptions/:subscriptionId
Cancel subscription

---

## 6. 💰 Billing & Invoices

### GET /api/billing
Get billing overview

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000,
    "thisMonth": 29900,
    "outstandingBalance": 5000,
    "paidInvoices": 24,
    "unpaidInvoices": 2
  }
}
```

### GET /api/invoices
List all invoices

**Query Parameters:**
- `page`, `limit`
- `status` (string: 'paid' | 'open' | 'past_due' | 'canceled')
- `teamId` (string)

**Request:**
```bash
GET http://localhost:3000/api/invoices?status=paid
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "inv-0001",
        "teamId": "team-acme-corp",
        "subscriptionId": "sub-acme-001",
        "amount": 29900,
        "currency": "usd",
        "status": "paid",
        "invoiceNumber": "INV-2024-0001",
        "invoiceDate": "2024-11-01T00:00:00Z",
        "dueDate": "2024-11-15T00:00:00Z",
        "paidAt": "2024-11-03T10:30:00Z",
        "stripeInvoiceId": "in_test_xxxxx",
        "pdfUrl": "https://invoices.stripe.com/test_xxxxx",
        "createdAt": "2024-11-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "totalPages": 3
    }
  }
}
```

### POST /api/invoices
Create invoice

### GET /api/invoices/:invoiceId
Get invoice details

---

## 7. 💳 Payment Methods

### GET /api/payment-methods
List payment methods

**Request:**
```bash
GET http://localhost:3000/api/payment-methods
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "pm-acme-001",
      "teamId": "team-acme-corp",
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2026,
      "isDefault": true,
      "stripePaymentMethodId": "pm_test_visa4242",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /api/payment-methods
Add payment method

**Request Body:**
```json
{
  "teamId": "team-001",
  "type": "card",
  "token": "tok_visa",
  "setAsDefault": true
}
```

### DELETE /api/payment-methods/:paymentMethodId
Remove payment method

---

## 8. 🪙 Credits & Wallets

**Note:** Wallets are only used for **per-run billing agents**. Monthly subscription and one-time payment agents don't use the wallet system.

### Wallet System Overview
- Document structure: `wallets/{teamId}` (teamId is the document ID)
- Team owner makes payments into the wallet to get credits
- Per-run agents deduct credits from the wallet on each execution
- Auto-refill can be configured to automatically purchase credits when balance is low

### POST /api/credits/purchase-pack
Purchase a credit pack and add credits to team wallet (per-run billing only)

**Request Body:**
```json
{
  "teamId": "team-acme-corp",
  "amount": 50,
  "credits": 500,
  "packName": "Starter Pack",
  "paymentMethodId": "pm-visa-4242"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "team-acme-corp",
      "teamId": "team-acme-corp",
      "balance": 1500,
      "currency": "credits"
    },
    "transaction": {
      "id": "txn-001",
      "type": "purchase",
      "amount": 500,
      "balance": 1500
    },
    "creditsAdded": 500
  },
  "message": "Credit pack purchased successfully"
}
```

### POST /api/credits/configure-auto-refill
Configure automatic credit refill for per-run agents

**Request Body:**
```json
{
  "teamId": "team-acme-corp",
  "enabled": true,
  "threshold": 100,
  "amount": 500,
  "paymentMethodId": "pm-visa-4242"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "team-acme-corp",
      "teamId": "team-acme-corp",
      "balance": 1500,
      "autoRefill": {
        "enabled": true,
        "threshold": 100,
        "amount": 500,
        "paymentMethodId": "pm-visa-4242"
      }
    },
    "autoRefillSettings": {
      "enabled": true,
      "threshold": 100,
      "amount": 500,
      "paymentMethodId": "pm-visa-4242"
    }
  },
  "message": "Auto-refill configured successfully"
}
```

### GET /api/credits/configure-auto-refill
Get current auto-refill configuration

**Query Parameters:**
- `teamId` (string, required)

**Request:**
```bash
GET http://localhost:3000/api/credits/configure-auto-refill?teamId=team-acme-corp
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

### POST /api/credits/report-run
**Internal endpoint only** - Report agent run and debit credits

**Request Body:**
```json
{
  "agentId": "agent-001",
  "teamId": "team-acme-corp",
  "creditCost": 5,
  "runId": "run-12345",
  "metadata": {
    "duration": 1250,
    "tokensUsed": 450
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "success": true,
    "previousBalance": 500,
    "creditCost": 5,
    "newBalance": 495,
    "belowThreshold": false,
    "transactionId": "txn-002"
  }
}
```

### POST /api/credits/grant
Grant credits to team (Super Admin only)

**Request Body:**
```json
{
  "teamId": "team-001",
  "amount": 1000,
  "reason": "Promotional bonus"
}
```

### GET /api/wallets
Get wallet by teamId

**Query Parameters:**
- `teamId` (string, optional) - Get specific team's wallet

**Request:**
```bash
GET http://localhost:3000/api/wallets?teamId=team-acme-corp
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "team-acme-corp",
    "teamId": "team-acme-corp",
    "balance": 150000,
    "currency": "credits",
    "autoRefill": {
      "enabled": true,
      "threshold": 100,
      "amount": 500,
      "paymentMethodId": "pm-visa-4242"
    },
    "updatedAt": "2025-11-28T10:00:00Z"
  }
}
```

---

## 9. ✉️ Invites

### GET /api/invites
List all invites

**Query Parameters:**
- `status` (string: 'pending' | 'accepted' | 'expired' | 'canceled')
- `teamId` (string)

**Request:**
```bash
GET http://localhost:3000/api/invites?status=pending
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "invite-001",
      "teamId": "team-acme-corp",
      "email": "newmember@acme.com",
      "role": "member",
      "status": "pending",
      "invitedBy": "user-owner-acme",
      "expiresAt": "2025-12-05T00:00:00Z",
      "createdAt": "2025-11-20T00:00:00Z"
    }
  ]
}
```

### POST /api/invites
Send invite

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "teamId": "team-001",
  "role": "member"
}
```

### POST /api/invites/:inviteId/accept
Accept invite

### DELETE /api/invites/:inviteId
Cancel invite

---

## 10. 🎁 Referrals

### GET /api/referrals
List all referrals

**Request:**
```bash
GET http://localhost:3000/api/referrals
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "ref-001",
      "referrerId": "user-owner-acme",
      "refereeEmail": "referred1@example.com",
      "status": "completed",
      "reward": 5000,
      "createdAt": "2024-09-15T00:00:00Z",
      "completedAt": "2024-09-20T00:00:00Z"
    }
  ]
}
```

### POST /api/referrals
Create referral

**Request Body:**
```json
{
  "refereeEmail": "friend@example.com"
}
```

### GET /api/referrals/:userId/stats
Get referral statistics

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalReferrals": 5,
    "completedReferrals": 3,
    "pendingReferrals": 2,
    "totalRewards": 15000,
    "conversionRate": 60
  }
}
```

---

## 11. 🎨 White Label

### GET /api/white-label
List white label configs

**Request:**
```bash
GET http://localhost:3000/api/white-label
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "wl-acme",
      "teamId": "team-acme-corp",
      "domain": "ai.acme.com",
      "companyName": "Acme AI",
      "logoUrl": "https://example.com/acme-logo.png",
      "primaryColor": "#1e40af",
      "secondaryColor": "#3b82f6",
      "status": "active",
      "createdAt": "2024-02-01T00:00:00Z"
    }
  ]
}
```

### POST /api/white-label
Create white label config

**Request Body:**
```json
{
  "teamId": "team-001",
  "domain": "custom.example.com",
  "companyName": "Custom Brand",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#0066cc",
  "secondaryColor": "#00cc66"
}
```

### PATCH /api/white-label/:configId
Update white label config

### DELETE /api/white-label/:configId
Delete white label config

---

## 12. 🛡️ Audit Logs

### GET /api/audit-logs
List audit logs

**Query Parameters:**
- `page`, `limit`
- `userId` (string)
- `action` (string)
- `resource` (string)
- `startDate` (ISO date)
- `endDate` (ISO date)

**Request:**
```bash
GET http://localhost:3000/api/audit-logs?page=1&limit=20&action=user.login
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "log-00001",
        "userId": "user-admin-001",
        "teamId": "team-acme-corp",
        "action": "user.login",
        "resourceType": "user",
        "resourceId": "user-admin-001",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "metadata": {},
        "createdAt": "2025-11-28T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### POST /api/audit-logs
Create audit log entry

---

## 13. 📊 Reports

### GET /api/reports/usage
Get usage report

**Query Parameters:**
- `startDate` (ISO date, required)
- `endDate` (ISO date, required)
- `teamId` (string, optional)

**Request:**
```bash
GET http://localhost:3000/api/reports/usage?startDate=2024-11-01&endDate=2024-11-28
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-11-01T00:00:00Z",
      "end": "2024-11-28T23:59:59Z"
    },
    "metrics": {
      "totalApiCalls": 150000,
      "creditsUsed": 7500,
      "activeAgents": 25,
      "activeUsers": 7,
      "activeTeams": 5
    },
    "breakdown": [
      {
        "date": "2024-11-28",
        "apiCalls": 5000,
        "creditsUsed": 250
      }
    ]
  }
}
```

### POST /api/reports/usage
Generate usage report

**Request Body:**
```json
{
  "startDate": "2024-11-01",
  "endDate": "2024-11-28",
  "teamId": "team-001"
}
```

---

## 14. 🔧 Debug & Admin

### GET /api/debug/health
System health check

**Request:**
```bash
GET http://localhost:3000/api/debug/health
Headers:
  x-api-key: shechetai_super_secret_key_2025
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-28T10:00:00Z",
    "services": {
      "api": "operational",
      "database": "operational",
      "firebase": "operational"
    },
    "uptime": "99.98%"
  }
}
```

### POST /api/debug/test-email
Test email sending

**Request Body:**
```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "template": "welcome"
}
```

### GET /api/admin/settings
Get admin settings

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "maintenanceMode": false,
    "registrationEnabled": true,
    "maxTeamSize": 50,
    "maxAgentsPerTeam": 100
  }
}
```

### POST /api/admin/settings
Update admin settings

**Request Body:**
```json
{
  "maintenanceMode": false,
  "registrationEnabled": true
}
```

---

## 🧪 Testing Examples

### Example 1: Complete User Flow

```bash
# 1. Get overview
curl http://localhost:3000/api/overview \
  -H "x-api-key: shechetai_super_secret_key_2025"

# 2. List users
curl http://localhost:3000/api/users?page=1&limit=10 \
  -H "x-api-key: shechetai_super_secret_key_2025"

# 3. Create new user
curl -X POST http://localhost:3000/api/users \
  -H "x-api-key: shechetai_super_secret_key_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "member"
  }'

# 4. Get user details
curl http://localhost:3000/api/users/user-001 \
  -H "x-api-key: shechetai_super_secret_key_2025"

# 5. Update user
curl -X PATCH http://localhost:3000/api/users/user-001 \
  -H "x-api-key: shechetai_super_secret_key_2025" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Example 2: Agent Management

```bash
# List agents
curl http://localhost:3000/api/agents?status=active \
  -H "x-api-key: shechetai_super_secret_key_2025"

# Create agent
curl -X POST http://localhost:3000/api/agents \
  -H "x-api-key: shechetai_super_secret_key_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Bot",
    "type": "customer-support",
    "teamId": "team-001",
    "status": "active"
  }'

# Get agent stats
curl http://localhost:3000/api/agents/agent-001 \
  -H "x-api-key: shechetai_super_secret_key_2025"
```

### Example 3: Billing & Subscriptions

```bash
# Get billing overview
curl http://localhost:3000/api/billing \
  -H "x-api-key: shechetai_super_secret_key_2025"

# List invoices
curl http://localhost:3000/api/invoices?status=paid \
  -H "x-api-key: shechetai_super_secret_key_2025"

# Get specific invoice
curl http://localhost:3000/api/invoices/inv-0001 \
  -H "x-api-key: shechetai_super_secret_key_2025"

# List subscriptions
curl http://localhost:3000/api/subscriptions \
  -H "x-api-key: shechetai_super_secret_key_2025"
```

---

## 📦 Postman Collection

### Import Collection
1. Open Postman
2. Click **Import**
3. Select `postman-collection-complete.json` from project root
4. Collection imported with all endpoints!

### Collection Features
- ✅ All 60+ endpoints pre-configured
- ✅ API key authentication included
- ✅ Sample request bodies
- ✅ Environment variables ready
- ✅ Organized by feature

### Environment Variables
The collection uses these variables:
```
baseUrl: http://localhost:3000/api
apiKey: shechetai_super_secret_key_2025
```

---

## 📝 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful GET/PATCH request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🔍 Troubleshooting

### Error: 401 Unauthorized

**Problem:** API returns `{"success": false, "error": "Unauthorized"}`

**Solutions:**
1. ✅ Verify header name is exactly `x-api-key` (lowercase, with dash)
2. ✅ Check API key value: `shechetai_super_secret_key_2025`
3. ✅ Ensure dev server is running: `npm run dev`
4. ✅ Verify `.env.local` has `SUPER_ADMIN_API_KEY` set

### Error: 429 Too Many Requests

**Problem:** Rate limit exceeded (100 requests/minute)

**Solutions:**
1. ✅ Wait 60 seconds before retrying
2. ✅ Implement request throttling in your code
3. ✅ Use pagination for large data requests
4. ✅ Cache responses when possible

### Error: 404 Not Found

**Problem:** Endpoint not found

**Solutions:**
1. ✅ Check URL path is correct (case-sensitive)
2. ✅ Verify base URL: `http://localhost:3000/api`
3. ✅ Ensure dev server is running on port 3000
4. ✅ Check endpoint exists in this documentation

### Error: 500 Internal Server Error

**Problem:** Server-side error

**Solutions:**
1. ✅ Check terminal logs for error details
2. ✅ Verify Firebase connection is working
3. ✅ Run test data generator: `node scripts/generate-test-data.mjs`
4. ✅ Check database collections exist in Firestore

### Error: CORS Issues

**Problem:** Browser blocks request due to CORS

**Solutions:**
1. ✅ Ensure you're using `http://localhost:3000` (not 127.0.0.1)
2. ✅ Check `next.config.mjs` has CORS headers configured
3. ✅ Use Postman or cURL for testing (no CORS issues)

---

## 📊 Test Data Summary

After running test data generator, you have:
- **5 teams** (4 active, 1 suspended)
- **7 users** (various roles)
- **25 agents** (different types and statuses)
- **4 subscriptions** (3 active, 1 past_due)
- **30 invoices** (mix of paid/open/past_due)
- **3 payment methods**
- **3 wallets** with balances
- **60 credit transactions**
- **3 invites** (pending/accepted/expired)
- **3 referrals**
- **2 white-label configs**
- **100 audit logs**

---

## 🎯 Testing Checklist

Use this checklist to test all functionality:

### Authentication
- [ ] Test with API key header
- [ ] Test with missing API key (should return 401)
- [ ] Test with invalid API key (should return 401)

### Users
- [ ] List users with pagination
- [ ] Create new user
- [ ] Get user details
- [ ] Update user
- [ ] Delete user
- [ ] Suspend user
- [ ] Activate user

### Agents
- [ ] List agents
- [ ] Filter agents by status
- [ ] Create agent
- [ ] Update agent
- [ ] Delete agent

### Teams
- [ ] List teams
- [ ] Get team analytics
- [ ] Create team
- [ ] Update team

### Billing
- [ ] List invoices
- [ ] Filter invoices by status
- [ ] Get invoice details
- [ ] List subscriptions
- [ ] Create subscription

### Credits
- [ ] Get credits balance
- [ ] Grant credits
- [ ] Deduct credits

### Invites
- [ ] List invites
- [ ] Send invite
- [ ] Accept invite
- [ ] Cancel invite

### Reports
- [ ] Generate usage report
- [ ] Get usage report with date range

### Admin
- [ ] Check system health
- [ ] Test email sending
- [ ] Get admin settings

---

## 📞 Support

### Documentation Files
- `API_TESTING_COMPLETE.md` - This file (complete API testing guide)
- `API_DOCUMENTATION.md` - Detailed API reference (1383 lines)
- `PAYMENT_EMAIL_UPLOAD_SETUP.md` - Integration setup guide
- `README.md` - Project overview and quick start

### Quick Commands

**Start server:**
```bash
npm run dev
```

**Generate test data:**
```bash
node scripts/generate-test-data.mjs
```

**Check TypeScript:**
```bash
npm run type-check
```

---

## 🎉 Ready to Test!

You now have:
- ✅ Complete API documentation
- ✅ 60+ endpoints with examples
- ✅ cURL commands for every endpoint
- ✅ Postman collection ready to import
- ✅ Test data in Firestore
- ✅ API key configured

**Start testing now!** Just add the header:
```
x-api-key: shechetai_super_secret_key_2025
```

---

**Last Updated:** November 28, 2025
**API Version:** 1.0.0
**Total Endpoints:** 60+
