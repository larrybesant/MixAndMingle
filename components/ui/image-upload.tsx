"use client";

import { useState, useRef } from 'react';
import { ImageUploadService } from '@/lib/services/image-upload-service';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUploadedAction: (url: string) => void;
  currentImage?: string;
  type: 'avatar' | 'banner';
  communityId?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageUploadedAction,
  currentImage,
  type,
  communityId,
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxDimensions = type === 'avatar' ? { width: 200, height: 200 } : { width: 800, height: 300 };
  const aspectRatio = type === 'avatar' ? 'aspect-square' : 'aspect-[8/3]';

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;

    try {
      setUploading(true);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Resize image before upload
      const resizedFile = await ImageUploadService.resizeImage(
        file,
        maxDimensions.width,
        maxDimensions.height,
        0.8
      );

      // Upload image
      const tempId = communityId || 'temp_' + Date.now();
      const imageUrl = await ImageUploadService.uploadCommunityImage(resizedFile, tempId, type);
      
      onImageUploadedAction(imageUrl);
      
      // Clean up preview
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image');
      
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative ${aspectRatio} w-full border-2 border-dashed border-gray-700 rounded-lg 
          overflow-hidden cursor-pointer transition-all duration-200 group
          ${dragOver ? 'border-purple-500 bg-purple-500/10' : 'hover:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={triggerFileSelect}
      >
        {displayImage ? (
          <>
            <Image
              src={displayImage}
              alt={`Community ${type}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-sm font-medium">Change {type}</div>
                <div className="text-xs opacity-80">Click or drag to replace</div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">
                {type === 'avatar' ? '👤' : '🖼️'}
              </div>
              <div className="text-sm font-medium">
                Upload {type === 'avatar' ? 'Avatar' : 'Banner'}
              </div>
              <div className="text-xs opacity-80">
                Click or drag image here
              </div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <div className="text-sm">Uploading...</div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="mt-2 text-xs text-gray-400">
        {type === 'avatar' ? 'Recommended: 200x200px' : 'Recommended: 800x300px'} • Max 5MB
      </div>
    </div>
  );
}
