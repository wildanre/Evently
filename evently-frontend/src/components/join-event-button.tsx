"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface JoinEventButtonProps {
  eventId: string;
  isJoined: boolean;
  eventName: string;
  requireApproval?: boolean;
  onJoinStatusChange?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function JoinEventButton({
  eventId,
  isJoined,
  eventName,
  requireApproval = false,
  onJoinStatusChange,
  className = "",
  size = "default"
}: JoinEventButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check if user has already joined this event when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      checkJoinStatus();
    }
  }, [eventId, isAuthenticated, user?.email]);

  // Update joined state when isJoined prop changes
  useEffect(() => {
    setJoined(isJoined);
  }, [isJoined]);

  const checkJoinStatus = async () => {
    if (!isAuthenticated || !user?.email) return;

    console.log("Checking join status for event:", eventId, "user:", user.email);
    setCheckingStatus(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Use the new join-status endpoint
      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${eventId}/join-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const statusData = await response.json();
        console.log("Join status result:", statusData);
        setJoined(statusData.isJoined || false);
      }
    } catch (error) {
      console.error('Error checking join status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to join events", {
        action: {
          label: "Login",
          onClick: () => window.location.href = '/login'
        }
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJoined(true);
        if (onJoinStatusChange) onJoinStatusChange();
        
        if (data.requireApproval || requireApproval) {
          toast.success("Registration submitted!", {
            description: `Your request to join "${eventName}" is pending approval from the organizer.`,
            duration: 6000,
          });
        } else {
          toast.success("Successfully joined event!", {
            description: `You've joined "${eventName}". Check your My Events page.`,
            duration: 5000,
          });
        }
      } else {
        const errorData = await response.json();
        
        if (response.status === 400) {
          if (errorData.error.includes('already registered')) {
            toast.info("Already joined", {
              description: "You're already registered for this event.",
            });
            setJoined(true);
            if (onJoinStatusChange) onJoinStatusChange();
          } else if (errorData.error.includes('Event is full')) {
            toast.error("Event is full", {
              description: "This event has reached its maximum capacity.",
            });
          } else {
            toast.error("Cannot join event", {
              description: errorData.error || "Please try again later.",
            });
          }
        } else if (response.status === 404) {
          toast.error("Event not found", {
            description: "This event may have been deleted or moved.",
          });
        } else {
          toast.error("Failed to join event", {
            description: "Please try again later.",
          });
        }
      }
    } catch (error) {
      console.error('Join event error:', error);
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.EVENTS}/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJoined(false);
        if (onJoinStatusChange) onJoinStatusChange();
        toast.success("Successfully left event", {
          description: `You've left "${eventName}".`,
        });
      } else {
        const errorData = await response.json();
        toast.error("Failed to leave event", {
          description: errorData.error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error('Leave event error:', error);
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        size={size}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        onClick={() => {
          toast.info("Login required", {
            description: "Please log in to join events.",
            action: {
              label: "Login",
              onClick: () => window.location.href = '/login'
            }
          });
        }}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Join Event
      </Button>
    );
  }

  if (joined) {
    return (
      <Button
        size={size}
        variant="outline"
        className={`border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 ${className}`}
        onClick={handleLeaveEvent}
        disabled={loading || checkingStatus}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserMinus className="h-4 w-4 mr-2" />
        )}
        {loading ? "Leaving..." : "Leave Event"}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      onClick={handleJoinEvent}
      disabled={loading || checkingStatus}
    >
      {(loading || checkingStatus) ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {loading ? "Joining..." : checkingStatus ? "Loading..." : "Join Event"}
    </Button>
  );
}
