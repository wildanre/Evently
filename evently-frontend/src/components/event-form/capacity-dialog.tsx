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
import { Users, Edit } from "lucide-react";

interface CapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capacity: string;
  capacityLimit: string;
  onCapacityChange: (capacity: string) => void;
  onCapacityLimitChange: (limit: string) => void;
  onSave: (capacityData: { capacity: string; limit: string }) => void;
}

export function CapacityDialog({
  open,
  onOpenChange,
  capacity,
  capacityLimit,
  onCapacityChange,
  onCapacityLimitChange,
  onSave,
}: CapacityDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ capacity, limit: capacityLimit });
    onOpenChange(false);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1a1a2e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-blue-600" />
        <span className="text-gray-900 dark:text-white font-medium">Capacity</span>
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-400">
              {capacity === "unlimited"
                ? "Unlimited"
                : `${capacityLimit} people`}
            </span>
            <Edit className="h-4 w-4 text-gray-400" />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Event Capacity</DialogTitle>
            <DialogDescription className="text-gray-400">
              Set the maximum number of attendees for your event.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              value={capacity}
              onValueChange={onCapacityChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border border-neutral-700 rounded-lg p-3">
                <RadioGroupItem value="unlimited" id="unlimited-capacity" />
                <Label
                  htmlFor="unlimited-capacity"
                  className="flex-1 cursor-pointer text-white"
                >
                  <div>
                    <p className="font-medium">Unlimited</p>
                    <p className="text-sm text-gray-400">
                      No limit on attendees
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-neutral-700 rounded-lg p-3">
                <RadioGroupItem value="limited" id="limited-capacity" />
                <Label
                  htmlFor="limited-capacity"
                  className="flex-1 cursor-pointer text-white"
                >
                  <div>
                    <p className="font-medium">Limited</p>
                    <p className="text-sm text-gray-400">
                      Set maximum number of attendees
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {capacity === "limited" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity-limit" className="text-white">
                    Maximum Attendees
                  </Label>
                  <Input
                    id="capacity-limit"
                    type="number"
                    min="1"
                    value={capacityLimit}
                    onChange={(e) => onCapacityLimitChange(e.target.value)}
                    placeholder="Enter maximum number of attendees"
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    💡 Tip: Consider setting capacity 10-15% higher than your
                    venue limit to account for no-shows.
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
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Capacity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
