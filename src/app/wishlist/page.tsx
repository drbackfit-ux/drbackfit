"use client";

import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import seedData from "@/data/seed-data.json";

export default function Wishlist() {
  // Mock wishlist - in a real app, this would come from context or database
  const [wishlistItems, setWishlistItems] = useState(
    seedData.products.slice(0, 3)
  );

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Your Wishlist is Empty
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Save your favorite items to easily find them later.
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
            My Wishlist
          </h1>
          <p className="text-lg text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard {...product} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background z-10"
                onClick={() => removeFromWishlist(product.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}