"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefundPolicyPage() {
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
                            Refund Policy
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Our commitment to ensuring your satisfaction with every purchase.
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
                                At DrBackfit, we want you to be completely satisfied with your purchase. Please review our refund policy below.
                            </p>
                        </section>

                        {/* Order Cancellation */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Order Cancellation</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Orders may be cancelled within 24 hours of confirmation or before dispatch, whichever is earlier.</li>
                                <li>A 2.25% transaction fee will be deducted for payment gateway charges upon cancellation.</li>
                                <li>Cancellation requests must be made through our customer support.</li>
                            </ul>
                        </section>

                        {/* Refund Process */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Refund Process</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Refunds are processed within 7 working days after approval.</li>
                                <li>Refunds will be credited to the original payment method used during purchase.</li>
                                <li>Bank processing times may vary; please allow additional 5-7 business days for the amount to reflect in your account.</li>
                            </ul>
                        </section>

                        {/* Damaged Products Refund */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Damaged Products</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Customers must report damage within 24–48 hours of delivery with proper proof (photos/videos).</li>
                                <li>Claims are reviewed within 72 hours of submission.</li>
                                <li>Approved returns will be picked up within 15 days.</li>
                                <li>Refunds are processed within 7 working days after inspection and approval.</li>
                            </ul>
                        </section>

                        {/* Non-Refundable Items */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Non-Refundable Items</h2>
                            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                <p className="text-destructive font-medium">
                                    ❌ No refund is applicable on customized products.
                                </p>
                            </div>
                            <p className="text-muted-foreground mt-4">
                                Custom-made products are manufactured specifically as per your requirements and cannot be refunded or exchanged.
                            </p>
                        </section>

                        {/* Contact Us */}
                        <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                For refund-related queries, please contact:
                            </p>
                            <div className="text-muted-foreground space-y-2">
                                <p className="font-semibold text-foreground">DrBackfit</p>
                                <p className="text-sm italic">(Operated by OM.D Mattress Industries)</p>
                                <p className="mt-4">
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
