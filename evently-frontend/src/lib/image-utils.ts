// Image validation utilities for Cloudinary upload

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): ImageValidationResult => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file (JPG, PNG, WebP, etc.)' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 10MB' };
  }

  // Check if it's a valid image format
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Unsupported image format. Please use JPG, PNG, WebP, GIF, or SVG.' };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create image preview'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const getCloudinaryConfig = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Please check environment variables.');
  }

  return {
    cloudName,
    uploadPreset,
    apiUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  };
};

// Generate a unique filename for upload
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  
  return `evently_event_${timestamp}_${randomString}.${extension}`;
};
