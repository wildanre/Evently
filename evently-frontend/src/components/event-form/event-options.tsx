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
      <p className="text-sm font-medium text-white">Event Options</p>

      <TicketDialog
        open={ticketsOpen}
        onOpenChange={onTicketsOpenChange}
        ticketType={ticketType}
        ticketPrice={ticketPrice}
        onTicketTypeChange={onTicketTypeChange}
        onTicketPriceChange={onTicketPriceChange}
        onSave={onTicketsSave}
      />

      <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-white">Require Approval</span>
        </div>
        <Switch
          checked={requireApproval}
          onCheckedChange={onRequireApprovalChange}
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
