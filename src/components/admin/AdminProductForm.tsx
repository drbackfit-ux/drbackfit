"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Plus,
  Minus
} from 'lucide-react';
import {
  ProductInput,
  PRODUCT_SECTIONS,
  PRODUCT_SECTION_LABELS,
  PRODUCT_CATEGORIES,
  EcommerceProduct
} from '@/models/EcommerceProduct';
import { useProductManagement } from '@/hooks/use-product-management';
import { useImageUpload } from '@/hooks/use-image-upload';
import { toast } from 'sonner';
import { DraggableImageList } from '@/components/admin/DraggableImageList';

// Form validation schema
const ProductFormSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  stock: z.number().min(0, 'Stock must be a non-negative number'),
  section: z.enum(['featured', 'trending', 'new_arrival', 'offers', 'home_page']),
  isActive: z.boolean().default(true),
  sku: z.string().optional(),
  slug: z.string().optional(),
  materials: z.array(z.string()).default([]),
  dimensions: z.object({
    w: z.number().positive(),
    h: z.number().positive(),
    d: z.number().positive(),
  }).optional(),
  leadTimeDays: z.number().positive().optional(),
  isCustomAllowed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

type ProductFormData = z.infer<typeof ProductFormSchema>;

interface AdminProductFormProps {
  product?: EcommerceProduct;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdminProductForm({ product, onSuccess, onCancel }: AdminProductFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(product?.imageUrls || []);
  const [currentMaterial, setCurrentMaterial] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addProduct, updateProduct, isLoading } = useProductManagement();
  const { isUploading, uploadProgress } = useImageUpload();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      shortDescription: product?.shortDescription || '',
      category: product?.category || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      section: product?.section || 'featured',
      isActive: product?.isActive ?? true,
      sku: product?.sku || '',
      slug: product?.slug || '',
      materials: product?.materials || [],
      dimensions: product?.dimensions || { w: 0, h: 0, d: 0 },
      leadTimeDays: product?.leadTimeDays || 14,
      isCustomAllowed: product?.isCustomAllowed || false,
      tags: product?.tags || [],
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);

      // Generate preview URLs
      validFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrls(prev => [...prev, previewUrl]);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke object URL if it's a local preview
      if (prev[index].startsWith('blob:')) {
        URL.revokeObjectURL(prev[index]);
      }
      return newUrls;
    });
  };

  const reorderImages = (newOrder: string[]) => {
    // Find the mapping between preview URLs and file indices
    const reorderedFiles: File[] = [];

    newOrder.forEach(url => {
      const originalIndex = imagePreviewUrls.indexOf(url);
      if (originalIndex !== -1 && selectedImages[originalIndex]) {
        reorderedFiles.push(selectedImages[originalIndex]);
      }
    });

    setImagePreviewUrls(newOrder);
    setSelectedImages(reorderedFiles);
  };

  const addMaterial = () => {
    if (currentMaterial.trim()) {
      const currentMaterials = form.getValues('materials');
      if (!currentMaterials.includes(currentMaterial.trim())) {
        form.setValue('materials', [...currentMaterials, currentMaterial.trim()]);
        setCurrentMaterial('');
      }
    }
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues('materials');
    form.setValue('materials', currentMaterials.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim()) {
      const currentTags = form.getValues('tags');
      if (!currentTags.includes(currentTag.trim())) {
        form.setValue('tags', [...currentTags, currentTag.trim()]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (!product && selectedImages.length === 0 && imagePreviewUrls.length === 0) {
        toast.error('At least one product image is required');
        return;
      }

      if (product) {
        // Update existing product
        await updateProduct(product.id, data as any, selectedImages);
        toast.success('Product updated successfully');
      } else {
        // Add new product
        await addProduct(data as ProductInput, selectedImages);
        toast.success('Product added successfully');
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter detailed product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brief description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Section */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PRODUCT_CATEGORIES).map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Section *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select display section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRODUCT_SECTION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price * ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock and Lead Time */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadTimeDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Time (Days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="14"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Images */}
            <div className="space-y-4">
              <Label>Product Images</Label>

              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Select Images'}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Uploading images... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Image Previews with Drag-and-Drop */}
              {imagePreviewUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag images to reorder them. The first image will be the main product image.
                  </p>
                  <DraggableImageList
                    images={imagePreviewUrls}
                    onReorder={reorderImages}
                    onRemove={removeImage}
                  />
                </div>
              )}
            </div>

            {/* Materials */}
            <div className="space-y-4">
              <Label>Materials</Label>

              <div className="flex gap-2">
                <Input
                  value={currentMaterial}
                  onChange={(e) => setCurrentMaterial(e.target.value)}
                  placeholder="Add material"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                />
                <Button type="button" onClick={addMaterial} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.watch('materials').map((material, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {material}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeMaterial(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label>Tags</Label>

              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.watch('tags').map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeTag(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <Label>Dimensions (cm)</Label>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="dimensions.w"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Width"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions.h"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Height"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions.d"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depth</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Depth"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="isCustomAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Custom Orders</FormLabel>
                      <FormDescription>
                        Allow customers to request custom modifications
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Product</FormLabel>
                      <FormDescription>
                        Display this product on the website
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {product ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  product ? 'Update Product' : 'Add Product'
                )}
              </Button>

              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
