import Stripe from 'stripe';
import { PaymentProvider } from './provider';
import { prisma } from '@/lib/prisma';

export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckout(payload: {
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
  }> {
    try {
      // Create order in database first
      const order = await prisma.order.create({
        data: {
          status: 'PENDING',
          amount: payload.amount,
          currency: payload.currency,
          productId: payload.productId,
          userId: payload.userId,
          addons: payload.addons,
          paymentProvider: 'stripe',
        },
      });

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: payload.currency.toLowerCase(),
              product_data: {
                name: '팬덤 광고 상품',
                description: `Order #${order.orderNumber}`,
              },
              unit_amount: payload.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/account?order_success=${order.id}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/ads/checkout?canceled=true`,
        metadata: {
          orderId: order.id,
          userId: payload.userId,
          ...payload.metadata,
        },
      });

      // Update order with session ID
      await prisma.order.update({
        where: { id: order.id },
        data: { sessionId: session.id },
      });

      return {
        ok: true,
        sessionUrl: session.url || undefined,
        sessionId: session.id,
      };
    } catch (error) {
      console.error('Stripe checkout error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Payment setup failed',
      };
    }
  }

  async confirmPayment(payload: {
    sessionId: string;
  }): Promise<{
    ok: boolean;
    orderId?: string;
    paymentIntentId?: string;
    error?: string;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(payload.sessionId);

      if (session.payment_status !== 'paid') {
        return {
          ok: false,
          error: 'Payment not completed',
        };
      }

      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return {
          ok: false,
          error: 'Order ID not found in session',
        };
      }

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentIntentId: session.payment_intent as string,
        },
      });

      return {
        ok: true,
        orderId,
        paymentIntentId: session.payment_intent as string,
      };
    } catch (error) {
      console.error('Stripe confirm error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  async refund(orderId: string): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order || !order.paymentIntentId) {
        return {
          ok: false,
          error: 'Order or payment intent not found',
        };
      }

      await this.stripe.refunds.create({
        payment_intent: order.paymentIntentId,
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'REFUNDED' },
      });

      return { ok: true };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }
}

