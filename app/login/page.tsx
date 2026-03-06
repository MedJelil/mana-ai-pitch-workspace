"use client";

import AnimatedOTPInput from "@/components/AnimatedOtp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, Suspense, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

type Step = "email" | "otp";

type EmailFormData = {
  email: string;
};

type OTPFormData = {
  otp: string;
};

function LoginPageContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [userEmail, setUserEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const otpFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const emailSchema = yup.object({
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    const { data: responseData, error } =
      await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "sign-in",
      });
    if (error) {
      const errorMessage =
        error.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
    if (responseData?.success) {
      setUserEmail(data.email);
      setCurrentStep("otp");
      toast.success("Verification code sent to your email");
    }
  };

  const otpSchema = yup.object({
    otp: yup
      .string()
      .required("Verification code is required")
      .length(6, "Verification code must be 6 digits"),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
    setError: setOtpError,
  } = useForm<OTPFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onOtpSubmit = async (data: OTPFormData) => {
    const { data: responseData, error } = await authClient.signIn.emailOtp({
      email: userEmail,
      otp: data.otp,
    });

    if (error) {
      const errorMessage =
        error.message || "Invalid verification code. Please try again.";
      toast.error(errorMessage);
      setOtpError("otp", { message: errorMessage });
    }
    if (responseData) {
      const session = await authClient.getSession();

      if (!session.data?.user) {
        toast.error("Failed to get user session");
        return;
      }

      toast.success("Successfully signed in!");

      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm lg:max-w-md z-10 bg-white/95 dark:bg-card rounded-xl overflow-hidden shadow-lg border border-border">
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/logo.svg"
              alt="Mana AI"
              width={160}
              height={24}
              className="h-7 w-auto"
              priority
            />
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Create tailored retail pitches powered by AI
            </p>
          </div>

          {currentStep === "email" && (
            <div className="flex flex-col gap-4">
              <h1 className="text-lg font-semibold text-foreground text-center">
                Sign in to your workspace
              </h1>
              <p className="text-sm text-muted-foreground text-center -mt-2">
                Enter your email and we&apos;ll send you a verification code.
              </p>

              <form
                onSubmit={handleEmailSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      autoComplete="email webauthn"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      className={cn(
                        emailErrors.email &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      {...registerEmail("email")}
                      disabled={isEmailSubmitting}
                    />
                  </div>
                  {emailErrors.email && (
                    <p className="text-sm text-destructive">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isEmailSubmitting}
                  className="w-full font-semibold text-xl"
                >
                  {isEmailSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner />
                      <span className="text-sm">
                        Sending verification code...
                      </span>
                    </div>
                  ) : (
                    "Next"
                  )}
                </Button>
              </form>
            </div>
          )}

          {currentStep === "otp" && (
            <>
              <div className="text-center mb-1">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5 break-all">
                  {userEmail}
                </p>
              </div>

              <form
                ref={otpFormRef}
                onSubmit={handleOtpSubmit(onOtpSubmit)}
                className="space-y-6"
              >
                <AnimatedOTPInput
                  register={registerOtp("otp")}
                  error={otpErrors.otp?.message}
                  cardTitle="Enter your code"
                  disabled={isOtpSubmitting || isResending}
                  onComplete={() => {
                    if (
                      otpFormRef.current &&
                      !isOtpSubmitting &&
                      !isResending
                    ) {
                      otpFormRef.current.requestSubmit();
                    }
                  }}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep("email");
                    }}
                    className="flex-1"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isOtpSubmitting || isResending}
                    className="font-semibold flex-1"
                  >
                    {isOtpSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner />
                        Verifying...
                      </div>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!userEmail) {
                        toast.error("Enter your email to resend the code.");
                        setCurrentStep("email");
                        return;
                      }

                      setIsResending(true);
                      const { error } =
                        await authClient.emailOtp.sendVerificationOtp({
                          email: userEmail,
                          type: "sign-in",
                        });
                      setIsResending(false);

                      if (error) {
                        const errorMessage =
                          error.message ||
                          "Failed to resend code. Please try again.";
                        toast.error(errorMessage);
                      } else {
                        toast.success("Verification code resent");
                        setResendCooldown(60);
                      }
                    }}
                    disabled={isResending || resendCooldown > 0}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>Resend in {resendCooldown}s</>
                    ) : (
                      "Resend Code"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
          <p className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="bg-card border border-border rounded-xl shadow-lg p-8">
              <div className="flex flex-col items-center mb-8">
                <Image
                  src="/logo.svg"
                  alt="Mana AI"
                  width={160}
                  height={24}
                  className="h-7 w-auto"
                  priority
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Create tailored retail pitches powered by AI
                </p>
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
