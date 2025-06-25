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
