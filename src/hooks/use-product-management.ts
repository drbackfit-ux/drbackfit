"use client";

import { useState } from 'react';
import { firestoreService } from '@/lib/firestore';
import { EcommerceProduct, ProductInput, ProductUpdate } from '@/models/EcommerceProduct';
import { useImageUpload } from './use-image-upload';

export interface UseProductManagementResult {
  products: EcommerceProduct[];
  isLoading: boolean;
  error: string | null;
  addProduct: (productData: ProductInput, imageFiles: File[]) => Promise<string>;
  updateProduct: (id: string, updates: Partial<ProductUpdate>, newImageFiles?: File[]) => Promise<void>;
  deleteProduct: (id: string, imageUrls?: string[]) => Promise<void>;
  loadProducts: () => Promise<void>;
  loadProductsBySection: (section: string) => Promise<void>;
}

export const useProductManagement = (): UseProductManagementResult => {
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadImages, deleteImage } = useImageUpload();

  const loadProducts = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedProducts = await firestoreService.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsBySection = async (section: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedProducts = await firestoreService.getProductsBySection(section as any);
      setProducts(fetchedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load products for section: ${section}`;
      setError(errorMessage);
      console.error('Error loading products by section:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (productData: ProductInput, imageFiles: File[]): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload images first
      const imageUrls = await uploadImages(imageFiles);
      
      if (imageUrls.length === 0) {
        throw new Error('At least one product image is required');
      }

      // Add product with image URLs
      const productId = await firestoreService.addProduct({
        ...productData,
        imageUrls,
      });

      // Reload products to get the updated list
      await loadProducts();

      return productId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product';
      setError(errorMessage);
      console.error('Error adding product:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (
    id: string, 
    updates: Partial<ProductUpdate>, 
    newImageFiles?: File[]
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let finalUpdates = { ...updates };

      // Upload new images if provided
      if (newImageFiles && newImageFiles.length > 0) {
        const newImageUrls = await uploadImages(newImageFiles);
        
        // Combine with existing images or replace them
        if (finalUpdates.imageUrls) {
          finalUpdates.imageUrls = [...finalUpdates.imageUrls, ...newImageUrls];
        } else {
          finalUpdates.imageUrls = newImageUrls;
        }
      }

      // Update product in Firestore
      await firestoreService.updateProduct(id, finalUpdates);

      // Reload products to get the updated list
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      console.error('Error updating product:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string, imageUrls?: string[]): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Delete images from Cloudinary first (if provided)
      if (imageUrls && imageUrls.length > 0) {
        await Promise.all(imageUrls.map(url => 
          deleteImage(url).catch(err => 
            console.warn(`Failed to delete image ${url}:`, err)
          )
        ));
      }

      // Delete product from Firestore
      await firestoreService.deleteProduct(id);

      // Reload products to get the updated list
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      console.error('Error deleting product:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    loadProducts,
    loadProductsBySection,
  };
};
