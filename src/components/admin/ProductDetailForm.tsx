"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import type { ProductDetail } from "@/models/ProductDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DraggableImageList } from "@/components/admin/DraggableImageList";

interface ProductDetailFormProps {
  product?: ProductDetail;
  onSubmit: (product: Partial<ProductDetail>) => void;
  onCancel: () => void;
}

export function ProductDetailForm({
  product,
  onSubmit,
  onCancel,
}: ProductDetailFormProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    title: product?.title || "",
    subtitle: product?.subtitle || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    longDescription: product?.longDescription || "",
    category: product?.category || "beds",

    // Images
    images: product?.images || [""],

    // Dimensions
    dimensions: product?.dimensions || { w: 0, h: 0, d: 0 },

    // Pricing
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

    // Rating
    rating: product?.rating || { average: 4.5, count: 0 },

    // Stock Status
    stockStatus: product?.stockStatus || {
      label: "In Stock",
      subLabel: "Ready to ship",
      inStock: true as boolean,
    },

    // Product Details
    priceEstimateMin: product?.priceEstimateMin || 0,
    priceEstimateMax: product?.priceEstimateMax || 0,
    materials: product?.materials || [""],
    leadTimeDays: product?.leadTimeDays || 30,
    isCustomAllowed: (product?.isCustomAllowed ?? true) as boolean,
    tags: product?.tags || [""],

    // Size Options
    sizeOptions: product?.sizeOptions || [],

    // Offers
    offers: product?.offers || [],

    // Service Highlights
    serviceHighlights: product?.serviceHighlights || [],

    // Detail Sections
    detailSections: product?.detailSections || [],

    // Overview Points
    overviewPoints: product?.overviewPoints || [""],

    // FAQs
    faqs: product?.faqs || [],

    // Video Shopping
    videoShopping: product?.videoShopping || {
      title: "Shop via Video Call",
      description: "Get personalized assistance",
      ctaLabel: "Book Now",
      ctaHref: "/contact",
      imageUrl: "",
    },

    // Warranty
    warranty: product?.warranty || undefined,

    // Breadcrumbs
    breadcrumbs: product?.breadcrumbs || [
      { label: "Home", href: "/" },
      { label: "Products", href: "/catalog" },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Partial<ProductDetail> = {
      id: product?.id,
      ...formData,
      images: formData.images.filter(img => img.trim()),
      materials: formData.materials.filter(m => m.trim()),
      tags: formData.tags.filter(t => t.trim()),
      overviewPoints: formData.overviewPoints.filter(p => p.trim()),
    };

    onSubmit(productData);
  };

  // Image Management
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

  // Array field helpers
  const addArrayField = (field: 'materials' | 'tags' | 'overviewPoints') => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const updateArrayField = (field: 'materials' | 'tags' | 'overviewPoints', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayField = (field: 'materials' | 'tags' | 'overviewPoints', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // Size Options
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

  // Offers
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

  // Service Highlights
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

  // Detail Sections
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

  // FAQs
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
              <Label htmlFor="subtitle">Subtitle *</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="longDescription">Long Description *</Label>
            <Textarea
              id="longDescription"
              value={formData.longDescription}
              onChange={(e) =>
                setFormData({ ...formData, longDescription: e.target.value })
              }
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Images</span>
            <Button type="button" onClick={addImage} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image URL Inputs */}
          <div className="space-y-3">
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeImage(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Image Previews with Drag-and-Drop */}
          {formData.images.filter(img => img.trim()).length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">Image Preview & Ordering</p>
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
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      salePrice: Number(e.target.value),
                    },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="discountPercent">Discount %</Label>
              <Input
                id="discountPercent"
                type="number"
                value={formData.pricing.discountPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      discountPercent: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceEstimateMin">Price Estimate Min (₹)</Label>
              <Input
                id="priceEstimateMin"
                type="number"
                value={formData.priceEstimateMin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceEstimateMin: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="priceEstimateMax">Price Estimate Max (₹)</Label>
              <Input
                id="priceEstimateMax"
                type="number"
                value={formData.priceEstimateMax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceEstimateMax: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="couponCode">Coupon Code</Label>
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
            <Label htmlFor="emiText">EMI Text</Label>
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

      {/* Dimensions & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
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
              />
            </div>
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
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
              />
            </div>
            <div>
              <Label htmlFor="depth">Depth (inches)</Label>
              <Input
                id="depth"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadTimeDays">Lead Time (Days)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                value={formData.leadTimeDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leadTimeDays: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isCustomAllowed"
                checked={formData.isCustomAllowed}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isCustomAllowed: checked })
                }
              />
              <Label htmlFor="isCustomAllowed">Allow Customization</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Materials</span>
            <Button
              type="button"
              onClick={() => addArrayField('materials')}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.materials.map((material, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={material}
                onChange={(e) => updateArrayField('materials', index, e.target.value)}
                placeholder="e.g., Solid Wood, Premium Fabric"
              />
              {formData.materials.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeArrayField('materials', index)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tags</span>
            <Button
              type="button"
              onClick={() => addArrayField('tags')}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={tag}
                onChange={(e) => updateArrayField('tags', index, e.target.value)}
                placeholder="e.g., trending, handmade, luxury"
              />
              {formData.tags.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeArrayField('tags', index)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Size Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Size Options</span>
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
                    onCheckedChange={(checked) =>
                      updateSizeOption(index, 'inStock', checked)
                    }
                  />
                  <Label>In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={option.isDefault || false}
                    onCheckedChange={(checked) =>
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
            <span>Offers</span>
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
                placeholder="Offer Title"
              />
              <Textarea
                value={offer.description}
                onChange={(e) => updateOffer(index, 'description', e.target.value)}
                placeholder="Offer Description"
                rows={2}
              />
              <Input
                value={offer.icon || ""}
                onChange={(e) => updateOffer(index, 'icon', e.target.value)}
                placeholder="Icon (lucide icon name)"
              />
              <Input
                value={offer.ctaLabel || ""}
                onChange={(e) => updateOffer(index, 'ctaLabel', e.target.value)}
                placeholder="CTA Label (optional)"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Service Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Service Highlights</span>
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
                placeholder="Service Title"
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
                placeholder="Icon (lucide icon name)"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detail Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detail Sections</span>
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
                  placeholder="Section Title"
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

      {/* Overview Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overview Points</span>
            <Button
              type="button"
              onClick={() => addArrayField('overviewPoints')}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Point
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.overviewPoints.map((point, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={point}
                onChange={(e) =>
                  updateArrayField('overviewPoints', index, e.target.value)
                }
                placeholder="Key overview point"
                rows={2}
              />
              {formData.overviewPoints.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeArrayField('overviewPoints', index)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>FAQs</span>
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

      {/* Stock Status & Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Stock & Rating</CardTitle>
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
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="inStock"
                checked={formData.stockStatus.inStock}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    stockStatus: { ...formData.stockStatus, inStock: checked },
                  })
                }
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating (0-5)</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="ratingCount">Rating Count</Label>
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
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Shopping */}
      <Card>
        <CardHeader>
          <CardTitle>Video Shopping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={formData.videoShopping.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                videoShopping: {
                  ...formData.videoShopping,
                  title: e.target.value,
                },
              })
            }
            placeholder="Title"
          />
          <Textarea
            value={formData.videoShopping.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                videoShopping: {
                  ...formData.videoShopping,
                  description: e.target.value,
                },
              })
            }
            placeholder="Description"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={formData.videoShopping.ctaLabel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  videoShopping: {
                    ...formData.videoShopping,
                    ctaLabel: e.target.value,
                  },
                })
              }
              placeholder="CTA Label"
            />
            <Input
              value={formData.videoShopping.ctaHref}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  videoShopping: {
                    ...formData.videoShopping,
                    ctaHref: e.target.value,
                  },
                })
              }
              placeholder="CTA URL"
            />
          </div>
          <Input
            value={formData.videoShopping.imageUrl}
            onChange={(e) =>
              setFormData({
                ...formData,
                videoShopping: {
                  ...formData.videoShopping,
                  imageUrl: e.target.value,
                },
              })
            }
            placeholder="Image URL"
          />
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
