"use client";

import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { JoinEventButton } from "@/components/join-event-button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
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
  name?: string;
  date: string;
  day: string;
  time: string;
  title: string;
  organizers: string;
  location: string;
  mapsLink?: string;
  attendees: number;
  imageUrl: string;
  going: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  requireApproval?: boolean;
  participants?: any[];
  tags?: string[];
  capacity?: number;
  status?: string;
  attendeeCount?: number;
}

interface EventSliderProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinStatusChange?: () => void;
}

const EventSlider = ({ event, isOpen, onClose, onJoinStatusChange }: EventSliderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'joined' | 'pending' | 'rejected' | 'not_joined'>('not_joined');

  // Real API functions
  const getEventDetails = useCallback(async (eventId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${eventId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }, []);

  const checkJoinStatus = useCallback(async (eventId: string) => {
    if (!isAuthenticated || !user?.email) return 'not_joined';
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return 'not_joined';

      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${eventId}/join-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const statusData = await response.json();
        return statusData.status || (statusData.isJoined ? 'joined' : 'not_joined');
      }
    } catch (error) {
      console.error('Error checking join status:', error);
    }
    return 'not_joined';
  }, [isAuthenticated, user?.email]);

  const generateMockAttendees = useCallback((count: number) => {
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      id: `attendee-${i}`,
      name: `User ${String.fromCharCode(65 + (i % 26))}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=attendee-${i}`,
      role: i === 0 ? 'Organizer' : i < 3 ? 'Speaker' : 'Attendee',
    }));
  }, []);

  const fetchEventDetails = useCallback(async () => {
    if (!event) return;
    
    setLoading(true);
    try {
      // Fetch real event details
      const details = await getEventDetails(event.id);
      console.log('Event details fetched in slider:', details); // Debug log
      setEventDetails(details);
      
      // Check join status
      const status = await checkJoinStatus(event.id);
      console.log('Join status in slider:', status); // Debug log
      setJoinStatus(status);
      
      // Generate mock attendees for demo (replace with real API call when available)
      const attendeeCount = details.attendeeCount || details._count?.event_participants_event_participants_eventIdToevents || event.attendees || 0;
      setAttendees(generateMockAttendees(attendeeCount));
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      // Fallback to using prop data
      setEventDetails({
        ...event,
        attendeeCount: event.attendees,
        status: 'upcoming',
        tags: event.tags || [],
        capacity: event.capacity || 100,
        ticketPrice: 0 // Add default ticket price
      });
      setAttendees(generateMockAttendees(event.attendees));
    } finally {
      setLoading(false);
    }
  }, [event, getEventDetails, checkJoinStatus, generateMockAttendees]);

  useEffect(() => {
    if (isOpen && event) {
      fetchEventDetails();
    }
  }, [isOpen, event, fetchEventDetails]);

  const handleJoinStatusChange = useCallback(() => {
    if (onJoinStatusChange) {
      onJoinStatusChange();
    }
    // Refetch event details to update join status
    fetchEventDetails();
  }, [onJoinStatusChange, fetchEventDetails]);

  const handleShare = useCallback(async () => {
    if (!event) return;
    
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
  }, [event]);

  const fallbackShare = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  }, []);

  const handleAddToCalendar = useCallback(() => {
    if (!event) return;
    
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
  }, [event, eventDetails]);

  const handleDownloadEvent = useCallback(() => {
    if (!event) return;
    
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
  }, [event, eventDetails]);

  const openLocationInMaps = useCallback(() => {
    if (!event) return;
    
    // Use custom mapsLink if available, otherwise generate one
    const mapsUrl = event.mapsLink || eventDetails?.mapsLink || 
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
    window.open(mapsUrl, '_blank');
  }, [event, eventDetails]);

  const handleFavorite = useCallback(() => {
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
  }, [isFavorited]);

  const handlePaymentRequired = useCallback(() => {
    if (!event) return;
    
    // Redirect to payment page or show payment form
    const paymentUrl = `/payment/mock?paymentId=${event.id}&amount=${eventDetails?.ticketPrice || 0}&method=qris`;
    window.location.href = paymentUrl;
  }, [event, eventDetails]);

  // Return early AFTER all hooks are called
  if (!event) return null;

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
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Add SheetTitle for accessibility */}
          <SheetTitle className="sr-only">
            {event.title} - Event Details
          </SheetTitle>

          {/* Event Image */}
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={event.imageUrl || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {/* Status Badge Overlay */}
            <div className="absolute top-4 right-4">
              <Badge
                variant="outline"
                className={`bg-black/60 border-white/20 text-white backdrop-blur-sm ${
                  joinStatus === 'joined' 
                    ? 'bg-green-600/80 border-green-400/50' 
                    : joinStatus === 'pending'
                    ? 'bg-orange-600/80 border-orange-400/50'
                    : 'bg-neutral-800/80 border-neutral-600/50'
                }`}
              >
                {joinStatus === 'joined' ? 'Going' : 
                 joinStatus === 'pending' ? 'Pending' : 
                 joinStatus === 'rejected' ? 'Rejected' : 'Not Going'}
              </Badge>
            </div>
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
                      joinStatus === 'joined' 
                        ? 'bg-green-600 text-white' 
                        : joinStatus === 'pending'
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {joinStatus === 'joined' ? 'Going' : 
                     joinStatus === 'pending' ? 'Pending' : 
                     joinStatus === 'rejected' ? 'Rejected' : 'Not Going'}
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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openLocationInMaps}
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in Maps
                  </Button>
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
                    {eventDetails.tags.map((tag: string, index: number) => (
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
                        <Badge className="text-xs mt-1 px-1 py-0.5">
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
            <div className="space-y-4">
              {/* Main Join Button */}
              <JoinEventButton
                eventId={event.id}
                isJoined={joinStatus === 'joined'}
                joinStatus={joinStatus}
                eventName={event.title}
                requireApproval={event.requireApproval}
                ticketPrice={eventDetails?.ticketPrice || 0}
                onJoinStatusChange={handleJoinStatusChange}
                onPaymentRequired={handlePaymentRequired}
                className="w-full"
              />
              
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-neutral-500 p-2 bg-neutral-800 rounded">
                  Debug: ticketPrice={eventDetails?.ticketPrice}, joinStatus={joinStatus}
                </div>
              )}
              
              {/* Secondary Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className={`border-neutral-600 hover:bg-neutral-800 ${
                    isFavorited ? 'bg-red-600 border-red-600 text-white' : 'text-neutral-300'
                  }`}
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Saved' : 'Save'}
                </Button>
                
                <Button
                  variant="outline"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                  onClick={openLocationInMaps}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Maps
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
