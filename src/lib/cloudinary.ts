"use client";

import { clientEnv } from '@/config/client-env';

// Cloudinary utility functions for image upload
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export class CloudinaryService {
  private cloudName: string;
  
  constructor() {
    this.cloudName = clientEnv.CLOUDINARY.CLOUD_NAME || '';
    
    if (!this.cloudName) {
      console.warn('Cloudinary cloud name is not configured. Image upload will fail.');
    }
  }

  // Upload image to Cloudinary using unsigned upload
  async uploadImage(
    file: File, 
    uploadPreset: string = 'drbackfit'
  ): Promise<CloudinaryUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'products'); // Organize images in products folder
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload multiple images
  async uploadMultipleImages(
    files: File[], 
    uploadPreset: string = 'drbackfit'
  ): Promise<CloudinaryUploadResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file, uploadPreset)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<void> {
    try {
      // This requires server-side implementation for security
      // We'll create an API endpoint for this
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw new Error('Failed to delete image');
    }
  }

  // Generate optimized image URL
  generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    let transformation = `f_${format},q_${quality}`;
    
    if (width && height) {
      transformation += `,w_${width},h_${height},c_fill`;
    } else if (width) {
      transformation += `,w_${width}`;
    } else if (height) {
      transformation += `,h_${height}`;
    }
    
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}`;
  }

  // Extract public_id from Cloudinary URL
  extractPublicId(url: string): string | null {
    try {
      const regex = new RegExp(`https://res\\.cloudinary\\.com/${this.cloudName}/image/upload/(?:v\\d+/)?(.+?)(?:\\.\\w+)?$`);
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
