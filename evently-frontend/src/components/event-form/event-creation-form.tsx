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

export default function EventCreationForm() {
  // Basic event info
  const [eventName, setEventName] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Date and time
  const [startDate, setStartDate] = useState<Date>(
    new Date("2024-06-16T17:30")
  );
  const [startTime, setStartTime] = useState("17:30");
  const [endDate, setEndDate] = useState<Date>(new Date("2024-06-16T18:30"));
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
    const [tags, setTags] = useState<string[]>([]) 

  const handleLocationSave = (locationData: any) => {
    console.log("Location saved:", locationData);
  };

  const handleDescriptionSave = (desc: string) => {
    console.log("Description saved:", desc);
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

  const handleCreateEvent = () => {
    const eventData = {
      name: eventName,
      visibility,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone,
      description,
      requireApproval,
      ticketType,
      ticketPrice,
      capacity,
      capacityLimit,
       tags,
    };
    console.log("Creating event:", eventData);
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
            eventName
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-800 text-gray-400"
          )}
          disabled={!eventName}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </div>
    </div>
  );
}
