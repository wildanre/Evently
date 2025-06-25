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
        <div className="flex items-center gap-2 bg-neutral-800 border rounded-md px-3 py-1.5">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-white">Personal Calendar</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>

        <Select value={visibility} onValueChange={onVisibilityChange}>
          <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700">
            <div className="flex items-center gap-2">
              {visibility === "public" ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
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
          className="bg-transparent border-none px-0 h-auto py-6 text-2xl font-semibold text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
        />
        {!eventName.trim() && (
          <div className="absolute -bottom-1 left-0 text-xs text-red-400">
            Event name is required
          </div>
        )}
      </div>
    </>
  );
}
