import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, Heart, Share2 } from "lucide-react";
import { formatDateRange, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { celeb: true },
  });

  if (!event) {
    return {
      title: "이벤트를 찾을 수 없습니다",
    };
  }

  return {
    title: `${event.title} - FanPlace`,
    description: event.description || `${event.celeb.name}의 특별한 이벤트`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      celeb: true,
      place: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <Image
          src={
            event.imageUrl ||
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&h=900&fit=crop"
          }
          alt={event.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Floating Actions */}
        <div className="absolute top-6 right-6 flex gap-2">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm mb-4">
              {event.celeb.name}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">기간</p>
                  <p className="text-sm font-medium text-white">
                    {formatDateRange(event.startDate, event.endDate)}
                  </p>
                </div>
              </div>

              {event.place && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/20">
                    <MapPin className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">장소</p>
                    <p className="text-sm font-medium text-white">
                      {event.place.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                  이벤트 소개
                </h2>
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Perks */}
            {event.perks.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">특전</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {event.perks.map((perk: any) => (
                    <div
                      key={perk}
                      className="rounded-lg bg-white/5 border border-white/10 p-3 text-center text-sm text-zinc-200"
                    >
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {event.place && event.place.latitude && event.place.longitude && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">위치</h2>
                <div className="aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <p className="text-zinc-400">
                    지도 뷰는 개발 중입니다 (Mapbox 통합 필요)
                  </p>
                </div>
                <p className="mt-3 text-sm text-zinc-300">
                  {event.place.address}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">주최자</h3>
              <p className="text-white font-medium">{event.user.name}</p>
            </div>

            {/* Action Button */}
            <Button className="w-full" size="lg">
              이벤트 참여하기
            </Button>

            {/* Related */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                관련 이벤트
              </h3>
              <p className="text-sm text-zinc-500">
                더 많은 이벤트를 준비 중입니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

