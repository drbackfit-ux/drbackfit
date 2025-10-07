"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ProductCard from "@/components/ProductCard";
import seedData from "@/data/seed-data.json";

function CatalogContent() {
  const searchParams = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(seedData.products);
  const [showFilters, setShowFilters] = useState(false);

  const categoryParam = searchParams.get("category");

  const categories = ["beds", "sofas", "couches", "custom"];
  const materials = ["Linen", "Leather", "Velvet", "Wood", "Fabric"];
  const priceRanges = [
    { label: "Under $3,000", min: 0, max: 3000 },
    { label: "$3,000 - $5,000", min: 3000, max: 5000 },
    { label: "$5,000 - $7,500", min: 5000, max: 7500 },
    { label: "Over $7,500", min: 7500, max: 999999 },
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    let filtered = [...seedData.products];

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter((p) =>
        p.materials.some((m) => selectedMaterials.some((sm) => m.includes(sm)))
      );
    }

    // Price range filter
    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.label === selectedPriceRange);
      if (range) {
        filtered = filtered.filter(
          (p) =>
            p.priceEstimateMin >= range.min && p.priceEstimateMin <= range.max
        );
      }
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.priceEstimateMin - b.priceEstimateMin);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.priceEstimateMin - a.priceEstimateMin);
    } else if (sortBy === "newest") {
      filtered.reverse();
    }

    setFilteredProducts(filtered);
  }, [selectedCategories, selectedMaterials, selectedPriceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Our Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover handcrafted furniture designed to elevate your living
            spaces.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 flex-shrink-0 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Category Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Category
              </h3>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>

            {/* Material Filter */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Material
              </h3>
              {materials.map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={material}
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={() => toggleMaterial(material)}
                  />
                  <Label htmlFor={material} className="text-sm cursor-pointer">
                    {material}
                  </Label>
                </div>
              ))}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Price Range
              </h3>
              <Select
                value={selectedPriceRange}
                onValueChange={setSelectedPriceRange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Prices</SelectItem>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(selectedCategories.length > 0 ||
              selectedMaterials.length > 0 ||
              selectedPriceRange) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedMaterials([]);
                  setSelectedPriceRange("");
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found matching your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedMaterials([]);
                    setSelectedPriceRange("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
