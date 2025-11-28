# 🎯 Shechetai Control Tower - Project Overview

## What Is This Project?

This is an **Admin Control Panel** (like a dashboard) for managing an AI agent platform called Shechetai. Think of it as the "command center" where administrators can see everything happening in the system and manage all the parts.

---

## 🤔 What Does It Do?

Imagine you run a business that provides AI chatbots (agents) to different companies. This control tower helps you:

1. **See everything at a glance** - Who's using your service, how many AI agents are running, etc.
2. **Manage customers (teams)** - Add new companies, see their subscription plans
3. **Control AI agents** - Create, edit, or delete AI assistants
4. **Handle billing** - Track payments, invoices, and credits
5. **Monitor users** - See who has access, what role they have
6. **Check system health** - Make sure everything is working properly

---

## 🏗️ What's Inside This Project?

### 1. **Frontend (The Visual Part)**
- **Dashboard Pages**: Beautiful screens you can click through
  - Overview page - Shows statistics
  - Users page - Lists all users
  - Agents & Teams page - Manages AI agents and customer companies
  - Billing pages - Handles payments and subscriptions
  - Credits & Wallets - Tracks how much credit each team has
  - And more...

- **Built with**: Next.js (a modern website framework), React (for interactive UI), Tailwind CSS (for styling)

### 2. **Backend (The Brain)**
- **60+ API Endpoints**: These are like "service windows" that handle requests
  - Create a new user → POST /api/users
  - Get all teams → GET /api/teams
  - Purchase credits → POST /api/credits/purchase-pack
  - And many more...

- **Built with**: Next.js API routes, Firebase (for database), TypeScript (for better code)

### 3. **Database**
- **Firebase Firestore**: Stores all the data
  - Users collection - Everyone who uses the platform
  - Teams collection - Customer companies
  - Agents collection - AI chatbots
  - Wallets collection - Credit balances
  - Transactions, invoices, audit logs, etc.

---

## 💡 How Does It Work? (Simple Example)

**Scenario**: A company wants to use your AI agents

1. **Company signs up** → Creates a team account
2. **They create an AI agent** → Names it "Customer Support Bot"
3. **They choose a billing plan**:
   - Option A: Monthly subscription ($99/month)
   - Option B: Pay-per-use (1 credit per AI conversation)
4. **If pay-per-use**: They buy a credit pack (500 credits for $50)
5. **Agent runs** → Each time their AI answers a question, credits are deducted
6. **Auto-refill**: If credits run low (below 100), automatically buy 500 more
7. **You track everything** → See invoices, usage stats, all from your control tower

---

## 🎨 Key Features You Built

### ✅ **User Management**
- View all users in a table
- See their role (admin, member, owner)
- Check their status (active, inactive, suspended)
- Filter and search users

### ✅ **Credit Wallet System** (Your Latest Work)
This is special! Here's how it works:

**The Problem**: Some customers want to pay-per-use instead of monthly subscriptions.

**Your Solution**:
- Each team has a **wallet** (like a piggy bank for credits)
- Team owner buys credits: $50 → 500 credits
- Each time their AI agent runs: -5 credits
- When credits drop below 100: Auto-buy 500 more
- Everything is tracked in transactions

**Document structure**: `wallets/{teamId}`
- `teamId` is the document ID (makes it fast to find)
- Stores: balance, currency, auto-refill settings

**Three main endpoints you created**:
1. `POST /api/credits/purchase-pack` - Buy credits
2. `POST /api/credits/configure-auto-refill` - Set up automatic top-ups
3. `POST /api/credits/report-run` - Deduct credits when agent runs (internal only)

### ✅ **Consistent Design**
- All pages look the same (same layout, spacing, colors)
- Responsive (works on phones, tablets, computers)
- Smooth animations when pages load
- Clean, professional UI

### ✅ **API Documentation**
- Complete guide for testing 60+ endpoints
- Postman collection ready to import
- cURL examples for every request
- Error handling and troubleshooting guide

---

## 📁 Project Structure (Simplified)

