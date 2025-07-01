"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventImageUpload } from "./event-image-upload";
import { EventBasicInfo } from "./event-basic-info";
import { LocationDialog } from "./location-dialog";
import { DescriptionDialog } from "./description-dialog";
import { EventOptions } from "./event-options";
import { EventDateTimePicker } from "@/components/date-time";
import { TagsInput } from "./tags-input";
import { createEvent, CreateEventData } from "@/lib/events";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EventCreationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic event info
  const [eventName, setEventName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Date and time
  const [startDate, setStartDate] = useState<Date>(
    new Date("2025-07-01T17:30")
  );
  const [startTime, setStartTime] = useState("17:30");
  const [endDate, setEndDate] = useState<Date>(new Date("2025-07-01T18:30"));
  const [endTime, setEndTime] = useState("18:30");
  const [timezone, setTimezone] = useState("GMT+07:00");

  // Location
  const [locationOpen, setLocationOpen] = useState(false);

  // Description
  const [description, setDescription] = useState("");
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  // Event options
  const [requireApproval, setRequireApproval] = useState(false);
  const [ticketType, setTicketType] = useState("free");
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [capacity, setCapacity] = useState("unlimited");
  const [capacityLimit, setCapacityLimit] = useState("");
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const handleLocationSave = (locationData: any) => {
    // Convert location object to a readable string
    let locationString = '';
    
    const parts = [];
    
    // Check if it's from map selection (has latitude/longitude)
    if (locationData.latitude && locationData.longitude) {
      // Map-selected location
      locationString = locationData.address || locationData.venueName || 'Selected Location';
    } else {
      // Manual entry
      if (locationData.venueName) parts.push(locationData.venueName);
      if (locationData.address) parts.push(locationData.address);
      if (locationData.city) parts.push(locationData.city);
      if (locationData.postalCode) parts.push(locationData.postalCode);
      locationString = parts.join(', ');
    }
    
    setLocation(locationString);
    setLocationOpen(false);
  };

  const handleDescriptionSave = (desc: string) => {
    setDescription(desc);
    setDescriptionOpen(false);
  };

  const handleTicketsSave = (ticketData: { type: string; price: string }) => {
    console.log("Tickets saved:", ticketData);
  };

  const handleCapacitySave = (capacityData: {
    capacity: string;
    limit: string;
  }) => {
    console.log("Capacity saved:", capacityData);
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      toast.error("Event name is required");
      return;
    }

    setIsLoading(true);
    
    try {
      // Combine date and time for proper ISO string
      const combinedStartDate = new Date(startDate);
      const [startHour, startMinute] = startTime.split(':');
      combinedStartDate.setHours(parseInt(startHour), parseInt(startMinute));
      
      const combinedEndDate = new Date(endDate);
      const [endHour, endMinute] = endTime.split(':');
      combinedEndDate.setHours(parseInt(endHour), parseInt(endMinute));

      const eventData: CreateEventData = {
        name: eventName,
        description: description || undefined,
        location: location || undefined,
        startDate: combinedStartDate.toISOString(),
        endDate: combinedEndDate.toISOString(),
        visibility: visibility === "public",
        requireApproval,
        capacity: capacity === "unlimited" ? undefined : parseInt(capacityLimit) || undefined,
        tags,
        imageUrl: imageUrl || undefined,
      };

      const createdEvent = await createEvent(eventData);
      toast.success("Event created successfully!");
      
      // Redirect to the created event or events page
      router.push(`/events`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-4 max-w-5xl grid md:grid-cols-[1fr_1.5fr] gap-6 bg-gradient-to-b from-neutral-900 to-black mt-4 p-6 rounded-lg">
      <EventImageUpload />

      <div className="flex flex-col gap-5">
        <EventBasicInfo
          eventName={eventName}
          visibility={visibility}
          onEventNameChange={setEventName}
          onVisibilityChange={setVisibility}
        />

        <EventDateTimePicker
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          timezone={timezone}
          onStartDateChange={(date) => {
            if (date) setStartDate(date);
          }}
          onStartTimeChange={setStartTime}
          onEndDateChange={(date) => {
            if (date) setEndDate(date);
          }}
          onEndTimeChange={setEndTime}
          onTimezoneChange={setTimezone}
        />

        <LocationDialog
          open={locationOpen}
          onOpenChange={setLocationOpen}
          onSave={handleLocationSave}
        />

        <DescriptionDialog
          open={descriptionOpen}
          onOpenChange={setDescriptionOpen}
          description={description}
          onDescriptionChange={setDescription}
          onSave={handleDescriptionSave}
        />
        <TagsInput tags={tags} onTagsChange={setTags} />

        <EventOptions
          requireApproval={requireApproval}
          onRequireApprovalChange={setRequireApproval}
          ticketType={ticketType}
          ticketPrice={ticketPrice}
          ticketsOpen={ticketsOpen}
          onTicketsOpenChange={setTicketsOpen}
          onTicketTypeChange={setTicketType}
          onTicketPriceChange={setTicketPrice}
          onTicketsSave={handleTicketsSave}
          capacity={capacity}
          capacityLimit={capacityLimit}
          capacityOpen={capacityOpen}
          onCapacityOpenChange={setCapacityOpen}
          onCapacityChange={setCapacity}
          onCapacityLimitChange={setCapacityLimit}
          onCapacitySave={handleCapacitySave}
        />

        <Button
          className={cn(
            "w-full mt-4 rounded-md py-6",
            eventName && !isLoading
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-800 text-gray-400"
          )}
          disabled={!eventName || isLoading}
          onClick={handleCreateEvent}
        >
          {isLoading ? "Creating Event..." : "Create Event"}
        </Button>
      </div>
    </div>
  );
}
