"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2, Clock, X, AlertTriangle } from "lucide-react";

interface JoinEventButtonProps {
  eventId: string;
  isJoined: boolean;
  eventName: string;
  requireApproval?: boolean;
  joinStatus?: 'joined' | 'pending' | 'rejected' | 'not_joined'; // Add rejected status
  onJoinStatusChange?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function JoinEventButton({
  eventId,
  isJoined,
  eventName,
  requireApproval = false,
  joinStatus = 'not_joined', // Default value
  onJoinStatusChange,
  className = "",
  size = "default"
}: JoinEventButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [currentJoinStatus, setCurrentJoinStatus] = useState(joinStatus);
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
    setCurrentJoinStatus(joinStatus);
  }, [isJoined, joinStatus]);

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
        // Update join status based on API response
        if (statusData.status) {
          setCurrentJoinStatus(statusData.status);
        } else {
          setCurrentJoinStatus(statusData.isJoined ? 'joined' : 'not_joined');
        }
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
        
        if (data.requireApproval || requireApproval) {
          setCurrentJoinStatus('pending');
          setJoined(false); // Not fully joined yet, just pending
          const isReRegistration = currentJoinStatus === 'rejected';
          toast.success(isReRegistration ? "Re-registration submitted!" : "Registration submitted!", {
            description: isReRegistration 
              ? `Your new request to join "${eventName}" is pending approval from the organizer.`
              : `Your request to join "${eventName}" is pending approval from the organizer.`,
            duration: 6000,
          });
        } else {
          setCurrentJoinStatus('joined');
          setJoined(true);
          const isReRegistration = currentJoinStatus === 'rejected';
          toast.success(isReRegistration ? "Successfully re-joined event!" : "Successfully joined event!", {
            description: `You've ${isReRegistration ? 're-' : ''}joined "${eventName}". Check your My Events page.`,
            duration: 5000,
          });
        }
        
        if (onJoinStatusChange) onJoinStatusChange();
      } else {
        const errorData = await response.json();
        
        if (response.status === 400) {
          if (errorData.error.includes('already registered')) {
            // Check current status to determine appropriate message
            if (currentJoinStatus === 'rejected') {
              // This shouldn't happen now since backend allows re-registration after rejection
              setCurrentJoinStatus('rejected');
              toast.info("Registration was rejected", {
                description: "Your previous registration was rejected. Please try joining again.",
              });
            } else {
              toast.info("Already joined", {
                description: "You're already registered for this event.",
              });
              setCurrentJoinStatus('joined');
              setJoined(true);
            }
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
        setCurrentJoinStatus('not_joined');
        setJoined(false);
        if (onJoinStatusChange) onJoinStatusChange();
        
        // Show appropriate message based on previous status
        if (currentJoinStatus === 'pending') {
          toast.success("Registration canceled", {
            description: `Your registration request for "${eventName}" has been canceled.`,
          });
        } else {
          toast.success("Successfully left event", {
            description: `You've left "${eventName}".`,
          });
        }
      } else {
        const errorData = await response.json();
        const actionText = currentJoinStatus === 'pending' ? 'cancel registration' : 'leave event';
        toast.error(`Failed to ${actionText}`, {
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

  // Show pending status button
  if (currentJoinStatus === 'pending') {
    return (
      <Button
        size={size}
        variant="outline"
        className={`border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 ${className}`}
        onClick={handleLeaveEvent}
        disabled={loading || checkingStatus}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <X className="h-4 w-4 mr-2" />
        )}
        {loading ? "Canceling..." : "Cancel Request"}
      </Button>
    );
  }

  // Show rejected status button - allow re-joining
  if (currentJoinStatus === 'rejected') {
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
        {loading ? "Joining..." : checkingStatus ? "Loading..." : "Join Again"}
      </Button>
    );
  }

  if (joined || currentJoinStatus === 'joined') {
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
