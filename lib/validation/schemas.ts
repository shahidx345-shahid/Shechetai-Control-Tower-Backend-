/**
 * Zod Validation Schemas
 * Centralized validation for all forms and API inputs
 */

import { z } from "zod"

// User schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  role: z.enum(["super_admin", "admin", "user"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
  status: z.enum(["active", "suspended", "inactive"]).optional(),
})

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["super_admin", "admin", "user"]).optional(),
  status: z.enum(["active", "suspended", "inactive"]).optional(),
})

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100),
  description: z.string().max(500, "Description too long").optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const updateTeamSchema = createTeamSchema.partial()

// Agent schemas
export const createAgentSchema = z.object({
  name: z.string().min(2, "Agent name must be at least 2 characters").max(100),
  teamId: z.string().min(1, "Team ID is required"),
  description: z.string().max(500).optional(),
  configuration: z.record(z.any()).optional(),
})

export const updateAgentSchema = createAgentSchema.partial().omit({ teamId: true })

// Subscription schemas
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2, "Plan name required").max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.string().length(3, "Currency must be 3 letters (e.g., USD)").default("USD"),
  interval: z.enum(["monthly", "yearly", "lifetime"]),
  features: z.array(z.string()).min(1, "At least one feature required"),
  isActive: z.boolean().default(true),
})

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial()

// Payment method schemas
export const createPaymentMethodSchema = z.object({
  type: z.enum(["credit_card", "debit_card", "bank_account"]),
  cardNumber: z.string()
    .min(13, "Card number too short")
    .max(19, "Card number too long")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardholderName: z.string().min(2, "Cardholder name required").max(100),
  expiryMonth: z.string()
    .length(2, "Month must be 2 digits")
    .regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string()
    .length(2, "Year must be 2 digits")
    .regex(/^\d{2}$/, "Invalid year"),
  cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "CVV must be numeric"),
  billingZip: z.string().min(3, "ZIP code required").max(10),
})

// Contract schemas
export const createContractSchema = z.object({
  teamId: z.string().min(1, "Team ID required"),
  name: z.string().min(2, "Contract name required").max(100),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  value: z.number().min(0, "Contract value cannot be negative"),
  terms: z.string().max(5000, "Terms too long").optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]).default("draft"),
})

export const updateContractSchema = createContractSchema.partial()

// Credits schemas
export const grantCreditsSchema = z.object({
  teamId: z.string().min(1, "Team ID required"),
  amount: z.number().int("Amount must be integer").min(1, "Amount must be positive").max(1000000),
  reason: z.string().min(5, "Reason required").max(500),
})

// Invite schemas
export const createInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
  teamId: z.string().min(1, "Team ID required"),
})

// Admin settings schemas
export const updateSettingSchema = z.object({
  key: z.string().min(1, "Setting key required"),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

// Feature flag schemas
export const createFeatureFlagSchema = z.object({
  key: z.string().min(2, "Flag key required").max(50).regex(/^[a-z0-9_]+$/, "Use lowercase, numbers, and underscores only"),
  name: z.string().min(2, "Flag name required").max(100),
  description: z.string().max(500).optional(),
  enabled: z.boolean().default(false),
})

export const updateFeatureFlagSchema = createFeatureFlagSchema.partial().omit({ key: true })

// White label schemas
export const createWhiteLabelSchema = z.object({
  teamId: z.string().min(1, "Team ID required"),
  companyName: z.string().min(2, "Company name required").max(100),
  domain: z.string().min(3, "Domain required").regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid domain format"),
  logo: z.string().url("Invalid logo URL").optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
})

export const updateWhiteLabelSchema = createWhiteLabelSchema.partial()

// Referral schemas
export const createReferralSchema = z.object({
  referrerId: z.string().min(1, "Referrer ID required"),
  referredEmail: z.string().email("Invalid email address"),
  rewardType: z.enum(["credits", "discount", "bonus"]).default("credits"),
  rewardAmount: z.number().min(0),
})

// Search/Filter schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>
export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>
export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>
export type GrantCreditsInput = z.infer<typeof grantCreditsSchema>
export type CreateInviteInput = z.infer<typeof createInviteSchema>
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>
export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>
export type CreateWhiteLabelInput = z.infer<typeof createWhiteLabelSchema>
export type UpdateWhiteLabelInput = z.infer<typeof updateWhiteLabelSchema>
export type CreateReferralInput = z.infer<typeof createReferralSchema>
