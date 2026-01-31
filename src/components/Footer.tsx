import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footer-bg border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Dr Backfit"
                width={180}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-footer italic">
              Made by hand. Loved for years.
            </p>
            <div className="flex space-x-3">
              <Link href="https://www.instagram.com/dr.backfitmattress" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://www.facebook.com/dr.backfitmattress" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 hover:shadow-lg transition-all duration-300"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://www.youtube.com/@drbackfitmattress7454" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-red-600 text-white hover:bg-red-700 hover:scale-110 hover:shadow-lg transition-all duration-300"
                >
                  <Youtube className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold text-footer mb-4">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/catalog?category=beds"
                  className="text-footer hover:text-primary-button hover:bg-primary-button/10 rounded-md px-2 py-1 transition-colors"
                >
                  Beds
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=sofas"
                  className="text-footer hover:text-primary-button hover:bg-primary-button/10 rounded-md px-2 py-1 transition-colors"
                >
                  Sofas
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=couches"
                  className="text-footer hover:text-primary-button transition-colors"
                >
                  Couches
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-footer hover:text-primary-button transition-colors"
                >
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-footer mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-footer hover:text-primary-button transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-footer hover:text-primary-button transition-colors"
                >
                  Visit Showroom
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-footer hover:text-primary-button transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-footer hover:text-primary-button transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-footer mb-4">
              Stay Connected
            </h4>
            <p className="text-sm text-footer mb-4">
              Subscribe for exclusive offers and design inspiration.
            </p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Your email" className="flex-1" />
              <Button className="btn-premium px-6">Join</Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-footer" suppressHydrationWarning>
            © {currentYear} Dr Backfit. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-footer hover:text-primary-button transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-footer hover:text-primary-button transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/shipping-policy"
              className="text-footer hover:text-primary-button transition-colors"
            >
              Shipping Policy
            </Link>
            <Link
              href="/refund-policy"
              className="text-footer hover:text-primary-button transition-colors"
            >
              Refund Policy
            </Link>
            <Link
              href="/return-policy"
              className="text-footer hover:text-primary-button transition-colors"
            >
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
