"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import type { WishlistProduct } from "@/models/WishlistProduct";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  product: WishlistProduct;
  variant?: "default" | "ghost";
  size?: "icon" | "default";
}

export function WishlistButton({ 
  product, 
  variant = "ghost",
  size = "icon" 
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);

  const toggleWishlist = () => {
    if (isFavorited) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className="group"
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist();
      }}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-colors",
          isFavorited 
            ? "fill-orange-500 stroke-orange-500 group-hover:stroke-white" 
            : "stroke-foreground group-hover:stroke-white"
        )}
      />
    </Button>
  );
}
