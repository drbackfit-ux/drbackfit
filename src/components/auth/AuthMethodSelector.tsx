"use client";

import { Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AuthMethodSelectorProps {
    selected: 'email' | 'phone';
    onSelect: (method: 'email' | 'phone') => void;
}

export function AuthMethodSelector({ selected, onSelect }: AuthMethodSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selected === 'email'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                    }`}
                onClick={() => onSelect('email')}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-full ${selected === 'email' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        }`}>
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Email OTP</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Verify via email
                        </p>
                    </div>
                </div>
            </Card>

            <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selected === 'phone'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                    }`}
                onClick={() => onSelect('phone')}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-full ${selected === 'phone' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        }`}>
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Phone OTP</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Verify via SMS
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
