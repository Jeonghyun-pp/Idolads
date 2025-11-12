import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "startDate";
  const region = searchParams.get("region");
  const celebId = searchParams.get("celebId");

  try {
    const where: any = {
      status: "PUBLISHED",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { celeb: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (region) {
      where.place = {
        region: region,
      };
    }

    if (celebId) {
      where.celebId = celebId;
    }

    let orderBy: any = { startDate: "asc" };

    if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "popular") {
      // For now, use createdAt as proxy for popularity
      orderBy = { createdAt: "desc" };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        celeb: {
          select: {
            id: true,
            name: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
      take: 50,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Add authentication check
    // TODO: Validate body with zod

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        perks: body.perks || [],
        status: "DRAFT",
        celebId: body.celebId,
        placeId: body.placeId,
        userId: body.userId, // Should come from session
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

