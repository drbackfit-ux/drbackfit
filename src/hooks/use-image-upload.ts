"use client";

import { useState } from 'react';
import { cloudinaryService, CloudinaryUploadResult } from '@/lib/cloudinary';

export interface UseImageUploadResult {
  uploadImages: (files: File[]) => Promise<string[]>;
  deleteImage: (url: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useImageUpload = (): UseImageUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadResults: CloudinaryUploadResult[] = [];
      
      // Upload images one by one to track progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }

        const result = await cloudinaryService.uploadImage(file);
        uploadResults.push(result);
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      const imageUrls = uploadResults.map(result => result.secure_url);
      return imageUrls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (url: string): Promise<void> => {
    try {
      const publicId = cloudinaryService.extractPublicId(url);
      if (!publicId) {
        throw new Error('Invalid image URL');
      }

      await cloudinaryService.deleteImage(publicId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    uploadImages,
    deleteImage,
    isUploading,
    uploadProgress,
    error,
  };
};
