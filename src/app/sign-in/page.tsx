"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Mail, Phone } from "lucide-react";
import { PhoneInput } from "@/components/auth/PhoneInput";

type LoginMethod = 'email' | 'phone';
type Step = 'method' | 'credentials';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const { signInWithEmail, signInWithPhone, isAuthenticated, isLoading: authLoading } = useAuth();

  // All hooks must be declared before any conditional returns
  const [step, setStep] = useState<Step>('method');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, authLoading, router, redirectUrl]);

  // Show loading state while checking authentication
  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleMethodSelect = (method: LoginMethod) => {
    setLoginMethod(method);
    setStep('credentials');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === 'email') {
        await signInWithEmail(formData.email, formData.password);
      } else {
        await signInWithPhone(formData.phoneNumber, formData.password);
      }

      toast.success("Signed in successfully!");
      router.push(redirectUrl);
    } catch (error: any) {
      toast.error(error?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Step 1: Choose Login Method */}
        {step === 'method' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Sign In
              </h1>
              <p className="text-muted-foreground">
                Choose how you want to sign in
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${loginMethod === 'email'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => handleMethodSelect('email')}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="p-3 rounded-full bg-primary text-primary-foreground">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign in with password
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${loginMethod === 'phone'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => handleMethodSelect('phone')}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="p-3 rounded-full bg-primary text-primary-foreground">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign in with password
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </>
        )}

        {/* Step 2: Enter Credentials - Email */}
        {step === 'credentials' && loginMethod === 'email' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Sign In with Email
              </h1>
              <p className="text-muted-foreground">
                Enter your email and password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                />
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
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
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

        {/* Step 2: Enter Credentials - Phone */}
        {step === 'credentials' && loginMethod === 'phone' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Sign In with Phone
              </h1>
              <p className="text-muted-foreground">
                Enter your phone number and password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PhoneInput
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                required
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone-password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="phone-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                />
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
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
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
      </Card>
    </div>
  );
}