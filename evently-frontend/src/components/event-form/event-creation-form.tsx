"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventImageUpload } from "./event-image-upload";
import { ImageUploadErrorBoundary } from "../error-boundary";
import { EventBasicInfo } from "./event-basic-info";
import { LocationDialog } from "./location-dialog";
import { DescriptionDialog } from "./description-dialog";
import { EventOptions } from "./event-options";
import { EventDateTimePicker } from "@/components/date-time";
import { TagsInput } from "./tags-input";
import { API_ENDPOINTS } from "@/lib/api";
import { debugApiConfig } from "@/lib/debug-api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PAYMENT_CONFIG, formatAmount } from "@/lib/payment-config";

export default function EventCreationForm() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Debug API configuration on component mount
  useEffect(() => {
    debugApiConfig();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-gray-600 dark:text-gray-300">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              You need to be logged in to create an event. Please sign in to continue.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              onClick={() => {
                toast.info("Redirecting to login page...");
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1000);
              }}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Basic event info
  const [eventName, setEventName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [imageUrl, setImageUrl] = useState("");


  // Date and time - Initialize with current date and future times
  const initializeCurrentDate = () => {
    const now = new Date();
    // Round to next hour
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    console.log("Initialized start date:", now);
    return now;
  };

  const initializeEndDate = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    console.log("Initialized end date:", endDate);
    return endDate;
  };

  const [startDate, setStartDate] = useState<Date>(() => initializeCurrentDate());
  const [startTime, setStartTime] = useState(() => {
    const date = initializeCurrentDate();
    return `${date.getHours().toString().padStart(2, '0')}:00`;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const start = initializeCurrentDate();
    return initializeEndDate(start);
  });
  const [endTime, setEndTime] = useState(() => {
    const start = initializeCurrentDate();
    const end = initializeEndDate(start);
    return `${end.getHours().toString().padStart(2, '0')}:00`;
  });

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
  const [isCreating, setIsCreating] = useState(false);

  const handleLocationSave = (locationData: any) => {
    // Store the maps link if provided for offline events
    if (locationData.type === "offline" && locationData.mapsLink) {
      setMapsLink(locationData.mapsLink);
    } else {
      setMapsLink(""); // Clear if not offline or no link provided
    }
    
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
    
    // Validate paid ticket price
    if (ticketType === "paid") {
      const price = parseFloat(ticketPrice) || 0;
      if (price < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) return false;
      if (price > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) return false;
    }
    
    // Check if dates are valid and in the future
    const now = new Date();
    if (startDate < now) return false;
    
    if (startDate >= endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        // Same day, check time
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        const endTimeMinutes = endHours * 60 + endMinutes;
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
    
    // Validate ticket price for paid events
    if (ticketType === "paid") {
      const price = parseFloat(ticketPrice) || 0;
      if (!ticketPrice || price <= 0) {
        errors.push("Ticket price is required for paid events");
      } else if (price < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) {
        errors.push(`Minimum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)}`);
      } else if (price > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) {
        errors.push(`Maximum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT)}`);
      }
    }
    
    const now = new Date();
    if (startDate < now) {
      errors.push("Start date must be in the future");
    }
    
    if (startDate >= endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        const endTimeMinutes = endHours * 60 + endMinutes;
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
      const newStartDate = new Date(date);
      setStartDate(newStartDate);
      
      // If end date is before start date, update it
      if (endDate < newStartDate) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setHours(newStartDate.getHours() + 1);
        setEndDate(newEndDate);
        
        // Update end time as well
        const endHour = newEndDate.getHours();
        setEndTime(`${endHour.toString().padStart(2, '0')}:00`);
      }
    }
  };

  // Update end time when start time changes
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    
    // If same day and end time is before start time, update end time
    if (startDate.toDateString() === endDate.toDateString()) {
      const [startHours, startMinutes] = time.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTimeMinutes = startHours * 60 + startMinutes;
      const endTimeMinutes = endHours * 60 + endMinutes;
      
      if (endTimeMinutes <= startTimeMinutes) {
        const newEndTimeMinutes = startTimeMinutes + 60; // 1 hour later
        const newHours = Math.floor(newEndTimeMinutes / 60) % 24;
        const newMinutes = newEndTimeMinutes % 60;
        setEndTime(`${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`);
      }
    }
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newEndDate = new Date(date);
      setEndDate(newEndDate);
      
      // If end date is before start date, it should not be allowed by calendar
      // But let's add a safety check
      if (newEndDate < startDate) {
        const safeEndDate = new Date(startDate);
        safeEndDate.setHours(startDate.getHours() + 1);
        setEndDate(safeEndDate);
        setEndTime(`${safeEndDate.getHours().toString().padStart(2, '0')}:00`);
      }
    }
  };

  const handleCreateEvent = async () => {
    const validationErrors = getValidationErrors();
    
    if (validationErrors.length > 0) {
      toast.error("Please fill in all required fields", {
        description: validationErrors.join(", "),
        duration: 5000,
      });
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
      mapsLink: mapsLink.trim() || undefined, // Only send if provided
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      capacity: eventCapacity,
      tags: tags.filter(tag => tag.trim() !== ""), // Remove empty tags
      visibility: visibility === "public", // Convert to boolean
      requireApproval: requireApproval,
      imageUrl: imageUrl.trim() || "",
      ticketPrice: ticketType === "paid" ? parseFloat(ticketPrice) || 0 : 0
    };
    
    console.log("Creating event with payload:", eventPayload);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error("Authentication required", {
          description: "Please log in to create an event.",
          action: {
            label: "Login",
            onClick: () => window.location.href = '/login'
          }
        });
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication token not found", {
          description: "Please log in again.",
          action: {
            label: "Login",
            onClick: () => window.location.href = '/login'
          }
        });
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
        
        toast.success("Event created successfully!", {
          description: `${eventName} has been created and is now live.`,
          duration: 5000,
        });
        
        // Reset form after successful creation
        const resetForm = () => {
          setEventName("");
          setDescription("");
          setLocation("");
          setMapsLink("");
          setTags([]);
          setImageUrl("");
          setVisibility("public");
          setRequireApproval(false);
          setTicketType("free");
          setTicketPrice("");
          setCapacity("unlimited");
          setCapacityLimit("");
          
          // Reset dates to current time + 1 hour
          const now = initializeCurrentDate();
          const end = initializeEndDate(now);
          setStartDate(now);
          setEndDate(end);
          setStartTime(`${now.getHours().toString().padStart(2, '0')}:00`);
          setEndTime(`${end.getHours().toString().padStart(2, '0')}:00`);
          setTimezone("GMT+07:00");
        };
        
        resetForm();
        
      } else {
        const errorData = await response.json();
        console.error("Failed to create event:", errorData);
        
        if (response.status === 400) {
          // Handle validation errors from backend
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
        } else if (response.status === 401) {
          toast.error("Authentication required", {
            description: "Please log in first.",
            action: {
              label: "Login",
              onClick: () => window.location.href = '/login'
            }
          });
        } else {
          toast.error("Failed to create event", {
            description: "Please try again later.",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error", {
        description: "Please check your connection and try again.",
        duration: 5000,
      });
    } finally {
      setIsCreating(false); // Stop loading
    }
  };

  return (
    <div className="w-full mx-4 max-w-6xl">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-0">
          {/* Left Column - Image Upload */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6">
            <ImageUploadErrorBoundary>
              <EventImageUpload 
                imageUrl={imageUrl}
                onImageUpload={setImageUrl}
              />
            </ImageUploadErrorBoundary>
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
                  onEndDateChange={handleEndDateChange}
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

        <Button
          className={cn(
            "w-full mt-6 rounded-lg py-6 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2",
            isFormValid() && !isCreating
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
          disabled={!isFormValid() || isCreating}
          onClick={handleCreateEvent}
        >
          {isCreating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isCreating ? "Creating Event..." : "Create Event"}

        </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
