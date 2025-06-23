import EventCreationForm from "@/components/event-form/event-creation-form"
import React from "react";

export default function CreatePage() {
  return (
    <div className="flex mx-auto justify-center bg-gradient-to-b from-neutral-900 to-black">
      <EventCreationForm />
    </div>
  );
}
