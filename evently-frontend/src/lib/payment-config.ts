// Payment configuration for iPaymu integration
export const PAYMENT_CONFIG = {
  // iPaymu Configuration
  IPAYMU: {
    VA: process.env.NEXT_PUBLIC_IPAYMU_VA || '1234567890',
    API_KEY: process.env.NEXT_PUBLIC_IPAYMU_API_KEY || 'demo-api-key',
    BASE_URL: process.env.NEXT_PUBLIC_IPAYMU_BASE_URL || 'https://sandbox.ipaymu.com/api/v2',
  },
  
  // Payment Methods
  METHODS: {
    VA: {
      id: 'va',
      name: 'Virtual Account',
      description: 'Bank Transfer via Virtual Account',
      icon: 'CreditCard',
      enabled: true,
    },
    CC: {
      id: 'cc',
      name: 'Credit Card',
      description: 'Visa, MasterCard, JCB',
      icon: 'CreditCard',
      enabled: true,
    },
    QRIS: {
      id: 'qris',
      name: 'QRIS',
      description: 'Scan QR Code with any e-wallet (⚡ Instant)',
      icon: 'QrCode',
      enabled: true,
      featured: true, // Mark as featured for priority display
    },
    CONVENIENCE_STORE: {
      id: 'convenience_store',
      name: 'Convenience Store',
      description: 'Alfamart, Indomaret',
      icon: 'Building',
      enabled: false, // Disabled for now
    },
  },
  
  // Currency Configuration
  CURRENCY: {
    CODE: process.env.NEXT_PUBLIC_CURRENCY || 'IDR',
    SYMBOL: 'Rp',
    LOCALE: 'id-ID',
  },
  
  // Payment Settings
  SETTINGS: {
    ENABLED: process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true',
    MIN_AMOUNT: 10000, // Minimum Rp 10,000
    MAX_AMOUNT: 50000000, // Maximum Rp 50,000,000
    DEFAULT_QUANTITY: 1,
    MAX_QUANTITY: 10,
  },
  
  // Payment Status
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  },
  
  // Payment Status Colors
  STATUS_COLORS: {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  },
};

// Helper Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(PAYMENT_CONFIG.CURRENCY.LOCALE, {
    style: 'currency',
    currency: PAYMENT_CONFIG.CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatAmount = (amount: number): string => {
  return `${PAYMENT_CONFIG.CURRENCY.SYMBOL} ${amount.toLocaleString(PAYMENT_CONFIG.CURRENCY.LOCALE)}`;
};

export const isPaymentEnabled = (): boolean => {
  return PAYMENT_CONFIG.SETTINGS.ENABLED;
};

export const getAvailablePaymentMethods = () => {
  const enabledMethods = process.env.NEXT_PUBLIC_PAYMENT_METHODS?.split(',') || ['va', 'cc', 'qris'];
  
  return Object.values(PAYMENT_CONFIG.METHODS).filter(method => 
    method.enabled && enabledMethods.includes(method.id)
  );
};

export const validatePaymentAmount = (amount: number): { valid: boolean; message?: string } => {
  if (amount < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) {
    return {
      valid: false,
      message: `Minimum amount is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)}`
    };
  }
  
  if (amount > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) {
    return {
      valid: false,
      message: `Maximum amount is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT)}`
    };
  }
  
  return { valid: true };
};

export const getPaymentStatusColor = (status: string): string => {
  return PAYMENT_CONFIG.STATUS_COLORS[status as keyof typeof PAYMENT_CONFIG.STATUS_COLORS] || 
         PAYMENT_CONFIG.STATUS_COLORS.pending;
};

export const generatePaymentReference = (eventId: string): string => {
  return `EVT-${eventId}-${Date.now()}`;
};

// iPaymu Signature Generation (client-side helper)
export const generatePaymentSignature = (method: string, url: string, body?: any): string => {
  // Note: In production, signature should be generated on server-side for security
  // This is for reference only
  const crypto = require('crypto');
  const bodyHash = body ? crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') : '';
  const stringToSign = `${method.toUpperCase()}:${url}:${bodyHash}:${PAYMENT_CONFIG.IPAYMU.API_KEY}`;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
};

export default PAYMENT_CONFIG;
