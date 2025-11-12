import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/provider";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
  productId: z.string(),
  userId: z.string(),
  addons: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, addons } = checkoutSchema.parse(body);

    // Fetch product
    const product = await prisma.adProduct.findUnique({
      where: { id: productId, active: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Get payment provider
    const paymentProvider = await getPaymentProvider();

    // Create checkout session
    const result = await paymentProvider.createCheckout({
      productId: product.id,
      addons,
      amount: product.priceKRW,
      currency: "KRW",
      userId,
      metadata: {
        productTitle: product.title,
        termMonths: product.termMonths.toString(),
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "결제 초기화에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionUrl: result.sessionUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

