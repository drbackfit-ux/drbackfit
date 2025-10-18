"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { type Product } from "@/models/Product";
import seedData from "@/data/accessories-data.json";

export default function Accessories() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  // Define filter options
  const categories = ["Sofa Cover", "Pillow", "Pillow Cover", "Bed Cover", "Table Cover"];
  const materials = ["Cotton", "Linen", "Silk", "Polyester", "Velvet"];
  const priceRanges = [
    { label: "Under $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Over $200", min: 200, max: 999999 },
  ];

  useEffect(() => {
    // Use seed data directly
    setProducts(seedData.products);
    setLoading(false);
  }, []);

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => product.title.toLowerCase().includes(cat.toLowerCase()));
      
      // Material filter
      const matchesMaterial = selectedMaterials.length === 0 ||
        selectedMaterials.some(material => 
          product.materials.some(m => m.toLowerCase().includes(material.toLowerCase()))
        );
      
      // Price range filter
      const selectedRange = priceRanges.find(range => range.label === selectedPriceRange);
      const matchesPriceRange = !selectedRange ||
        (product.priceEstimateMin >= selectedRange.min && product.priceEstimateMax <= selectedRange.max);
      
      return matchesSearch && matchesCategory && matchesMaterial && matchesPriceRange;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priceLowToHigh":
          return a.priceEstimateMin - b.priceEstimateMin;
        case "priceHighToLow":
          return b.priceEstimateMin - a.priceEstimateMin;
        case "newest":
          return b.id.localeCompare(a.id);
        case "featured":
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accessories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Accessories</h1>
        <p className="text-muted-foreground">
          Discover our collection of premium accessories, including pillows, covers, and more.
        </p>
      </div>

      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Input
            type="search"
            placeholder="Search accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px]"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="priceLowToHigh">Price: Low to High</SelectItem>
            <SelectItem value="priceHighToLow">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } lg:block w-full lg:w-64 space-y-6`}
        >
          {/* Category Filter */}
          <div>
            <h3 className="font-semibold mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== category)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={category}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          <div>
            <h3 className="font-semibold mb-3">Material</h3>
            <div className="space-y-2">
              {materials.map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={material}
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMaterials([...selectedMaterials, material]);
                      } else {
                        setSelectedMaterials(
                          selectedMaterials.filter((m) => m !== material)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={material}>{material}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <div key={range.label} className="flex items-center space-x-2">
                  <Checkbox
                    id={range.label}
                    checked={selectedPriceRange === range.label}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPriceRange(range.label);
                      } else {
                        setSelectedPriceRange("");
                      }
                    }}
                  />
                  <Label htmlFor={range.label}>{range.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  title={product.title}
                  shortDescription={product.shortDescription}
                  images={product.images}
                  priceEstimateMin={product.priceEstimateMin}
                  priceEstimateMax={product.priceEstimateMax}
                  isCustomAllowed={product.isCustomAllowed}
                  tags={product.tags}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No accessories found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
