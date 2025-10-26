"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePathname } from "next/navigation";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/(auth)/login";

  return (
    <AdminAuthProvider>
      {isLoginPage ? children : <AdminLayout>{children}</AdminLayout>}
    </AdminAuthProvider>
  );
}
