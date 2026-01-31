"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReturnPolicyPage() {
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
                            Return Policy
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Guidelines for returning products to DrBackfit.
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
                                We understand that sometimes a product may not meet your expectations. Please review our return policy below.
                            </p>
                        </section>

                        {/* Return Eligibility */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Return Eligibility</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Products must be returned in their original condition and packaging.</li>
                                <li>Returns are accepted only for damaged or defective products.</li>
                                <li>Customer must report the issue within 24–48 hours of delivery.</li>
                            </ul>
                        </section>

                        {/* How to Initiate a Return */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">How to Initiate a Return</h2>
                            <ol className="list-decimal list-inside text-muted-foreground space-y-3">
                                <li>
                                    <strong>Document the Issue:</strong> Take clear photos or videos showing the damage or defect.
                                </li>
                                <li>
                                    <strong>Contact Support:</strong> Reach out to our customer care team via phone or email with your order details and proof of damage.
                                </li>
                                <li>
                                    <strong>Wait for Approval:</strong> Our team will review your claim within 72 hours.
                                </li>
                                <li>
                                    <strong>Schedule Pickup:</strong> Once approved, we will arrange pickup within 15 days.
                                </li>
                            </ol>
                        </section>

                        {/* Return Timeline */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Return Timeline</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-muted-foreground">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 pr-4 font-semibold text-foreground">Step</th>
                                            <th className="py-3 font-semibold text-foreground">Timeline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 pr-4">Report issue</td>
                                            <td className="py-3">Within 24-48 hours of delivery</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 pr-4">Claim review</td>
                                            <td className="py-3">Within 72 hours</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 pr-4">Product pickup</td>
                                            <td className="py-3">Within 15 days of approval</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 pr-4">Refund processing</td>
                                            <td className="py-3">Within 7 working days after inspection</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Non-Returnable Items */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Non-Returnable Items</h2>
                            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                <p className="text-destructive font-medium">
                                    ❌ Customized products cannot be returned or exchanged.
                                </p>
                            </div>
                            <p className="text-muted-foreground mt-4">
                                Products manufactured to your specific requirements (custom sizes, materials, or designs) are non-returnable.
                            </p>
                        </section>

                        {/* Important Notes */}
                        <section className="bg-card rounded-xl p-8 shadow-sm border">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Important Notes</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Returns initiated after the 48-hour window will not be accepted.</li>
                                <li>Products damaged due to misuse or negligence are not eligible for return.</li>
                                <li>Keep all original packaging until the return window has passed.</li>
                                <li>DrBackfit reserves the right to reject return claims without proper proof.</li>
                            </ul>
                        </section>

                        {/* Contact Us */}
                        <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                For return-related queries, please contact:
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
