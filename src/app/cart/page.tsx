"use client";

// This page uses client-side cart context which depends on cookies
export const dynamic = "force-dynamic";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotal, getItemCount } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Your Cart is Empty
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild size="lg" className="btn-premium">
            <Link href="/catalog">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Shopping Cart
          </h1>
          <p className="text-lg text-muted-foreground">
            {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex gap-6">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/product/${item.slug}`}>
                          <h3 className="text-xl font-serif font-semibold text-foreground hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-lg font-semibold text-primary mt-2">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Order Summary
              </h2>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${getTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <Button asChild className="w-full btn-premium" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/catalog">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
