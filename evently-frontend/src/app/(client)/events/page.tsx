"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpcomingEventCard from "./_components/upcoming-event-card";
import PastEventCard from "./_components/past-event-card";

export default function page() {
  const [tabValue, setTabValue] = React.useState("upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Events</h1>
          <Tabs
            defaultValue="upcoming"
            className="w-[200px]"
            onValueChange={setTabValue}
          >
            <TabsList className="bg-neutral-800">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-neutral-700"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-neutral-700"
              >
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Using ternary operator for conditional rendering */}
        {tabValue === "upcoming" ? (
          <UpcomingEventCard />
        ) : tabValue === "past" ? (
          <PastEventCard />
        ) : null}
      </div>
    </div>
  );
}
