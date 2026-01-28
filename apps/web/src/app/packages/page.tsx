"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PACKAGES, type PackageId } from "@/lib/packages";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function PackagesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<PackageId | null>(null);

  const handlePurchase = async (packageId: PackageId) => {
    setIsLoading(packageId);
    try {
      const response = await fetch("/api/purchase/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to Paynow payment page
        window.location.href = data.redirectUrl;
      } else {
        console.error("Payment failed:", data.message);
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Credit Packages
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Purchase more credits to get the most out of Tatenda.
            Each credit allows you to generate one complete ZIMSEC project.
          </p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.5} />
            Back
          </Button>
        </motion.div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PACKAGES.map((pkg, index) => {
            const isPopular = pkg.popular;
            const pricePerCredit = (pkg.price / pkg.credits).toFixed(2);

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.4,
                  ease: "easeOut"
                }}
              >
                <Card
                  className={cn(
                    "relative p-8 flex flex-col h-full",
                    isPopular && "border-brand border-2 bg-brand text-white shadow-xl scale-105"
                  )}
                >
                  {/* Best Value Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-white text-brand px-4 py-1 rounded-full text-sm font-semibold">
                        Best Value
                      </div>
                    </div>
                  )}

                  {/* Package Header */}
                  <div className="mb-6">
                    <h3 className={cn(
                      "text-2xl font-bold mb-2",
                      isPopular ? "text-white" : "text-foreground"
                    )}>
                      {pkg.name}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isPopular ? "text-white/90" : "text-muted-foreground"
                    )}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-4xl font-bold",
                        isPopular ? "text-white" : "text-foreground"
                      )}>
                        ${pkg.price}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm mt-1",
                      isPopular ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {pkg.credits} credits • ${pricePerCredit} per credit
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-1 space-y-3">
                    <div className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={20}
                        className={isPopular ? "text-white" : "text-brand"}
                        strokeWidth={1.5}
                      />
                      <span className={cn(
                        "text-sm",
                        isPopular ? "text-white" : "text-foreground"
                      )}>
                        Generate {pkg.credits} complete ZIMSEC projects
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={20}
                        className={isPopular ? "text-white" : "text-brand"}
                        strokeWidth={1.5}
                      />
                      <span className={cn(
                        "text-sm",
                        isPopular ? "text-white" : "text-foreground"
                      )}>
                        AI-powered project assistance
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={20}
                        className={isPopular ? "text-white" : "text-brand"}
                        strokeWidth={1.5}
                      />
                      <span className={cn(
                        "text-sm",
                        isPopular ? "text-white" : "text-foreground"
                      )}>
                        Credits never expire
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={20}
                        className={isPopular ? "text-white" : "text-brand"}
                        strokeWidth={1.5}
                      />
                      <span className={cn(
                        "text-sm",
                        isPopular ? "text-white" : "text-foreground"
                      )}>
                        Priority support
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isLoading !== null}
                    className={cn(
                      "w-full",
                      isPopular
                        ? "bg-white text-brand hover:bg-white/90"
                        : "bg-brand text-white hover:bg-brand/90"
                    )}
                    size="lg"
                  >
                    {isLoading === pkg.id ? "Processing..." : "Purchase Credits"}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2, ease: "easeOut" }}
        >
          <p className="text-sm text-muted-foreground">
            All payments are secure and processed through Paynow.
            Need help? <a href="/dashboard/account" className="text-brand hover:underline">Contact support</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
