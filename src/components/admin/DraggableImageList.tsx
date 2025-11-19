"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableImageListProps {
  images: string[];
  onReorder: (newOrder: string[]) => void;
  onRemove: (index: number) => void;
  className?: string;
}

export function DraggableImageList({
  images,
  onReorder,
  onRemove,
  className,
}: DraggableImageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    onReorder(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {images.map((url, index) => (
        <div
          key={`${url}-${index}`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative group cursor-move transition-all duration-200",
            draggedIndex === index && "opacity-50 scale-95",
            dragOverIndex === index && "ring-2 ring-primary ring-offset-2"
          )}
        >
          {/* Position Indicator */}
          <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold shadow-md">
            {index + 1}
          </div>

          {/* Drag Handle Indicator */}
          <div className="absolute top-1 right-1 z-10 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-white" />
          </div>

          {/* Image */}
          <div className="relative w-full h-32 rounded-lg border-2 border-border overflow-hidden bg-muted">
            <Image
              src={url}
              alt={`Product ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          {/* Remove Button */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full p-0 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
