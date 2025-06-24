import { supabase } from '@/lib/supabase/client';

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'community-images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Initialize the storage bucket (call this once during setup)
  static async initializeBucket() {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((bucket: any) => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        // Create the bucket
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (error) {
          console.error('Error creating bucket:', error);
          throw error;
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error initializing bucket:', error);
      throw error;
    }
  }

  // Upload community avatar or banner
  static async uploadCommunityImage(
    file: File, 
    communityId: string, 
    type: 'avatar' | 'banner'
  ): Promise<string> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${communityId}/${type}_${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Upload post image
  static async uploadPostImage(file: File, communityId: string, postId: string): Promise<string> {
    try {
      this.validateFile(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${communityId}/posts/${postId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading post image:', error);
      throw error;
    }
  }

  // Delete image
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-2).join('/'); // Get community/file path

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      // Don't throw - deletion failures shouldn't break the app
    }
  }

  // Validate file before upload
  private static validateFile(file: File): void {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('File type not supported. Please use JPEG, PNG, WebP, or GIF');
    }
  }

  // Resize image (client-side) before upload
  static async resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
