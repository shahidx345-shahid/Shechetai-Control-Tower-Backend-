# Shechetai Control Tower - Backend API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints require authentication via one of the following methods:

### API Key (Header)
```http
x-api-key: YOUR_API_KEY
```

### Bearer Token (Header)
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow this structure:

```typescript
{
  success: boolean
  data?: any
  error?: string
  message?: string
}
```

Paginated responses include:
```typescript
{
  success: true
  data: {
    data: Array<T>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

---

## Endpoints

### System Health

#### GET /api/health
Get system health status and service availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "timestamp": "2024-01-15T19:00:00Z",
    "services": {
      "api": "operational",
      "database": "operational",
      "cache": "operational",
      "queue": "operational"
    },
    "uptime": "99.98%",
    "version": "1.0.0"
  }
}
```

---

### Overview

#### GET /api/overview
Get platform statistics and health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": {
      "total": 100,
      "active": 85,
      "inactive": 15
    },
    "teams": {
      "total": 50,
      "active": 48,
      "suspended": 2
    },
    "billing": {
      "totalContracts": 40,
      "activeContracts": 35,
      "totalRevenue": 50000
    },
    "systemHealth": {
      "status": "operational",
      "uptime": "99.9%"
    }
  }
}
```

---

### Users

#### GET /api/users
List all users with optional filters (Super Admin only).

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role (super_admin, admin, user)
- `status`: Filter by status (active, suspended, deleted)
- `search`: Search by user ID, email, or name

#### POST /api/users
Create a new user (Super Admin only).

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure_password",
  "role": "user"
}
```

#### GET /api/users/[userId]
Get user by ID.

#### PATCH /api/users/[userId]
Update user (Super Admin only).

#### DELETE /api/users/[userId]
Soft delete user (Super Admin only).

#### POST /api/users/[userId]/suspend
Suspend a user account (Super Admin only).

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

#### POST /api/users/[userId]/activate
Reactivate a suspended user (Super Admin only).

---

### Agents

#### GET /api/agents
List all agents with optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `teamId` (optional): Filter by team ID
- `status` (optional): Filter by status (active, inactive, suspended)
- `search` (optional): Search by agent ID or name

**Example:**
```bash
GET /api/agents?teamId=team_123&status=active&page=1&limit=20
```

#### POST /api/agents
Create a new agent.

**Request Body:**
```json
{
  "name": "AI Assistant Pro",
  "teamId": "team_123",
  "status": "active",
  "metadata": {}
}
```

#### GET /api/agents/[agentId]
Get agent by ID.

#### PATCH /api/agents/[agentId]
Update agent.

**Request Body:**
```json
{
  "name": "Updated Agent Name",
  "status": "inactive"
}
```

#### DELETE /api/agents/[agentId]
Delete agent.

#### GET /api/agents/[agentId]/analytics
Get agent usage analytics and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_001",
    "totalRequests": 5000,
    "successfulRequests": 4800,
    "failedRequests": 200,
    "averageResponseTime": 250.5,
    "lastUsedAt": "2024-01-15T10:30:00Z",
    "usageByDay": [
      { "date": "2024-01-15", "count": 100 },
      { "date": "2024-01-14", "count": 95 }
    ]
  }
}
```

---

### Agent Seats

#### GET /api/agent-seats/status
Get agent seat status and availability.

**Query Parameters:**
- `agentId` (optional): Filter by agent ID
- `teamId` (optional): Filter by team ID

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_001",
    "teamId": "team_123",
    "totalSeats": 10,
    "usedSeats": 7,
    "availableSeats": 3,
    "pendingRequests": 2
  }
}
```

#### GET /api/agent-seats/requests
List all agent seat requests.

**Query Parameters:**
- `page`, `limit`: Pagination
- `agentId`: Filter by agent ID
- `teamId`: Filter by team ID
- `status`: Filter by status (pending, approved, denied)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "requestId": "req_001",
        "agentId": "agent_001",
        "teamId": "team_123",
        "requestedBy": "user_123",
        "status": "pending",
        "requestedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### POST /api/agent-seats/requests/decide
Approve or deny an agent seat request (Admin only).

