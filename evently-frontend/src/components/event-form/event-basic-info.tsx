"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronDown, Globe, Lock } from "lucide-react";

interface EventBasicInfoProps {
  eventName: string;
  visibility: string;
  onEventNameChange: (name: string) => void;
  onVisibilityChange: (visibility: string) => void;
}

export function EventBasicInfo({
  eventName,
  visibility,
  onEventNameChange,
  onVisibilityChange,
}: EventBasicInfoProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 border rounded-lg px-3 py-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-700 dark:text-white font-medium">Personal Calendar</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>

        <Select value={visibility} onValueChange={onVisibilityChange}>
          <SelectTrigger className="w-32 bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              {visibility === "public" ? (
                <Globe className="h-4 w-4 text-blue-600" />
              ) : (
                <Lock className="h-4 w-4 text-blue-600" />
              )}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">
              <div className="flex items-center gap-2">
                Public
              </div>
            </SelectItem>
            <SelectItem value="private">
              <div className="flex items-center gap-2">
                Private
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Input
          placeholder="Event Name *"
          className="bg-transparent border-none px-0 h-auto py-6 text-2xl font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
        />
        {!eventName.trim() && (
          <div className="absolute -bottom-1 left-0 text-xs text-red-500">
            Event name is required
          </div>
        )}
      </div>
    </>
  );
}
