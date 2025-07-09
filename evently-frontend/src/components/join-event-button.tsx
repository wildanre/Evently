"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2, Clock, X, AlertTriangle, CreditCard } from "lucide-react";

interface JoinEventButtonRef {
  refreshPaymentStatus: () => void;
}

interface JoinEventButtonProps {
  eventId: string;
  isJoined: boolean;
  eventName: string;
  requireApproval?: boolean;
  joinStatus?: 'joined' | 'pending' | 'rejected' | 'not_joined';
  ticketPrice?: number; // Add ticket price prop
  onJoinStatusChange?: () => void;
  onPaymentRequired?: () => void; // Add callback for payment
  onPaymentSuccess?: () => void; // Add callback for payment success
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const JoinEventButton = forwardRef<JoinEventButtonRef, JoinEventButtonProps>(({
  eventId,
  isJoined,
  eventName,
  requireApproval = false,
  joinStatus = 'not_joined',
  ticketPrice,
  onJoinStatusChange,
  onPaymentRequired,
  onPaymentSuccess,
  className = "",
  size = "default"
}, ref) => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [currentJoinStatus, setCurrentJoinStatus] = useState(joinStatus);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const isPaidEvent = ticketPrice && ticketPrice > 0;

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('JoinEventButton props:', {
        eventId,
        ticketPrice,
        isPaidEvent,
        isJoined,
        joinStatus,
        hasPaid
      });
    }
  }, [eventId, ticketPrice, isPaidEvent, isJoined, joinStatus, hasPaid]);

  // Check if user has already joined this event when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      checkJoinStatus();
      if (isPaidEvent) {
        checkPaymentStatus();
      }
    }
  }, [eventId, isAuthenticated, user?.email, isPaidEvent]);

  // Check payment status when ticketPrice changes (for event sliders that load data async)
  useEffect(() => {
    if (isPaidEvent && isAuthenticated && user?.email) {
      checkPaymentStatus();
    }
  }, [ticketPrice, isPaidEvent, isAuthenticated, user?.email]);

  // Refresh payment status when join status changes, but avoid infinite loops
  useEffect(() => {
    if (isPaidEvent && isAuthenticated && user?.email && currentJoinStatus !== 'joined') {
      checkPaymentStatus();
    }
  }, [currentJoinStatus, isPaidEvent, isAuthenticated, user?.email]);

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

  const checkPaymentStatus = async () => {
    if (!isAuthenticated || !user?.email || !isPaidEvent) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      console.log('Checking payment status for event:', eventId, 'user:', user.email);
      const response = await fetch(`${API_ENDPOINTS.PAYMENTS}/check/${eventId}?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Payment check result:', result);
        const hasPaidStatus = result.data?.hasPaid || false;
        setHasPaid(hasPaidStatus);
        
        // If user has paid but not joined yet, and not pending approval, auto-join them
        if (hasPaidStatus && currentJoinStatus === 'not_joined' && !requireApproval) {
          console.log('User has paid but not joined, auto-joining...');
          await handleAutoJoin();
        }
      } else {
        console.error('Payment check failed:', response.status);
        setHasPaid(false);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setHasPaid(false);
    }
  };

  const handleAutoJoin = async () => {
    if (!isAuthenticated || !user?.email) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

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
          setJoined(false);
        } else {
          setCurrentJoinStatus('joined');
          setJoined(true);
        }
        
        if (onJoinStatusChange) onJoinStatusChange();
      }
    } catch (error) {
      console.error('Auto-join error:', error);
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
          
          // For paid events, also check payment when showing success message
          if (isPaidEvent && !hasPaid) {
            toast.success(isReRegistration ? "Re-registration submitted!" : "Registration submitted!", {
              description: isReRegistration 
                ? `Your new request to join "${eventName}" is pending approval. Payment will be required once approved.`
                : `Your request to join "${eventName}" is pending approval. Payment will be required once approved.`,
              duration: 6000,
            });
          } else {
            toast.success(isReRegistration ? "Re-registration submitted!" : "Registration submitted!", {
              description: isReRegistration 
                ? `Your new request to join "${eventName}" is pending approval from the organizer.`
                : `Your request to join "${eventName}" is pending approval from the organizer.`,
              duration: 6000,
            });
          }
        } else {
          setCurrentJoinStatus('joined');
          setJoined(true);
          const isReRegistration = currentJoinStatus === 'rejected';
          
          // For paid events, show payment reminder
          if (isPaidEvent && !hasPaid) {
            toast.success(isReRegistration ? "Successfully re-joined event!" : "Successfully joined event!", {
              description: `You've ${isReRegistration ? 're-' : ''}joined "${eventName}". Please complete payment to confirm your ticket.`,
              duration: 6000,
              action: {
                label: "Pay Now",
                onClick: () => {
                  if (onPaymentRequired) {
                    onPaymentRequired();
                  }
                }
              }
            });
          } else {
            toast.success(isReRegistration ? "Successfully re-joined event!" : "Successfully joined event!", {
              description: `You've ${isReRegistration ? 're-' : ''}joined "${eventName}". Check your My Events page.`,
              duration: 5000,
            });
          }
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

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refreshPaymentStatus: checkPaymentStatus,
  }));

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

  // For paid events, show buy tickets button if not paid, BUT allow showing status if already registered
  if (isPaidEvent && !hasPaid && currentJoinStatus === 'not_joined') {
    return (
      <Button
        size={size}
        className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
        onClick={() => {
          if (onPaymentRequired) {
            onPaymentRequired();
          } else {
            toast.error("Payment required", {
              description: "Please purchase tickets to join this event."
            });
          }
        }}
        disabled={loading || checkingStatus}
      >
        {(loading || checkingStatus) ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        {loading ? "Loading..." : checkingStatus ? "Checking..." : `Buy Tickets (Rp ${ticketPrice?.toLocaleString('id-ID')})`}
      </Button>
    );
  }

  // If user is registered but hasn't paid for a paid event, show payment required message
  if (isPaidEvent && !hasPaid && (currentJoinStatus === 'pending' || currentJoinStatus === 'joined')) {
    return (
      <Button
        size={size}
        className={`bg-orange-600 hover:bg-orange-700 text-white ${className}`}
        onClick={() => {
          if (onPaymentRequired) {
            onPaymentRequired();
          } else {
            toast.error("Payment required", {
              description: "Complete payment to confirm your registration."
            });
          }
        }}
        disabled={loading || checkingStatus}
      >
        {(loading || checkingStatus) ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        {loading ? "Loading..." : checkingStatus ? "Checking..." : "Payment Required"}
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
    <div className="flex gap-2">
      <Button
        size={size}
        className={`bg-blue-600 hover:bg-blue-700 text-white flex-1 ${className}`}
        onClick={handleJoinEvent}
        disabled={loading || checkingStatus}
      >
        {(loading || checkingStatus) ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        {loading ? "Joining..." : checkingStatus ? "Loading..." : 
         isPaidEvent ? "Join (Payment Later)" : "Join Event"}
      </Button>
      
      {isPaidEvent && (
        <Button
          size={size}
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => {
            if (onPaymentRequired) {
              onPaymentRequired();
            } else {
              toast.error("Payment required", {
                description: "Please purchase tickets to join this event."
              });
            }
          }}
          disabled={loading || checkingStatus}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Buy Tickets
        </Button>
      )}
    </div>
  );
});

JoinEventButton.displayName = 'JoinEventButton';
