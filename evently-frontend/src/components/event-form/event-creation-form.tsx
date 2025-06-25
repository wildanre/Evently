"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventImageUpload } from "./event-image-upload";
import { EventBasicInfo } from "./event-basic-info";
import { LocationDialog } from "./location-dialog";
import { DescriptionDialog } from "./description-dialog";
import { EventOptions } from "./event-options";
import { EventDateTimePicker } from "@/components/date-time";
import { TagsInput } from "./tags-input";
import { API_ENDPOINTS } from "@/lib/api";
import { debugApiConfig } from "@/lib/debug-api";
import { useAuth } from "@/contexts/AuthContext";

export default function EventCreationForm() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Debug API configuration on component mount
  useEffect(() => {
    debugApiConfig();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full mx-4 max-w-5xl bg-gradient-to-b from-neutral-900 to-black mt-4 p-6 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full mx-4 max-w-5xl bg-gradient-to-b from-neutral-900 to-black mt-4 p-6 rounded-lg">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to create an event.</p>
          <Button 
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  // Basic event info
  const [eventName, setEventName] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Date and time - Set to current date and time
  const currentDate = new Date();
  const [startDate, setStartDate] = useState<Date>(currentDate);
  const [startTime, setStartTime] = useState(
    `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(currentDate.getTime() + 60 * 60 * 1000) // 1 hour later
  );
  const [endTime, setEndTime] = useState(
    `${(currentDate.getHours() + 1).toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`
  );
  const [timezone, setTimezone] = useState("GMT+07:00");

  // Location
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<string>("");

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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const handleLocationSave = (locationData: any) => {
    // For offline events, combine venue name and address into a single location string
    if (locationData.type === "offline") {
      const locationParts = [];
      if (locationData.venueName) locationParts.push(locationData.venueName);
      if (locationData.address) locationParts.push(locationData.address);
      if (locationData.city) locationParts.push(locationData.city);
      setLocation(locationParts.join(", "));
    } else {
      // For virtual events, use the meeting platform and link
      setLocation(`${locationData.meetingPlatform || "Virtual"}: ${locationData.meetingLink || ""}`);
    }
    console.log("Location saved:", locationData);
  };

  const handleDescriptionSave = (desc: string) => {
    setDescription(desc);
    console.log("Description saved:", desc);
  };

  const handleTicketsSave = (ticketData: { type: string; price: string }) => {
    setTicketType(ticketData.type);
    setTicketPrice(ticketData.price);
    console.log("Tickets saved:", ticketData);
  };

  const handleCapacitySave = (capacityData: {
    capacity: string;
    limit: string;
  }) => {
    setCapacity(capacityData.capacity);
    setCapacityLimit(capacityData.limit);
    console.log("Capacity saved:", capacityData);
  };

  // Validation function
  const isFormValid = () => {
    if (!eventName.trim()) return false;
    if (!description.trim()) return false; // Description is required
    if (!location.trim()) return false; // Location is required
    if (startDate >= endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        // Same day, check time
        const startTimeMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        if (startTimeMinutes >= endTimeMinutes) return false;
      } else {
        return false;
      }
    }
    return true;
  };

  // Get validation errors for display
  const getValidationErrors = () => {
    const errors = [];
    if (!eventName.trim()) errors.push("Event name");
    if (!description.trim()) errors.push("Description");
    if (!location.trim()) errors.push("Location");
    
    if (startDate >= endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        const startTimeMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        if (startTimeMinutes >= endTimeMinutes) {
          errors.push("End time must be after start time");
        }
      } else {
        errors.push("End date must be after start date");
      }
    }
    
    return errors;
  };

  // Update end date when start date changes
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      // If end date is before start date, update it
      if (endDate < date) {
        setEndDate(new Date(date.getTime() + 60 * 60 * 1000)); // 1 hour later
      }
    }
  };

  // Update end time when start time changes
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    // If same day and end time is before start time, update end time
    if (startDate.toDateString() === endDate.toDateString()) {
      const startTimeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
      const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      if (endTimeMinutes <= startTimeMinutes) {
        const newEndTimeMinutes = startTimeMinutes + 60; // 1 hour later
        const hours = Math.floor(newEndTimeMinutes / 60) % 24;
        const minutes = newEndTimeMinutes % 60;
        setEndTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
  };

  const handleCreateEvent = async () => {
    const validationErrors = getValidationErrors();
    
    if (validationErrors.length > 0) {
      alert(`Please fill in the following required fields:\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    setIsCreating(true); // Start loading

    // Create ISO date strings for backend
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    // Convert capacity to number if not unlimited
    const eventCapacity = capacity === "unlimited" ? null : parseInt(capacityLimit) || null;

    // Create payload exactly matching backend API
    const eventPayload = {
      name: eventName.trim(),
      description: description.trim(),
      location: location.trim(),
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      capacity: eventCapacity,
      tags: tags.filter(tag => tag.trim() !== ""), // Remove empty tags
      visibility: visibility === "public", // Convert to boolean
      requireApproval: requireApproval,
      imageUrl: imageUrl.trim() || ""
    };
    
    console.log("Creating event with payload:", eventPayload);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        alert("Please log in to create an event.");
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
      }

      // Send data to backend API with authorization
      const response = await fetch(API_ENDPOINTS.EVENTS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Event created successfully:", result);
        alert("Event created successfully!");
        
        // Reset form after successful creation
        setEventName("");
        setDescription("");
        setLocation("");
        setTags([]);
        setImageUrl("");
        // Reset other fields as needed...
        
      } else {
        const errorData = await response.json();
        console.error("Failed to create event:", errorData);
        
        if (response.status === 400) {
          // Handle validation errors from backend
          if (errorData.errors) {
            const backendErrors = errorData.errors.map((err: any) => err.msg).join('\n• ');
            alert(`Validation errors:\n• ${backendErrors}`);
          } else {
            alert(`Error: ${errorData.error || "Bad request"}`);
          }
        } else if (response.status === 401) {
          alert("Authentication required. Please log in first.");
        } else {
          alert("Failed to create event. Please try again.");
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsCreating(false); // Stop loading
    }
  };

  return (
    <div className="w-full mx-4 max-w-5xl grid md:grid-cols-[1fr_1.5fr] gap-6 bg-gradient-to-b from-neutral-900 to-black mt-4 p-6 rounded-lg">
      <EventImageUpload 
        imageUrl={imageUrl}
        onImageUpload={setImageUrl}
      />

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
          onStartDateChange={handleStartDateChange}
          onStartTimeChange={handleStartTimeChange}
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
          currentLocation={location}
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
            isFormValid() && !isCreating
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-800 text-gray-400 cursor-not-allowed"
          )}
          disabled={!isFormValid() || isCreating}
          onClick={handleCreateEvent}
        >
          {isCreating ? "Creating Event..." : "Create Event"}
        </Button>
      </div>
    </div>
  );
}