**Request Body:**
```json
{
  "requestId": "req_001",
  "decision": "approved",
  "reason": "Approved for project expansion"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "req_001",
    "decision": "approved",
    "decidedBy": "admin_001",
    "decidedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Teams

#### GET /api/teams
List all teams with optional filters.

**Query Parameters:**
- `page`, `limit`: Pagination
- `ownerId`: Filter by owner ID
- `status`: Filter by status
- `search`: Search by team ID or name

#### POST /api/teams
Create a new team.

**Request Body:**
```json
{
  "name": "Acme Corp",
  "ownerId": "user_123",
  "seatCap": 10,
  "metadata": {}
}
```

#### GET /api/teams/[teamId]
Get team by ID.

#### PATCH /api/teams/[teamId]
Update team.

#### DELETE /api/teams/[teamId]
Delete team (soft delete).

#### GET /api/teams/[teamId]/analytics
Get team analytics and usage statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": "team_123",
    "totalAgents": 5,
    "activeAgents": 4,
    "totalMembers": 8,
    "seatUtilization": 80,
    "totalRequests": 50000,
    "monthlySpend": 299.99,
    "activityLog": []
  }
}
```

---

### Team Members

#### GET /api/teams/[teamId]/members
Get all members of a team.

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": "team_123",
    "totalSeats": 10,
    "usedSeats": 3,
    "availableSeats": 7,
    "members": [
      {
        "userId": "user_001",
        "email": "user@example.com",
        "role": "owner",
        "status": "active",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/teams/[teamId]/members
Add a member to a team.

**Request Body:**
```json
{
  "userId": "user_456",
  "email": "newmember@example.com",
  "role": "member"
}
```

#### DELETE /api/teams/[teamId]/members/[userId]
Remove a member from a team.

---

### Team Invites

#### GET /api/teams/[teamId]/invites
Get all invites for a team.

#### POST /api/teams/[teamId]/invites
Create a new team invite.

**Request Body:**
```json
{
  "email": "invite@example.com",
  "role": "member"
}
```

#### POST /api/teams/[teamId]/invites/revoke
Revoke a team invite.

**Request Body:**
```json
{
  "inviteId": "invite_123",
  "reason": "Position no longer available"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inviteId": "invite_123",
    "status": "revoked",
    "revokedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

### Billing & Contracts

#### GET /api/billing/contracts
List all billing contracts.

**Query Parameters:**
- `teamId`: Filter by team ID
#### DELETE /api/billing/contracts/[contractId]
Cancel a contract.

#### GET /api/billing/catalog
Get billing catalog with all available plans and pricing.

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "planId": "plan_pro",
        "name": "Professional",
        "price": 99.99,
        "currency": "USD",
        "billingCycle": "monthly",
        "features": ["Up to 10 agents", "Priority support"],
        "seatPrice": 10
      }
    ],
    "addons": [
      {
        "addonId": "addon_seat",
        "name": "Additional Seat",
        "price": 10,
        "currency": "USD"
      }
    ]
  }
}
```

#### POST /api/billing/catalog/admin/upsert
Create or update billing catalog entry (Super Admin only).

**Request Body:**
```json
{
  "planId": "plan_enterprise",
  "name": "Enterprise Plan",
  "price": 499,
  "currency": "USD",
  "billingCycle": "monthly",
  "features": ["Unlimited agents", "24/7 support", "Custom SLA"],
  "seatPrice": 25,
  "isActive": true
}
```

#### POST /api/billing/contracts/[contractId]/add-seat
Add seat to existing contract.

**Request Body:**
```json
{
  "quantity": 2,
  "effectiveDate": "2024-02-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractId": "contract_123",
    "seatsAdded": 2,
    "newTotalSeats": 12,
    "proRatedCharge": 20,
    "effectiveDate": "2024-02-01T00:00:00Z"
  }
}
```

#### POST /api/billing/contracts/[contractId]/remove-seat
Remove seat from contract.

**Request Body:**
```json
{
  "quantity": 1,
  "effectiveDate": "2024-02-01T00:00:00Z"
#### GET /api/credits/transactions
Get credit transactions.

**Query Parameters:**
- `teamId`: Filter by team ID
- `walletId`: Filter by wallet ID
- `page`, `limit`: Pagination

#### GET /api/credits/wallet/status
Get detailed wallet status for a team.

**Query Parameters:**
- `teamId` (required): Team ID

**Response:**
```json
{
  "success": true,
  "data": {
    "walletId": "wallet_123",
    "teamId": "team_123",
    "balance": 5000,
    "currency": "credits",
    "lastTransaction": "2024-01-15T10:00:00Z",
    "monthlyUsage": 1200,
    "projectedDepletion": "2024-05-15T00:00:00Z"
  }
}
```

#### POST /api/credits/deduct
Deduct credits from a team's wallet (System use only).

**Request Body:**
```json
{
  "teamId": "team_123",
  "amount": 100,
  "reason": "API usage charge",
  "metadata": {
    "agentId": "agent_001",
    "requestCount": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_001",
    "walletId": "wallet_123",
    "amount": -100,
    "balance": 4900,
    "timestamp": "2024-01-15T15:00:00Z"
  }
}
```

---

### Subscriptions & Plans
  "price": 50,
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractId": "contract_123",
    "blockId": "block_001",
    "blockType": "api_calls",
    "quantity": 10000,
    "price": 50,
    "addedAt": "2024-01-15T13:00:00Z"
  }
}
```

#### POST /api/billing/contracts/[contractId]/remove-block
Remove usage block from contract.

**Request Body:**
```json
{
  "blockId": "block_001"
}
```

#### POST /api/billing/contracts/[contractId]/resume
Resume a suspended contract.

**Request Body:**
```json
{
  "resumeDate": "2024-02-01T00:00:00Z",
  "reason": "Payment received"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractId": "contract_123",
    "status": "active",
    "resumedAt": "2024-02-01T00:00:00Z"
  }
}
```

#### POST /api/billing/onetime-charge
Create a one-time charge for a team.

**Request Body:**
```json
{
  "teamId": "team_123",
  "amount": 50,
  "currency": "USD",
#### DELETE /api/white-label/[configId]
Disable configuration.

#### POST /api/white-label/domains/request
Request a custom domain for white-label configuration.

**Request Body:**
```json
{
  "teamId": "team_123",
  "domain": "app.customdomain.com",
  "configId": "config_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "domain_req_001",
    "domain": "app.customdomain.com",
    "status": "pending_verification",
    "createdAt": "2024-01-15T16:00:00Z"
  }
}
```

#### GET /api/white-label/domains/instructions
Get DNS setup instructions for custom domain.

**Query Parameters:**
- `requestId` (required): Domain request ID

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "domain_req_001",
    "domain": "app.customdomain.com",
    "dnsRecords": [
      {
        "type": "CNAME",
        "name": "app",
        "value": "platform.shechetai.com",
        "ttl": 3600
      },
      {
        "type": "TXT",
        "name": "_verification",
        "value": "shechetai-verification-abc123xyz",
        "ttl": 3600
      }
    ],
    "instructions": "Add these DNS records to your domain registrar."
  }
}
```

#### GET /api/white-label/domains/status
Check custom domain verification status.

**Query Parameters:**
- `requestId` (required): Domain request ID

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "domain_req_001",
    "domain": "app.customdomain.com",
    "status": "verified",
    "verifiedAt": "2024-01-16T10:00:00Z",
    "sslStatus": "active"
  }
}
```

#### POST /api/white-label/domains/verify
Manually trigger domain verification check.

**Request Body:**
```json
{
  "requestId": "domain_req_001"
}
```

#### POST /api/white-label/domains/remove
Remove custom domain from white-label configuration.

**Request Body:**
```json
{
  "requestId": "domain_req_001",
  "reason": "Switching to different domain"
}
```

#### POST /api/white-label/retail/configure
Configure retail settings for white-label agent.

**Request Body:**
```json
{
  "configId": "config_123",
  "retailEnabled": true,
  "pricingMarkup": 20,
  "currency": "USD",
  "paymentMethods": ["card", "paypal"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "configId": "config_123",
    "retailEnabled": true,
    "pricingMarkup": 20,
    "updatedAt": "2024-01-15T17:00:00Z"
  }
}
```

#### GET /api/white-label/retail/status
Get retail configuration status for white-label.

**Query Parameters:**
- `configId` (required): White-label config ID

**Response:**
```json
{
  "success": true,
  "data": {
    "configId": "config_123",
    "retailEnabled": true,
    "pricingMarkup": 20,
    "totalSales": 15000,
    "activeLicenses": 50
  }
}
```

---

### Products

#### GET /api/products
List all products in the catalog.

**Query Parameters:**
- `page`, `limit`: Pagination
- `category`: Filter by category
- `status`: Filter by status (active, inactive)
- `search`: Search by product name or ID

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "productId": "prod_001",
        "name": "AI Agent Pro",
        "category": "agents",
        "price": 99.99,
        "currency": "USD",
        "status": "active",
        "features": ["Advanced NLP", "Custom training"],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### GET /api/products/[productId]
Get product details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "prod_001",
    "name": "AI Agent Pro",
    "description": "Professional AI agent with advanced capabilities",
    "category": "agents",
    "price": 99.99,
    "currency": "USD",
    "features": ["Advanced NLP", "Custom training", "Analytics"],
    "metadata": {},
    "status": "active"
  }
}
```

