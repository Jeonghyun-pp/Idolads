import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = updateSchema.parse(body);

    const review = await prisma.adReview.update({
      where: { id: params.id },
      data: {
        status,
        reviewedAt: new Date(),
      },
    });

    // If approved, create posting
    if (status === "APPROVED") {
      const order = await prisma.order.findUnique({
        where: { id: review.orderId },
        include: { product: true },
      });

      if (order) {
        const startDate = review.targetDate || new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + order.product.termMonths);

        await prisma.adPosting.create({
          data: {
            orderId: order.id,
            startDate,
            endDate,
            locations: order.product.placement,
          },
        });
      }
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

