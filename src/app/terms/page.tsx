"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsConditionsPage() {
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
                            Terms &amp; Conditions
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            These Terms &amp; Conditions define the rules and responsibilities between DrBackfit and its customers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">

                        {/* Agreement Notice */}
                        <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                By accessing our website or purchasing our products, you agree to these Terms &amp; Conditions.
                            </p>
                        </section>

                        {/* 1. General Information */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. General Information</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>DrBackfit is a manufacturing brand operated by OM.D MATTRESS INDUSTRIES.</li>
                                <li>Use of our products or services indicates acceptance of these terms.</li>
                            </ul>
                        </section>

                        {/* 2. Products & Quality */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Products &amp; Quality</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>We strive to maintain high quality standards in all products.</li>
                                <li>Product specifications, designs, and availability may change without prior notice.</li>
                            </ul>
                        </section>

                        {/* 3. Orders & Payments */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Orders &amp; Payments</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Orders are processed only after successful payment confirmation.</li>
                                <li>Customers must provide accurate and complete information.</li>
                                <li>DrBackfit reserves the right to cancel orders in case of incorrect details or payment issues.</li>
                            </ul>
                        </section>

                        {/* 4. Delivery */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Delivery</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Delivery timelines are estimated and may vary based on location and logistics.</li>
                                <li>Delays caused by external factors are beyond our control.</li>
                            </ul>
                        </section>

                        {/* 5. Returns & Refunds */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Returns &amp; Refunds</h2>
                            <div className="text-muted-foreground space-y-4">
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Orders may be cancelled within 24 hours of confirmation or before dispatch, whichever is earlier.</li>
                                    <li>A 2.25% transaction fee will be deducted for payment gateway charges upon cancellation.</li>
                                </ul>

                                <div className="mt-4">
                                    <p className="font-semibold text-foreground mb-2">Damaged Products:</p>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Customers must report damage within 24–48 hours of delivery with proper proof.</li>
                                        <li>Claims are reviewed within 72 hours.</li>
                                        <li>Approved returns will be picked up within 15 days, and refunds processed within 7 working days after inspection.</li>
                                    </ul>
                                </div>

                                <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                    <p className="text-destructive font-medium">
                                        ❌ No return or refund is applicable on customized products.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 6. Customer Responsibilities */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Customer Responsibilities</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Customers must provide correct details.</li>
                                <li>Products should be used only as intended.</li>
                                <li>DrBackfit is not responsible for damage caused by misuse.</li>
                            </ul>
                        </section>

                        {/* 7. Third-Party Links */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Third-Party Links</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                Our website may contain links to third-party websites.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                We are not responsible for their content, policies, or services. Any interaction with third-party sites is at your own risk.
                            </p>
                        </section>

                        {/* 8. Intellectual Property */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                All trademarks, logos, product designs, images, and website content related to DrBackfit are the property of the company.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Unauthorized use is strictly prohibited.
                            </p>
                        </section>

                        {/* 9. Changes to Terms */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                DrBackfit reserves the right to update these Terms &amp; Conditions at any time.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Continued use of our services implies acceptance of revised terms.
                            </p>
                        </section>

                        {/* 10. Governing Law */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                These Terms &amp; Conditions shall be governed by the laws of India.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Any disputes shall be subject to Meerut jurisdiction.
                            </p>
                        </section>

                        {/* Contact Us */}
                        <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                For questions regarding these Terms &amp; Conditions, contact:
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
                                    <a href="mailto:care@drbackfitmattress.com" className="text-primary hover:underline">
                                        care@drbackfitmattress.com
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
