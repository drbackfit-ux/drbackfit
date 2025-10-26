"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    ],
  },
  {
    title: "Commerce",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
      { name: "Shipping", href: "/admin/shipping", icon: Truck },
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [{ name: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, isAuthenticated } = useAdminAuth();
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Admin Panel
                </h2>
                <Badge
                  variant="outline"
                  className="mt-0.5 border-[#1e3a8a]/30 text-[10px] text-[#1e3a8a]"
                >
                  Internal
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-6">
              {navigationItems.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#1e3a8a] text-white"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* User Profile & Logout */}
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-[#1e3a8a]/10 text-[#1e3a8a]">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Administrator
                </p>
                <p className="truncate text-xs text-slate-500">
                  admin@drbackfit.com
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-semibold text-slate-900 lg:text-xl">
              {navigationItems
                .flatMap((section) => section.items)
                .find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="hidden border-emerald-200 bg-emerald-50 text-emerald-700 sm:flex"
            >
              <span className="relative mr-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </Badge>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
