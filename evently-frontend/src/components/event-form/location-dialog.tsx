"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { MapPin, Link } from "lucide-react";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (locationData: any) => void;
  currentLocation?: string;
}

export function LocationDialog({
  open,
  onOpenChange,
  onSave,
  currentLocation,
}: LocationDialogProps) {
  const [locationType, setLocationType] = useState("offline");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const locationData = {
      type: locationType,
      ...Object.fromEntries(formData.entries()),
    };
    onSave(locationData);
    onOpenChange(false);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a1a2e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <MapPin className="h-5 w-5 text-blue-600" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full text-left justify-start p-0 h-auto text-gray-900 dark:text-white hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {currentLocation ? "Edit Event Location" : "Add Event Location *"}
                </p>
                <p className="text-xs text-gray-500">
                  {currentLocation || "Offline location or virtual link (required)"}
                </p>
                {!currentLocation && (
                  <p className="text-xs text-red-500 mt-1">
                    Location is required
                  </p>
                )}
              </div>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Event Location</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose between an offline venue or virtual meeting link for your
              event.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              value={locationType}
              onValueChange={setLocationType}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border border-neutral-700 rounded-lg p-3">
                <RadioGroupItem value="offline" id="offline" />
                <Label
                  htmlFor="offline"
                  className="flex items-center gap-2 cursor-pointer text-white"
                >
                  <MapPin className="h-4 w-4" />
                  Offline
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-neutral-700 rounded-lg p-3">
                <RadioGroupItem value="virtual" id="virtual" />
                <Label
                  htmlFor="virtual"
                  className="flex items-center gap-2 cursor-pointer text-white"
                >
                  <Link className="h-4 w-4" />
                  Virtual
                </Label>
              </div>
            </RadioGroup>

            {locationType === "offline" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venue-name" className="text-white">
                    Venue Name
                  </Label>
                  <Input
                    id="venue-name"
                    name="venueName"
                    placeholder="Enter venue name"
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter full address"
                    className="min-h-[80px] resize-none bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="City"
                      className="bg-[#1a1a2e] border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal-code" className="text-white">
                      Postal Code
                    </Label>
                    <Input
                      id="postal-code"
                      name="postalCode"
                      placeholder="Postal code"
                      className="bg-[#1a1a2e] border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maps-link" className="text-white">
                    Google Maps Link (Optional)
                  </Label>
                  <Input
                    id="maps-link"
                    name="mapsLink"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    Provide a custom Google Maps link for this location. If not provided, one will be auto-generated.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-platform" className="text-white">
                    Meeting Platform
                  </Label>
                  <Input
                    id="meeting-platform"
                    name="meetingPlatform"
                    placeholder="e.g., Zoom, Google Meet, Teams"
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting-link" className="text-white">
                    Meeting Link
                  </Label>
                  <Input
                    id="meeting-link"
                    name="meetingLink"
                    type="url"
                    placeholder="https://..."
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting-id" className="text-white">
                    Meeting ID (Optional)
                  </Label>
                  <Input
                    id="meeting-id"
                    name="meetingId"
                    placeholder="Meeting ID or Room Number"
                    className="bg-[#1a1a2e] border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passcode" className="text-white">
                    Passcode (Optional)
                  </Label>
                  <Input
                    id="passcode"
                    name="passcode"
                    placeholder="Meeting passcode"
                    className="bg-[#1a1a2e] border-gray-700 text-white"
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
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Location
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
