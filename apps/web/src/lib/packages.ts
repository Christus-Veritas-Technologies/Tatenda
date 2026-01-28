/**
 * Tatenda Credit Packages
 *
 * This file defines the available credit packages users can purchase.
 */

export type Package = {
  id: "basic" | "student" | "pro";
  name: string;
  price: number;
  credits: number;
  description: string;
  popular?: boolean;
};

/**
 * Basic Package
 * - $5 for 10 credits
 */
export const BASIC_PACKAGE: Package = {
  id: "basic",
  name: "Basic",
  price: 5,
  credits: 10,
  description: "Perfect for getting started",
};

/**
 * Student Package
 * - $10 for 25 credits
 * - Most popular option
 */
export const STUDENT_PACKAGE: Package = {
  id: "student",
  name: "Student",
  price: 10,
  credits: 25,
  description: "Best value for students",
  popular: true,
};

/**
 * Pro Package
 * - $25 for 80 credits
 * - Best value per credit
 */
export const PRO_PACKAGE: Package = {
  id: "pro",
  name: "Pro",
  price: 25,
  credits: 80,
  description: "Maximum credits, best savings",
};

/**
 * All available packages
 */
export const PACKAGES: Package[] = [BASIC_PACKAGE, STUDENT_PACKAGE, PRO_PACKAGE];

/**
 * Package lookup by ID
 */
export const PACKAGES_BY_ID: Record<Package["id"], Package> = {
  basic: BASIC_PACKAGE,
  student: STUDENT_PACKAGE,
  pro: PRO_PACKAGE,
};

/**
 * Get package details by ID
 */
export function getPackageById(id: Package["id"]): Package {
  return PACKAGES_BY_ID[id] ?? BASIC_PACKAGE;
}

/**
 * Calculate price per credit for a package
 */
export function getPricePerCredit(packageId: Package["id"]): number {
  const pkg = getPackageById(packageId);
  return pkg.price / pkg.credits;
}

/**
 * Type for package IDs (for use in database and API)
 */
export type PackageId = Package["id"];
