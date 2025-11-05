import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import type { Product } from "@/models/Product";
import type { ProductDetail } from "@/models/ProductDetail";

type ProductCardProps = (Omit<
  Product,
  "longDescription" | "category" | "materials" | "dimensions" | "leadTimeDays"
> | ProductDetail) & {
  priceEstimateMin?: number;
  priceEstimateMax?: number;
};

const ProductCard = (props: ProductCardProps) => {
  const { id, slug, title, shortDescription, images, tags } = props;
  
  // Handle both Product and ProductDetail types
  let priceMin: number;
  let priceMax: number;
  
  if ('pricing' in props && props.pricing) {
    // ProductDetail type
    priceMin = props.pricing.salePrice;
    priceMax = props.pricing.mrp;
  } else {
    // Product type
    priceMin = props.priceEstimateMin || 0;
    priceMax = props.priceEstimateMax || priceMin;
  }
  return (
    <div className="card-premium group hover-lift hover-glow flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-background/90 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-4 right-4">
          <WishlistButton
            product={{
              id,
              slug,
              title,
              shortDescription,
              images,
              priceEstimateMin: priceMin,
              priceEstimateMax: priceMax,
              tags,
            }}
          />
        </div>
      </div>

      {/* Content - Flex grow to push button to bottom */}
      <div className="flex flex-col flex-grow p-6 space-y-3">
        <Link href={`/product/${slug}`}>
          <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
          {shortDescription}
        </p>

        {/* Price Range */}
        <div className="flex items-baseline space-x-2 pt-2">
          <span className="text-sm text-muted-foreground">From</span>
          <span className="text-lg font-semibold text-primary">
            ₹{priceMin.toLocaleString('en-IN')}
          </span>
          {priceMax > priceMin && (
            <span className="text-sm text-muted-foreground">
              - ₹{priceMax.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Always at bottom */}
        <div className="pt-4">
          <AddToCartButton productSlug={slug} className="w-full btn-premium" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
