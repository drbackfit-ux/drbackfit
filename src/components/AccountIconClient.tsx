"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountIconClient() {
    const pathname = usePathname();

    // Don't redirect back to sign-in or sign-up pages
    const excludedPaths = ['/sign-in', '/sign-up', '/forgot-password'];
    const shouldRedirect = !excludedPaths.some(path => pathname.startsWith(path));

    // Build the href with redirect parameter
    const href = shouldRedirect && pathname !== '/account'
        ? `/account?redirect=${encodeURIComponent(pathname)}`
        : '/account';

    return (
        <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex hover:bg-primary-button hover:text-primary-foreground"
            asChild
        >
            <Link href={href}>
                <User className="h-5 w-5" />
            </Link>
        </Button>
    );
}