#### POST /api/products/admin/upsert
Create or update a product (Super Admin only).

**Request Body:**
```json
{
  "productId": "prod_002",
  "name": "AI Agent Enterprise",
  "description": "Enterprise-grade AI agent",
  "category": "agents",
  "price": 499.99,
  "currency": "USD",
  "features": ["Unlimited requests", "Dedicated support", "Custom SLA"],
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "prod_002",
    "name": "AI Agent Enterprise",
    "status": "active",
    "createdAt": "2024-01-15T18:00:00Z"
  }
}
```

#### DELETE /api/products/admin/[productId]
Delete a product (Super Admin only).

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Referrals
```json
{
  "success": true,
  "data": {
    "chargeId": "charge_001",
    "teamId": "team_123",
    "amount": 50,
    "currency": "USD",
    "status": "pending",
    "createdAt": "2024-01-15T14:00:00Z"
  }
}
```

---

### Invoicesdy:**
```json
{
  "teamId": "team_123",
  "planType": "pro",
  "billingCycle": "monthly",
  "amount": 99.99,
  "currency": "USD",
  "startDate": "2024-01-01T00:00:00Z"
}
```

#### GET /api/billing/contracts/[contractId]
Get contract by ID.

#### PATCH /api/billing/contracts/[contractId]
Update contract.

