"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    onResend?: () => void;
    isLoading?: boolean;
}

export function OTPInput({ length = 6, onComplete, onResend, isLoading = false }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (newOtp.every(digit => digit !== '') && index === length - 1) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < length) {
                newOtp[index] = char;
            }
        });
        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, length) - 1;
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (newOtp.every(digit => digit !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleResend = () => {
        setOtp(Array(length).fill(''));
        setCountdown(60);
        onResend?.();
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <Input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        disabled={isLoading}
                        className="w-12 h-12 text-center text-xl font-bold"
                    />
                ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
                {countdown > 0 ? (
                    <p>Resend code in {countdown}s</p>
                ) : (
                    <Button
                        variant="link"
                        onClick={handleResend}
                        disabled={isLoading}
                        className="text-primary hover:underline"
                    >
                        Resend OTP
                    </Button>
                )}
            </div>
        </div>
    );
}
