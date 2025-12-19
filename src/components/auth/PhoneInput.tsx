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
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
];

export function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
    const [countryCode, setCountryCode] = useState('+1');
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
