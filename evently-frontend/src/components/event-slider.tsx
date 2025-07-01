"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { registerForEvent, unregisterFromEvent, getEvent, type Event as EventType } from "@/lib/events";
import dynamic from 'next/dynamic';
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Share2,
  Heart,
  ExternalLink,
  X,
  Loader2,
  Tag,
  CreditCard,
  Globe,
  Video,
  Copy,
  Download,
  MessageSquare,
} from "lucide-react";

// Dynamically import the MapLocationPicker for location display
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface Event {
  id: string;
  date: string;
  day: string;
  time: string;
  title: string;
  organizers: string;
  location: string;
  attendees: number;
  imageUrl: string;
  going: boolean;
  description?: string;
  endDate?: string;
  startDate?: string;
  tags?: string[];
  capacity?: number;
  requireApproval?: boolean;
  visibility?: boolean;
  status?: string;
}

interface EventSliderProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventSlider = ({ event, isOpen, onClose }: EventSliderProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event?.going || false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);

  // Fetch detailed event information when the slider opens
  useEffect(() => {
    if (isOpen && event?.id) {
      fetchEventDetails();
    }
  }, [isOpen, event?.id]);
  
  // Early return after all hooks are declared
  if (!event) return null;

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const details = await getEvent(event.id);
      setEventDetails(details);
      // Generate mock attendees for demo
      setAttendees(generateMockAttendees(details.attendeeCount));
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAttendees = (count: number) => {
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      id: `attendee-${i}`,
      name: `User ${String.fromCharCode(65 + (i % 26))}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=attendee-${i}`,
      role: i === 0 ? 'Organizer' : i < 3 ? 'Speaker' : 'Attendee',
    }));
  };

  const handleRegistration = async () => {
    setIsRegistering(true);
    try {
      if (isRegistered) {
        await unregisterFromEvent(event.id);
        setIsRegistered(false);
        toast.success("Successfully unregistered", {
          description: "You have been removed from this event.",
        });
      } else {
        await registerForEvent(event.id);
        setIsRegistered(true);
        toast.success("Successfully registered", {
          description: "You're now registered for this event!",
        });
      }
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = async () => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title} on ${event.date}`,
      url: eventUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Event shared successfully!");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(eventUrl);
        }
      }
    } else {
      fallbackShare(eventUrl);
    }
  };

  const fallbackShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(eventDetails?.startDate || event.startDate || Date.now());
    const endDate = new Date(eventDetails?.endDate || event.endDate || startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', event.title);
    googleCalendarUrl.searchParams.set('dates', `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    googleCalendarUrl.searchParams.set('details', eventDetails?.description || event.description || '');
    googleCalendarUrl.searchParams.set('location', event.location);
    
    window.open(googleCalendarUrl.toString(), '_blank');
    toast.success("Opening Google Calendar...");
  };

  const handleDownloadEvent = () => {
    const eventData = {
      title: event.title,
      description: eventDetails?.description || event.description,
      location: event.location,
      startDate: eventDetails?.startDate || event.startDate,
      endDate: eventDetails?.endDate || event.endDate,
      organizer: event.organizers,
    };
    
    const dataStr = JSON.stringify(eventData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_event.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success("Event details downloaded!");
  };

  const openLocationInMaps = () => {
    const encodedLocation = encodeURIComponent(event.location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(mapsUrl, '_blank');
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (isFavorited) {
      toast.success("Removed from favorites", {
        description: "Event removed from your favorites.",
      });
    } else {
      toast.success("Added to favorites", {
        description: "Event added to your favorites!",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[540px] sm:max-w-[540px] bg-neutral-900 border-neutral-700 p-0">
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-400">Event Details</span>
            </div>
          </div>

          {/* Add SheetTitle for accessibility */}
          <SheetTitle className="sr-only">
            {event.title} - Event Details
          </SheetTitle>

          {/* Event Image */}
          <div className="w-full h-64 overflow-hidden">
            <img
              src={event.imageUrl || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-neutral-400">Loading event details...</span>
                </div>
              )}
              
              {/* Event Status and Type */}
              <div className="flex flex-wrap gap-2">
                {eventDetails?.status && (
                  <Badge variant="outline" className="capitalize">
                    {eventDetails.status.toLowerCase()}
                  </Badge>
                )}
                {eventDetails?.requireApproval && (
                  <Badge variant="outline">
                    Approval Required
                  </Badge>
                )}
                {eventDetails?.capacity && (
                  <Badge variant="outline">
                    {eventDetails.attendeeCount}/{eventDetails.capacity} spots
                  </Badge>
                )}
              </div>

              {/* Date and Time */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {event.date}, {event.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                </div>
                {eventDetails?.endDate && (
                  <div className="mt-2 text-xs text-neutral-500">
                    Ends: {new Date(eventDetails.endDate).toLocaleDateString()} at {new Date(eventDetails.endDate).toLocaleTimeString()}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddToCalendar}
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Add to Calendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadEvent}
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`rounded-sm border-0 px-3 ${
                      isRegistered 
                        ? 'bg-green-600 text-white' 
                        : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {isRegistered ? 'Going' : 'Not Going'}
                  </Badge>
                </div>
              </div>

              {/* Organizers */}
              <div>
                <div className="flex items-center gap-2 text-neutral-400 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Organized by</span>
                </div>
                <p className="text-white">{event.organizers}</p>
              </div>

              {/* Location */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="text-white mb-3">{event.location || 'Location TBA'}</p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openLocationInMaps}
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in Maps
                  </Button>
                  <Dialog open={showMap} onOpenChange={setShowMap}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Show Map
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-700">
                      <DialogTitle>Event Location</DialogTitle>
                      <div className="h-64 w-full rounded-lg overflow-hidden">
                        {typeof window !== 'undefined' && (
                          <MapContainer
                            center={[-6.2088, 106.8456]} // Default to Jakarta, you'd get real coords from geocoding
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[-6.2088, 106.8456]}>
                            </Marker>
                          </MapContainer>
                        )}
                      </div>
                      <p className="text-neutral-400 text-sm mt-2">{event.location}</p>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Separator className="bg-neutral-700" />

              {/* Tags */}
              {(eventDetails?.tags && eventDetails.tags.length > 0) && (
                <div>
                  <div className="flex items-center gap-2 text-neutral-400 mb-3">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventDetails.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}


              {/* Attendees */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Attendees ({event.attendees})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                </div>
                
                {/* Attendee Grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {attendees.slice(0, 12).map((attendee, i) => (
                    <div key={attendee.id} className="text-center">
                      <Avatar className="w-12 h-12 mx-auto border-2 border-neutral-700">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback className="bg-neutral-600 text-xs">
                          {attendee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-neutral-400 mt-1 truncate">
                        {attendee.name}
                      </p>
                      {attendee.role !== 'Attendee' && (
                        <Badge size="sm" className="text-xs mt-1">
                          {attendee.role}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                {attendees.length > 12 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                    >
                      View All {event.attendees} Attendees
                    </Button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  About this event
                </h3>
                <p className="text-neutral-300 leading-relaxed">
                  {event.description || 
                    "Join us for an exciting community meetup where developers, designers, and tech enthusiasts come together to share knowledge, network, and build meaningful connections. This event will feature presentations, workshops, and plenty of opportunities to connect with like-minded individuals in the tech community."}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-neutral-700">
            <div className="space-y-3">
              {/* Primary Action */}
              <Button 
                className={`w-full ${
                  isRegistered 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } font-semibold`}
                onClick={handleRegistration}
                disabled={isRegistering || (eventDetails?.capacity && eventDetails.attendeeCount >= eventDetails.capacity)}
                size="lg"
              >
                {isRegistering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {eventDetails?.capacity && eventDetails.attendeeCount >= eventDetails.capacity 
                  ? 'Event Full' 
                  : isRegistered 
                    ? 'Leave Event' 
                    : eventDetails?.requireApproval 
                      ? 'Request to Join' 
                      : 'Join Event'
                }
              </Button>
              
              {/* Secondary Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 border-neutral-600 hover:bg-neutral-800 ${
                    isFavorited ? 'bg-red-600 border-red-600 text-white' : 'text-neutral-300'
                  }`}
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventSlider;
