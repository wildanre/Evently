"use client";

import type React from "react";
import { useState } from "react";

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
import { PAYMENT_CONFIG, formatAmount } from "@/lib/payment-config";

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
  const [priceError, setPriceError] = useState<string>("");

  const handlePriceChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    // Clear previous errors
    setPriceError("");
    
    // Validate minimum amount
    if (value && numericValue > 0 && numericValue < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) {
      setPriceError(`Minimum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)}`);
    }
    
    // Validate maximum amount
    if (numericValue > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) {
      setPriceError(`Maximum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT)}`);
    }
    
    onTicketPriceChange(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before saving
    if (ticketType === "paid") {
      const numericPrice = parseFloat(ticketPrice) || 0;
      
      if (numericPrice < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) {
        setPriceError(`Minimum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)}`);
        return;
      }
      
      if (numericPrice > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) {
        setPriceError(`Maximum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT)}`);
        return;
      }
    }
    
    onSave({ type: ticketType, price: ticketPrice });
    onOpenChange(false);
    setPriceError(""); // Clear errors on successful save
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1a1a2e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Ticket className="h-5 w-5 text-blue-600" />
        <span className="text-gray-900 dark:text-white font-medium">Tickets</span>
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-400">
              {ticketType === "free" ? "Free" : (ticketPrice ? formatAmount(parseFloat(ticketPrice) || 0) : "Rp 0")}
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
                    Ticket Price (Rp)
                  </Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    min={PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT}
                    max={PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT}
                    step="1000"
                    value={ticketPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder={`Minimum ${formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)}`}
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                  {priceError && (
                    <p className="text-sm text-red-400 mt-1">{priceError}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum: {formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)} • Maximum: {formatAmount(PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!!priceError}
              >
                Save Tickets
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
