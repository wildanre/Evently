"use client";

import { MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
}

const events: Event[] = [
  {
    id: "1",
    date: "Jun 15",
    day: "Sunday",
    time: "6:00 PM",
    title: "Based Community Meetup Yogyakarta",
    organizers: "By Santosa, Sanaz L., sakti & Bridget",
    location: "teaLOGi Sky View",
    attendees: 56,
    imageUrl: "/base-logo.webp",
    going: true,
  },
  {
    id: "2",
    date: "Jun 17",
    day: "Tuesday",
    time: "4:00 PM",
    title: "BUILD BUDDIES Malang",
    organizers: "By Meta Pool, MaxOne & Build Buddies",
    location: "Ada Apa Dengan Kopi (AADK) Tlogomas - Coffee & Eatery",
    attendees: 361,
    imageUrl:
      "/https://www.google.com/imgres?q=base%20community%20meet%20up&imgurl=https%3A%2F%2Fimages.lumacdn.com%2Fcdn-cgi%2Fimage%2Fformat%3Dauto%2Cfit%3Dcover%2Cdpr%3D2%2Cbackground%3Dwhite%2Cquality%3D75%2Cwidth%3D400%2Cheight%3D400%2Fevent-covers%2Frg%2F3e798b2d-7380-4884-ad8f-994870f0a9bc&imgrefurl=https%3A%2F%2Flu.ma%2Fzaxyiky0&docid=4sFFZpG0B1gwSM&tbnid=gPig7TQul1CCaM&vet=12ahUKEwjJjZLywu6NAxVETWwGHVn1L6YQM3oECB4QAA..i&w=800&h=800&hcb=2&itg=1&ved=2ahUKEwjJjZLywu6NAxVETWwGHVn1L6YQM3oECB4QAA",
    going: true,
  },
];

export default function UpcomingEventCard() {
  return (
    <div className="space-y-12 mx-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex">
          <div className="w-24 flex flex-col items-start">
            <div className="font-medium">{event.date}</div>
            <div className="text-neutral-400">{event.day}</div>
          </div>
          <div className="relative flex-grow">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
            </div>
            <Card className="ml-8 bg-neutral-900 border-neutral-700 overflow-hidden">
              <CardContent className="p-0 mx-4">
                <div className="flex p-2 gap-4">
                  <div className="flex-grow">
                    <div className="text-neutral-400 mb-1">{event.time}</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-neutral-400 mb-2">
                      <Users className="h-4 w-4" />
                      <span>{event.organizers}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-neutral-400 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-sm bg-green-600 text-white border-0 px-3"
                      >
                        Going
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
                        {event.attendees}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="w-32 h-32 overflow-hidden rounded-lg">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />{" "}
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
