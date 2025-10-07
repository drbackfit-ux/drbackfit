"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Heart, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import seedData from "@/data/seed-data.json";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  
  const product = seedData.products.find(p => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Product Not Found
          </h1>
          <Button asChild className="btn-premium">
            <Link href="/catalog">Browse Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = seedData.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/catalog" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Catalog
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary/20">
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {product.tags.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                {product.title}
              </h1>
              <p className="text-xl text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-3xl font-bold text-primary">
                ${product.priceEstimateMin.toLocaleString()}
              </span>
              {product.priceEstimateMax > product.priceEstimateMin && (
                <span className="text-lg text-muted-foreground">
                  - ${product.priceEstimateMax.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => addToCart({
                  id: product.id,
                  title: product.title,
                  image: product.images[0],
                  priceEstimateMin: product.priceEstimateMin,
                  slug: product.slug
                })}
                className="flex-1 btn-premium" 
                size="lg"
              >
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {product.isCustomAllowed && (
              <Card className="p-4 bg-secondary/20">
                <p className="text-sm text-muted-foreground">
                  <Check className="inline h-4 w-4 text-accent mr-2" />
                  Custom dimensions and materials available
                </p>
                <Button asChild variant="link" className="px-0 h-auto">
                  <Link href="/custom-order">Request Custom Quote</Link>
                </Button>
              </Card>
            )}

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="materials" className="flex-1">Materials</TabsTrigger>
                <TabsTrigger value="dimensions" className="flex-1">Dimensions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {product.longDescription}
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Lead Time:</h4>
                  <p className="text-muted-foreground">{product.leadTimeDays} days</p>
                </div>
              </TabsContent>
              
              <TabsContent value="materials" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {product.materials.map((material, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{material}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="dimensions" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Width</p>
                    <p className="text-lg font-semibold">{product.dimensions.w} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Depth</p>
                    <p className="text-lg font-semibold">{product.dimensions.d} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Height</p>
                    <p className="text-lg font-semibold">{product.dimensions.h} cm</p>
                  </div>
                </div>
                {product.isCustomAllowed && (
                  <p className="text-sm text-muted-foreground mt-4">
                    * Custom dimensions available upon request
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-16">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}