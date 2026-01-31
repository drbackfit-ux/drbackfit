import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Providers } from "@/app/providers";
import { LayoutContent } from "./layout-content";
import "./globals.css";

export const metadata = {
  title: "DrBackfitmattresses| Orthopedic Mattresses & Custom Mattresses IndiaMeta",
  description:
    "Buy premium orthopedic mattresses & handcrafted mattresses. Doctor-recommended back support, 20+ years craftsmanship. Free delivery. Shop now!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className="overflow-x-hidden">
        <Providers>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <LayoutContent>{children}</LayoutContent>
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
