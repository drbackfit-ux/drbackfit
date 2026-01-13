"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, Truck, CreditCard, Package, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    icon: React.ReactNode;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        title: "Orders & Payments",
        icon: <CreditCard className="h-5 w-5" />,
        items: [
            {
                question: "How do I place an order?",
                answer: "You can place an order directly through our website by selecting your desired product, adding it to cart, and proceeding to checkout. You can also contact us via phone or visit our showroom to place an order."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) for select locations. All online payments are processed through secure payment gateways."
            },
            {
                question: "Can I cancel my order?",
                answer: "Yes, you can cancel your order within 24 hours of confirmation or before dispatch, whichever is earlier. A 2.25% transaction fee will be deducted for payment gateway charges upon cancellation."
            },
            {
                question: "Is it safe to pay online on your website?",
                answer: "Absolutely! We use industry-standard SSL encryption and trusted payment gateways to ensure your payment information is completely secure."
            }
        ]
    },
    {
        title: "Delivery & Shipping",
        icon: <Truck className="h-5 w-5" />,
        items: [
            {
                question: "How long does delivery take?",
                answer: "Delivery typically takes 7-15 business days depending on your location. For remote areas, it may take slightly longer. You'll receive tracking information once your order is dispatched."
            },
            {
                question: "Do you deliver all over India?",
                answer: "Yes, we deliver across India. Delivery timelines and charges may vary based on your location and the size of your order."
            },
            {
                question: "Is shipping free?",
                answer: "We offer free shipping on most orders. Shipping charges, if applicable, will be displayed at checkout before you complete your purchase."
            },
            {
                question: "How can I track my order?",
                answer: "Once your order is dispatched, you'll receive tracking details via SMS and email. You can also track your order by logging into your account on our website."
            }
        ]
    },
    {
        title: "Products & Quality",
        icon: <Package className="h-5 w-5" />,
        items: [
            {
                question: "What types of mattresses do you offer?",
                answer: "We offer a wide range of mattresses including Orthopaedic, Memory Foam, Spring, and Hybrid mattresses. Each is designed for optimal comfort and support for better sleep."
            },
            {
                question: "How do I choose the right mattress?",
                answer: "The right mattress depends on your sleeping position, body weight, and personal preferences. Our customer support team can help you choose the perfect mattress. You can also visit our showroom to try different options."
            },
            {
                question: "Do you offer custom sizes?",
                answer: "Yes, we manufacture custom-sized mattresses to fit your specific requirements. Contact us with your dimensions for a quote. Please note that customized products are non-refundable."
            },
            {
                question: "What is the lifespan of your mattresses?",
                answer: "With proper care, our mattresses typically last 8-10 years. We recommend rotating your mattress every 3-6 months for even wear and longer life."
            }
        ]
    },
    {
        title: "Returns & Warranty",
        icon: <Shield className="h-5 w-5" />,
        items: [
            {
                question: "What is your return policy?",
                answer: "Orders can be cancelled within 24 hours of confirmation or before dispatch. For damaged products, you must report within 24-48 hours of delivery with proper proof. Customized products are not eligible for returns."
            },
            {
                question: "What if my product arrives damaged?",
                answer: "If your product arrives damaged, please report it within 24-48 hours of delivery with photos as proof. Our team will review your claim within 72 hours. Approved returns will be picked up within 15 days, and refunds processed within 7 working days after inspection."
            },
            {
                question: "Do your products come with a warranty?",
                answer: "Yes, all our mattresses come with a warranty against manufacturing defects. Warranty duration varies by product. Please check the product page or contact us for specific warranty details."
            },
            {
                question: "How do I claim warranty?",
                answer: "To claim warranty, contact our customer support with your order details and photos of the issue. Our team will guide you through the warranty claim process."
            }
        ]
    },
    {
        title: "General Questions",
        icon: <HelpCircle className="h-5 w-5" />,
        items: [
            {
                question: "Where is DrBackfit located?",
                answer: "Our manufacturing unit is located at Industrial Area, Phase-2, Meerut, Uttar Pradesh – 250001, India. You can visit our showroom during business hours."
            },
            {
                question: "How can I contact customer support?",
                answer: "You can reach us via email at support@drbackfit.com or call us at +91 9XXXXXXXXX. Our customer support team is available Monday to Saturday, 10 AM to 6 PM."
            },
            {
                question: "Do you have a showroom I can visit?",
                answer: "Yes! You can visit our showroom in Meerut to experience our products firsthand. Contact us to schedule a visit or for directions."
            },
            {
                question: "Can I become a dealer or distributor?",
                answer: "Yes, we welcome partnership inquiries. Please contact us via email with your business details, and our team will get back to you."
            }
        ]
    }
];

function FAQAccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-muted/50 transition-colors rounded-lg"
            >
                <span className="font-medium text-foreground pr-4">{item.question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <p className="px-2 pb-4 text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

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
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Find answers to common questions about our products, orders, delivery, and more.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {faqData.map((category, categoryIndex) => (
                        <section key={categoryIndex} className="bg-card rounded-xl p-6 md:p-8 shadow-sm border">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {category.icon}
                                </div>
                                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{category.title}</h2>
                            </div>
                            <div className="space-y-1">
                                {category.items.map((item, itemIndex) => (
                                    <FAQAccordionItem
                                        key={itemIndex}
                                        item={item}
                                        isOpen={openItems[`${categoryIndex}-${itemIndex}`] || false}
                                        onClick={() => toggleItem(categoryIndex, itemIndex)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* Still Have Questions */}
                    <section className="bg-primary/5 rounded-xl p-8 border border-primary/20 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold mb-3 text-foreground">Still Have Questions?</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Can&apos;t find what you&apos;re looking for? Our customer support team is here to help.
                        </p>
                        <Link href="/contact">
                            <Button className="btn-premium px-8">
                                Contact Us
                            </Button>
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}
