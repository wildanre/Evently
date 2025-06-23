"use client";

import { Button } from "@/components/ui/button";
import { Upload, PenLine, ChevronDown } from "lucide-react";

interface EventImageUploadProps {
  onImageUpload?: () => void;
  onThemeChange?: () => void;
}

export function EventImageUpload({
  onImageUpload,
  onThemeChange,
}: EventImageUploadProps) {
  return (
    <div className="relative flex flex-col">
      <div className="aspect-square bg-[#0f0f1a] rounded-lg overflow-hidden flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-3 w-4/5 h-4/5">
            <div className="bg-purple-500/50 rounded-full m-1"></div>
            <div className="bg-blue-400/50 rounded-full m-1"></div>
            <div className="bg-purple-500/50 rounded-full m-1"></div>
            <div className="bg-blue-400/50 rounded-full m-1"></div>
            <div className="bg-purple-500/80 rounded-full m-1 flex items-center justify-center">
              <div className="bg-blue-400/80 rounded-full w-3/4 h-3/4"></div>
            </div>
            <div className="bg-blue-400/50 rounded-full m-1"></div>
            <div className="bg-purple-500/50 rounded-full m-1"></div>
            <div className="bg-blue-400/50 rounded-full m-1"></div>
            <div className="bg-purple-500/50 rounded-full m-1"></div>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 right-4 bg-black/50 border-gray-700 text-white rounded-full"
          onClick={onImageUpload}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      {/* Theme selector */}
      <div className="mt-4 flex items-center gap-2 bg-[#1a1a2e] p-3 rounded-lg">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
          <PenLine className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Theme</p>
          <p className="font-medium text-white">Warp</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400"
          onClick={onThemeChange}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
