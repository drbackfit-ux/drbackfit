"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { adminLoginAction } from "@/actions/admin.actions";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  username: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await adminLoginAction(formState);

      if (result.ok) {
        router.push("/admin");
      } else {
        setError(result.error || "Invalid credentials. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-xl shadow-blue-100/60">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-[#1e3a8a]">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-3xl font-semibold text-slate-900">
              Admin Access
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Sign in to manage products, orders, and insights behind the
              storefront.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2 text-left">
                <Label htmlFor="username" className="text-slate-700">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formState.username}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                type="submit"
                className="w-full bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2 text-center text-sm text-slate-500">
            <p>Use admin credentials provided by operations.</p>
            <p>
              Need help? Contact{" "}
              <a
                href="mailto:support@drbackfitatelier.com"
                className="font-medium text-[#1e3a8a] hover:underline"
              >
                support@drbackfitatelier.com
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
