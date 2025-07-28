"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, CreditCard, QrCode } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";

// Loading component for Suspense fallback
function PaymentMockLoading() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-center text-xl sm:text-2xl flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Loading Payment...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Preparing payment page...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component that uses useSearchParams
function MockPaymentContent() {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(3);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method') || 'va';

  useEffect(() => {
    if (paymentStatus === 'processing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'processing' && countdown === 0) {
      // Simulate successful payment
      setPaymentStatus('success');
      simulatePaymentSuccess();
    }
  }, [paymentStatus, countdown]);

  const simulatePaymentSuccess = async () => {
    try {
      // In a real scenario, iPaymu would call our webhook
      // For demo, we'll simulate it by calling our webhook directly
      const response = await fetch(`${API_ENDPOINTS.BASE}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference_id: `EVT-${paymentId}-mock`,
          status: 'berhasil',
          trx_id: `TRX-${Date.now()}`,
          payment_method: method
        })
      });

      if (response.ok) {
        toast.success('Payment completed successfully!');
      } else {
        console.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handlePayment = () => {
    setPaymentStatus('processing');
    setCountdown(method === 'qris' ? 2 : 3); // QRIS is faster
  };

  const handleBackToEvent = () => {
    router.back();
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'Rp 0';
    return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
  };

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'qris':
        return {
          name: 'QRIS',
          description: 'Scan QR Code with any e-wallet',
          icon: QrCode,
          color: 'from-green-600 to-emerald-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'cc':
        return {
          name: 'Credit Card',
          description: 'Visa, MasterCard, JCB',
          icon: CreditCard,
          color: 'from-blue-600 to-indigo-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      case 'va':
        return {
          name: 'Virtual Account',
          description: 'Bank Transfer via Virtual Account',
          icon: CreditCard,
          color: 'from-purple-600 to-violet-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        };
      default:
        return {
          name: 'Payment',
          description: 'Complete your payment',
          icon: CreditCard,
          color: 'from-blue-600 to-purple-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
    }
  };

  const methodDetails = getMethodDetails(method);
  const IconComponent = methodDetails.icon;

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
      <Card className="overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${methodDetails.color} text-white`}>
          <CardTitle className="text-center text-xl sm:text-2xl flex items-center justify-center gap-2">
            <IconComponent className="h-6 w-6" />
            {paymentStatus === 'pending' && `Pay with ${methodDetails.name}`}
            {paymentStatus === 'processing' && 'Processing Payment...'}
            {paymentStatus === 'success' && 'Payment Successful!'}
            {paymentStatus === 'failed' && 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {paymentStatus === 'pending' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(amount)}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Payment ID: {paymentId}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Method: {methodDetails.description}
                </p>
              </div>

              <div className="space-y-4">
                {method === 'qris' && (
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Scan QR Code to Pay</h3>
                    <div className={`${methodDetails.bgColor} p-6 rounded-lg border-2 border-dashed border-green-300 mx-auto max-w-xs`}>
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="bg-gray-900 h-32 w-32 mx-auto rounded-lg flex items-center justify-center">
                          <div className="grid grid-cols-3 gap-1">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`}></div>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">QR Code untuk pembayaran</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Buka aplikasi e-wallet (GoPay, OVO, Dana, dll.)</p>
                      <p>• Scan QR code di atas</p>
                      <p>• Konfirmasi jumlah pembayaran</p>
                      <p className="font-medium text-green-600">• Pembayaran otomatis terverifikasi</p>
                    </div>
                  </div>
                )}
                
                {method === 'va' && (
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Transfer ke Virtual Account</h3>
                    <div className={`${methodDetails.bgColor} p-6 rounded-lg border`}>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nomor Virtual Account</p>
                          <div className="font-mono text-xl font-bold text-center bg-white dark:bg-gray-800 p-3 rounded border">
                            1179002329092617
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bank</p>
                          <div className="font-medium">Bank Transfer (All Banks)</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Transfer ke nomor VA di atas</p>
                      <p>• Jumlah: {formatCurrency(amount)}</p>
                      <p>• Pembayaran dikonfirmasi otomatis</p>
                      <p className="font-medium text-purple-600">• Berlaku untuk semua bank</p>
                    </div>
                  </div>
                )}

                {method === 'cc' && (
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Pembayaran Kartu Kredit</h3>
                    <div className={`${methodDetails.bgColor} p-6 rounded-lg border`}>
                      <CreditCard className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                      <div className="space-y-2">
                        <p className="font-medium">Kartu Kredit yang Didukung</p>
                        <div className="flex justify-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">Visa</span>
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded">MasterCard</span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">JCB</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Masukkan detail kartu dengan aman</p>
                      <p>• Mendukung Visa, MasterCard, JCB</p>
                      <p>• Autentikasi 3D Secure</p>
                      <p className="font-medium text-blue-600">• Transaksi terenkripsi SSL</p>
                    </div>
                  </div>
                )}
                
                <Button
                  className={`w-full text-white text-lg py-6 bg-gradient-to-r ${methodDetails.color} hover:opacity-90`}
                  onClick={handlePayment}
                  disabled={paymentStatus !== 'pending'}
                >
                  {method === 'qris' && (
                    <>
                      <QrCode className="h-5 w-5 mr-2" />
                      Simulasi Pembayaran QRIS
                    </>
                  )}
                  {method === 'va' && (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Simulasi Transfer VA
                    </>
                  )}
                  {method === 'cc' && (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Simulasi Pembayaran Kartu
                    </>
                  )}
                  {!['qris', 'va', 'cc'].includes(method) && 'Simulasi Pembayaran'}
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={handleBackToEvent}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Kembali ke Event
                  </Button>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <div>
                  <p className="text-lg font-medium">Memproses pembayaran...</p>
                  <p className="text-gray-600 dark:text-gray-400">Tunggu {countdown} detik</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Terima kasih, pembayaran Anda telah berhasil diproses.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      🎫 Tiket Anda telah dikonfirmasi
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      📧 Email konfirmasi akan segera dikirim
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/my-events')}
                >
                  Lihat Tiket Saya
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToEvent}
                >
                  Kembali ke Event
                </Button>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">Pembayaran Gagal</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setPaymentStatus('pending')}
                >
                  Coba Lagi
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToEvent}
                >
                  Kembali ke Event
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
function MockPaymentPage() {
  return (
    <Suspense fallback={<PaymentMockLoading />}>
      <MockPaymentContent />
    </Suspense>
  );
}

export default MockPaymentPage;
