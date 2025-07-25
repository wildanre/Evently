"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CalendarDays, MapPin, Users, Search, Filter, X, Sun, Moon, Grid3X3, List, RefreshCw, AlertCircle, ChevronRight, Briefcase, Code, Palette, Music, Heart, Gamepad2, BookOpen, Coffee, Zap, TrendingUp, Navigation, Share2, Map } from 'lucide-react';
import { getEvents, Event, EventsResponse, getEventCategories, getFeaturedEvents, getUpcomingEvents, getEventsByCategory, EventCategory } from '@/lib/events';
import { useAuth } from '@/contexts/AuthContext';
import { JoinEventButton } from '@/components/join-event-button';
import { toast } from "sonner";
import Link from 'next/link';
import Marquee from "react-fast-marquee";

type ViewMode = 'grid' | 'list';

// Icon mapping for categories
const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    Code,
    Briefcase,
    Palette,
    Music,
    Heart,
    Gamepad2,
    BookOpen,
    Coffee,
  };
  return icons[iconName] || Code;
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Simple Event Card Component
const SimpleEventCard = ({ event, onClick, onJoinStatusChange, onShare, getMapsUrl, isEventOnline }: { 
  event: Event, 
  onClick?: () => void, 
  onJoinStatusChange?: () => void,
  onShare?: (event: Event) => void,
  getMapsUrl?: (event: Event) => string,
  isEventOnline?: (location: string) => boolean
}) => {
  const eventIsOnline = isEventOnline ? isEventOnline(event.location || '') : false;
  
  return (
    <Card className="group overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border">
      <div className="aspect-[4/3] bg-muted relative overflow-hidden cursor-pointer" onClick={onClick}>
        <img
          src={event.imageUrl || "/api/placeholder/400/300"}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/400/300";
          }}
        />
        {event.tags.length > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white text-xs">
              {event.tags[0]}
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="outline" className="bg-white/90 text-black text-xs">
            <Users className="h-3 w-3 mr-1" />
            {event.attendeeCount}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              eventIsOnline 
                ? 'bg-purple-100/90 text-purple-800' 
                : 'bg-gray-100/90 text-gray-800'
            }`}
          >
            {eventIsOnline ? '🌐' : '📍'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="cursor-pointer" onClick={onClick}>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-3 leading-relaxed">
            {event.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center text-xs text-muted-foreground dark:text-gray-500">
              <CalendarDays className="h-3 w-3 mr-1" />
              {formatDate(event.startDate)}
            </div>
            {event.capacity && (
              <div className="text-xs text-muted-foreground">
                {event.attendeeCount}/{event.capacity}
              </div>
            )}
          </div>
          {event.location && (
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground dark:text-gray-500">
              <div className="flex items-center flex-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{event.location}</span>
              </div>
              {!eventIsOnline && getMapsUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(getMapsUrl(event), '_blank');
                  }}
                  className="ml-2 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="View on Google Maps"
                >
                  <Map className="h-3 w-3 text-blue-600 hover:text-blue-700" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">
              by {event.users.name}
            </div>
            {event.status === 'PUBLISHED' && (
              <Badge className="text-xs bg-green-100 text-green-800">
                Available
              </Badge>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-border flex gap-2">
          <JoinEventButton
            eventId={event.id}
            isJoined={false} // We'll determine this in the component itself
            eventName={event.name}
            requireApproval={event.requireApproval}
            onJoinStatusChange={onJoinStatusChange}
            size="sm"
            className="flex-1"
          />
          {onShare && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onShare(event);
              }}
              className="border-green-200 text-green-600 hover:bg-green-50"
              title="Share event"
            >
              <Share2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Category Card Component
const CategoryCard = ({ category }: { category: EventCategory }) => {
  const IconComponent = getIconComponent(category.icon);
  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border dark:border-neutral-600 bg-card cursor-pointer"
    >
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          {category.count} events
        </p>
      </CardContent>
    </Card>
  );
};

export default function DiscoverPage() {
  const { isAuthenticated } = useAuth();
  
  // Helper function to generate Google Maps URL
  const generateMapsUrl = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  // Helper function to get the appropriate maps URL
  const getMapsUrl = (event: Event) => {
    // Use custom mapsLink if provided, otherwise generate from location
    return event.mapsLink || generateMapsUrl(event.location || '');
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
  
  // States for all events view
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  
  // States for discover view sections
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  const loadEvents = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        limit: 12,
        ...(search && { search })
      };

      const response: EventsResponse = await getEvents(filters);
      setEvents(response.events);
      setPagination(response.pagination);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAllEvents) {
      loadEvents(currentPage, searchTerm);
    } else {
      loadDiscoverData();
    }
  }, [currentPage, showAllEvents]);

  const loadDiscoverData = async () => {
    setDiscoverLoading(true);
    try {
      const [categoriesData, featuredData, upcomingData] = await Promise.all([
        getEventCategories(),
        getFeaturedEvents(4),
        getUpcomingEvents(4)
      ]);
      
      setCategories(categoriesData);
      setFeaturedEvents(featuredData);
      setUpcomingEvents(upcomingData);
    } catch (err) {
      console.error('Error loading discover data:', err);
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleCategoryClick = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    try {
      const categoryEvents = await getEventsByCategory(categoryId, 12);
      setEvents(categoryEvents);
      setShowAllEvents(true);
      setSearchTerm('');
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading category events:', err);
    }
  };

  const navigateToEvent = (eventId: string) => {
    window.location.href = `/events/${eventId}`;
  };

  const handleJoinStatusChange = () => {
    // Refresh the current events list when join status changes
    if (showAllEvents) {
      loadEvents(currentPage, searchTerm);
    } else {
      // Refresh discover sections
      loadDiscoverData();
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setShowAllEvents(true);
    loadEvents(1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    if (showAllEvents) {
      loadEvents(1, '');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Discover Events</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-muted/50 border-border dark:border-gray-700 text-foreground dark:text-white"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch} className="sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        {!showAllEvents ? (
          <>
            {discoverLoading ? (
              <div className="space-y-12">
                {/* Category Loading */}
                <section className="mb-12 sm:mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-8 w-48 bg-muted" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden border-border bg-card">
                        <CardContent className="p-6 text-center">
                          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4 bg-muted" />
                          <Skeleton className="h-4 w-20 mx-auto mb-2 bg-muted" />
                          <Skeleton className="h-3 w-16 mx-auto bg-muted" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
                
                {/* Featured Events Loading */}
                <section className="mb-12 sm:mb-16">
                  <Skeleton className="h-8 w-48 mb-6 bg-muted" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden border-border bg-card">
                        <div className="aspect-[4/3]">
                          <Skeleton className="w-full h-full bg-muted" />
                        </div>
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2 bg-muted" />
                          <Skeleton className="h-3 w-full mb-1 bg-muted" />
                          <Skeleton className="h-3 w-2/3 bg-muted" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <>
                <section className="mb-12 sm:mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Browse by Category</h2>
                  </div>
                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                      {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No categories available</p>
                    </div>
                  )}
                </section>

                <section className="mb-12 sm:mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Featured Events
                      </h2>
                      <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                        Most popular events happening soon
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-primary/80"
                      onClick={() => setShowAllEvents(true)}
                    >
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  {featuredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {featuredEvents.map((event) => (
                        <SimpleEventCard
                          key={event.id}
                          event={event}
                          onClick={() => navigateToEvent(event.id)}
                          onJoinStatusChange={handleJoinStatusChange}
                          onShare={shareEvent}
                          getMapsUrl={getMapsUrl}
                          isEventOnline={isEventOnline}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No featured events available</p>
                    </div>
                  )}
                </section>

                <section className="mb-12 sm:mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <Navigation className="h-6 w-6 text-primary" />
                        Upcoming Events
                      </h2>
                      <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                        Events happening soon
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-primary/80"
                      onClick={() => setShowAllEvents(true)}
                    >
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {upcomingEvents.map((event) => (
                        <SimpleEventCard
                          key={event.id}
                          event={event}
                          onClick={() => navigateToEvent(event.id)}
                          onJoinStatusChange={handleJoinStatusChange}
                          onShare={shareEvent}
                          getMapsUrl={getMapsUrl}
                          isEventOnline={isEventOnline}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No upcoming events available</p>
                    </div>
                  )}
                </section>
              </>
            )}

            <section className="text-center bg-muted/50 rounded-2xl p-8 sm:p-12">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground dark:text-white">
                Can't find what you're looking for?
              </h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-6 max-w-md mx-auto">
                Explore all events or create your own to bring your community together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setShowAllEvents(true)}
                  className="sm:w-auto"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Events
                </Button>
                <Link href={isAuthenticated ? "/create" : "/login"}>
                  <Button variant="outline" className="sm:w-auto border-border dark:border-gray-700 w-full">
                    Create Event
                  </Button>
                </Link>
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllEvents(false)}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <div>
                  <h2 className="text-xl font-bold text-foreground dark:text-white">All Events</h2>
                  {!loading && (
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {pagination.total} events found
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex border rounded-lg bg-muted/50">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    variant="ghost"
                    className="h-8 px-3"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" className="border-border dark:border-gray-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {loading ? (
              <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-border bg-card">
                    <div className="aspect-[4/3]">
                      <Skeleton className="w-full h-full bg-muted" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2 bg-muted" />
                      <Skeleton className="h-3 w-full mb-1 bg-muted" />
                      <Skeleton className="h-3 w-2/3 bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4 mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-white">
                  {searchTerm ? `No events found for "${searchTerm}"` : 'No events available'}
                </h3>
                <p className="text-muted-foreground dark:text-gray-400 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms or browse all events.'
                    : 'Check back later for new events.'
                  }
                </p>
                {searchTerm && (
                  <Button onClick={clearSearch} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                {events.map((event) => (
                  <SimpleEventCard
                    key={event.id}
                    event={event}
                    onClick={() => navigateToEvent(event.id)}
                    onJoinStatusChange={handleJoinStatusChange}
                    onShare={shareEvent}
                    getMapsUrl={getMapsUrl}
                    isEventOnline={isEventOnline}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} transition-colors`}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNumber <= totalPages) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer hover:bg-accent transition-colors"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} transition-colors`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}