#### DELETE /api/billing/contracts/[contractId]
Cancel a contract.

---

### Invoices

#### GET /api/billing/invoices
List all invoices.

**Query Parameters:**
- `teamId`: Filter by team ID

#### POST /api/billing/invoices
Create a new invoice.

**Request Body:**
```json
{
  "contractId": "contract_123",
  "teamId": "team_123",
  "amount": 99.99,
  "currency": "USD",
  "dueDate": "2024-02-01T00:00:00Z"
}
```

---

### Wallets & Credits

#### GET /api/wallets
Get wallet by team ID.

**Query Parameters:**
- `teamId` (required): Team ID

#### POST /api/wallets
Create a new wallet for a team.

**Request Body:**
```json
{
  "teamId": "team_123",
  "balance": 0,
  "currency": "credits"
}
```

#### POST /api/credits/grant
Grant credits to a team (Super Admin only).

**Request Body:**
```json
{
  "teamId": "team_123",
  "amount": 1000,
  "reason": "Promotional credits"
}
```

#### GET /api/credits/transactions
Get credit transactions.

**Query Parameters:**
- `teamId`: Filter by team ID
- `walletId`: Filter by wallet ID
- `page`, `limit`: Pagination

---

### Subscriptions & Plans

#### GET /api/subscriptions
Get subscriptions with optional team filter.

**Query Parameters:**
- `teamId`: Filter by team ID

#### POST /api/subscriptions
Create a new subscription for a team.

**Request Body:**
```json
{
  "teamId": "team_123",
  "planId": "plan_pro",
  "status": "active",
  "trialEnd": "2024-02-01T00:00:00Z"
}
```

#### POST /api/subscriptions/[subscriptionId]/cancel
Cancel a subscription.

**Request Body:**
```json
{
  "cancelAtPeriodEnd": true,
  "reason": "Switching to different provider"
}
```

#### GET /api/subscriptions/plans
List all available subscription plans.

#### POST /api/subscriptions/plans
Create a new subscription plan (Super Admin only).

**Request Body:**
```json
{
  "name": "Enterprise Plan",
  "tier": "enterprise",
  "price": 499,
  "currency": "USD",
  "billingCycle": "monthly",
  "features": ["Unlimited agents", "Priority support", "Custom integrations"],
  "limits": {
    "seats": 50,
    "agents": -1,
    "requests": -1
  }
}
```

