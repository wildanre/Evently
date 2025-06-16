"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CalendarDays, MapPin, Users, Search, Filter, X, Sun, Moon, Grid3X3, List, RefreshCw, AlertCircle, ChevronRight, Briefcase, Code, Palette, Music, Heart, Gamepad2, BookOpen, Coffee, Zap, TrendingUp, Navigation } from 'lucide-react';
import { getEvents, Event, EventsResponse } from '@/lib/events';

type ViewMode = 'grid' | 'list';

// Mock data for categories
const categories = [
  { id: 'tech', name: 'Technology', icon: Code, color: 'bg-blue-500', count: 142 },
  { id: 'business', name: 'Business', icon: Briefcase, color: 'bg-green-500', count: 89 },
  { id: 'design', name: 'Design', icon: Palette, color: 'bg-purple-500', count: 67 },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-pink-500', count: 124 },
  { id: 'health', name: 'Health & Wellness', icon: Heart, color: 'bg-red-500', count: 78 },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'bg-indigo-500', count: 45 },
  { id: 'education', name: 'Education', icon: BookOpen, color: 'bg-yellow-500', count: 93 },
  { id: 'social', name: 'Social', icon: Coffee, color: 'bg-orange-500', count: 156 },
];

// Mock trending events
const trendingEvents = [
  {
    id: 1,
    title: "AI Revolution Summit 2025",
    description: "Join industry leaders as they discuss the future of artificial intelligence and machine learning.",
    image: "/api/placeholder/400/240",
    date: "June 25, 2025",
    location: "San Francisco, CA"
  },
  {
    id: 2,
    title: "Startup Pitch Night",
    description: "Watch innovative startups pitch their ideas to top investors in this exciting competition.",
    image: "/api/placeholder/400/240",
    date: "June 20, 2025",
    location: "New York, NY"
  },
  {
    id: 3,
    title: "Design Thinking Workshop",
    description: "Learn the fundamentals of design thinking and how to apply them to solve complex problems.",
    image: "/api/placeholder/400/240",
    date: "June 22, 2025",
    location: "Los Angeles, CA"
  },
  {
    id: 4,
    title: "Music Festival 2025",
    description: "Experience the best in live music with performances from top artists across multiple genres.",
    image: "/api/placeholder/400/240",
    date: "July 15, 2025",
    location: "Austin, TX"
  }
];

// Mock local events
const localEvents = [
  {
    id: 5,
    title: "Coffee & Code Meetup",
    description: "Weekly gathering for developers to network, share ideas, and collaborate on projects.",
    image: "/api/placeholder/400/240",
    date: "Every Wednesday",
    location: "Local Coffee Shop"
  },
  {
    id: 6,
    title: "Morning Yoga Class",
    description: "Start your day with a peaceful yoga session suitable for all skill levels.",
    image: "/api/placeholder/400/240",
    date: "Daily at 7:00 AM",
    location: "Community Center"
  },
  {
    id: 7,
    title: "Book Club Discussion",
    description: "Monthly book club meeting to discuss our latest read and share recommendations.",
    image: "/api/placeholder/400/240",
    date: "Last Friday of Month",
    location: "Public Library"
  },
  {
    id: 8,
    title: "Local Art Exhibition",
    description: "Showcase of works by local artists featuring paintings, sculptures, and digital art.",
    image: "/api/placeholder/400/240",
    date: "June 18-30, 2025",
    location: "Downtown Gallery"
  }
];

export default function DiscoverPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

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
    }
  }, [currentPage, showAllEvents]);

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

  const SimpleEventCard = ({ event, onClick }: { event: any, onClick?: () => void }) => (
    <Card className="group overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border cursor-pointer" onClick={onClick}>
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <img
          src={event.image || event.imageUrl || "/api/placeholder/400/300"}
          alt={event.title || event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/400/300";
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {event.title || event.name}
        </h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
        {(event.date || event.startDate) && (
          <div className="flex items-center mt-3 text-xs text-muted-foreground dark:text-gray-500">
            <CalendarDays className="h-3 w-3 mr-1" />
            {event.date || formatDate(event.startDate)}
          </div>
        )}
        {(event.location) && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground dark:text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {event.location}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CategoryCard = ({ category }: { category: any }) => {
    const IconComponent = category.icon;
    return (
      <Card className="group overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border dark:border-neutral-600 bg-card cursor-pointer">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground dark:text-white">Discover Events</h1>
            <p className="text-muted-foreground dark:text-gray-400">Find exciting events happening around you</p>
          </div>
        </div>

        {!showAllEvents ? (
          <>
            <section className="mb-12 sm:mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Browse by Category</h2>
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            <section className="mb-12 sm:mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Trending Events
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                    Popular events happening this week
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {trendingEvents.map((event) => (
                  <SimpleEventCard
                    key={event.id}
                    event={event}
                    onClick={() => console.log('Navigate to event details:', event.id)}
                  />
                ))}
              </div>
            </section>

            <section className="mb-12 sm:mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
                    <Navigation className="h-6 w-6 text-primary" />
                    Local Events
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                    Events happening near you
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {localEvents.map((event) => (
                  <SimpleEventCard
                    key={event.id}
                    event={event}
                    onClick={() => console.log('Navigate to event details:', event.id)}
                  />
                ))}
              </div>
            </section>

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
                <Button variant="outline" className="sm:w-auto border-border dark:border-gray-700">
                  Create Event
                </Button>
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
                <div className="flex border rounded-lg p-1 bg-muted/50">
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
                    onClick={() => console.log('Navigate to event details:', event.id)}
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