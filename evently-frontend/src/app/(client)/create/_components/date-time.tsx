"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// Time options in 24-hour format with 30-minute intervals
const timeOptions: { value: string; label: string }[] = [];
for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const timeString = `${hour.toString().padStart(2, "0")}.${minute
      .toString()
      .padStart(2, "0")}`;
    timeOptions.push({ value: timeString, label: timeString });
  }
}

// Timezone list
export const timezones = [
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

const formatDate = (date: Date | null) => {
  if (!date) return "Select date";
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

type DateTimeRowProps = {
  label: string;
  date: Date | null;
  time: string;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
  isStart?: boolean;
};

const DateTimeRow = ({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  isStart = false,
}: DateTimeRowProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full border-2 ${
            isStart ? "bg-white border-white" : "bg-transparent border-white/60"
          }`}
        />

      </div>

      {/* Label */}
      <div className="text-white/80 text-lg font-medium w-12">{label}</div>

      {/* Date picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-black/20 hover:bg-black/30 text-white border-0 rounded-lg px-4 py-3 h-auto text-lg font-medium min-w-[140px] justify-start"
          >
            {formatDate(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date ?? undefined}
            onSelect={(newDate) => {
              onDateChange(newDate || null);
              setIsCalendarOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time picker */}
      <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-black/20 hover:bg-black/30 text-white border-0 rounded-lg px-4 py-3 h-auto text-lg font-medium min-w-[80px] justify-center"
          >
            {time || "00.00"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-0" align="center">
          <div className="max-h-60 overflow-y-auto">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className="w-full justify-start font-normal hover:bg-gray-100"
                onClick={() => {
                  onTimeChange(option.value);
                  setIsTimeOpen(false);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

type TimezoneDisplayProps = {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
};

const TimezoneDisplay = ({
  timezone,
  onTimezoneChange,
}: TimezoneDisplayProps) => {
  const selectedTimezone = timezones.find((tz) => tz.value === timezone);

  return (
    <Select value={timezone} onValueChange={onTimezoneChange}>
      <SelectTrigger className="bg-black/20 hover:bg-black/30 text-white border-0 rounded-lg px-6 py-15 h-auto min-w-[140px]">
        <div className="flex flex-col text-left gap-3">
          <Globe className="w-5 h-5 text-white/80" />
          <div className="text-lg font-medium text-white">{timezone}</div>
          <div className="text-sm text-white/60">{selectedTimezone?.city}</div>
        </div>
      </SelectTrigger>
      <SelectContent>
        {timezones.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label} ({tz.city})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export type EventDateTimePickerProps = {
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  timezone: string;
  onStartDateChange: (date: Date | null) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: Date | null) => void;
  onEndTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
};

export const EventDateTimePicker = ({
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
}: EventDateTimePickerProps) => {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl">
      <div className="flex items-start gap-8">
        {/* Date/Time Section */}
        <div className="flex-1 space-y-4">
          <DateTimeRow
            label="Start"
            date={startDate}
            time={startTime}
            onDateChange={onStartDateChange}
            onTimeChange={onStartTimeChange}
            isStart={true}
          />
          <DateTimeRow
            label="End"
            date={endDate}
            time={endTime}
            onDateChange={onEndDateChange}
            onTimeChange={onEndTimeChange}
            isStart={false}
          />
        </div>

        {/* Timezone Section */}
        <div className="flex-shrink-0 ">
          <TimezoneDisplay
            timezone={timezone}
            onTimezoneChange={onTimezoneChange}
          />
        </div>
      </div>
    </div>
  );
};
