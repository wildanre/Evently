"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";

interface DescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  onSave: (description: string) => void;
}

export function DescriptionDialog({
  open,
  onOpenChange,
  description,
  onDescriptionChange,
  onSave,
}: DescriptionDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(description);
    onOpenChange(false);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a1a2e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <Edit className="h-5 w-5 text-blue-600" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full text-left justify-start p-0 h-auto text-gray-900 dark:text-white hover:bg-transparent"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">
                {description ? "Edit Description" : "Add Description *"}
              </p>
              {description ? (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {description.substring(0, 50)}...
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-1">
                  Description is required
                </p>
              )}
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px] bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Event Description</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a detailed description for your event to help attendees
              understand what to expect.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe your event, what attendees can expect, agenda, requirements, etc. (Required)"
                className="min-h-[120px] bg-[#1a1a2e] border-gray-700 text-white resize-none"
                rows={6}
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Description
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
