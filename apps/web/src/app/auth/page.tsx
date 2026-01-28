"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMail01Icon, Robot02Icon, MailCheckIcon } from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const isAnyLoading = isGoogleLoading || isMagicLinkLoading;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        newUserCallbackURL: "/onboarding"
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsMagicLinkLoading(true);
    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
        newUserCallbackURL: "/onboarding"
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send magic link");
        setIsMagicLinkLoading(false);
        return;
      }

      toast.success("Magic link sent! Check your email inbox.");
      setMagicLinkSent(true);
      setEmail("");
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-brand/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Robot02Icon}
                  size={40}
                  color="#7148FC"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to Tatenda
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to start creating your ZIMSEC projects
            </CardDescription>
          </CardHeader>

          <CardContent>
            {magicLinkSent ? (
              // Success state
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mb-6">
                  <HugeiconsIcon
                    icon={MailCheckIcon}
                    size={48}
                    color="#10b981"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center mb-2">
                  Check your email!
                </h3>
                <p className="text-center text-muted-foreground text-sm mb-6">
                  We've sent a magic link to <span className="font-medium text-foreground">{email}</span>. 
                  Click it to sign in to your account.
                </p>
                <p className="text-center text-xs text-muted-foreground mb-6">
                  The link will expire in 5 minutes. If you didn't receive it, check your spam folder.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-border hover:bg-secondary"
                  onClick={() => setMagicLinkSent(false)}
                >
                  Try another email
                </Button>
              </motion.div>
            ) : (
              // Form state
              <div className="space-y-6">
                {/* Magic Link Form */}
                <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isAnyLoading}
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isAnyLoading}
                  >
                    {isMagicLinkLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon
                          icon={AiMail01Icon}
                          size={20}
                          strokeWidth={1.5}
                          className="mr-2"
                        />
                        Send magic link
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-border hover:bg-secondary"
                  onClick={handleGoogleSignIn}
                  disabled={isAnyLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in with Google...
                    </>
                  ) : (
                    <>
                      <Image
                        src="/icons/google.png"
                        alt="Google"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      Sign in with Google
                    </>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-center text-xs text-muted-foreground">
                  By signing in, you agree to our{" "}
                  <a href="/terms" className="text-brand hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-brand hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
