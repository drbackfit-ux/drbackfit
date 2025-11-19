"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import type { ProductDetail } from "@/models/ProductDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useImageUpload } from "@/hooks/use-image-upload";
import Image from "next/image";
import { DraggableImageList } from "@/components/admin/DraggableImageList";

interface ProductDetailFormStreamlinedProps {
  product?: ProductDetail;
  onSubmit: (product: Partial<ProductDetail>) => void;
  onCancel: () => void;
}

export function ProductDetailFormStreamlined({
  product,
  onSubmit,
  onCancel,
}: ProductDetailFormStreamlinedProps) {
  const { uploadImages, isUploading, uploadProgress, error: uploadError } = useImageUpload();

  const [formData, setFormData] = useState({
    // Basic Info - VISIBLE ON PAGE
    title: product?.title || "",
    slug: product?.slug || "",
    category: product?.category || "beds",

    // Images - VISIBLE (main image + thumbnails)
    images: product?.images || [""],

    // Rating - VISIBLE (shows on page)
    rating: product?.rating || { average: 4.5, count: 0 },

    // Pricing - VISIBLE (MRP, Sale Price, Discount, Savings)
    pricing: product?.pricing || {
      currency: "INR",
      mrp: 0,
      salePrice: 0,
      discountPercent: 0,
      savingsAmount: 0,
      couponPrice: undefined,
      couponCode: "",
      couponDescription: "",
      emiText: "",
      taxInclusiveLabel: "Inclusive of all taxes",
    },

    // Stock Status - VISIBLE (In Stock label)
    stockStatus: product?.stockStatus || {
      label: "In Stock",
      subLabel: "Ready to ship",
      inStock: true as boolean,
    },

    // Dimensions - VISIBLE (in specifications section)
    dimensions: product?.dimensions || { w: 0, h: 0, d: 0 },

    // Materials - VISIBLE (in specifications section)
    materials: product?.materials || [""],

    // Size Options - VISIBLE (dropdown with sizes)
    sizeOptions: product?.sizeOptions || [],

    // Offers - VISIBLE (savings card with expandable offers)
    offers: product?.offers || [],

    // Service Highlights - VISIBLE (icons below main product)
    serviceHighlights: product?.serviceHighlights || [],

    // Detail Sections - VISIBLE (Features accordion)
    detailSections: product?.detailSections || [],

    // Care Instructions - VISIBLE (longDescription)
    longDescription: product?.longDescription || "",

    // Warranty - VISIBLE (warranty section)
    warranty: product?.warranty || undefined,

    // FAQs - VISIBLE (FAQs section)
    faqs: product?.faqs || [],

    // Delivery - VISIBLE (pincode check)
    delivery: product?.delivery || {
      placeholder: "Enter pincode",
      ctaLabel: "Check",
      helperText: "",
    },

    // REQUIRED BUT NOT DISPLAYED (for API compatibility)
    shortDescription: product?.shortDescription || "",
    priceEstimateMin: product?.priceEstimateMin || 0,
    priceEstimateMax: product?.priceEstimateMax || 0,
    leadTimeDays: product?.leadTimeDays || 30,
    isCustomAllowed: (product?.isCustomAllowed ?? true) as boolean,
    tags: product?.tags || [],
    breadcrumbs: product?.breadcrumbs || [],
    overviewPoints: product?.overviewPoints || [],
    subtitle: product?.subtitle || "",
    videoShopping: product?.videoShopping || {
      title: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      imageUrl: "",
    },
    ratingSummary: product?.ratingSummary || [],

    // Display Locations - NEW (where to show the product)
    displayLocations: product?.displayLocations || {
      homeBestseller: false,
      homeFeatured: false,
      catalog: true,
      accessories: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Partial<ProductDetail> = {
      id: product?.id,
      ...formData,
      images: formData.images.filter(img => img.trim()),
      materials: formData.materials.filter(m => m.trim()),
    };

    onSubmit(productData);
  };

  // Image Management
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedUrls = await uploadImages(Array.from(files));
      setFormData({
        ...formData,
        images: [...formData.images.filter(img => img.trim()), ...uploadedUrls],
      });
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const reorderImages = (newOrder: string[]) => {
    setFormData({ ...formData, images: newOrder });
  };

  // Materials Management
  const addMaterial = () => {
    setFormData({ ...formData, materials: [...formData.materials, ""] });
  };

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = value;
    setFormData({ ...formData, materials: newMaterials });
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index),
    });
  };

  // Size Options Management
  const addSizeOption = () => {
    setFormData({
      ...formData,
      sizeOptions: [
        ...formData.sizeOptions,
        { label: "", value: "", inStock: true, isDefault: false },
      ],
    });
  };

  const updateSizeOption = (index: number, field: string, value: any) => {
    const newOptions = [...formData.sizeOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, sizeOptions: newOptions });
  };

  const removeSizeOption = (index: number) => {
    setFormData({
      ...formData,
      sizeOptions: formData.sizeOptions.filter((_, i) => i !== index),
    });
  };

  // Offers Management
  const addOffer = () => {
    setFormData({
      ...formData,
      offers: [
        ...formData.offers,
        { title: "", description: "", icon: "", ctaLabel: "" },
      ],
    });
  };

  const updateOffer = (index: number, field: string, value: string) => {
    const newOffers = [...formData.offers];
    newOffers[index] = { ...newOffers[index], [field]: value };
    setFormData({ ...formData, offers: newOffers });
  };

  const removeOffer = (index: number) => {
    setFormData({
      ...formData,
      offers: formData.offers.filter((_, i) => i !== index),
    });
  };

  // Service Highlights Management
  const addServiceHighlight = () => {
    setFormData({
      ...formData,
      serviceHighlights: [
        ...formData.serviceHighlights,
        { title: "", description: "", icon: "" },
      ],
    });
  };

  const updateServiceHighlight = (index: number, field: string, value: string) => {
    const newHighlights = [...formData.serviceHighlights];
    newHighlights[index] = { ...newHighlights[index], [field]: value };
    setFormData({ ...formData, serviceHighlights: newHighlights });
  };

  const removeServiceHighlight = (index: number) => {
    setFormData({
      ...formData,
      serviceHighlights: formData.serviceHighlights.filter((_, i) => i !== index),
    });
  };

  // Detail Sections Management
  const addDetailSection = () => {
    setFormData({
      ...formData,
      detailSections: [
        ...formData.detailSections,
        { id: `section-${Date.now()}`, title: "", content: [""] },
      ],
    });
  };

  const updateDetailSection = (index: number, field: string, value: any) => {
    const newSections = [...formData.detailSections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, detailSections: newSections });
  };

  const addDetailSectionContent = (sectionIndex: number) => {
    const newSections = [...formData.detailSections];
    newSections[sectionIndex].content.push("");
    setFormData({ ...formData, detailSections: newSections });
  };

  const updateDetailSectionContent = (sectionIndex: number, contentIndex: number, value: string) => {
    const newSections = [...formData.detailSections];
    newSections[sectionIndex].content[contentIndex] = value;
    setFormData({ ...formData, detailSections: newSections });
  };

  const removeDetailSectionContent = (sectionIndex: number, contentIndex: number) => {
    const newSections = [...formData.detailSections];
    newSections[sectionIndex].content = newSections[sectionIndex].content.filter((_, i) => i !== contentIndex);
    setFormData({ ...formData, detailSections: newSections });
  };

  const removeDetailSection = (index: number) => {
    setFormData({
      ...formData,
      detailSections: formData.detailSections.filter((_, i) => i !== index),
    });
  };

  // FAQs Management
  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [
        ...formData.faqs,
        { id: `faq-${Date.now()}`, question: "", answer: "" },
      ],
    });
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData({ ...formData, faqs: newFaqs });
  };

  const removeFaq = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="product-url-slug"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beds">Beds</SelectItem>
                <SelectItem value="sofas">Sofas</SelectItem>
                <SelectItem value="couches">Couches</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              rows={2}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Display Locations</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose where this product should appear on your website
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="homeBestseller" className="font-medium">
                  Home - Best Seller Section
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in the Best Seller products section on homepage
                </p>
              </div>
              <Switch
                id="homeBestseller"
                checked={formData.displayLocations.homeBestseller}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    displayLocations: {
                      ...formData.displayLocations,
                      homeBestseller: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="homeFeatured" className="font-medium">
                  Home - Featured Products Section
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in the Featured Products section on homepage
                </p>
              </div>
              <Switch
                id="homeFeatured"
                checked={formData.displayLocations.homeFeatured}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    displayLocations: {
                      ...formData.displayLocations,
                      homeFeatured: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="catalog" className="font-medium">
                  Catalog Page
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in the main catalog/products listing page
                </p>
              </div>
              <Switch
                id="catalog"
                checked={formData.displayLocations.catalog}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    displayLocations: {
                      ...formData.displayLocations,
                      catalog: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="accessories" className="font-medium">
                  Accessories Page
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in the accessories page
                </p>
              </div>
              <Switch
                id="accessories"
                checked={formData.displayLocations.accessories}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    displayLocations: {
                      ...formData.displayLocations,
                      accessories: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Images (Visible: Main + Thumbnails)</span>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                size="sm"
                variant="outline"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading {uploadProgress.toFixed(0)}%
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {uploadError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {uploadError}
            </div>
          )}

          {formData.images.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">No images uploaded yet</p>
              <Button
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                size="sm"
                variant="outline"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Drag images to reorder them. The first image will be the main product image.
              </p>
              <DraggableImageList
                images={formData.images.filter(img => img.trim())}
                onReorder={reorderImages}
                onRemove={removeImage}
              />
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            First image will be the main product image. Maximum 5MB per image.
          </p>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Rating (Visible: Below title)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Average Rating (0-5) *</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating.average}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: {
                      ...formData.rating,
                      average: Number(e.target.value),
                    },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="ratingCount">Review Count *</Label>
              <Input
                id="ratingCount"
                type="number"
                value={formData.rating.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: {
                      ...formData.rating,
                      count: Number(e.target.value),
                    },
                  })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing (Visible: Price section with MRP, Sale Price, Discount)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="mrp">MRP (₹) *</Label>
              <Input
                id="mrp"
                type="number"
                value={formData.pricing.mrp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, mrp: Number(e.target.value) },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price (₹) *</Label>
              <Input
                id="salePrice"
                type="number"
                value={formData.pricing.salePrice}
                onChange={(e) => {
                  const salePrice = Number(e.target.value);
                  const mrp = formData.pricing.mrp;
                  const discountPercent = mrp > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
                  const savingsAmount = mrp - salePrice;

                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      salePrice,
                      discountPercent,
                      savingsAmount,
                    },
                  });
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="discountPercent">Discount % (Auto-calc)</Label>
              <Input
                id="discountPercent"
                type="number"
                value={formData.pricing.discountPercent}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
              <Input
                id="couponCode"
                value={formData.pricing.couponCode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      couponCode: e.target.value,
                    },
                  })
                }
                placeholder="SAVE100"
              />
            </div>
            <div>
              <Label htmlFor="couponPrice">Coupon Price (₹)</Label>
              <Input
                id="couponPrice"
                type="number"
                value={formData.pricing.couponPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      couponPrice: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emiText">EMI Text (Optional)</Label>
            <Input
              id="emiText"
              value={formData.pricing.emiText || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, emiText: e.target.value },
                })
              }
              placeholder="EMI starting at ₹2,000/month"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Status (Visible: Shows availability)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockLabel">Stock Label</Label>
              <Input
                id="stockLabel"
                value={formData.stockStatus.label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockStatus: {
                      ...formData.stockStatus,
                      label: e.target.value,
                    },
                  })
                }
                placeholder="In Stock"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="inStock"
                checked={formData.stockStatus.inStock}
                onCheckedChange={(checked: boolean) =>
                  setFormData({
                    ...formData,
                    stockStatus: { ...formData.stockStatus, inStock: checked },
                  })
                }
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Size Options (Visible: Dropdown selector)</span>
            <Button
              type="button"
              onClick={addSizeOption}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.sizeOptions.map((option, index) => (
            <div key={index} className="flex gap-2 items-start p-4 border rounded">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateSizeOption(index, 'label', e.target.value)}
                  placeholder="Label (e.g., King Size)"
                />
                <Input
                  value={option.value}
                  onChange={(e) => updateSizeOption(index, 'value', e.target.value)}
                  placeholder="Value (e.g., 72x84)"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={option.inStock}
                    onCheckedChange={(checked: boolean) =>
                      updateSizeOption(index, 'inStock', checked)
                    }
                  />
                  <Label>In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={option.isDefault || false}
                    onCheckedChange={(checked: boolean) =>
                      updateSizeOption(index, 'isDefault', checked)
                    }
                  />
                  <Label>Default</Label>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => removeSizeOption(index)}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Offers (Visible: Savings card with expandable list)</span>
            <Button type="button" onClick={addOffer} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.offers.map((offer, index) => (
            <div key={index} className="p-4 border rounded space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Offer #{index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeOffer(index)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={offer.title}
                onChange={(e) => updateOffer(index, 'title', e.target.value)}
                placeholder="Offer Title (e.g., Bank Offer)"
              />
              <Textarea
                value={offer.description}
                onChange={(e) => updateOffer(index, 'description', e.target.value)}
                placeholder="Offer Description"
                rows={2}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Service Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Service Highlights (Visible: Icon cards below product)</span>
            <Button
              type="button"
              onClick={addServiceHighlight}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.serviceHighlights.map((highlight, index) => (
            <div key={index} className="p-4 border rounded space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Highlight #{index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeServiceHighlight(index)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={highlight.title}
                onChange={(e) =>
                  updateServiceHighlight(index, 'title', e.target.value)
                }
                placeholder="Service Title (e.g., Free Installation)"
              />
              <Textarea
                value={highlight.description}
                onChange={(e) =>
                  updateServiceHighlight(index, 'description', e.target.value)
                }
                placeholder="Service Description"
                rows={2}
              />
              <Input
                value={highlight.icon}
                onChange={(e) =>
                  updateServiceHighlight(index, 'icon', e.target.value)
                }
                placeholder="Icon name (e.g., truck, shield-check, warranty)"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Product Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Product Specifications (Visible: Specifications section)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Dimensions (in cm)</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <Input
                type="number"
                value={formData.dimensions.w}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      w: Number(e.target.value),
                    },
                  })
                }
                placeholder="Width"
              />
              <Input
                type="number"
                value={formData.dimensions.h}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      h: Number(e.target.value),
                    },
                  })
                }
                placeholder="Height"
              />
              <Input
                type="number"
                value={formData.dimensions.d}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      d: Number(e.target.value),
                    },
                  })
                }
                placeholder="Depth"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Materials</Label>
              <Button
                type="button"
                onClick={addMaterial}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={material}
                    onChange={(e) => updateMaterial(index, e.target.value)}
                    placeholder="e.g., Solid Wood, Premium Fabric"
                  />
                  {formData.materials.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sections (Features) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Features Sections (Visible: Accordion sections)</span>
            <Button
              type="button"
              onClick={addDetailSection}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.detailSections.map((section, sectionIndex) => (
            <div key={section.id} className="p-4 border rounded space-y-3">
              <div className="flex justify-between items-start">
                <Input
                  value={section.title}
                  onChange={(e) =>
                    updateDetailSection(sectionIndex, 'title', e.target.value)
                  }
                  placeholder="Section Title (e.g., Description, Features)"
                  className="max-w-md"
                />
                <Button
                  type="button"
                  onClick={() => removeDetailSection(sectionIndex)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between">
                  <Label>Content Points</Label>
                  <Button
                    type="button"
                    onClick={() => addDetailSectionContent(sectionIndex)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Point
                  </Button>
                </div>
                {section.content.map((point, contentIndex) => (
                  <div key={contentIndex} className="flex gap-2">
                    <Textarea
                      value={point}
                      onChange={(e) =>
                        updateDetailSectionContent(
                          sectionIndex,
                          contentIndex,
                          e.target.value
                        )
                      }
                      placeholder="Content point"
                      rows={2}
                    />
                    {section.content.length > 1 && (
                      <Button
                        type="button"
                        onClick={() =>
                          removeDetailSectionContent(sectionIndex, contentIndex)
                        }
                        size="sm"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Care Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Care Instructions (Visible: Care instructions section)</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="longDescription">Long Description</Label>
          <Textarea
            id="longDescription"
            value={formData.longDescription}
            onChange={(e) =>
              setFormData({ ...formData, longDescription: e.target.value })
            }
            rows={4}
            placeholder="Detailed care instructions for the product"
          />
        </CardContent>
      </Card>

      {/* Warranty */}
      <Card>
        <CardHeader>
          <CardTitle>Warranty (Visible: Warranty section - Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="warrantyTitle">Warranty Title</Label>
            <Input
              id="warrantyTitle"
              value={formData.warranty?.title || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  warranty: {
                    title: e.target.value,
                    description: formData.warranty?.description || "",
                  },
                })
              }
              placeholder="e.g., 10 Year Warranty"
            />
          </div>
          <div>
            <Label htmlFor="warrantyDescription">Warranty Description</Label>
            <Textarea
              id="warrantyDescription"
              value={formData.warranty?.description || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  warranty: {
                    title: formData.warranty?.title || "",
                    description: e.target.value,
                  },
                })
              }
              rows={3}
              placeholder="Warranty details"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>FAQs (Visible: FAQs section)</span>
            <Button type="button" onClick={addFaq} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.faqs.map((faq, index) => (
            <div key={faq.id} className="p-4 border rounded space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">FAQ #{index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeFaq(index)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={faq.question}
                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                placeholder="Question"
              />
              <Textarea
                value={faq.answer}
                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                placeholder="Answer"
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Check */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Check (Visible: Pincode input section)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryPlaceholder">Placeholder Text</Label>
              <Input
                id="deliveryPlaceholder"
                value={formData.delivery?.placeholder || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery: {
                      ...formData.delivery,
                      placeholder: e.target.value,
                      ctaLabel: formData.delivery?.ctaLabel || "Check",
                      helperText: formData.delivery?.helperText || "",
                    },
                  })
                }
                placeholder="Enter pincode"
              />
            </div>
            <div>
              <Label htmlFor="deliveryCtaLabel">Button Label</Label>
              <Input
                id="deliveryCtaLabel"
                value={formData.delivery?.ctaLabel || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery: {
                      ...formData.delivery,
                      placeholder: formData.delivery?.placeholder || "Enter pincode",
                      ctaLabel: e.target.value,
                      helperText: formData.delivery?.helperText || "",
                    },
                  })
                }
                placeholder="Check"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end sticky bottom-0 bg-white p-4 border-t">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
