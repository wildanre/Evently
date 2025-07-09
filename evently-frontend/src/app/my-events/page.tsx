"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ExternalLink, AlertTriangle, Share2, Map, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { JoinEventButton } from "@/components/join-event-button";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  mapsLink?: string; // Add optional mapsLink field
  startDate: string;
  endDate: string;
  imageUrl?: string;
  tags: string[];
  capacity?: number;
  attendeesCount: number;
  organizerName: string;
  participantStatus?: 'confirmed' | 'pending' | 'rejected'; // Add rejected status
  status: 'upcoming' | 'ongoing' | 'past';
  isOnline?: boolean; // Add online/offline flag
  ticketPrice?: number; // Add ticket price
}

export default function MyEventsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyEvents();
    }
  }, [isAuthenticated]);

  const handleEventLeft = () => {
    // Refresh the events list when user leaves an event
    fetchMyEvents();
  };

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please log in to view your events");
        return;
      }

      // Get user email from auth context
      const userEmail = user?.email;

      console.log("Debug - User from auth context:", user);
      console.log("Debug - User email:", userEmail);

      if (!userEmail) {
        toast.error("Unable to get user email. Please log in again.");
        return;
      }

      // Fetch joined events using dedicated endpoint
      const response = await fetch(`${API_ENDPOINTS.EVENTS}/my-joined`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Raw API response:", data);
        
        // Transform data to match expected interface
        const transformedEvents = data.events ? data.events.map((event: any) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          location: event.location,
          mapsLink: event.mapsLink, // Include mapsLink from API
          startDate: event.startDate,
          endDate: event.endDate,
          imageUrl: event.imageUrl,
          tags: event.tags || [],
          capacity: event.capacity,
          ticketPrice: event.ticketPrice || 0, // Include ticket price
          attendeesCount: event.attendeeCount || 0,
          organizerName: event.organizerName || 'Unknown',
          participantStatus: event.participantStatus || 'confirmed', // Add participant status
          status: getEventStatus(event.startDate, event.endDate),
          isOnline: isEventOnline(event.location || '') // Determine if event is online
        })) : [];

        console.log("Transformed events:", transformedEvents);
        setEvents(transformedEvents);
      } else {
        const errorText = await response.text();
        console.error("API response not ok:", response.status, response.statusText, errorText);
        
        if (response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        } else {
          toast.error("Failed to fetch your events");
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error while fetching events");
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

  // Helper function to generate Google Maps URL
  const generateMapsUrl = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  // Helper function to get the appropriate maps URL
  const getMapsUrl = (event: Event) => {
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

  // Helper function to share event
  const shareEvent = async (event: Event) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const shareText = `Check out this event: ${event.name}\n${event.description}\n\nDate: ${formatDate(event.startDate)}\nLocation: ${event.location}\n\n`;
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: event.name,
          text: shareText,
          url: eventUrl,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareText + eventUrl);
        toast.success("Event link copied to clipboard!", {
          description: "Share this link with others to invite them to the event.",
        });
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      // Fallback: copy URL only
      try {
        await navigator.clipboard.writeText(eventUrl);
        toast.success("Event link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Unable to share or copy link. Please try again.");
      }
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'pending') return event.participantStatus === 'pending';
    if (filter === 'rejected') return event.participantStatus === 'rejected';
    return getEventStatus(event.startDate, event.endDate) === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'past': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
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
            Please log in to view your events.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.location.href = '/login'}
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Events you've joined and are attending
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'ongoing', label: 'Ongoing' },
          { key: 'pending', label: 'Pending' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'past', label: 'Past' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No events found' : `No ${filter} events`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? "You haven't joined any events yet. Discover events to get started!"
              : `You don't have any ${filter} events.`
            }
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.location.href = '/discover'}
          >
            Discover Events
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event.startDate, event.endDate);
            const displayStatus = event.participantStatus === 'pending' ? 'pending' : 
                                 event.participantStatus === 'rejected' ? 'rejected' : status;
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 relative">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Calendar className="h-12 w-12 text-blue-400" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 right-3 ${getStatusColor(displayStatus)}`}>
                    {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                  </Badge>
                  {/* Online/Offline indicator */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        event.isOnline 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {event.isOnline ? '🌐 Online' : '📍 Offline'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <CardTitle className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {event.name}
                  </CardTitle>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Pending Status Notice */}
                  {event.participantStatus === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Your registration is pending approval from the organizer. You can cancel your request anytime.
                      </p>
                      {event.ticketPrice && event.ticketPrice > 0 && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                          💳 Payment will be required once approved (Rp {event.ticketPrice.toLocaleString('id-ID')})
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rejected Status Notice */}
                  {event.participantStatus === 'rejected' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        Your registration was rejected by the organizer. You can try joining again.
                      </p>
                    </div>
                  )}

                  {/* Payment Required Notice for Paid Events */}
                  {event.participantStatus === 'confirmed' && event.ticketPrice && event.ticketPrice > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        <CreditCard className="h-4 w-4 inline mr-1" />
                        This is a paid event (Rp {event.ticketPrice.toLocaleString('id-ID')}). 
                        Complete payment to confirm your ticket.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="line-clamp-1 flex-1">{event.location}</span>
                      {!event.isOnline && (
                        <button
                          onClick={() => window.open(getMapsUrl(event), '_blank')}
                          className="ml-auto p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="View on Google Maps"
                        >
                          <Map className="h-4 w-4 text-blue-600 hover:text-blue-700" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>
                        {event.attendeesCount} attendees
                        {event.capacity && ` / ${event.capacity}`}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {event.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{event.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => window.location.href = `/events/${event.id}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-600 hover:bg-green-50"
                      onClick={() => shareEvent(event)}
                      title="Share event"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <JoinEventButton
                      eventId={event.id}
                      isJoined={event.participantStatus === 'confirmed'}
                      eventName={event.name}
                      ticketPrice={event.ticketPrice}
                      joinStatus={event.participantStatus === 'pending' ? 'pending' : 
                                 event.participantStatus === 'rejected' ? 'rejected' :
                                 event.participantStatus === 'confirmed' ? 'joined' : 'not_joined'}
                      onJoinStatusChange={handleEventLeft}
                      size="sm"
                      className="flex-1"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
