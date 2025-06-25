"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { JoinEventButton } from "@/components/join-event-button";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Share2,
  Heart,
  ExternalLink,
  X,
} from "lucide-react";

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
  requireApproval?: boolean;
  participants?: any[];
}

interface EventSliderProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinStatusChange?: () => void;
}

const EventSlider = ({ event, isOpen, onClose, onJoinStatusChange }: EventSliderProps) => {
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
              {/* Date and Time */}
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

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-sm bg-green-600 text-white border-0 px-3"
                  >
                    Going
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
              <div>
                <div className="flex items-center gap-2 text-neutral-400 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="text-white">{event.location}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto mt-3 text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on map
                </Button>
              </div>

              <Separator className="bg-neutral-700" />

              {/* Attendees */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Attendees ({event.attendees})
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(8)].map((_, i) => (
                      <Avatar
                        key={i}
                        className="w-8 h-8 border-2 border-neutral-800"
                      >
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                        />
                        <AvatarFallback className="bg-neutral-600 text-xs">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-sm text-neutral-400">
                    +{event.attendees - 8} more
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  About this event
                </h3>
                <p className="text-neutral-300 leading-relaxed">
                  Join us for an exciting community meetup where developers,
                  designers, and tech enthusiasts come together to share
                  knowledge, network, and build meaningful connections. This
                  event will feature presentations, workshops, and plenty of
                  opportunities to connect with like-minded individuals in the
                  tech community.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-neutral-700">
            <div className="flex gap-3">
              <JoinEventButton
                eventId={event.id}
                isJoined={false}
                eventName={event.title}
                requireApproval={event.requireApproval}
                onJoinStatusChange={onJoinStatusChange}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-neutral-600 hover:bg-neutral-800"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-neutral-600 hover:bg-neutral-800"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventSlider;
