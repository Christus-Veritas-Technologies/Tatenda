"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import {
  UserIcon,
  SchoolIcon,
  InformationCircleIcon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type OnboardingStep = 1 | 2 | 3;

interface OnboardingData {
  fullName: string;
  age: string;
  schoolLevel: "primary" | "secondary";
  grade: string;
  school: string;
  city: string;
  referralSources: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    age: "",
    schoolLevel: "secondary",
    grade: "",
    school: "",
    city: "",
    referralSources: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save onboarding data");
      }

      toast.success("Onboarding completed successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to complete onboarding"
      );
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const canProceedStep1 = data.fullName.trim().length > 0 && data.grade.trim().length > 0;
  const canProceedStep2 = data.school.trim().length > 0 && data.city.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 3 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= currentStep
                      ? "bg-brand text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                      step < currentStep ? "bg-brand" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep} of 3
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={24}
                      color="#7148FC"
                      strokeWidth={1.5}
                    />
                  </div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Tell us a bit about yourself to personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={data.fullName}
                      onChange={(e) =>
                        setData({ ...data, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="16"
                      value={data.age}
                      onChange={(e) => setData({ ...data, age: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      School Level <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={data.schoolLevel === "primary" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() =>
                          setData({ ...data, schoolLevel: "primary" })
                        }
                      >
                        Primary
                      </Button>
                      <Button
                        type="button"
                        variant={data.schoolLevel === "secondary" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() =>
                          setData({ ...data, schoolLevel: "secondary" })
                        }
                      >
                        Secondary
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">
                      {data.schoolLevel === "primary" ? "Grade" : "Form"}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grade"
                      type="text"
                      placeholder={
                        data.schoolLevel === "primary" ? "Grade 7" : "Form 4"
                      }
                      value={data.grade}
                      onChange={(e) =>
                        setData({ ...data, grade: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleNext}
                    disabled={!canProceedStep1}
                  >
                    Next
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: School Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                    <HugeiconsIcon
                      icon={SchoolIcon}
                      size={24}
                      color="#7148FC"
                      strokeWidth={1.5}
                    />
                  </div>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>
                    Where do you attend school?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">
                      School Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="school"
                      type="text"
                      placeholder="Churchill Boys High"
                      value={data.school}
                      onChange={(e) =>
                        setData({ ...data, school: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Harare"
                      value={data.city}
                      onChange={(e) => setData({ ...data, city: e.target.value })}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleNext}
                    disabled={!canProceedStep2}
                  >
                    Next
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Referral Source */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={24}
                      color="#7148FC"
                      strokeWidth={1.5}
                    />
                  </div>
                  <CardTitle>How did you hear about us?</CardTitle>
                  <CardDescription>
                    This helps us understand how students find Tatenda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {["Google", "Friend", "WhatsApp", "AI Chatbot"].map(
                      (source) => (
                        <Button
                          key={source}
                          type="button"
                          variant="outline"
                          className={
                            data.referralSources.includes(source)
                              ? "border-purple-500 text-purple-500"
                              : ""
                          }
                          onClick={() => {
                            setData((prev) => {
                              const isSelected = prev.referralSources.includes(source);
                              return {
                                ...prev,
                                referralSources: isSelected
                                  ? prev.referralSources.filter((s) => s !== source)
                                  : [...prev.referralSources, source],
                              };
                            });
                          }}
                        >
                          {source}
                        </Button>
                      )
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSkip}
                      disabled={isSaving}
                    >
                      Skip
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleFinish}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Finish"}
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
