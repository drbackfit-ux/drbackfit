"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Firebase imports - commented out for development
// import {
//   collection,
//   doc,
//   limit,
//   onSnapshot,
//   orderBy,
//   query,
// } from "firebase/firestore";
import {
  Star,
  StarHalf,
  StarOff,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  Heart,
  Share2,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import {
  ProductDetail,
  ProductDetailSchema,
  ProductServiceHighlight,
} from "@/models/ProductDetail";
import type { Review } from "@/models/Review";
import { isPincodeServiceable } from "@/utils/pincode-validator";
import type { Product } from "@/models/Product";
import { ReviewSchema } from "@/models/Review";
// Firebase imports - commented out for development  
// import { getFirebaseClientDb } from "@/lib/firebase/client";
// import { prepareProductPayload } from "@/utils/product-normalizer";

interface ProductDetailClientProps {
  initialProduct: ProductDetail;
  initialReviews: Review[];
  similarProducts: Product[];
}

const iconLibrary: Record<string, LucideIcon> = {
  truck: Truck,
  "shield-check": ShieldCheck,
  warranty: ShieldCheck,
};

const resolveIcon = (icon: string): LucideIcon => {
  const normalized = icon.toLowerCase();
  return iconLibrary[normalized] ?? ShieldCheck;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const renderStars = (rating: number) => {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i += 1) {
    if (rounded >= i) {
      stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    } else if (rounded + 0.5 === i) {
      stars.push(
        <StarHalf key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      );
    } else {
      stars.push(<StarOff key={i} className="h-4 w-4 text-muted-foreground" />);
    }
  }

  return stars;
};

const ServiceHighlight = ({ highlight }: { highlight: ProductServiceHighlight }) => {
  const Icon = resolveIcon(highlight.icon);

  return (
    <Card className="flex items-center gap-2 sm:gap-3 border border-dashed border-secondary bg-muted/20 px-3 sm:px-4 py-3 shadow-none w-full max-w-full">
      <span className="rounded-full bg-primary/10 p-1.5 sm:p-2 text-primary flex-shrink-0">
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs sm:text-sm text-foreground break-words">{highlight.title}</p>
        <p className="text-xs text-muted-foreground break-words leading-relaxed">{highlight.description}</p>
      </div>
    </Card>
  );
};

const ReviewCard = ({ review }: { review: Review }) => (
  <Card className="space-y-3 border shadow-sm p-5">
    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
      <Badge variant="secondary" className="bg-amber-400 text-black">
        {review.rating.toFixed(1)}
      </Badge>
      <span>{review.userName}</span>
    </div>
    <p className="text-sm font-semibold text-foreground">{review.headline}</p>
    <p className="text-sm leading-relaxed text-muted-foreground">
      {review.comment}
    </p>
    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
      {review.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </p>
  </Card>
);

export function ProductDetailClient({
  initialProduct,
  initialReviews,
  similarProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetail>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    initialProduct.sizeOptions?.find((size) => size.isDefault)?.value ??
    initialProduct.sizeOptions?.[0]?.value
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeValidation, setPincodeValidation] = useState<{
    checked: boolean;
    isValid: boolean;
    message: string;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
    name: "",
    email: ""
  });
  const [activeSection, setActiveSection] = useState<string>("product");
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.pricing.currency,
      maximumFractionDigits: 0,
    }),
    [product.pricing.currency]
  );

  // Compute active pricing based on selected size (with fallback to product pricing)
  const activePricing = useMemo(() => {
    // Find the selected size option
    const selectedSizeOption = product.sizeOptions?.find(
      (size) => size.value === selectedSize
    );

    // If size has its own pricing with required fields, use it
    if (selectedSizeOption?.pricing?.mrp && selectedSizeOption?.pricing?.salePrice) {
      const sizePricing = selectedSizeOption.pricing;
      return {
        mrp: sizePricing.mrp,
        salePrice: sizePricing.salePrice,
        discountPercent: sizePricing.discountPercent ??
          Math.round(((sizePricing.mrp - sizePricing.salePrice) / sizePricing.mrp) * 100),
        savingsAmount: sizePricing.savingsAmount ?? (sizePricing.mrp - sizePricing.salePrice),
        couponCode: sizePricing.couponCode ?? product.pricing.couponCode,
        couponPrice: sizePricing.couponPrice ?? product.pricing.couponPrice,
        emiText: sizePricing.emiText ?? product.pricing.emiText,
        currency: product.pricing.currency,
        couponDescription: product.pricing.couponDescription,
        taxInclusiveLabel: product.pricing.taxInclusiveLabel,
      };
    }

    // Fallback to product-level pricing
    return product.pricing;
  }, [selectedSize, product.sizeOptions, product.pricing]);

  useEffect(() => {
    setSelectedSize(
      product.sizeOptions?.find((size) => size.isDefault)?.value ??
      product.sizeOptions?.[0]?.value
    );
  }, [product.sizeOptions]);

  // Scroll detection for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["product", "details", "reviews", "faqs", "similar"];
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // For development, we'll skip Firebase real-time updates and use initial data
  // In production, you would set up Firebase configuration and enable this
  // useEffect(() => {
  //   try {
  //     const db = getFirebaseClientDb();
  //     const productRef = doc(db, "products", initialProduct.id);
  //     // ... Firebase snapshot listeners
  //   } catch (error) {
  //     console.log("Firebase not configured, using initial data");
  //   }
  // }, [initialProduct.id]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      image: product.images[0],
      priceEstimateMin: product.priceEstimateMin,
      slug: product.slug,
    });
  };

  const handlePincodeCheck = () => {
    if (!pincode.trim()) {
      setPincodeValidation({
        checked: true,
        isValid: false,
        message: "Please enter a pincode",
      });
      return;
    }

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeValidation({
        checked: true,
        isValid: false,
        message: "Please enter a valid 6-digit pincode",
      });
      return;
    }

    // Check if pincode is serviceable (Delhi NCR and nearby states)
    const isServiceable = isPincodeServiceable(pincode.trim());

    setPincodeValidation({
      checked: true,
      isValid: isServiceable,
      message: isServiceable
        ? "Delivery available to this pincode"
        : "Sorry, delivery not available to your location",
    });
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reviewForm.rating === 0 || !reviewForm.title.trim() || !reviewForm.comment.trim() || !reviewForm.name.trim()) {
      alert("Please fill in all required fields and provide a rating.");
      return;
    }

    // Create new review object
    const newReview: Review = {
      id: `review_${Date.now()}`, // Simple ID generation for local use
      userName: reviewForm.name,
      rating: reviewForm.rating,
      headline: reviewForm.title,
      comment: reviewForm.comment,
      createdAt: new Date()
    };

    // Add to local reviews state
    setReviews(prev => [newReview, ...prev]);

    // Reset form
    setReviewForm({
      rating: 0,
      title: "",
      comment: "",
      name: "",
      email: ""
    });

    // Close modal
    setIsReviewModalOpen(false);

    // Show success message
    alert("Thank you! Your review has been submitted successfully.");
  };

  const handleStarClick = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handlePreviousImage = () => {
    setActiveImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const renderReviewStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={interactive ? () => handleStarClick(i) : undefined}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <Star
            className={`h-6 w-6 ${i <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Sticky Navigation Menu */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="w-full px-3 sm:px-4 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 py-3 min-w-max sm:min-w-0 sm:justify-center">
            {[
              { id: "product", label: "Product" },
              { id: "details", label: "Details" },
              { id: "reviews", label: "Reviews" },
              { id: "faqs", label: "FAQs" },
              { id: "similar", label: "Similar" }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap rounded-lg transition-colors flex-shrink-0 ${activeSection === section.id
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                  }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Product Section */}
      <section id="product" className="container mx-auto px-3 sm:px-4 py-1 sm:py-1 max-w-full mt-4 sm:mt-2">
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2 w-full max-w-none">
          {/* Left Side - Product Image */}
          <div className="space-y-3 sm:space-y-4 w-full max-w-full">
            {/* Main Product Image */}
            <div className="relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 w-full max-h-[60vh] lg:max-h-[75vh] group">
              <Image
                src={product.images[activeImageIndex]}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Image Navigation Buttons */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-2 sm:px-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePreviousImage}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleNextImage}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                </Button>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {activeImageIndex + 1} / {product.images.length}
              </div>

              {/* Wishlist and Share buttons */}
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide w-full">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-square w-14 sm:w-16 md:w-20 flex-shrink-0 overflow-hidden rounded-md sm:rounded-lg border-2 transition-all duration-200 ${activeImageIndex === index
                    ? "border-orange-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  {/* Active indicator */}
                  {activeImageIndex === index && (
                    <div className="absolute inset-0 bg-orange-500/10 rounded-md sm:rounded-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-3 w-full max-w-full min-w-0">
            {/* Product Title and Rating */}
            <div className="space-y-1.5 w-full">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight break-words">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 flex-wrap w-full">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating.average)}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">
                  {product.rating.average} ({formatNumber(product.rating.count)} reviews)
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {currencyFormatter.format(activePricing.salePrice)}
                </span>
                <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through break-words">
                  {currencyFormatter.format(activePricing.mrp)}
                </span>
                <span className="text-xs sm:text-sm text-green-600 font-medium bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                  {activePricing.discountPercent}% off
                </span>
              </div>
              <p className="text-sm text-green-600">
                (Save ₹{formatNumber(activePricing.savingsAmount)})
              </p>
            </div>

            {/* Combined Offers, Coupons, and EMI Section */}
            <Card className="border border-dashed border-orange-300 bg-orange-50 p-2.5 sm:p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">
                Save Extra with Better Offers
              </h3>
              <div className="space-y-2">
                {/* Coupon Code and Coupon Price */}
                {(activePricing.couponCode || activePricing.couponPrice) && (
                  <div className="bg-blue-50 border border-dashed border-blue-300 rounded-lg p-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {activePricing.couponCode && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Coupon Code:</span>
                          <Badge variant="secondary" className="bg-blue-600 text-white font-mono text-xs px-2 py-0.5">
                            {activePricing.couponCode}
                          </Badge>
                        </div>
                      )}
                      {activePricing.couponPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Coupon Price:</span>
                          <span className="text-sm sm:text-base font-bold text-blue-700">
                            {currencyFormatter.format(activePricing.couponPrice)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* EMI Text */}
                {activePricing.emiText && (
                  <div className="flex items-start gap-1.5 p-2 bg-purple-50 rounded-lg border border-dashed border-purple-300">
                    <span className="text-purple-600 mt-0.5 text-sm">ℹ️</span>
                    <p className="text-xs text-purple-900 break-words leading-relaxed">
                      {activePricing.emiText}
                    </p>
                  </div>
                )}

                {/* Bank Offers */}
                {product.offers.slice(0, 1).map((offer, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="text-orange-600 mt-1">•</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 break-words">{offer.title}</p>
                      <p className="text-gray-600 break-words leading-relaxed">{offer.description}</p>
                    </div>
                  </div>
                ))}

                {/* Show remaining offers when expanded */}
                {showAllOffers && product.offers.slice(1).map((offer, index) => (
                  <div key={index + 1} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="text-orange-600 mt-1">•</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 break-words">{offer.title}</p>
                      <p className="text-gray-600 break-words leading-relaxed">{offer.description}</p>
                    </div>
                  </div>
                ))}

                {/* View More / View Less button */}
                {product.offers.length > 1 && (
                  <button
                    onClick={() => setShowAllOffers(!showAllOffers)}
                    className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    {showAllOffers ? '- View Less' : `+ View More (${product.offers.length - 1} more offers)`}
                  </button>
                )}
              </div>
            </Card>
            {/* Quantity and Size Selection Side by Side */}
            <div className="flex gap-3 items-start">
              {/* Quantity Selection - Left Side */}
              <div className="flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Qty</h3>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-l-lg hover:bg-gray-100"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-gray-300 bg-gray-50 text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-r-lg hover:bg-gray-100"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Size Selection - Right Side */}
              {product.sizeOptions && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    <span className="text-sm text-red-500 font-medium">
                      ({product.sizeOptions.length} Standard Options)
                    </span>
                  </div>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full h-10 text-left bg-black text-white border-black hover:bg-gray-800">
                      <SelectValue>
                        {selectedSize ?
                          product.sizeOptions.find(size => size.value === selectedSize)?.label
                          : "Select a size"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizeOptions.map((size) => (
                        <SelectItem
                          key={size.value}
                          value={size.value}
                          disabled={!size.inStock}
                          className={`${!size.inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 w-full">
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700 h-11 sm:h-12 text-sm sm:text-base font-semibold min-w-0"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>
            </div>

            {/* Stock Status Label */}
            {product.stockStatus && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Stock Status:</span>
                <Badge
                  variant="secondary"
                  className={`text-xs sm:text-sm px-3 py-1 font-semibold ${product.stockStatus.inStock
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                >
                  {product.stockStatus.label}
                </Badge>
                {product.stockStatus.subLabel && (
                  <span className="text-xs text-gray-600">({product.stockStatus.subLabel})</span>
                )}
              </div>
            )}


            {/* Delivery Check */}
            {product.delivery && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Check Delivery Code
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={product.delivery.placeholder}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      // Reset validation when user types
                      setPincodeValidation(null);
                    }}
                    className="flex-1 h-10 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePincodeCheck();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 h-10 px-3 sm:px-4 text-sm whitespace-nowrap"
                    onClick={handlePincodeCheck}
                  >
                    {product.delivery.ctaLabel}
                  </Button>
                </div>

                {/* Validation Message */}
                {pincodeValidation?.checked && (
                  <div
                    className={`p-3 rounded-lg border text-sm space-y-2 ${pincodeValidation.isValid
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {pincodeValidation.isValid ? (
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-lg flex-shrink-0">⚠️</span>
                      )}
                      <p className="font-medium">{pincodeValidation.message}</p>
                    </div>
                    {!pincodeValidation.isValid && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-red-700">
                          We currently deliver only to Delhi NCR and nearby states (Delhi, Haryana, UP, Rajasthan, Punjab).
                        </p>
                        <Button
                          onClick={() => router.push('/contact')}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-9 w-full sm:w-auto"
                        >
                          Contact Us for Manual Order
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Video Shopping */}
            {/* <Card className="overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  {product.videoShopping.title}
                </p>
                <p className="text-sm font-medium text-gray-900 break-words">
                  {product.videoShopping.description}
                </p>
                <Button
                  size="sm"
                  className="bg-orange-500 text-white hover:bg-orange-600 text-xs sm:text-sm"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {product.videoShopping.ctaLabel}
                </Button>
              </div>
              <div className="relative h-16 w-12 sm:h-20 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={product.videoShopping.imageUrl}
                  alt="Video shopping"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>
          </Card> */}
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      {product.serviceHighlights.length > 0 && (
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4 w-full">
            {product.serviceHighlights.map((highlight) => (
              <ServiceHighlight key={highlight.title} highlight={highlight} />
            ))}
          </div>
        </section>
      )}

      {/* Product Details Sections */}
      <section id="details" className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-full overflow-x-hidden">
        {/* Features Section */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Features</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {product.detailSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-lg border border-gray-200"
              >
                <AccordionTrigger className="px-6 py-4 text-left font-semibold text-gray-900 hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  <div className="space-y-2">
                    {section.content.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Product Specifications */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Product specifications</h2>
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Dimensions</h3>
                <p className="text-gray-600">
                  {product.dimensions.w} × {product.dimensions.h} × {product.dimensions.d} cm
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Materials</h3>
                <p className="text-gray-600">{product.materials.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Care Instructions */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Care instructions</h2>
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
            <p className="text-gray-600 leading-relaxed">
              {product.longDescription}
            </p>
          </div>
        </div>

        {/* Warranty */}
        {product.warranty && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Warranty</h2>
            <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{product.warranty.title}</h3>
              <p className="text-gray-600">{product.warranty.description}</p>
            </div>
          </div>
        )}

        {/* Quality promise */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quality promise</h2>
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Quality Assurance</h3>
                  <p className="text-sm text-gray-600">Rigorous quality checks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
                  <p className="text-sm text-gray-600">Quick and safe delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Payments</h3>
                  <p className="text-sm text-gray-600">Safe and secure transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Customer Reviews</h3>
                  <p className="text-sm text-gray-600">Trusted by thousands</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Customer Reviews Section */}
      <section id="reviews" className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 bg-gray-50 max-w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">CUSTOMER REVIEWS</h2>
          </div>

          {/* Reviews Overview */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_300px_1fr] items-start mb-8 sm:mb-12">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating.average)}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {product.rating.average.toFixed(2)} out of 5
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Based on {formatNumber(product.rating.count)} reviews
              </p>
              <div className="flex items-center justify-center mt-2">
                <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-600">Verified</span>
              </div>
            </div>

            {/* Star Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = product.ratingSummary.find(item => item.label === `${stars}`)?.percentage || 0;
                const count = Math.round((percentage / 100) * product.rating.count);
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      {[...Array(stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
                      ))}
                      {[...Array(5 - stars)].map((_, i) => (
                        <Star key={i + stars} className="w-3 h-3 text-gray-300" />
                      ))}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                      <div
                        className="bg-orange-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600 min-w-[3rem]">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Write Review Button */}
            <div className="text-center">
              <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full">
                    Write a review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-gray-900">
                      Write a review
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                      Share your experience with this product
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleReviewSubmit} className="space-y-6 mt-4">
                    {/* Rating Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Rating *</Label>
                      <div className="flex items-center justify-center gap-2">
                        {renderReviewStars(reviewForm.rating, true)}
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        {reviewForm.rating === 0 ? "Select a rating" : `${reviewForm.rating} out of 5 stars`}
                      </p>
                    </div>

                    {/* Review Title */}
                    <div className="space-y-2">
                      <Label htmlFor="review-title" className="text-sm font-medium text-gray-700">
                        Review Title *
                      </Label>
                      <Input
                        id="review-title"
                        placeholder="Give your review a title"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    {/* Review Content */}
                    <div className="space-y-2">
                      <Label htmlFor="review-comment" className="text-sm font-medium text-gray-700">
                        Review content *
                      </Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Start writing here..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px] resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="reviewer-name" className="text-sm font-medium text-gray-700">
                        Display name *
                      </Label>
                      <Input
                        id="reviewer-name"
                        placeholder="Display name"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="reviewer-email" className="text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <Input
                        id="reviewer-email"
                        type="email"
                        placeholder="Your email address"
                        value={reviewForm.email}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    {/* Privacy Notice */}
                    <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
                      How we use your data: We'll only contact you about the review you left,
                      and only if necessary. By submitting your review, you agree to
                      Judge.me's terms, privacy and content policies.
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsReviewModalOpen(false)}
                        className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Cancel review
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Reviews Filter and List */}
          <div className="space-y-6">
            {/* Filter Dropdown */}
            <div className="flex justify-start">
              <Select defaultValue="most-recent">
                <SelectTrigger className="w-48 border-orange-300 text-orange-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-recent">Most Recent</SelectItem>
                  <SelectItem value="highest-rating">Highest Rating</SelectItem>
                  <SelectItem value="lowest-rating">Lowest Rating</SelectItem>
                  <SelectItem value="most-helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Individual Reviews */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Show first 2 reviews always */}
              {reviews.slice(0, 2).map((review) => (
                <Card key={review.id} className="p-6 border-gray-200">
                  <div className="space-y-3">
                    {/* Review Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-600">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.createdAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {review.headline}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Show remaining reviews when expanded */}
              {showAllReviews && reviews.slice(2).map((review) => (
                <Card key={review.id} className="p-6 border-gray-200">
                  <div className="space-y-3">
                    {/* Review Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-600">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.createdAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {review.headline}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* View More Reviews Button */}
            {reviews.length > 2 && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  className="px-8 border-orange-300 text-orange-600 hover:bg-orange-50"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews ? '- View Less Reviews' : `+ View More Reviews (${reviews.length - 2} more)`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {product.faqs.length > 0 && (
        <section id="faqs" className="container mx-auto px-3 sm:px-4 py-12 space-y-8 max-w-full overflow-x-hidden">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {product.faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="rounded-lg border border-gray-200"
              >
                <AccordionTrigger className="px-6 py-4 text-left font-semibold text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section id="similar" className="container mx-auto px-3 sm:px-4 py-12 space-y-8 max-w-full overflow-x-hidden">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Similar Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarProducts.map((related) => (
              <ProductCard key={related.id} {...related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
