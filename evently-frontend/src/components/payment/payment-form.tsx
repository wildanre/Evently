"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Smartphone, QrCode, Building, Users, Calendar, MapPin } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { PAYMENT_CONFIG, getAvailablePaymentMethods, formatAmount, validatePaymentAmount } from "@/lib/payment-config";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentFormProps {
  event: {
    id: string;
    name: string;
    startDate: string;
    location: string;
    ticketPrice: number;
    capacity?: number;
    attendeeCount: number;
    imageUrl?: string;
  };
  onPaymentSuccess?: (paymentData: any) => void;
  onCancel?: () => void;
}

export function PaymentForm({ event, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(PAYMENT_CONFIG.SETTINGS.DEFAULT_QUANTITY);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = event.ticketPrice * quantity;
  const maxQuantity = event.capacity ? Math.min(PAYMENT_CONFIG.SETTINGS.MAX_QUANTITY, event.capacity - event.attendeeCount) : PAYMENT_CONFIG.SETTINGS.MAX_QUANTITY;

  const paymentMethods = getAvailablePaymentMethods();

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast.error("Please fill in your name, email, and phone number");
      return;
    }

    // Validate payment amount
    const validation = validatePaymentAmount(totalAmount);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const paymentData = {
        eventId: event.id,
        quantity: quantity,
        paymentMethod: paymentMethod,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim()
      };

      console.log('Sending payment data:', paymentData);

      const response = await fetch(`${API_ENDPOINTS.PAYMENTS}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Payment created successfully!");
        
        // Redirect to payment URL
        if (result.data.paymentUrl) {
          window.open(result.data.paymentUrl, '_blank');
        }

        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess(result.data);
        }
      } else {
        toast.error(result.error || "Failed to create payment");
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Purchase Event Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your payment to secure your tickets
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.imageUrl && (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src={event.imageUrl} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {event.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  {event.attendeeCount} attendees
                  {event.capacity && ` / ${event.capacity} capacity`}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Ticket Price:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(event.ticketPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Number of Tickets</Label>
              <Select
                value={quantity.toString()}
                onValueChange={(value) => setQuantity(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} ticket{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <div className="grid gap-3 mt-2">
                {paymentMethods.map((method) => {
                  // Map icon names to actual components
                  const getIcon = (iconName: string) => {
                    switch (iconName) {
                      case 'CreditCard': return CreditCard;
                      case 'QrCode': return QrCode;
                      case 'Building': return Building;
                      case 'Smartphone': return Smartphone;
                      default: return CreditCard;
                    }
                  };
                  
                  const Icon = getIcon(method.icon);
                  
                  return (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${
                          paymentMethod === method.id ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-medium ${
                            paymentMethod === method.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                          }`}>
                            {method.name}
                          </div>
                          <div className={`text-sm ${
                            paymentMethod === method.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'
                          }`}>
                            {method.description}
                          </div>
                          {method.id === 'qris' && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                              ⚡ Instant payment
                            </div>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buyer Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Buyer Information</h4>
              
              <div>
                <Label htmlFor="buyerName">Full Name *</Label>
                <Input
                  id="buyerName"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyerEmail">Email Address *</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyerPhone">Phone Number *</Label>
                <Input
                  id="buyerPhone"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  required
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium">Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span>{quantity} × {formatCurrency(event.ticketPrice)}</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !paymentMethod}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
