/**
 * Tatenda Subscription Plans
 *
 * This file defines the pricing and limits for each subscription tier.
 */

export type Plan = {
  id: "free" | "student" | "pro";
  name: string;
  price: number;
  perProjectAmount: number;
  projects: number;
  description: string;
  features: string[];
};

/**
 * Free Plan
 * - 5 projects included
 * - Basic AI model (gpt-5-mini)
 * - No cost
 */
export const FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  price: 0,
  perProjectAmount: 0,
  projects: 5,
  description: "Get started with Tatenda for free",
  features: [
    "5 ZIMSEC projects",
    "Basic AI assistance (gpt-5-mini)",
    "Text-based project help",
    "Standard response times",
  ],
};

/**
 * Student Plan
 * - 10 projects included for $5
 * - $0.50 per additional project
 * - Pro AI model (gpt-5.2)
 */
export const STUDENT_PLAN: Plan = {
  id: "student",
  name: "Student",
  price: 5,
  perProjectAmount: 0.5,
  projects: 10,
  description: "Perfect for dedicated students",
  features: [
    "10 ZIMSEC projects",
    "Advanced AI assistance (gpt-5.2)",
    "Voice conversations",
    "Image generation for diagrams",
    "$0.50 per additional project",
    "Priority support",
  ],
};

/**
 * Pro Plan
 * - 50 projects included for $10
 * - $0.25 per additional project
 * - Pro AI model (gpt-5.2)
 * - All features unlocked
 */
export const PRO_PLAN: Plan = {
  id: "pro",
  name: "Pro",
  price: 10,
  perProjectAmount: 0.25,
  projects: 50,
  description: "Best value for serious students",
  features: [
    "50 ZIMSEC projects",
    "Advanced AI assistance (gpt-5.2)",
    "Unlimited voice conversations",
    "High-quality image generation",
    "$0.25 per additional project",
    "Priority support",
    "Early access to new features",
  ],
};

/**
 * All available plans
 */
export const PLANS: Plan[] = [FREE_PLAN, STUDENT_PLAN, PRO_PLAN];

/**
 * Plan lookup by ID
 */
export const PLANS_BY_ID: Record<Plan["id"], Plan> = {
  free: FREE_PLAN,
  student: STUDENT_PLAN,
  pro: PRO_PLAN,
};

/**
 * Get plan details by ID
 */
export function getPlanById(id: Plan["id"]): Plan {
  return PLANS_BY_ID[id] ?? FREE_PLAN;
}

/**
 * Check if a plan has access to pro features (Student and Pro plans)
 */
export function hasProAccess(planId: Plan["id"]): boolean {
  return planId === "student" || planId === "pro";
}

/**
 * Calculate the cost for additional projects beyond the plan limit
 */
export function calculateExtraProjectsCost(
  planId: Plan["id"],
  totalProjects: number
): number {
  const plan = getPlanById(planId);
  const extraProjects = Math.max(0, totalProjects - plan.projects);
  return extraProjects * plan.perProjectAmount;
}

/**
 * Get the number of remaining free projects for a user
 */
export function getRemainingProjects(
  planId: Plan["id"],
  usedProjects: number
): number {
  const plan = getPlanById(planId);
  return Math.max(0, plan.projects - usedProjects);
}

/**
 * Type for plan IDs (for use in database and API)
 */
export type PlanId = Plan["id"];
