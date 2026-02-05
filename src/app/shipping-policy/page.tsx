"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShippingPolicyPage() {
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
                            Shipping Policy
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Information about our shipping process, delivery timelines, and shipping charges.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">

                        {/* Introduction */}
                        <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                At DrBackfit, we are committed to delivering your mattress and sleep products safely and on time. Please review our shipping policy below.
                            </p>
                        </section>

                        {/* Shipping Coverage */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Shipping Coverage</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>We currently ship across India.</li>
                                <li>Delivery is available to all major cities, towns, and most PIN codes.</li>
                                <li>For remote locations, additional shipping time may apply.</li>
                            </ul>
                        </section>

                        {/* Delivery Timeline */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Delivery Timeline</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-muted-foreground">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 pr-4 font-semibold text-foreground">Location</th>
                                            <th className="py-3 font-semibold text-foreground">Estimated Delivery</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 pr-4">Metro Cities (Delhi NCR, Mumbai, Bangalore, etc.)</td>
                                            <td className="py-3">5-7 Business Days</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 pr-4">Tier 2 & Tier 3 Cities</td>
                                            <td className="py-3">7-10 Business Days</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 pr-4">Remote Areas</td>
                                            <td className="py-3">10-15 Business Days</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-muted-foreground mt-4 text-sm">
                                * Delivery timelines are estimated and may vary based on logistics and external factors.
                            </p>
                        </section>

                        {/* Shipping Charges */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Shipping Charges</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Free Shipping:</strong> Available on orders above ₹10,000.</li>
                                <li><strong>Standard Shipping:</strong> ₹500 - ₹1,500 depending on product size and delivery location.</li>
                                <li>Exact shipping charges will be calculated at checkout based on your PIN code.</li>
                            </ul>
                        </section>

                        {/* Order Processing */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Order Processing</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Orders are processed within 1-2 business days after payment confirmation.</li>
                                <li>Custom orders may take additional 3-5 days for manufacturing.</li>
                                <li>You will receive an order confirmation email with tracking details once shipped.</li>
                            </ul>
                        </section>

                        {/* Tracking Your Order */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Tracking Your Order</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Once your order is dispatched, you will receive a tracking number via email/SMS.</li>
                                <li>Track your shipment using the logistics partner&apos;s website or our customer support.</li>
                                <li>For any tracking issues, contact our support team immediately.</li>
                            </ul>
                        </section>

                        {/* Delivery Process */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Delivery Process</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Our delivery partner will contact you before delivery to schedule a convenient time.</li>
                                <li>Please ensure someone is available to receive the order at the delivery address.</li>
                                <li>Inspect the package for any external damage before accepting delivery.</li>
                                <li>If the package appears damaged, refuse delivery and contact us immediately.</li>
                            </ul>
                        </section>

                        {/* Important Notes */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Important Notes</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Delays may occur due to natural disasters, strikes, or other unforeseen circumstances.</li>
                                <li>DrBackfit is not responsible for delays caused by incorrect address or contact information.</li>
                                <li>Additional charges may apply for re-delivery attempts due to customer unavailability.</li>
                            </ul>
                        </section>

                        {/* Contact Us */}
                        <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                For shipping-related queries, please contact:
                            </p>
                            <div className="text-muted-foreground space-y-2">
                                <p className="font-semibold text-foreground">DrBackfit</p>
                                <p className="text-sm italic">(Operated by OM.D Mattress Industries)</p>
                                <p className="mt-4">
                                    <strong>Address:</strong> Sector - 01, 883/1, Madhav Puram, Meerut, Uttar Pradesh, 250002, India
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
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
