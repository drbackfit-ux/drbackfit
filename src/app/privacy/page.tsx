"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="mb-8 hover:bg-background/50">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">

            {/* About Us */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">About Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                DrBackfit is a mattress and sleep-comfort brand operated by OM.D MATTRESS INDUSTRIES (&quot;DrBackfit&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We manufacture and sell mattresses and related sleep products (&quot;Products&quot;) through our website and authorized dealers to our customers (&quot;Users&quot;, &quot;you&quot;, or &quot;your&quot;).
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Privacy Policy explains how we handle your personal information when you visit, browse, or purchase products from our website.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using our website, you agree to this Privacy Policy and consent to the practices described below.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you place an order, register, or contact us, we may collect the following information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Full Name</li>
                <li>Mobile Number</li>
                <li>Email Address</li>
                <li>Billing &amp; Delivery Address</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not knowingly collect information from individuals below 18 years of age.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your personal data is collected strictly for legitimate business purposes and is handled with care. We do not misuse or unnecessarily retain personal information.
              </p>
            </section>

            {/* Use of Information */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Use of Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your personal information only to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Process and fulfill orders</li>
                <li>Arrange delivery of products</li>
                <li>Provide customer support</li>
                <li>Send order confirmations, invoices, and updates</li>
                <li>Improve our products and services</li>
                <li>Comply with applicable Indian laws and regulations</li>
                <li>Prevent fraud or misuse</li>
              </ul>
            </section>

            {/* Sharing of Information */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Sharing of Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share limited information with trusted third-party partners such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Logistics &amp; delivery partners</li>
                <li>Payment gateway providers</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This sharing is strictly limited to order fulfillment and payment processing. All partners are obligated to keep your information confidential.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose information if required by law or government authorities.
              </p>
            </section>

            {/* Data Security */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We take reasonable technical and administrative measures to protect your personal data from unauthorized access, loss, misuse, or disclosure.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Access to personal information is restricted to authorized personnel only for business operations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                However, no online system is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Cookies Policy */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookies Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our website may use cookies to enhance your browsing experience.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cookies help us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Remember user preferences</li>
                <li>Improve website functionality</li>
                <li>Analyze website traffic</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may disable cookies anytime through your browser settings.
              </p>
            </section>

            {/* Data Retention */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We retain your personal information only as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Complete transactions</li>
                <li>Maintain business records</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                After that, data is securely deleted or anonymized.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may update this Privacy Policy from time to time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any changes will be posted on this page. Continued use of the website means acceptance of the updated policy.
              </p>
            </section>

            {/* Governing Law */}
            <section className="bg-card rounded-xl p-8 shadow-sm border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy shall be governed by and interpreted in accordance with the laws of India.
              </p>
            </section>

            {/* Contact Us */}
            <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For any questions regarding this Privacy Policy, please contact:
              </p>
              <div className="text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">DrBackfit</p>
                <p className="text-sm italic">(Operated by OM.D Mattress Industries)</p>
                <p className="mt-4">
                  <strong>Address:</strong> Industrial Area, Phase-2, Meerut, Uttar Pradesh – 250001, India
                </p>
                <p>
                  <strong>Phone:</strong> +91 8937905906
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:support@drbackfitmattress.com" className="text-primary hover:underline">
                    support@drbackfitmattress.com
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href="https://www.drbackfitmattress.com" className="text-primary hover:underline">
                    www.drbackfitmattress.com
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
