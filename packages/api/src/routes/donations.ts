import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth as authMiddleware } from '../middleware/auth.js';

const donations = new Hono();

// Validation schemas
const donationSchema = z.object({
  amount: z.number().positive().min(1).max(100000),
  currency: z.enum(['USD', 'CAD', 'EUR', 'GBP']).default('CAD'),
  type: z.enum(['zakat', 'sadaqah', 'fidya', 'kaffarah', 'general', 'masjid_fund', 'ramadan_iftar', 'hajj_fund']),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).optional(),
  anonymousDonation: z.boolean().default(false),
  dedicatedTo: z.string().max(200).optional(),
  message: z.string().max(500).optional(),
  paymentMethodId: z.string().optional(), // Stripe payment method ID
});

const zakatCalculationSchema = z.object({
  assets: z.object({
    cash: z.number().min(0).default(0),
    savings: z.number().min(0).default(0),
    gold: z.object({
      weight: z.number().min(0).default(0), // in grams
      purity: z.number().min(0).max(24).default(24), // karat
      currentPrice: z.number().min(0).optional(), // per gram
    }).optional(),
    silver: z.object({
      weight: z.number().min(0).default(0), // in grams
      currentPrice: z.number().min(0).optional(), // per gram
    }).optional(),
    stocks: z.number().min(0).default(0),
    bonds: z.number().min(0).default(0),
    businessAssets: z.number().min(0).default(0),
    cryptocurrency: z.number().min(0).default(0),
    otherInvestments: z.number().min(0).default(0),
  }),
  liabilities: z.object({
    debt: z.number().min(0).default(0),
    mortgages: z.number().min(0).default(0),
    loans: z.number().min(0).default(0),
    creditCards: z.number().min(0).default(0),
    otherLiabilities: z.number().min(0).default(0),
  }),
  currency: z.enum(['USD', 'CAD', 'EUR', 'GBP']).default('CAD'),
  goldSilverPrices: z.object({
    goldPerGram: z.number().optional(),
    silverPerGram: z.number().optional(),
  }).optional(),
});

const receiptSchema = z.object({
  donationId: z.string(),
  email: z.string().email().optional(),
  includeDetails: z.boolean().default(true),
});

// In-memory storage (in production, use database)
const donations_db = new Map<string, any>();
const receipts_db = new Map<string, any>();
const recurringDonations = new Map<string, any>();
const zakatCalculations = new Map<string, any>();

// Donation types with Islamic descriptions
const DONATION_TYPES = {
  zakat: {
    name: 'Zakat',
    description: 'Obligatory charity - one of the five pillars of Islam',
    nisab: {
      gold: 85, // grams
      silver: 595, // grams
    },
    rate: 0.025, // 2.5%
    minimumAmount: 1,
  },
  sadaqah: {
    name: 'Sadaqah',
    description: 'Voluntary charity given out of compassion, love, friendship or generosity',
    rate: null,
    minimumAmount: 1,
  },
  fidya: {
    name: 'Fidya',
    description: 'Compensation for missed fasts due to illness or inability',
    rate: null,
    minimumAmount: 10, // Approximate cost to feed one person per day
  },
  kaffarah: {
    name: 'Kaffarah',
    description: 'Expiation for breaking an oath or fast intentionally',
    rate: null,
    minimumAmount: 600, // Approximate cost to feed 60 people
  },
  general: {
    name: 'General Donation',
    description: 'General contribution to support masjid operations',
    rate: null,
    minimumAmount: 1,
  },
  masjid_fund: {
    name: 'Masjid Fund',
    description: 'Donations for masjid construction, renovation, and maintenance',
    rate: null,
    minimumAmount: 5,
  },
  ramadan_iftar: {
    name: 'Ramadan Iftar',
    description: 'Sponsoring iftar meals during Ramadan',
    rate: null,
    minimumAmount: 15, // Cost per person for iftar
  },
  hajj_fund: {
    name: 'Hajj Fund',
    description: 'Supporting community members in their Hajj journey',
    rate: null,
    minimumAmount: 50,
  },
};

// Current market prices (in production, fetch from real APIs)
const CURRENT_PRICES = {
  gold: {
    USD: 65.50, // per gram
    CAD: 89.25,
    EUR: 60.80,
    GBP: 52.15,
  },
  silver: {
    USD: 0.85, // per gram
    CAD: 1.16,
    EUR: 0.79,
    GBP: 0.68,
  },
};

