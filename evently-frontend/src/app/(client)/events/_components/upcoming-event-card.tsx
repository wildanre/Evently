"use client"

import { useEffect, useState } from "react"
import { MapPin, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import EventSlider from "@/components/event-slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Event {
  id: string
  date: string
  day: string
  time: string
  title: string
  organizers: string
  location: string
  attendees: number
  imageUrl: string
  going: boolean
}

export default function UpcomingEventCard() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Query parameters
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [search, setSearch] = useState("")
  const [tags, setTags] = useState("")

  // Add these new state variables after the existing ones
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://evently-backend-amber.vercel.app/api"
      const baseUrl = `${API_BASE_URL}/events`
      const url = new URL(baseUrl)
      url.searchParams.set("page", String(page))
      url.searchParams.set("limit", String(limit))
      if (search) url.searchParams.set("search", search)
      if (tags) url.searchParams.set("tags", tags)

      const res = await fetch(url.toString())

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log("API Response:", data) // Debug log

      // Handle different possible response structures
      let eventsArray = []
      if (data.data && Array.isArray(data.data)) {
        eventsArray = data.data
      } else if (Array.isArray(data)) {
        eventsArray = data
      } else if (data.events && Array.isArray(data.events)) {
        eventsArray = data.events
      } else {
        console.warn("Unexpected API response structure:", data)
        eventsArray = []
      }

      const formattedEvents = eventsArray.map((event: any, index: number) => {
        // Use startDate from backend API response
        const eventDate = event.startDate || event.dateTime || event.date || new Date().toISOString()

        return {
          id: event.id || `event-${index}`,
          date: new Date(eventDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          day: new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          time: new Date(eventDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          title: event.name || event.title || "Untitled Event",
          organizers: event.users?.name || event.organizer?.name || event.organizers || "Unknown",
          location: event.location || event.venue || "TBA",
          attendees: event.attendeeCount || event._count?.event_participants_event_participants_eventIdToevents || event.attendees || 0,
          imageUrl: event.imageUrl || event.image || `/placeholder.svg?height=128&width=128`,
          going: true,
        }
      })

      setEvents(formattedEvents)

      // In the fetchEvents function, after setting the formatted events, add:
      // Handle pagination metadata
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1)
        setTotalEvents(data.pagination.total || formattedEvents.length)
        setHasNextPage(data.pagination.hasNextPage || false)
        setHasPrevPage(data.pagination.hasPrevPage || false)
      } else {
        // Fallback pagination calculation
        setTotalPages(Math.ceil(formattedEvents.length / limit))
        setTotalEvents(formattedEvents.length)
        setHasNextPage(formattedEvents.length === limit)
        setHasPrevPage(page > 1)
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }

  // Add this right after the fetchEvents function
  const loadTestData = () => {
    const testEvents = [
      {
        id: "test-1",
        date: "Dec 25",
        day: "Monday",
        time: "2:00 PM",
        title: "Sample Tech Conference",
        organizers: "Tech Community",
        location: "Convention Center",
        attendees: 150,
        imageUrl: "/placeholder.svg?height=128&width=128",
        going: true,
      },
      {
        id: "test-2",
        date: "Dec 26",
        day: "Tuesday",
        time: "6:00 PM",
        title: "Networking Meetup",
        organizers: "Business Network",
        location: "Downtown Hotel",
        attendees: 75,
        imageUrl: "/placeholder.svg?height=128&width=128",
        going: true,
      },
    ]
    setEvents(testEvents)
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents().catch(() => {
      // If fetchEvents fails, load test data
      loadTestData()
    })
  }, [page, search, tags, limit])

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
    fetchEvents()
  }

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1)
    }
  }

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber)
  }

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-neutral-400">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: {error}</p>
          <div className="space-x-4">
            <Button onClick={fetchEvents} variant="outline">
              Try Again
            </Button>
            <Button onClick={loadTestData} variant="outline" className="bg-blue-600 hover:bg-blue-700">
              Load Test Data
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Upcoming Events</h1>
            <p className="text-neutral-400">Discover and join amazing events</p>
          </div>

          {/* Filter Form */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-neutral-900 border-neutral-700 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-64 bg-neutral-900 border-neutral-700 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </div>

          {/* Event List */}
          <div className="max-w-4xl mx-auto">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-400">No events found</p>
              </div>
            ) : (
              <div className="space-y-8">
                {events.map((event) => (
                  <div key={event.id} className="flex">
                    <div className="w-24 flex flex-col items-start">
                      <div className="font-medium text-white">{event.date}</div>
                      <div className="text-neutral-400 text-sm">{event.day}</div>
                    </div>
                    <div className="relative flex-grow">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
                      </div>
                      <Card
                        className="ml-8 bg-neutral-900 border-neutral-700 overflow-hidden cursor-pointer hover:bg-neutral-800 transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <CardContent className="p-0">
                          <div className="flex p-6 gap-4">
                            <div className="flex-grow">
                              <div className="text-neutral-400 mb-1 text-sm">{event.time}</div>
                              <h3 className="text-xl font-semibold mb-2 text-white">{event.title}</h3>
                              <div className="flex items-center gap-1 text-sm text-neutral-400 mb-2">
                                <Users className="h-4 w-4" />
                                <span>{event.organizers}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-neutral-400 mb-4">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-sm bg-green-600 text-white border-0 px-3">
                                  Going
                                </Badge>
                                <div className="flex -space-x-2">
                                  {[...Array(4)].map((_, i) => (
                                    <Avatar key={i} className="w-6 h-6 border border-neutral-800">
                                      <AvatarImage
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}-${i}`}
                                      />
                                      <AvatarFallback className="bg-neutral-600 text-[10px]">
                                        {String.fromCharCode(65 + i)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <span className="text-sm text-neutral-400">{event.attendees} attending</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="w-32 h-32 overflow-hidden rounded-lg">
                                <img
                                  src={event.imageUrl || "/placeholder.svg"}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {events.length > 0 && (
            <div className="flex flex-col items-center space-y-4">
              {/* Pagination Info */}
              <div className="text-sm text-neutral-400">
                Showing page {page} of {totalPages} ({totalEvents} total events)
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <Button
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage || loading}
                  variant="outline"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        disabled={loading}
                        variant={page === pageNum ? "default" : "outline"}
                        className={
                          page === pageNum
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                        }
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loading}
                  variant="outline"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>

              {/* Items per page selector */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-neutral-400">Items per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1) // Reset to first page when changing limit
                  }}
                  className=" border border-neutral-600 text-white rounded px-2 py-1"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          )}

          <EventSlider event={selectedEvent} isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
        </div>
      </div>
    </div>
  )
}
