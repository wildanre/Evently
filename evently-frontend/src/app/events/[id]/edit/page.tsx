"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventImageUpload } from "@/components/event-form/event-image-upload";
import { EventBasicInfo } from "@/components/event-form/event-basic-info";
import { LocationDialog } from "@/components/event-form/location-dialog";
import { DescriptionDialog } from "@/components/event-form/description-dialog";
import { EventOptions } from "@/components/event-form/event-options";
import { EventDateTimePicker } from "@/components/date-time";
import { TagsInput } from "@/components/event-form/tags-input";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Basic event info
  const [eventName, setEventName] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Date and time
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState("10:00");
  const [timezone, setTimezone] = useState("GMT+07:00");

  // Location
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [mapsLink, setMapsLink] = useState<string>("");

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

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchEventDetails();
    }
  }, [isAuthenticated, id]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please log in to edit events");
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const event = await response.json();
        
        // Populate form with existing data
        setEventName(event.name);
        setVisibility(event.visibility ? "public" : "private");
        setDescription(event.description);
        setLocation(event.location);
        setMapsLink(event.mapsLink || "");
        setTags(event.tags || []);
        setImageUrl(event.imageUrl || "");
        setRequireApproval(event.requireApproval);
        
        // Set dates and times
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        setStartDate(start);
        setEndDate(end);
        setStartTime(`${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`);
        setEndTime(`${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`);
        
        // Set capacity
        if (event.capacity) {
          setCapacity("limited");
          setCapacityLimit(event.capacity.toString());
        } else {
          setCapacity("unlimited");
        }
        
      } else if (response.status === 404) {
        toast.error("Event not found");
        router.push('/created-events');
      } else if (response.status === 403) {
        toast.error("You don't have permission to edit this event");
        router.push('/created-events');
      } else {
        toast.error("Failed to fetch event details");
      }
    } catch (error) {
      toast.error("Network error while fetching event");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSave = (locationData: any) => {
    // Store the maps link if provided for offline events
    if (locationData.type === "offline" && locationData.mapsLink) {
      setMapsLink(locationData.mapsLink);
    } else if (locationData.type === "offline") {
      // Keep existing maps link if not provided
      // setMapsLink(""); // Don't clear existing link
    } else {
      setMapsLink(""); // Clear for virtual events
    }
    
    if (locationData.type === "offline") {
      const locationParts = [];
      if (locationData.venueName) locationParts.push(locationData.venueName);
      if (locationData.address) locationParts.push(locationData.address);
      if (locationData.city) locationParts.push(locationData.city);
      setLocation(locationParts.join(", "));
    } else {
      setLocation(`${locationData.meetingPlatform || "Virtual"}: ${locationData.meetingLink || ""}`);
    }
  };

  const handleDescriptionSave = (desc: string) => {
    setDescription(desc);
  };

  const handleTicketsSave = (ticketData: { type: string; price: string }) => {
    setTicketType(ticketData.type);
    setTicketPrice(ticketData.price);
  };

  const handleCapacitySave = (capacityData: { capacity: string; limit: string }) => {
    setCapacity(capacityData.capacity);
    setCapacityLimit(capacityData.limit);
  };

  const isFormValid = () => {
    if (!eventName.trim()) return false;
    if (!description.trim()) return false;
    if (!location.trim()) return false;
    if (startDate >= endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        const startTimeMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        if (startTimeMinutes >= endTimeMinutes) return false;
      } else {
        return false;
      }
    }
    return true;
  };

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

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      if (endDate < date) {
        setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (startDate.toDateString() === endDate.toDateString()) {
      const startTimeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
      const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      if (endTimeMinutes <= startTimeMinutes) {
        const newEndTimeMinutes = startTimeMinutes + 60;
        const hours = Math.floor(newEndTimeMinutes / 60) % 24;
        const minutes = newEndTimeMinutes % 60;
        setEndTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
  };

  const handleUpdateEvent = async () => {
    const validationErrors = getValidationErrors();
    
    if (validationErrors.length > 0) {
      toast.error("Please fill in all required fields", {
        description: validationErrors.join(", "),
        duration: 5000,
      });
      return;
    }

    setIsUpdating(true);

    // Create ISO date strings for backend
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    const eventCapacity = capacity === "unlimited" ? null : parseInt(capacityLimit) || null;

    const eventPayload = {
      name: eventName.trim(),
      description: description.trim(),
      location: location.trim(),
      mapsLink: mapsLink.trim() || undefined, // Only send if provided
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      capacity: eventCapacity,
      tags: tags.filter(tag => tag.trim() !== ""),
      visibility: visibility === "public",
      requireApproval: requireApproval,
      imageUrl: imageUrl.trim() || ""
    };
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        toast.success("Event updated successfully!", {
          description: `${eventName} has been updated.`,
          duration: 5000,
        });
        
        router.push('/created-events');
      } else {
        const errorData = await response.json();
        
        if (response.status === 400) {
          if (errorData.errors) {
            const backendErrors = errorData.errors.map((err: any) => err.msg).join(', ');
            toast.error("Validation errors", {
              description: backendErrors,
              duration: 5000,
            });
          } else {
            toast.error("Bad request", {
              description: errorData.error || "Please check your input and try again.",
              duration: 5000,
            });
          }
        } else if (response.status === 403) {
          toast.error("Permission denied", {
            description: "You don't have permission to edit this event.",
          });
        } else {
          toast.error("Failed to update event", {
            description: "Please try again later.",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Please check your connection and try again.",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to edit events.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/created-events')}
          >
            ← Back to Created Events
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Event</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your event details and settings
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-0">
            {/* Left Column - Image Upload */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6">
              <EventImageUpload 
                imageUrl={imageUrl}
                onImageUpload={setImageUrl}
              />
            </div>

            {/* Right Column - Form Content */}
            <div className="p-8">
              <div className="flex flex-col gap-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Basic Information
                  </h2>
                  <EventBasicInfo
                    eventName={eventName}
                    visibility={visibility}
                    onEventNameChange={setEventName}
                    onVisibilityChange={setVisibility}
                  />
                </div>

                {/* Date & Time Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Date & Time
                  </h2>
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
                </div>

                {/* Location & Description Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Location & Description
                  </h2>
                  <div className="space-y-3">
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
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Additional Details
                  </h2>
                  <TagsInput tags={tags} onTagsChange={setTags} />
                </div>

                {/* Event Options Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Event Options
                  </h2>
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
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/created-events')}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={cn(
                      "flex-1 rounded-lg py-6 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                      isFormValid() && !isUpdating
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                    disabled={!isFormValid() || isUpdating}
                    onClick={handleUpdateEvent}
                  >
                    {isUpdating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isUpdating ? "Updating Event..." : "Update Event"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
