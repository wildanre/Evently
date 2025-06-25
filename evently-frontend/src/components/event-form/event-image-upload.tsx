"use client";

import { Button } from "@/components/ui/button";
import { Upload, PenLine, ChevronDown } from "lucide-react";

interface EventImageUploadProps {
  imageUrl?: string;
  onImageUpload?: (url: string) => void;
  onThemeChange?: () => void;
}

export function EventImageUpload({
  imageUrl,
  onImageUpload,
  onThemeChange,
}: EventImageUploadProps) {
  return (
    <div className="relative flex flex-col">
      <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-[#0f0f1a] dark:to-[#1a1a2e] rounded-lg overflow-hidden flex items-center justify-center relative border border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-3 w-4/5 h-4/5">
            <div className="bg-blue-500/40 dark:bg-purple-500/50 rounded-full m-1"></div>
            <div className="bg-purple-500/40 dark:bg-blue-400/50 rounded-full m-1"></div>
            <div className="bg-blue-500/40 dark:bg-purple-500/50 rounded-full m-1"></div>
            <div className="bg-purple-500/40 dark:bg-blue-400/50 rounded-full m-1"></div>
            <div className="bg-blue-600/60 dark:bg-purple-500/80 rounded-full m-1 flex items-center justify-center">
              <div className="bg-purple-600/60 dark:bg-blue-400/80 rounded-full w-3/4 h-3/4"></div>
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
          onClick={() => {
            // For now, simulate image upload with a placeholder URL
            const placeholderUrl = "https://via.placeholder.com/400x400";
            onImageUpload?.(placeholderUrl);
          }}
        >
          <Upload className="h-4 w-4 text-blue-600" />
        </Button>
      </div>

      {/* Theme selector */}
      <div className="mt-4 flex items-center gap-2 bg-gray-100 dark:bg-[#1a1a2e] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
          <PenLine className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Theme</p>
          <p className="font-medium text-gray-900 dark:text-white">Warp</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600"
          onClick={onThemeChange}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
