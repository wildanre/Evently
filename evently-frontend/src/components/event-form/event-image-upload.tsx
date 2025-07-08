"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateImageFile, getCloudinaryConfig, generateUniqueFileName, formatFileSize } from "@/lib/image-utils";

interface EventImageUploadProps {
  imageUrl?: string;
  onImageUpload?: (url: string) => void;
}

export function EventImageUpload({
  imageUrl,
  onImageUpload,
}: EventImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      const config = getCloudinaryConfig();
      const formData = new FormData();
      
      // Generate unique filename
      const uniqueFileName = generateUniqueFileName(file.name);
      
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);
      formData.append('public_id', uniqueFileName);
      formData.append('folder', 'evently/events');

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const uploadedUrl = await uploadToCloudinary(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onImageUpload?.(uploadedUrl);
      toast.success('Image uploaded successfully', {
        description: `File: ${file.name} (${formatFileSize(file.size)})`
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', {
        description: error.message || 'Please check your Cloudinary configuration and try again.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadClick = () => {
    try {
      getCloudinaryConfig(); // Validate config exists
      fileInputRef.current?.click();
    } catch (error: any) {
      toast.error('Configuration Error', {
        description: error.message,
        action: {
          label: 'Setup Guide',
          onClick: () => console.log('Check CLOUDINARY_SETUP.md for configuration help')
        }
      });
    }
  };

  const handleRemoveImage = () => {
    onImageUpload?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Image removed');
  };

  return (
    <div className="relative flex flex-col">
      <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-[#0f0f1a] dark:to-[#1a1a2e] rounded-lg overflow-hidden flex items-center justify-center relative border border-gray-200 dark:border-gray-700">
        {imageUrl ? (
          // Display uploaded image
          <>
            <img 
              src={imageUrl} 
              alt="Event banner" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image load error:', e);
                toast.error('Failed to load image');
                onImageUpload?.('');
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </>
        ) : (
          // Display placeholder with upload button
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 grid-rows-3 w-4/5 h-4/5 mb-4">
                <div className="bg-blue-500/40 dark:bg-purple-500/50 rounded-full m-1"></div>
                <div className="bg-purple-500/40 dark:bg-blue-400/50 rounded-full m-1"></div>
                <div className="bg-blue-500/40 dark:bg-purple-500/50 rounded-full m-1"></div>
                <div className="bg-purple-500/40 dark:bg-blue-400/50 rounded-full m-1"></div>
                <div className="bg-blue-600/60 dark:bg-purple-500/80 rounded-full m-1 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div className="bg-purple-500/40 dark:bg-blue-400/50 rounded-full m-1"></div>
                <div className="bg-blue-500/40 dark:bg-purple-500/50 rounded-full m-1"></div>
                <div className="bg-purple-500/40 dark:bg-blue-400/50 rounded-full m-1"></div>
                <div className="bg-blue-500/40 dark:bg-purple-500/50 rounded-full m-1"></div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-blue-50 dark:hover:bg-gray-800"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 text-blue-600" />
              )}
            </Button>
          </>
        )}
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/50 p-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-gray-600 dark:text-gray-400 min-w-[3rem]">
                {Math.round(uploadProgress)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {imageUrl ? 'Event Image' : 'Upload Event Image'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {imageUrl ? 'Click X to remove image' : 'JPG, PNG up to 10MB. Recommended: 1200x630px'}
            </p>
          </div>
          {!imageUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Browse'}
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
