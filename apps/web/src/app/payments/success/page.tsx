"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  CheckmarkCircle02Icon, 
  AlertCircleIcon,
  Add01Icon,
  CustomerSupportIcon 
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import Link from "next/link";

type PaymentStatus = "loading" | "success" | "already_completed" | "error";

interface PaymentResult {
  status: PaymentStatus;
  credits?: number;
  creditsAdded?: number;
  message?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const intermittentPaymentId = searchParams.get("intermittentPaymentId");
  const [result, setResult] = useState<PaymentResult>({ status: "loading" });

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tatenda.ai";

  useEffect(() => {
    if (!intermittentPaymentId) {
      setResult({
        status: "error",
        message: "No payment reference found",
      });
      return;
    }

    processPayment();
  }, [intermittentPaymentId]);

  const processPayment = async () => {
    try {
      const response = await fetch("/api/payments/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intermittentPaymentId }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          status: "success",
          credits: data.credits,
          creditsAdded: data.creditsAdded,
        });
      } else if (data.error === "ALREADY_COMPLETED") {
        setResult({
          status: "already_completed",
          credits: data.credits,
          message: data.message,
        });
      } else {
        setResult({
          status: "error",
          message: data.message || "Failed to process payment",
        });
      }
    } catch (error) {
      setResult({
        status: "error",
        message: "An error occurred while processing your payment",
      });
    }
  };

  if (result.status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-12 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand/10 flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Processing Payment
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (result.status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-12 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={48}
                className="text-green-600"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Payment Successful!
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p className="text-muted-foreground mb-2">
              You've successfully added {result.creditsAdded} credits to your account.
            </p>
            <p className="text-lg font-semibold text-brand mb-8">
              You now have {result.credits} credits in your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="space-y-3"
          >
            <Link href={"/talk?action=new-project" as any} className="block">
              <Button className="w-full bg-brand hover:bg-brand/90 text-white gap-2" size="lg">
                <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={1.5} />
                Create a New Project
              </Button>
            </Link>
            <Link href={"/dashboard" as any} className="block">
              <Button variant="outline" className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        </Card>
      </div>
    );
  }

  if (result.status === "already_completed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-12 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={48}
                className="text-blue-600"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Credits Already Received
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p className="text-muted-foreground mb-2">
              This payment has already been processed.
            </p>
            <p className="text-lg font-semibold text-brand mb-8">
              You currently have {result.credits} credits in your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="space-y-3"
          >
            <Link href={"/talk?action=new-project" as any} className="block">
              <Button className="w-full bg-brand hover:bg-brand/90 text-white gap-2" size="lg">
                <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={1.5} />
                Create a New Project
              </Button>
            </Link>
            <a href={`mailto:${supportEmail}`} className="block">
              <Button variant="outline" className="w-full gap-2" size="lg">
                <HugeiconsIcon icon={CustomerSupportIcon} size={20} strokeWidth={1.5} />
                Contact Support
              </Button>
            </a>
          </motion.div>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="p-12 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={48}
              className="text-red-600"
              strokeWidth={1.5}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Something Went Wrong
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-8">
            {result.message || "We couldn't process your payment. Please try again or contact support."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="space-y-3"
        >
          <Link href={"/packages" as any} className="block">
            <Button className="w-full bg-brand hover:bg-brand/90 text-white" size="lg">
              Try Again
            </Button>
          </Link>
          <a href={`mailto:${supportEmail}`} className="block">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <HugeiconsIcon icon={CustomerSupportIcon} size={20} strokeWidth={1.5} />
              Contact Support
            </Button>
          </a>
        </motion.div>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
