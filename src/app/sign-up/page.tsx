"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AuthMethodSelector } from "@/components/auth/AuthMethodSelector";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { OTPInput } from "@/components/auth/OTPInput";
import { ConfirmationResult } from "firebase/auth";
import { CheckCircle2, Loader2 } from "lucide-react";

type Step = 'method' | 'details' | 'otp' | 'success';

export default function SignUp() {
  const router = useRouter();
  const { signUpWithEmail, sendPhoneOTP, verifyPhoneOTPAndCreateAccount } = useAuth();

  const [step, setStep] = useState<Step>('method');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleMethodSelect = (method: 'email' | 'phone') => {
    setAuthMethod(method);
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      if (authMethod === 'email') {
        await signUpWithEmail({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          authMethod: 'email'
        });
        toast.success("Verification email sent! Please check your inbox.");
        setStep('success');
        setTimeout(() => router.push("/account"), 2000);
      } else {
        // For phone, first send OTP to verify ownership
        const result = await sendPhoneOTP(formData.phoneNumber);
        setConfirmationResult(result);
        toast.success("OTP sent to your phone!");
        setStep('otp');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    if (!confirmationResult) return;

    setIsLoading(true);
    try {
      // Verify OTP and create account with password
      await verifyPhoneOTPAndCreateAccount(confirmationResult, otp, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        authMethod: 'phone'
      });
      toast.success("Account created successfully!");
      setStep('success');
      setTimeout(() => router.push("/account"), 2000);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (authMethod !== 'phone') return;

    setIsLoading(true);
    try {
      const result = await sendPhoneOTP(formData.phoneNumber);
      setConfirmationResult(result);
      toast.success("New OTP sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Step 1: Choose Method */}
        {step === 'method' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Create Account
              </h1>
              <p className="text-muted-foreground">
                Choose your signup method
              </p>
            </div>

            <AuthMethodSelector
              selected={authMethod}
              onSelect={handleMethodSelect}
            />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* Step 2: Enter Details */}
        {step === 'details' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Sign Up with {authMethod === 'email' ? 'Email' : 'Phone'}
              </h1>
              <p className="text-muted-foreground">
                Enter your details to continue
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              {authMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              ) : (
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  required
                />
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                  }
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full btn-premium"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {authMethod === 'email' ? 'Creating Account...' : 'Sending OTP...'}
                    </>
                  ) : (
                    authMethod === 'email' ? 'Create Account' : 'Send OTP'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('method')}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Verify OTP (Phone only) */}
        {step === 'otp' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Verify Your Phone
              </h1>
              <p className="text-muted-foreground">
                Enter the 6-digit code sent to<br />
                <span className="font-medium">{formData.phoneNumber}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                After verification, your account will be created with your password
              </p>
            </div>

            <OTPInput
              onComplete={handleOTPComplete}
              onResend={handleResendOTP}
              isLoading={isLoading}
            />

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep('details')}
              disabled={isLoading}
            >
              Change Phone Number
            </Button>
          </>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Account Created!
              </h1>
              <p className="text-muted-foreground">
                {authMethod === 'email'
                  ? 'Please check your email to verify your account.'
                  : 'Your account has been successfully created. You can now sign in with your phone and password.'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to your account...
            </p>
          </div>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </Card>
    </div>
  );
}