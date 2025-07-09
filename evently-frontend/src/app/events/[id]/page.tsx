"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Edit, Share2, Map, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { JoinEventButton } from "@/components/join-event-button";
import { PaymentForm } from "@/components/payment/payment-form";
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
  ticketPrice?: number;
}

export default function EventDetailsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
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
          participants: eventData.participants || [],
          ticketPrice: eventData.ticketPrice || 0
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

  // Handle join status change
  const handleJoinStatusChange = () => {
    // Refresh event details when join status changes
    fetchEventDetails();
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData: any) => {
    toast.success('Payment initiated successfully!');
    setShowPaymentForm(false);
    // Refresh event details to update attendee count
    fetchEventDetails();
  };

  // Check if event is free or paid
  const isFreeEvent = !event?.ticketPrice || event.ticketPrice === 0;
  
  // Debug logging
  console.log('Event details:', {
    eventId: event?.id,
    ticketPrice: event?.ticketPrice,
    isFreeEvent,
    paymentEnabled: process.env.NEXT_PUBLIC_PAYMENT_ENABLED
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center h-32 sm:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center py-8 sm:py-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base px-4">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
            onClick={() => router.push('/discover')}
          >
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4 sm:mb-6 text-gray-600 hover:text-gray-900"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="overflow-hidden">
            {/* Event Image */}
            <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 relative">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
                </div>
              )}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <Badge className={getStatusColor(event.status)}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {event.name}
                </CardTitle>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  
                  {!isEventOnline(event.location) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenMaps}
                      className="flex items-center gap-2"
                    >
                      <Map className="h-4 w-4" />
                      <span className="hidden sm:inline">Maps</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                {event.description}
              </p>

              {/* Tags */}
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {event.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs sm:text-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Event Details */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{formatDate(event.startDate)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 min-w-0 flex-1">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{event.location}</span>
                  </div>
                  {!isEventOnline(event.location) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenMaps}
                      className="text-blue-600 hover:text-blue-700 p-1 ml-2 flex-shrink-0"
                      title="Open in Google Maps"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    {event.attendeeCount} attendees
                    {event.capacity && ` / ${event.capacity} capacity`}
                  </span>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Organized by
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {event.organizerName}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Ticket Price */}
          {!isFreeEvent && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Price</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rp {event?.ticketPrice?.toLocaleString('id-ID')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Join/Leave Event or Payment */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              {showPaymentForm && event && !isFreeEvent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Purchase Tickets</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <PaymentForm
                    event={{
                      id: event.id,
                      name: event.name,
                      startDate: event.startDate,
                      location: event.location,
                      ticketPrice: event.ticketPrice || 0,
                      capacity: event.capacity,
                      attendeeCount: event.attendeeCount,
                      imageUrl: event.imageUrl
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPaymentForm(false)}
                  />
                </div>
              ) : isUserOrganizer ? (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You are the organizer of this event
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                    onClick={() => router.push(`/events/${event.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {isFreeEvent 
                      ? (isUserJoined ? "You have joined this event" : "Join this event")
                      : "Purchase tickets to join this event"
                    }
                  </p>
                  
                  <JoinEventButton
                    eventId={event.id}
                    isJoined={isUserJoined}
                    eventName={event.name}
                    requireApproval={event.requireApproval}
                    ticketPrice={event.ticketPrice}
                    onJoinStatusChange={handleJoinStatusChange}
                    onPaymentRequired={() => setShowPaymentForm(true)}
                    className="w-full text-sm sm:text-base"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Price</span>
                <span className="font-medium text-sm sm:text-base">
                  {isFreeEvent ? 'Free' : `Rp ${event.ticketPrice?.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Attendees</span>
                <span className="font-medium text-sm sm:text-base">{event.attendeeCount}</span>
              </div>
              {event.capacity && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Capacity</span>
                  <span className="font-medium text-sm sm:text-base">{event.capacity}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Status</span>
                <Badge className={`${getStatusColor(event.status)} text-xs sm:text-sm`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
              {event.requireApproval && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Approval</span>
                  <span className="text-xs sm:text-sm text-amber-600">Required</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
