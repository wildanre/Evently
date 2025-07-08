"use client";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

interface EventDateTimePickerProps {
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  timezone: string;
  onStartDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onEndTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
}

// Timezone list
const timezones = [
  { value: "GMT-12:00", label: "GMT-12:00", city: "Baker Island" },
  { value: "GMT-11:00", label: "GMT-11:00", city: "Honolulu" },
  { value: "GMT-10:00", label: "GMT-10:00", city: "Anchorage" },
  { value: "GMT-09:00", label: "GMT-09:00", city: "Los Angeles" },
  { value: "GMT-08:00", label: "GMT-08:00", city: "Denver" },
  { value: "GMT-07:00", label: "GMT-07:00", city: "Chicago" },
  { value: "GMT-06:00", label: "GMT-06:00", city: "New York" },
  { value: "GMT-05:00", label: "GMT-05:00", city: "Caracas" },
  { value: "GMT-04:00", label: "GMT-04:00", city: "Santiago" },
  { value: "GMT-03:00", label: "GMT-03:00", city: "Buenos Aires" },
  { value: "GMT-02:00", label: "GMT-02:00", city: "South Georgia" },
  { value: "GMT-01:00", label: "GMT-01:00", city: "Azores" },
  { value: "GMT+00:00", label: "GMT+00:00", city: "London" },
  { value: "GMT+01:00", label: "GMT+01:00", city: "Berlin" },
  { value: "GMT+02:00", label: "GMT+02:00", city: "Cairo" },
  { value: "GMT+03:00", label: "GMT+03:00", city: "Moscow" },
  { value: "GMT+04:00", label: "GMT+04:00", city: "Dubai" },
  { value: "GMT+05:00", label: "GMT+05:00", city: "Karachi" },
  { value: "GMT+05:30", label: "GMT+05:30", city: "Mumbai" },
  { value: "GMT+06:00", label: "GMT+06:00", city: "Dhaka" },
  { value: "GMT+07:00", label: "GMT+07:00", city: "Jakarta" },
  { value: "GMT+08:00", label: "GMT+08:00", city: "Singapore" },
  { value: "GMT+09:00", label: "GMT+09:00", city: "Tokyo" },
  { value: "GMT+10:00", label: "GMT+10:00", city: "Sydney" },
  { value: "GMT+11:00", label: "GMT+11:00", city: "Noumea" },
  { value: "GMT+12:00", label: "GMT+12:00", city: "Auckland" },
];

export function EventDateTimePicker({
  startDate,
  startTime,
  endDate,
  endTime,
  timezone,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onTimezoneChange,
}: EventDateTimePickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date" className="text-gray-700 dark:text-white">
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700"
              align="start"
            >
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="start-time" className="text-gray-700 dark:text-white">
            Start Time
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
            <Input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="end-date" className="text-gray-700 dark:text-white">
            End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700"
              align="start"
            >
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                disabled={(date) => date < startDate}
                initialFocus
                className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="end-time" className="text-gray-700 dark:text-white">
            End Time
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
            <Input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-10"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="timezone" className="text-gray-700 dark:text-white">
          Timezone
        </Label>
        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger className="w-full bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label} - {tz.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
