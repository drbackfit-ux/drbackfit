import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import CartIconClient from "@/components/CartIconClient";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Catalog", path: "/catalog" },
  { name: "Accessories", path: "/accessories" },
  { name: "Custom Order", path: "/contact" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-navbar-bg backdrop-blur supports-[backdrop-filter]:bg-navbar-bg/95 border-b border-border">
      <div className="container mx-auto">
        <div className="flex h-20 items-center px-4 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
              Dr Backfit
            </h1>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={`${link.name}-${link.path}`}
                href={link.path}
                className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-primary-button hover:text-primary-foreground"
              asChild
            >
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary-button hover:text-primary-foreground" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-primary-button hover:text-primary-foreground"
              asChild
            >
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            <CartIconClient />

            {/* Mobile Menu - Only visible on mobile */}
            <div className="lg:hidden">
              <MobileMenu navLinks={navLinks} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