// Mock Stripe integration
class PaymentService {
  static async createPaymentIntent(amount: number, currency: string, metadata: any) {
    // In production, integrate with real Stripe
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id: paymentIntentId,
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase(),
      status: 'requires_confirmation',
      client_secret: `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`,
      metadata,
      created: Math.floor(Date.now() / 1000),
    };
  }

  static async confirmPaymentIntent(paymentIntentId: string) {
    // Simulate payment processing
    const success = Math.random() > 0.05; // 95% success rate
    
    return {
      id: paymentIntentId,
      status: success ? 'succeeded' : 'failed',
      amount: Math.floor(Math.random() * 50000) + 1000, // Random amount for demo
      currency: 'cad',
      receipt_url: success ? `https://pay.stripe.com/receipts/${paymentIntentId}` : null,
      failure_reason: success ? null : 'card_declined',
    };
  }

  static async createCustomer(email: string, name: string) {
    return {
      id: `cus_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      email,
      name,
      created: Math.floor(Date.now() / 1000),
    };
  }

  static async setupRecurringDonation(customerId: string, amount: number, currency: string, frequency: string) {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id: subscriptionId,
      customer: customerId,
      amount: amount * 100,
      currency: currency.toLowerCase(),
      interval: frequency,
      status: 'active',
      created: Math.floor(Date.now() / 1000),
    };
  }
}

// Zakat calculation utilities
class ZakatCalculator {
  static calculateNisab(currency: string): { gold: number; silver: number } {
    const goldPrice = CURRENT_PRICES.gold[currency as keyof typeof CURRENT_PRICES.gold];
    const silverPrice = CURRENT_PRICES.silver[currency as keyof typeof CURRENT_PRICES.silver];
    
    return {
      gold: goldPrice * DONATION_TYPES.zakat.nisab.gold,
      silver: silverPrice * DONATION_TYPES.zakat.nisab.silver,
    };
  }

  static calculateGoldValue(weight: number, purity: number, pricePerGram?: number, currency = 'CAD'): number {
    const price = pricePerGram || CURRENT_PRICES.gold[currency as keyof typeof CURRENT_PRICES.gold];
    return weight * (purity / 24) * price;
  }

  static calculateSilverValue(weight: number, pricePerGram?: number, currency = 'CAD'): number {
    const price = pricePerGram || CURRENT_PRICES.silver[currency as keyof typeof CURRENT_PRICES.silver];
    return weight * price;
  }

  static calculateZakat(assets: any, liabilities: any, currency: string) {
    // Calculate total assets
    let totalAssets = 0;
    
    // Cash and savings
    totalAssets += assets.cash + assets.savings;
    
    // Gold value
    if (assets.gold) {
      totalAssets += this.calculateGoldValue(
        assets.gold.weight,
        assets.gold.purity,
        assets.gold.currentPrice,
        currency
      );
    }
    
    // Silver value
    if (assets.silver) {
      totalAssets += this.calculateSilverValue(
        assets.silver.weight,
        assets.silver.currentPrice,
        currency
      );
    }
    
    // Other assets
    totalAssets += assets.stocks + assets.bonds + assets.businessAssets + 
                  assets.cryptocurrency + assets.otherInvestments;
    
    // Calculate total liabilities
    const totalLiabilities = liabilities.debt + liabilities.mortgages + 
                           liabilities.loans + liabilities.creditCards + 
                           liabilities.otherLiabilities;
    
    // Net wealth
    const netWealth = Math.max(0, totalAssets - totalLiabilities);
    
    // Get nisab thresholds
    const nisab = this.calculateNisab(currency);
    
    // Determine which nisab to use (lower of gold and silver)
    const nisabThreshold = Math.min(nisab.gold, nisab.silver);
    
    // Calculate zakat
    const isEligible = netWealth >= nisabThreshold;
    const zakatAmount = isEligible ? netWealth * DONATION_TYPES.zakat.rate : 0;
    
    return {
      totalAssets,
      totalLiabilities,
      netWealth,
      nisabThreshold,
      goldNisab: nisab.gold,
      silverNisab: nisab.silver,
      isEligible,
      zakatAmount: Math.round(zakatAmount * 100) / 100,
      zakatRate: DONATION_TYPES.zakat.rate,
      currency,
      calculatedAt: new Date().toISOString(),
    };
  }
}

// Receipt generator
class ReceiptGenerator {
  static async generateReceipt(donation: any, includeDetails = true) {
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const receipt = {
      id: receiptId,
      donationId: donation.id,
      donorName: donation.anonymousDonation ? 'Anonymous' : donation.donorName,
      amount: donation.amount,
      currency: donation.currency,
      type: donation.type,
      typeName: DONATION_TYPES[donation.type as keyof typeof DONATION_TYPES].name,
      date: donation.createdAt,
      paymentMethod: 'Credit Card', // Simplified
      transactionId: donation.paymentIntentId,
      taxDeductible: true, // Assume all donations are tax-deductible
      organizationInfo: {
        name: 'Masjid At-Taqwa',
        address: '123 Islamic Way, Toronto, ON M1A 1A1',
        phone: '+1 (416) 123-4567',
        email: 'donations@attaqwa.org',
        charitableNumber: 'BN123456789RR0001', // Canadian charity number format
      },
      islamicInfo: {
        hijriDate: this.getHijriDate(new Date(donation.createdAt)),
        duaForDonor: 'May Allah accept your donation and bless you abundantly. Ameen.',
        verse: 'The example of those who spend their wealth in the way of Allah is like a seed that grows seven stalks; in each stalk there are a hundred seeds. Allah multiplies for whom He wills. (Quran 2:261)',
      },
      includeDetails,
    };
    
    receipts_db.set(receiptId, receipt);
    return receipt;
  }

  static getHijriDate(gregorianDate: Date): string {
    // Simplified Hijri date calculation (in production, use proper Islamic calendar library)
    const islamicEpoch = new Date('622-07-16');
    const daysDiff = Math.floor((gregorianDate.getTime() - islamicEpoch.getTime()) / (1000 * 60 * 60 * 24));
    const islamicYear = Math.floor(daysDiff / 354) + 1;
    const remainingDays = daysDiff % 354;
    const islamicMonth = Math.floor(remainingDays / 29.5) + 1;
    const islamicDay = Math.floor(remainingDays % 29.5) + 1;
    
    const monthNames = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
      'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
    ];
    
    return `${Math.max(1, Math.min(30, islamicDay))} ${monthNames[Math.max(0, Math.min(11, islamicMonth - 1))]} ${islamicYear} AH`;
  }
}

// API Endpoints

// GET /api/donations/types
donations.get('/types', async (c) => {
  try {
    const typesWithPricing = Object.entries(DONATION_TYPES).map(([key, info]) => ({
      id: key,
      ...info,
      suggestedAmounts: key === 'zakat' ? [100, 250, 500, 1000] : [10, 25, 50, 100, 250],
    }));
    
    return c.json({
      data: typesWithPricing,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      error: 'Failed to get donation types',
      success: false,
    }, 500);
  }
});

// POST /api/donations/calculate-zakat
donations.post('/calculate-zakat',
  zValidator('json', zakatCalculationSchema),
  async (c) => {
    const calculationData = c.req.valid('json');
    
    try {
      const calculation = ZakatCalculator.calculateZakat(
        calculationData.assets,
        calculationData.liabilities,
        calculationData.currency
      );
      
      // Save calculation for reference
      const calculationId = `calc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      zakatCalculations.set(calculationId, {
        id: calculationId,
        ...calculation,
        inputData: calculationData,
      });
      
      return c.json({
        data: {
          calculationId,
          ...calculation,
        },
        success: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Zakat calculation error:', error);
      return c.json({
        error: 'Failed to calculate zakat',
        message: 'Please check your input and try again',
        success: false,
      }, 400);
    }
  }
);

// GET /api/donations/nisab-rates
donations.get('/nisab-rates', async (c) => {
  const currency = c.req.query('currency') || 'CAD';
  
  try {
    const nisab = ZakatCalculator.calculateNisab(currency);
    const currentPrices = {
      gold: CURRENT_PRICES.gold[currency as keyof typeof CURRENT_PRICES.gold],
      silver: CURRENT_PRICES.silver[currency as keyof typeof CURRENT_PRICES.silver],
    };
    
    return c.json({
      data: {
        currency,
        nisab,
        currentPrices,
        zakatRate: DONATION_TYPES.zakat.rate,
        lastUpdated: new Date().toISOString(),
      },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      error: 'Failed to get nisab rates',
      success: false,
    }, 500);
  }
});

// POST /api/donations/create-payment-intent
donations.post('/create-payment-intent',
  authMiddleware,
  zValidator('json', donationSchema),
  async (c) => {
    const user = c.get('user');
    const donationData = c.req.valid('json');
    
    try {
      // Validate donation amount against minimum for type
      const donationType = DONATION_TYPES[donationData.type];
      if (donationData.amount < donationType.minimumAmount) {
        return c.json({
          error: 'Amount below minimum',
          message: `Minimum amount for ${donationType.name} is ${donationType.minimumAmount} ${donationData.currency}`,
          success: false,
        }, 400);
      }
      
      // Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent(
        donationData.amount,
        donationData.currency,
        {
          userId: user.id,
          userName: user.name,
          donationType: donationData.type,
          isRecurring: donationData.isRecurring.toString(),
        }
      );
      
      // Save donation record
      const donationId = `don_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const donation = {
        id: donationId,
        userId: user.id,
        donorName: user.name,
        donorEmail: user.email,
        ...donationData,
        paymentIntentId: paymentIntent.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      donations_db.set(donationId, donation);
      
      // Handle recurring donation setup if needed
      if (donationData.isRecurring && donationData.recurringFrequency) {
        const customer = await PaymentService.createCustomer(user.email, user.name);
        const subscription = await PaymentService.setupRecurringDonation(
          customer.id,
          donationData.amount,
          donationData.currency,
          donationData.recurringFrequency
        );
        
        donation.customerId = customer.id;
        donation.subscriptionId = subscription.id;
        recurringDonations.set(subscription.id, donation);
      }
      
      return c.json({
        data: {
          donationId,
          paymentIntent: {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
          isRecurring: donationData.isRecurring,
        },
        success: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      return c.json({
        error: 'Failed to create payment intent',
        message: 'Please try again later',
        success: false,
      }, 500);
    }
  }
);

// POST /api/donations/confirm-payment
donations.post('/confirm-payment',
  authMiddleware,
  zValidator('json', z.object({
    donationId: z.string(),
    paymentIntentId: z.string(),
  })),
  async (c) => {
    const user = c.get('user');
    const { donationId, paymentIntentId } = c.req.valid('json');
    
    try {
      const donation = donations_db.get(donationId);
      if (!donation || donation.userId !== user.id) {
        return c.json({
          error: 'Donation not found',
          success: false,
        }, 404);
      }
      
      // Confirm payment with payment processor
      const paymentResult = await PaymentService.confirmPaymentIntent(paymentIntentId);
      
      // Update donation status
      donation.status = paymentResult.status === 'succeeded' ? 'completed' : 'failed';
      donation.paymentResult = paymentResult;
      donation.completedAt = new Date().toISOString();
      
      if (paymentResult.status === 'succeeded') {
        // Generate receipt
        const receipt = await ReceiptGenerator.generateReceipt(donation);
        donation.receiptId = receipt.id;
        
        // Send confirmation notification (if notification system is available)
        // await NotificationService.sendDonationConfirmation(user, donation, receipt);
      }
      
      return c.json({
        data: {
          donationId,
          status: donation.status,
          receiptId: donation.receiptId,
          amount: donation.amount,
          currency: donation.currency,
          type: donation.type,
        },
        success: paymentResult.status === 'succeeded',
        message: paymentResult.status === 'succeeded' ? 
          'Donation completed successfully. May Allah accept your donation!' :
          'Payment failed. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return c.json({
        error: 'Failed to confirm payment',
        message: 'Please try again later',
        success: false,
      }, 500);
    }
  }
);

// GET /api/donations/my-donations
donations.get('/my-donations', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
  const offset = (page - 1) * limit;
  
  try {
    const userDonations = Array.from(donations_db.values())
      .filter(d => d.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    
    const totalUserDonations = Array.from(donations_db.values()).filter(d => d.userId === user.id).length;
    
    // Calculate totals
    const completedDonations = Array.from(donations_db.values()).filter(d => d.userId === user.id && d.status === 'completed');
    const yearlyTotal = completedDonations
      .filter(d => new Date(d.createdAt).getFullYear() === new Date().getFullYear())
      .reduce((sum, d) => sum + d.amount, 0);
    
    return c.json({
      data: userDonations.map(d => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency,
        type: d.type,
        typeName: DONATION_TYPES[d.type as keyof typeof DONATION_TYPES].name,
        status: d.status,
        isRecurring: d.isRecurring,
        dedicatedTo: d.dedicatedTo,
        receiptId: d.receiptId,
        createdAt: d.createdAt,
        completedAt: d.completedAt,
      })),
      pagination: {
        page,
        limit,
        total: totalUserDonations,
        totalPages: Math.ceil(totalUserDonations / limit),
      },
      summary: {
        yearlyTotal,
        totalDonations: completedDonations.length,
        recurringDonations: completedDonations.filter(d => d.isRecurring).length,
      },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get user donations:', error);
    return c.json({
      error: 'Failed to get donations',
      success: false,
    }, 500);
  }
});

// GET /api/donations/receipt/:receiptId
donations.get('/receipt/:receiptId', authMiddleware, async (c) => {
  const user = c.get('user');
  const receiptId = c.req.param('receiptId');
  
  try {
    const receipt = receipts_db.get(receiptId);
    if (!receipt) {
      return c.json({
        error: 'Receipt not found',
        success: false,
      }, 404);
    }
    
    const donation = donations_db.get(receipt.donationId);
    if (!donation || (donation.userId !== user.id && user.role !== 'admin')) {
      return c.json({
        error: 'Access denied',
        success: false,
      }, 403);
    }
    
    return c.json({
      data: receipt,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get receipt:', error);
    return c.json({
      error: 'Failed to get receipt',
      success: false,
    }, 500);
  }
});

// GET /api/donations/statistics (Admin only)
donations.get('/statistics', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({
      error: 'Insufficient permissions',
      success: false,
    }, 403);
  }
  
  try {
    const allDonations = Array.from(donations_db.values()).filter(d => d.status === 'completed');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Calculate statistics
    const yearlyTotal = allDonations
      .filter(d => new Date(d.createdAt).getFullYear() === currentYear)
      .reduce((sum, d) => sum + d.amount, 0);
    
    const monthlyTotal = allDonations
      .filter(d => {
        const date = new Date(d.createdAt);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce((sum, d) => sum + d.amount, 0);
    
    const donationsByType = allDonations.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + d.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const recurringDonationStats = {
      total: Array.from(recurringDonations.size),
      monthly: Array.from(recurringDonations.values()).filter(d => d.recurringFrequency === 'monthly').length,
      quarterly: Array.from(recurringDonations.values()).filter(d => d.recurringFrequency === 'quarterly').length,
      annually: Array.from(recurringDonations.values()).filter(d => d.recurringFrequency === 'annually').length,
    };
    
    return c.json({
      data: {
        totalRaised: allDonations.reduce((sum, d) => sum + d.amount, 0),
        yearlyTotal,
        monthlyTotal,
        totalDonations: allDonations.length,
        uniqueDonors: new Set(allDonations.map(d => d.userId)).size,
        donationsByType,
        recurringDonations: recurringDonationStats,
        averageDonation: allDonations.length > 0 ? 
          allDonations.reduce((sum, d) => sum + d.amount, 0) / allDonations.length : 0,
      },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get donation statistics:', error);
    return c.json({
      error: 'Failed to get statistics',
      success: false,
    }, 500);
  }
});

// Health check endpoint
donations.get('/health', async (c) => {
  try {
    const stats = {
      totalDonations: donations_db.size,
      completedDonations: Array.from(donations_db.values()).filter(d => d.status === 'completed').length,
      recurringDonations: recurringDonations.size,
      receiptsGenerated: receipts_db.size,
      zakatCalculations: zakatCalculations.size,
    };
    
    return c.json({
      status: 'healthy',
      service: 'donations',
      statistics: stats,
      features: [
        'zakat-calculator',
        'multiple-donation-types',
        'recurring-donations',
        'receipt-generation',
        'islamic-calendar-integration',
        'stripe-integration',
        'tax-deductible-receipts'
      ],
      supportedCurrencies: ['USD', 'CAD', 'EUR', 'GBP'],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      status: 'error',
      service: 'donations',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export { donations as donationRoutes };