import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inquirySchema = z.object({
  placeId: z.string(),
  userId: z.string(),
  message: z.string().min(10, "문의 내용은 최소 10자 이상이어야 합니다."),
  eventDate: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId, userId, message, eventDate } = inquirySchema.parse(body);

    const inquiry = await prisma.placeInquiry.create({
      data: {
        placeId,
        userId,
        message,
        eventDate: eventDate ? new Date(eventDate) : null,
        status: "REQUESTED",
      },
    });

    return NextResponse.json(
      { inquiry, message: "문의가 성공적으로 전송되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Place inquiry error:", error);
    return NextResponse.json(
      { error: "문의 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const placeId = searchParams.get("placeId");

  try {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (placeId) {
      where.placeId = placeId;
    }

    const inquiries = await prisma.placeInquiry.findMany({
      where,
      include: {
        place: {
          select: {
            id: true,
            name: true,
            imageUrls: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

