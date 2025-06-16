"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  ChevronDown,
  Edit,
  Eye,
  Globe,
  MapPin,
  PenLine,
  Ticket,
  Upload,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import VisibilitySelect from "@/app/(client)/create/_components/visibility";
import {
  EventDateTimePicker,
  timezones,
} from "@/app/(client)/create/_components/date-time";

export default function EventCreationForm() {
  const [eventName, setEventName] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(2024, 5, 16)
  ); // June 16, 2024
  const [startTime, setStartTime] = useState("17.30");
  const [endDate, setEndDate] = useState<Date | null>(new Date(2024, 5, 16)); // June 16, 2024
  const [endTime, setEndTime] = useState("18.30");
  const [timezone, setTimezone] = useState("GMT+07:00");

  return (
    <div className="w-full max-w-5xl grid md:grid-cols-[1fr_1.5fr] gap-6 bg-black rounded-lg">
      <div className="relative flex flex-col">
        <div className="aspect-square bg-[#0f0f1a] rounded-lg overflow-hidden flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 grid-rows-3 w-4/5 h-4/5">
              <div className="bg-purple-500/50 rounded-full m-1"></div>
              <div className="bg-blue-400/50 rounded-full m-1"></div>
              <div className="bg-purple-500/50 rounded-full m-1"></div>
              <div className="bg-blue-400/50 rounded-full m-1"></div>
              <div className="bg-purple-500/80 rounded-full m-1 flex items-center justify-center">
                <div className="bg-blue-400/80 rounded-full w-3/4 h-3/4"></div>
              </div>
              <div className="bg-blue-400/50 rounded-full m-1"></div>
              <div className="bg-purple-500/50 rounded-full m-1"></div>
              <div className="bg-blue-400/50 rounded-full m-1"></div>
              <div className="bg-purple-500/50 rounded-full m-1"></div>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4 bg-black/50 border-gray-700 text-white rounded-full"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>

        {/* Theme selector */}
        <div className="mt-4 flex items-center gap-2 bg-[#1a1a2e] p-3 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
            <PenLine className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Theme</p>
            <p className="font-medium">Warp</p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right side - Event details form */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-md px-3 py-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Personal Calendar</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>

          <VisibilitySelect />
        </div>

        <div>
          <Input
            placeholder="Event Name"
            className="text-2xl font-semibold bg-transparent border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        {/* Date and time */}
        <div className="grid gap-3">
          <EventDateTimePicker
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            timezone={timezone}
            onStartDateChange={setStartDate}
            onStartTimeChange={setStartTime}
            onEndDateChange={setEndDate}
            onEndTimeChange={setEndTime}
            onTimezoneChange={setTimezone}
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-md p-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm">Add Event Location</p>
            <p className="text-xs text-gray-400">
              Offline location or virtual link
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-md p-3">
          <Edit className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm">Add Description</p>
          </div>
        </div>

        {/* Event options */}
        <div className="space-y-4">
          <p className="text-sm font-medium">Event Options</p>

          <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-gray-400" />
              <span>Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Free</span>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <span>Require Approval</span>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>

          <div className="flex items-center justify-between bg-[#1a1a2e] rounded-md p-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <span>Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Unlimited</span>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Create button */}
        <Button
          className={cn(
            "w-full mt-4 rounded-md py-6",
            eventName
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-800 text-gray-400"
          )}
          disabled={!eventName}
        >
          Create Event
        </Button>
      </div>
    </div>
  );
}