```
Shechetai Control Tower/
│
├── app/                          # Website pages
│   ├── dashboard/               # Admin dashboard
│   │   ├── users/              # Users management page (your latest fix)
│   │   ├── agents-teams/       # Agents & teams page
│   │   ├── overview/           # Statistics page
│   │   └── ...
│   │
│   └── api/                     # Backend endpoints
│       ├── users/              # User CRUD operations
│       ├── agents/             # Agent management
│       ├── teams/              # Team management
│       ├── credits/            # Credit system (your latest work)
│       │   ├── purchase-pack/  # Buy credits
│       │   ├── configure-auto-refill/  # Set auto-refill
│       │   └── report-run/     # Deduct credits
│       └── wallets/            # Wallet operations
│
├── components/                  # Reusable UI pieces
│   ├── pages/                  # Page components
│   ├── layout/                 # Sidebar, top bar
│   └── ui/                     # Buttons, cards, etc.
│
├── lib/                         # Utility code
│   ├── api/                    # API helpers
│   │   └── firestore.ts       # Database operations (you updated this)
│   ├── firebase/               # Firebase setup
│   └── types/                  # TypeScript definitions
│
├── scripts/                     # Helper scripts
│   └── generate-test-data.mjs  # Creates fake data for testing
│
├── .env.local                   # Secret keys (Firebase, API keys)
├── package.json                 # Project dependencies
└── README.md                    # Basic project info
```

---

## 🛠️ Technologies Used

| Technology | What It Does |
|------------|--------------|
| **Next.js 16** | Framework for building the website |
| **React** | Makes the UI interactive |
| **TypeScript** | Adds type safety to JavaScript |
| **Tailwind CSS** | Styles everything beautifully |
| **Firebase** | Cloud database & authentication |
| **Firestore** | NoSQL database for storing data |
| **Shadcn/UI** | Pre-built beautiful components |

---

## 🎯 Your Recent Accomplishments

### 1. **Fixed Users Page Layout** ✅
- Made it consistent with other pages
- Proper spacing and responsive design
- Added smooth animations

### 2. **Built Complete Wallet System** ✅
- Per-run billing for agents
- Credit purchase packs
- Auto-refill functionality
- Transaction tracking
- Used `wallets/{teamId}` structure for fast lookups

### 3. **Updated Database Layer** ✅
- Modified `WalletDatabase` class
- Added methods: `getByTeamId()`, `updateBalance()`
- Used teamId as document ID

### 4. **Created API Endpoints** ✅
- Purchase pack endpoint
- Configure auto-refill endpoint
- Report run endpoint (for deducting credits)

### 5. **Documented Everything** ✅
- Updated API documentation
- Added wallet system explanation
- Included request/response examples

---

## 🚀 How to Use This Project

### **Start the Server**
```bash
pnpm dev
```
Opens at: `http://localhost:3000`

### **Test with Postman**
1. Import `postman-collection-complete.json`
2. Set API key: `shechetai_super_secret_key_2025`
3. Test any endpoint!

### **View the Dashboard**
Go to: `http://localhost:3000/dashboard/overview`

---

## 📊 What Data Do You Have?

After running the test data generator:
- **5 teams** (like 5 different companies using your service)
- **7 users** (admins, members, owners)
- **25 AI agents** (chatbots doing work)
- **4 subscriptions** (monthly payment plans)
- **30 invoices** (billing records)
- **3 wallets** (credit balances)
- **60 credit transactions** (purchase and usage history)
- **3 invites** (pending team member invitations)
- **100 audit logs** (tracking who did what)

---

## 🎓 What You're Learning

Through this project, you're working with:

1. **Full-Stack Development**: Building both frontend (what users see) and backend (how it works)
2. **Database Design**: Structuring data efficiently in Firestore
3. **API Development**: Creating endpoints that other services can use
4. **Payment Systems**: Handling credits, wallets, and transactions
5. **User Management**: Authentication, roles, permissions
6. **Modern Web Tech**: Next.js, React, TypeScript, Tailwind
7. **Cloud Services**: Firebase for database and auth
8. **Documentation**: Writing clear guides for APIs

---

## 💰 Real-World Application

This type of project is used by companies like:
- **OpenAI** (ChatGPT dashboard)
- **Stripe** (Payment dashboard)
- **AWS** (Cloud console)
- **Twilio** (Communication dashboard)

You're building professional-level software! 🎉

---

## 🎯 Summary in 3 Sentences

1. **You built an admin control panel** for managing an AI agent platform
2. **It handles everything**: users, teams, agents, billing, credits, and monitoring
3. **Your latest work**: Created a credit wallet system where teams can buy credits and AI agents automatically deduct them when they run

---

## 📞 Need Help?

- Check `API_TESTING_COMPLETE.md` for testing all endpoints
- Check `API_DOCUMENTATION.md` for detailed API reference
- Check `PAYMENT_EMAIL_UPLOAD_SETUP.md` for integration setup

---

**Built with ❤️ using modern web technologies**

*Last Updated: November 28, 2025*
