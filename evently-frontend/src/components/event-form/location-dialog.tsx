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
import { MapPin, Link, Map } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import the MapLocationPicker to avoid SSR issues
const MapLocationPicker = dynamic(
  () => import('./map-location-picker'),
  { ssr: false, loading: () => <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-400">Loading map...</p></div> }
);

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (locationData: any) => void;
}

export function LocationDialog({
  open,
  onOpenChange,
  onSave,
}: LocationDialogProps) {
  const [inputMethod, setInputMethod] = useState<'manual' | 'map'>('manual');
  const [selectedMapLocation, setSelectedMapLocation] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let locationData;
    
    if (inputMethod === 'map' && selectedMapLocation) {
      // Use map selected location
      locationData = {
        type: 'offline',
        venueName: selectedMapLocation.displayName || 'Selected Location',
        address: selectedMapLocation.address || selectedMapLocation.displayName,
        latitude: selectedMapLocation.lat,
        longitude: selectedMapLocation.lng,
        city: '', // Could be parsed from address if needed
        postalCode: ''
      };
    } else {
      // Use manual form data
      const formData = new FormData(e.target as HTMLFormElement);
      locationData = {
        type: 'offline',
        ...Object.fromEntries(formData.entries()),
      };
    }
    
    onSave(locationData);
    onOpenChange(false);
  };

  return (
    <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-md p-3">
      <MapPin className="h-5 w-5 text-gray-400" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full text-left justify-start p-0 h-auto text-white hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">Add Event Location</p>
                <p className="text-xs text-gray-500">
                  Event location or venue
                </p>
              </div>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Event Location</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add the venue or location where your event will take place.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              {/* Input Method Selection */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={inputMethod === 'manual' ? 'default' : 'outline'}
                  onClick={() => setInputMethod('manual')}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
                <Button
                  type="button"
                  variant={inputMethod === 'map' ? 'default' : 'outline'}
                  onClick={() => setInputMethod('map')}
                  className="w-full"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Select on Map
                </Button>
              </div>
              
              {inputMethod === 'manual' ? (
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
              </div>
              ) : (
                <div className="space-y-4">
                  <MapLocationPicker
                    onLocationSelect={(location) => {
                      console.log('Selected location:', location);
                      setSelectedMapLocation(location);
                    }}
                    className=""
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Location</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
