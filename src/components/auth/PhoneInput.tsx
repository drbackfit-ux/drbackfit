"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
];

export function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
    const [countryCode, setCountryCode] = useState('+91'); // Default to India
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleCountryCodeChange = (code: string) => {
        setCountryCode(code);
        onChange(`${code}${phoneNumber}`);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const number = e.target.value.replace(/\D/g, ''); // Only digits
        setPhoneNumber(number);
        onChange(`${countryCode}${number}`);
    };

    // Handle paste to auto-detect country code
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        // Remove all non-digit characters
        const digitsOnly = pastedText.replace(/\D/g, '');

        // Check if it starts with + (has explicit country code)
        if (pastedText.trim().startsWith('+')) {
            const cleanedWithPlus = pastedText.replace(/[^\d+]/g, '');
            // Try to match known country codes
            for (const country of countryCodes) {
                if (cleanedWithPlus.startsWith(country.code)) {
                    // Get the phone number part (last 10 digits)
                    const remainingDigits = cleanedWithPlus.slice(country.code.length).replace(/\D/g, '');
                    const phone = remainingDigits.slice(-10); // Keep only last 10 digits
                    setCountryCode(country.code);
                    setPhoneNumber(phone);
                    onChange(`${country.code}${phone}`);
                    return;
                }
            }
        }

        // Handle 12-digit numbers: first 2 digits as country code, last 10 as phone
        if (digitsOnly.length === 12) {
            const extractedCode = '+' + digitsOnly.slice(0, 2);
            const phone = digitsOnly.slice(-10); // Last 10 digits
            // Check if this matches a known country code
            const matchedCountry = countryCodes.find(c => c.code === extractedCode);
            if (matchedCountry) {
                setCountryCode(extractedCode);
                setPhoneNumber(phone);
                onChange(`${extractedCode}${phone}`);
                return;
            }
        }

        // Handle 11-digit numbers: first 1 digit as country code, last 10 as phone
        if (digitsOnly.length === 11) {
            const extractedCode = '+' + digitsOnly.slice(0, 1);
            const phone = digitsOnly.slice(-10); // Last 10 digits
            // Check if this matches a known country code (like +1 for US/CA)
            const matchedCountry = countryCodes.find(c => c.code === extractedCode);
            if (matchedCountry) {
                setCountryCode(extractedCode);
                setPhoneNumber(phone);
                onChange(`${extractedCode}${phone}`);
                return;
            }
        }

        // For 10 or fewer digits, just use them as the phone number (keep current country code)
        // For more than 12 digits, take the last 10 as phone number
        const phone = digitsOnly.slice(-10);
        setPhoneNumber(phone);
        onChange(`${countryCode}${phone}`);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
                <Select value={countryCode} onValueChange={handleCountryCodeChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                                {country.flag} {country.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    onPaste={handlePaste}
                    placeholder="1234567890"
                    required={required}
                    className="flex-1"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Full number: {countryCode}{phoneNumber}
            </p>
        </div>
    );
}
