"use client";

import { useEffect, useState } from "react";
import { MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
  users: {
    name: string;
  };
  location: string;
  attendeeCount: number;
  imageUrl: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDay(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PastEventCard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://evently-backend-amber.vercel.app/api";
    fetch(`${API_BASE_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        // Filter hanya event yang sudah berakhir
        const now = new Date();
        const pastEvents = (data.events || []).filter(
          (event: Event) => new Date(event.endDate) < now
        );
        setEvents(pastEvents);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching past events:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="mx-4 text-neutral-400">Loading...</div>;
  }

  return (
    <div className="space-y-12 mx-4">
      {events.map((event) => (
        <div key={event.id} className="flex">
          <div className="w-24 flex flex-col items-start">
            <div className="font-medium">{formatDate(event.startDate)}</div>
            <div className="text-neutral-400">{formatDay(event.startDate)}</div>
          </div>
          <div className="relative flex-grow">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
            </div>
            <Card className="ml-8 bg-neutral-900 border-neutral-700 overflow-hidden">
              <CardContent className="p-0 mx-4">
                <div className="flex p-2 gap-4">
                  <div className="flex-grow">
                    <div className="text-neutral-400 mb-1">
                      {formatTime(event.startDate)} -{" "}
                      {formatTime(event.endDate)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-neutral-400 mb-2">
                      <Users className="h-4 w-4" />
                      <span>{event.users?.name || "Unknown Organizer"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-neutral-400 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-sm bg-neutral-600 text-white border-0 px-3"
                      >
                        Past
                      </Badge>
                      <div className="flex -space-x-2">
                        {[...Array(4)].map((_, i) => (
                          <Avatar
                            key={i}
                            className="w-6 h-6 border border-neutral-800"
                          >
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                            />
                            <AvatarFallback className="bg-neutral-600 text-[10px]">
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-sm text-neutral-400">
                        {event.attendeeCount}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="w-32 h-32 overflow-hidden rounded-lg">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
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
  );
}
