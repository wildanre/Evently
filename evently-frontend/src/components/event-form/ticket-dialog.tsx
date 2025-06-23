"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ticket, Edit } from "lucide-react";

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketType: string;
  ticketPrice: string;
  onTicketTypeChange: (type: string) => void;
  onTicketPriceChange: (price: string) => void;
  onSave: (ticketData: { type: string; price: string }) => void;
}

export function TicketDialog({
  open,
  onOpenChange,
  ticketType,
  ticketPrice,
  onTicketTypeChange,
  onTicketPriceChange,
  onSave,
}: TicketDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type: ticketType, price: ticketPrice });
    onOpenChange(false);
  };

  return (
    <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
      <div className="flex items-center gap-3">
        <Ticket className="h-5 w-5 text-gray-400" />
        <span className="text-white">Tickets</span>
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-400">
              {ticketType === "free" ? "Free" : `$${ticketPrice || "0"}`}
            </span>
            <Edit className="h-4 w-4 text-gray-400" />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Ticket Configuration
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set up ticketing for your event. Choose between free or paid
              tickets.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              value={ticketType}
              onValueChange={onTicketTypeChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border border-neutral-700 rounded-lg p-3">
                <RadioGroupItem value="free" id="free-ticket" />
                <Label
                  htmlFor="free-ticket"
                  className="flex-1 cursor-pointer text-white"
                >
                  <div>
                    <p className="font-medium">Free Event</p>
                    <p className="text-sm text-gray-400">
                      No charge for attendees
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-neutral-700 rounded-lg p-3">
                <RadioGroupItem value="paid" id="paid-ticket" />
                <Label
                  htmlFor="paid-ticket"
                  className="flex-1 cursor-pointer text-white"
                >
                  <div>
                    <p className="font-medium">Paid Event</p>
                    <p className="text-sm text-gray-400">
                      Charge attendees for tickets
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {ticketType === "paid" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-price" className="text-white">
                    Ticket Price ($)
                  </Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticketPrice}
                    onChange={(e) => onTicketPriceChange(e.target.value)}
                    placeholder="0.00"
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Tickets</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
