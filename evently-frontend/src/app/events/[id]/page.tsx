"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Edit, Share2, Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { JoinEventButton } from "@/components/join-event-button";
import { useParams, useRouter } from "next/navigation";

interface EventDetails {
  id: string;
  name: string;
  description: string;
  location: string;
  mapsLink?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  tags: string[];
  capacity?: number;
  attendeeCount: number;
  organizerName: string;
  organizerEmail: string;
  requireApproval: boolean;
  status: 'upcoming' | 'ongoing' | 'past';
  participants?: any[];
}

export default function EventDetailsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${eventId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        const eventData = data.event;
        
        // Transform data to match expected interface
        const transformedEvent: EventDetails = {
          id: eventData.id,
          name: eventData.name,
          description: eventData.description,
          location: eventData.location,
          mapsLink: eventData.mapsLink,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          imageUrl: eventData.imageUrl,
          tags: eventData.tags || [],
          capacity: eventData.capacity,
          attendeeCount: eventData.attendeeCount || 0,
          organizerName: eventData.organizer ? eventData.organizer.name : 'Unknown',
          organizerEmail: eventData.organizer ? eventData.organizer.email : '',
          requireApproval: eventData.requireApproval || false,
          status: getEventStatus(eventData.startDate, eventData.endDate),
          participants: eventData.participants || []
        };

        setEvent(transformedEvent);
      } else if (response.status === 404) {
        toast.error("Event not found");
        router.push('/discover');
      } else {
        toast.error("Failed to fetch event details");
      }
    } catch (error) {
      toast.error("Network error while fetching event details");
      console.error("Event fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'past' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'past': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to generate Google Maps URL
  const generateMapsUrl = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  // Helper function to get the appropriate maps URL
  const getMapsUrl = (event: EventDetails) => {
    // Use custom mapsLink if provided, otherwise generate from location
    return event.mapsLink || generateMapsUrl(event.location);
  };

  // Helper function to determine if event is online based on location
  const isEventOnline = (location: string) => {
    const onlineKeywords = ['online', 'virtual', 'zoom', 'teams', 'meet', 'webinar', 'livestream', 'remote'];
    return onlineKeywords.some(keyword => 
      location.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: event?.name || 'Event',
      text: `Check out this event: ${event?.name}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Event link copied to clipboard!');
      }
    } catch (error) {
      // Fallback to clipboard on error
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Event link copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Failed to share event');
      }
    }
  };

  // Handle opening maps
  const handleOpenMaps = () => {
    if (event && !isEventOnline(event.location)) {
      const mapsUrl = getMapsUrl(event);
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('This is an online event');
    }
  };

  const isUserOrganizer = user?.email === event?.organizerEmail;

  // Check if current user has joined this event
  const isUserJoined = event?.participants?.some((participant: any) => 
    participant.user && participant.user.email === user?.email && participant.status === 'confirmed'
  ) || false;

  const handleJoinStatusChange = () => {
    // Refresh event details when join status changes
    fetchEventDetails();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/discover')}
          >
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 text-gray-600 hover:text-gray-900"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Event Image */}
            <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 relative">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Calendar className="h-16 w-16 text-blue-400" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge className={getStatusColor(event.status)}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                  {event.name}
                </CardTitle>
                
                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  
                  {!isEventOnline(event.location) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenMaps}
                      className="flex items-center gap-2"
                    >
                      <Map className="h-4 w-4" />
                      Maps
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                {event.description}
              </p>

              {/* Tags */}
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Event Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{formatDate(event.startDate)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>{event.location}</span>
                  </div>
                  {!isEventOnline(event.location) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenMaps}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Open in Google Maps"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>
                    {event.attendeeCount} attendees
                    {event.capacity && ` / ${event.capacity} capacity`}
                  </span>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Organized by
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {event.organizerName}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join/Leave Event */}
          <Card>
            <CardContent className="p-6">
              {isUserOrganizer ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You are the organizer of this event
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push(`/events/${event.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {isUserJoined ? "You have joined this event" : "Join this event"}
                  </p>
                  <JoinEventButton
                    eventId={event.id}
                    isJoined={isUserJoined}
                    eventName={event.name}
                    requireApproval={event.requireApproval}
                    onJoinStatusChange={handleJoinStatusChange}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Attendees</span>
                <span className="font-medium">{event.attendeeCount}</span>
              </div>
              {event.capacity && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                  <span className="font-medium">{event.capacity}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <Badge className={getStatusColor(event.status)}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
              {event.requireApproval && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Approval</span>
                  <span className="text-sm text-amber-600">Required</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