---

### Payment Methods

#### GET /api/payment-methods
Get payment methods for a team.

**Query Parameters:**
- `teamId` (required): Team ID

#### POST /api/payment-methods
Add a new payment method.

**Request Body:**
```json
{
  "teamId": "team_123",
  "type": "card",
  "last4": "4242",
  "brand": "visa",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": true
}
```

#### DELETE /api/payment-methods/[paymentMethodId]
Remove a payment method.

---

### White-Label

#### GET /api/white-label
Get white-label configurations.

**Query Parameters:**
- `teamId`: Filter by team ID

#### POST /api/white-label
Create a new white-label configuration.

**Request Body:**
```json
{
  "teamId": "team_123",
  "domain": "custom.example.com",
  "brandName": "Custom Brand",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#007bff",
  "secondaryColor": "#6c757d"
}
```

#### GET /api/white-label/[configId]
Get configuration by ID.

#### PATCH /api/white-label/[configId]
Update configuration.

#### DELETE /api/white-label/[configId]
Disable configuration.

---

### Referrals

#### GET /api/referrals
Get referrals.

**Query Parameters:**
- `referrerId`: Filter by referrer ID
- `status`: Filter by status

#### POST /api/referrals
Create a new referral.

**Request Body:**
```json
{
  "referrerId": "user_123",
  "refereeId": "user_456",
  "refereeEmail": "referee@example.com",
  "programId": "program_001"
}
```

---

### Audit Logs

#### GET /api/audit-logs
Get audit logs (Super Admin only).

**Query Parameters:**
- `page`, `limit`: Pagination
- `userId`: Filter by user ID
- `resource`: Filter by resource type
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "logId": "log_001",
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user_001",
        "userEmail": "admin@example.com",
        "action": "user_created",
        "resource": "user",
        "resourceId": "user_123",
        "details": { "email": "newuser@example.com" }
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

---

### Admin Tools

#### GET /api/admin/feature-flags
Get all feature flags (Super Admin only).

#### POST /api/admin/feature-flags
Create a new feature flag (Super Admin only).

**Request Body:**
```json
{
  "name": "New Feature",
  "key": "new_feature_enabled",
  "enabled": false,
  "description": "Enable new feature for testing",
  "rolloutPercentage": 10
}
```

#### PATCH /api/admin/feature-flags/[flagId]
Update a feature flag (Super Admin only).

**Request Body:**
```json
{
  "enabled": true,
  "rolloutPercentage": 50
}
```

#### GET /api/admin/settings
Get system settings (Super Admin only).

**Query Parameters:**
- `category`: Filter by category (feature_flags, limits, maintenance, general)

#### PUT /api/admin/settings
Update a system setting (Super Admin only).

**Request Body:**
```json
{
  "key": "maintenance_mode",
  "value": true
}
```

---

### Reports

#### GET /api/reports/usage
Get usage reports.

**Query Parameters:**
- `teamId`: Filter by team ID (optional)

#### POST /api/reports/usage
Generate a new usage report (Admin only).

**Request Body:**
```json
{
  "teamId": "team_123",
  "period": "monthly",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_001",
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "metrics": {
      "totalRequests": 50000,
      "totalAgents": 100,
      "totalTeams": 50,
      "totalUsers": 200,
      "revenueGenerated": 15000
    },
    "generatedAt": "2024-02-01T00:00:00Z"
  }
}
```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Default limits: 100 requests per minute per API key.

---

## Development Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update environment variables with your values.

3. Install dependencies:
```bash
npm install
```

4. Run development server:
```bash
npm run dev
```

5. Test API endpoints at `http://localhost:3000/api`

---

## Testing

Use the provided API key in your requests:

```bash
curl -H "x-api-key: YOUR_API_KEY" http://localhost:3000/api/overview
```

Or with Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/teams
```

---

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Configure your database connection
3. Set up proper authentication keys
4. Deploy to your hosting platform (Vercel, AWS, etc.)

---

## Database Schema

The mock database in `lib/api/database.ts` should be replaced with a real database implementation using:
- **PostgreSQL** with Prisma
- **MongoDB** with Mongoose
- **MySQL** with Drizzle ORM

Refer to `lib/types/api.ts` for all data models.
