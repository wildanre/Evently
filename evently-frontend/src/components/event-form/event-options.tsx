"use client";

import { Switch } from "@/components/ui/switch";
import { Users } from "lucide-react";
import { TicketDialog } from "./ticket-dialog";
import { CapacityDialog } from "./capacity-dialog";

interface EventOptionsProps {
  requireApproval: boolean;
  onRequireApprovalChange: (value: boolean) => void;
  ticketType: string;
  ticketPrice: string;
  ticketsOpen: boolean;
  onTicketsOpenChange: (open: boolean) => void;
  onTicketTypeChange: (type: string) => void;
  onTicketPriceChange: (price: string) => void;
  onTicketsSave: (data: { type: string; price: string }) => void;
  capacity: string;
  capacityLimit: string;
  capacityOpen: boolean;
  onCapacityOpenChange: (open: boolean) => void;
  onCapacityChange: (capacity: string) => void;
  onCapacityLimitChange: (limit: string) => void;
  onCapacitySave: (data: { capacity: string; limit: string }) => void;
  isFeatured?: boolean;
  onIsFeaturedChange?: (value: boolean) => void;
  isOnline?: boolean;
  onIsOnlineChange?: (value: boolean) => void;
  meetingUrl?: string;
  onMeetingUrlChange?: (url: string) => void;
}

export function EventOptions({
  requireApproval,
  onRequireApprovalChange,
  ticketType,
  ticketPrice,
  ticketsOpen,
  onTicketsOpenChange,
  onTicketTypeChange,
  onTicketPriceChange,
  onTicketsSave,
  capacity,
  capacityLimit,
  capacityOpen,
  onCapacityOpenChange,
  onCapacityChange,
  onCapacityLimitChange,
  onCapacitySave,
  isFeatured = false,
  onIsFeaturedChange,
  isOnline = false,
  onIsOnlineChange,
  meetingUrl = '',
  onMeetingUrlChange,
}: EventOptionsProps) {
  return (
    <div className="space-y-4">
      <TicketDialog
        open={ticketsOpen}
        onOpenChange={onTicketsOpenChange}
        ticketType={ticketType}
        ticketPrice={ticketPrice}
        onTicketTypeChange={onTicketTypeChange}
        onTicketPriceChange={onTicketPriceChange}
        onSave={onTicketsSave}
      />

      <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1a1a2e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-gray-900 dark:text-white font-medium">Require Approval</span>
        </div>
        <Switch
          checked={requireApproval}
          onCheckedChange={onRequireApprovalChange}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
      
      {onIsFeaturedChange && (
        <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
          <span className="text-white">Featured Event</span>
          <Switch
            checked={isFeatured}
            onCheckedChange={onIsFeaturedChange}
          />
        </div>
      )}
      
      {onIsOnlineChange && (
        <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
          <span className="text-white">Online Event</span>
          <Switch
            checked={isOnline}
            onCheckedChange={onIsOnlineChange}
          />
        </div>
      )}
      
      {isOnline && onMeetingUrlChange && (
        <div className="bg-[#1a1a2e] rounded-md p-3">
          <label className="block text-sm font-medium text-white mb-2">Meeting URL</label>
          <input
            type="text"
            value={meetingUrl}
            onChange={(e) => onMeetingUrlChange(e.target.value)}
            className="w-full bg-[#2a2a3e] border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400"
            placeholder="https://..."
          />
        </div>
      )}

      <CapacityDialog
        open={capacityOpen}
        onOpenChange={onCapacityOpenChange}
        capacity={capacity}
        capacityLimit={capacityLimit}
        onCapacityChange={onCapacityChange}
        onCapacityLimitChange={onCapacityLimitChange}
        onSave={onCapacitySave}
      />
    </div>
  );
}
