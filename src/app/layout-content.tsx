"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 max-w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
