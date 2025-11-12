export interface PaymentProvider {
  createCheckout(payload: {
    productId: string;
    addons?: any;
    amount: number;
    currency: string;
    userId: string;
    metadata?: Record<string, string>;
  }): Promise<{
    ok: boolean;
    sessionUrl?: string;
    sessionId?: string;
    error?: string;
  }>;

  confirmPayment(payload: {
    sessionId: string;
  }): Promise<{
    ok: boolean;
    orderId?: string;
    paymentIntentId?: string;
    error?: string;
  }>;

  refund?(orderId: string): Promise<{
    ok: boolean;
    error?: string;
  }>;
}

// Provider factory
export async function getPaymentProvider(): Promise<PaymentProvider> {
  const provider = process.env.PAYMENT_PROVIDER || 'stripe';

  switch (provider) {
    case 'stripe':
      const { StripePaymentProvider } = await import('./stripe');
      return new StripePaymentProvider();
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

