"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { sendPasswordResetEmail, getAuth, ConfirmationResult, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseClientApp } from "@/lib/firebase/client";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { OTPInput } from "@/components/auth/OTPInput";
import { authService, phoneToEmail } from "@/services/auth.service";
import { userService } from "@/services/user.service";

type Step = 'method' | 'email' | 'phone' | 'otp' | 'success';
type ResetMethod = 'email' | 'phone';

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('method');
    const [resetMethod, setResetMethod] = useState<ResetMethod>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSelectMethod = (method: ResetMethod) => {
        setResetMethod(method);
        if (method === 'email') {
            setStep('email');
        } else {
            setStep('phone');
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const auth = getAuth(getFirebaseClientApp());
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent!");
            setStep('success');
        } catch (error: any) {
            console.error('Password reset error:', error);

            if (error.code === 'auth/user-not-found') {
                toast.error("No account found with this email");
            } else if (error.code === 'auth/invalid-email') {
                toast.error("Invalid email address");
            } else if (error.code === 'auth/too-many-requests') {
                toast.error("Too many requests. Please try again later");
            } else {
                toast.error(error.message || "Failed to send reset email");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setIsLoading(true);

        try {
            const recaptcha = authService.setupRecaptcha('recaptcha-container');
            const result = await authService.sendPhoneOTP(phoneNumber, recaptcha);
            setConfirmationResult(result);
            toast.success("OTP sent to your phone!");
            setStep('otp');
        } catch (error: any) {
            console.error('Phone OTP error:', error);

            if (error.code === 'auth/invalid-phone-number') {
                toast.error("Invalid phone number format");
            } else if (error.code === 'auth/too-many-requests') {
                toast.error("Too many requests. Please try again later");
            } else {
                toast.error(error.message || "Failed to send OTP");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPComplete = async (otp: string) => {
        if (!confirmationResult) {
            toast.error("Something went wrong. Please try again.");
            setStep('phone');
            return;
        }

        setIsLoading(true);

        try {
            // Verify OTP to confirm phone ownership
            const phoneCredential = await authService.verifyPhoneOTP(confirmationResult, otp);
            const phoneUser = phoneCredential.user;

            // Get and save user profile data if exists
            let existingProfile = null;
            try {
                existingProfile = await userService.getUserProfile(phoneUser.uid);
            } catch {
                // No existing profile, that's ok
            }

            // Sign out from phone auth
            await authService.signOut();

            // Create pseudo-email for this phone number
            const pseudoEmail = phoneToEmail(phoneNumber);
            const auth = getAuth(getFirebaseClientApp());

            try {
                // Try to create new account with pseudo email + password
                const newCredential = await createUserWithEmailAndPassword(auth, pseudoEmail, newPassword);

                // Create/update user profile
                await userService.createUserProfile(newCredential.user.uid, {
                    firstName: existingProfile?.firstName || 'User',
                    lastName: existingProfile?.lastName || '',
                    phoneNumber: phoneNumber,
                    email: pseudoEmail,
                    displayName: existingProfile?.displayName || 'User',
                    authMethod: 'phone',
                    emailVerified: false,
                    phoneVerified: true,
                    photoURL: existingProfile?.photoURL || null,
                    uid: newCredential.user.uid,
                    lastLoginAt: new Date(),
                    createdAt: existingProfile?.createdAt || new Date(),
                    updatedAt: new Date(),
                    isActive: true
                });

                toast.success("Password set successfully! You can now sign in with your phone and password.");
                setStep('success');
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    // Account already exists with password - user should use sign-in
                    toast.error("Account already has a password. Please use Sign In or contact support to reset.");
                    setStep('phone');
                } else {
                    throw error;
                }
            }
        } catch (error: any) {
            console.error('Password setup error:', error);

            if (error.code === 'auth/invalid-verification-code') {
                toast.error("Invalid OTP. Please try again.");
            } else {
                toast.error(error.message || "Failed to set password");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setStep('phone');
        setConfirmationResult(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4 py-12">
            <Card className="w-full max-w-md p-8 space-y-6">
                {/* reCAPTCHA container for phone auth */}
                <div id="recaptcha-container"></div>

                {/* Step 1: Choose Method */}
                {step === 'method' && (
                    <>
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-serif font-bold text-foreground">
                                Reset Password
                            </h1>
                            <p className="text-muted-foreground">
                                How did you register your account?
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card
                                className="p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-border"
                                onClick={() => handleSelectMethod('email')}
                            >
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="p-3 rounded-full bg-secondary">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Email</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Reset via email link
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card
                                className="p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-border"
                                onClick={() => handleSelectMethod('phone')}
                            >
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="p-3 rounded-full bg-secondary">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Phone</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Set password via OTP
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/sign-in"
                                className="inline-flex items-center text-sm text-primary hover:underline"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </>
                )}

                {/* Step 2a: Email Reset */}
                {step === 'email' && (
                    <>
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Mail className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-foreground">
                                Reset Password
                            </h1>
                            <p className="text-muted-foreground">
                                Enter your email and we'll send you reset instructions.
                            </p>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your.email@example.com"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll send a password reset link to this email
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-premium"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => setStep('method')}
                                className="inline-flex items-center text-sm text-primary hover:underline"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Choose different method
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2b: Phone Number + New Password Input (Combined) */}
                {step === 'phone' && (
                    <>
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Phone className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-foreground">
                                Set Password
                            </h1>
                            <p className="text-muted-foreground">
                                Verify your phone and set a password for easy login
                            </p>
                        </div>

                        <form onSubmit={handlePhoneSubmit} className="space-y-4">
                            <PhoneInput
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                required
                            />

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Enter new password"
                                        disabled={isLoading}
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Minimum 8 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    disabled={isLoading}
                                    minLength={8}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-premium"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send OTP'
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => setStep('method')}
                                className="inline-flex items-center text-sm text-primary hover:underline"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Choose different method
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: OTP Verification */}
                {step === 'otp' && (
                    <>
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-foreground">
                                Verify OTP
                            </h1>
                            <p className="text-muted-foreground">
                                Enter the 6-digit code sent to {phoneNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Your password will be set after verification
                            </p>
                        </div>

                        <OTPInput
                            onComplete={handleOTPComplete}
                            onResend={handleResendOTP}
                            isLoading={isLoading}
                        />

                        <div className="text-center">
                            <button
                                onClick={() => setStep('phone')}
                                className="inline-flex items-center text-sm text-primary hover:underline"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Change phone number
                            </button>
                        </div>
                    </>
                )}

                {/* Success State */}
                {step === 'success' && (
                    <div className="text-center space-y-6 py-8">
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-20 h-20 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-serif font-bold text-foreground">
                                {resetMethod === 'email' ? 'Check Your Email' : 'Password Set!'}
                            </h1>
                            {resetMethod === 'email' ? (
                                <>
                                    <p className="text-muted-foreground">
                                        We've sent a password reset link to:
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {email}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    You can now sign in with your phone number and password.
                                </p>
                            )}
                        </div>

                        {resetMethod === 'email' && (
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    Click the link in the email to reset your password.
                                </p>
                                <p>
                                    Didn't receive the email? Check your spam folder or{" "}
                                    <button
                                        onClick={() => setStep('email')}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={() => router.push('/sign-in')}
                            className={resetMethod === 'phone' ? "w-full btn-premium" : "w-full"}
                            variant={resetMethod === 'email' ? "outline" : "default"}
                            size="lg"
                        >
                            {resetMethod === 'phone' ? 'Sign In Now' : 'Back to Sign In'}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
