"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  className?: string;
}

export default function AddToCartButton({
  productId,
  productSlug,
  productTitle,
  productImage,
  productPrice,
  className,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    // Small delay for visual feedback
    setTimeout(() => {
      addToCart({
        id: productId,
        title: productTitle,
        image: productImage,
        priceEstimateMin: productPrice,
        slug: productSlug,
      });
      setIsAdding(false);
    }, 200);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
