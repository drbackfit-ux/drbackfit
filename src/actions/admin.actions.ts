"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env.mjs";

const AdminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function adminLoginAction(
  input: z.infer<typeof AdminLoginSchema>
) {
  const parsed = AdminLoginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
    };
  }

  const { username, password } = parsed.data;

  // Validate against environment variables
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return {
      ok: true,
      error: null,
    };
  }

  // Invalid credentials
  return {
    ok: false,
    error: "Invalid username or password",
  };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

/**
 * Check if admin is authenticated (used in middleware/components)
 * This is a helper function to check the session cookie
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}
