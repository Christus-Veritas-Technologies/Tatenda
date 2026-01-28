"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PACKAGES } from "@/lib/packages";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export default function PackagesPage() {
  const handlePurchase = (packageId: string) => {
    // TODO: Implement payment flow
    console.log("Purchase package:", packageId);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Credit Packages
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Purchase more credits to get the most out of Tatenda.
            Each credit allows you to generate one complete ZIMSEC project.
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PACKAGES.map((pkg) => {
            const isPopular = pkg.popular;
            const pricePerCredit = (pkg.price / pkg.credits).toFixed(2);

            return (
              <Card
                key={pkg.id}
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
                  className={cn(
                    "w-full",
                    isPopular
                      ? "bg-white text-brand hover:bg-white/90"
                      : "bg-brand text-white hover:bg-brand/90"
                  )}
                  size="lg"
                >
                  Purchase Credits
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All payments are secure and processed through Stripe.
            Need help? <a href="/dashboard/account" className="text-brand hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
