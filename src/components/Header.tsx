import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import CartIcon from "@/components/CartIcon";
import { Suspense } from "react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Catalog", path: "/catalog" },
  { name: "Custom Order", path: "/custom-order" },
  { name: "About", path: "/about" },
  { name: "Showroom", path: "/showroom" },
  { name: "Contact", path: "/contact" },
];

// Separate component for cart data that can be dynamically rendered
async function CartIconWithData() {
  const { getCartData } = await import("@/actions/cart.actions");
  const { itemCount } = await getCartData();
  return <CartIcon itemCount={itemCount} />;
}

const Header = () => {

  return (
    <header className="sticky top-0 z-50 w-full bg-navbar-bg backdrop-blur supports-[backdrop-filter]:bg-navbar-bg/95 border-b border-border">
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
              Dr Backfit
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              asChild
            >
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              asChild
            >
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            <Suspense fallback={<CartIcon itemCount={0} />}>
              <CartIconWithData />
            </Suspense>
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
