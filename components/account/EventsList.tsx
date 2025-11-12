"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/utils";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

type Event = {
  id: string;
  title: string;
  imageUrl: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  celeb: {
    name: string;
  };
  place: {
    name: string;
  } | null;
};

export default function EventsList({ events }: { events: Event[] }) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      DRAFT: { variant: "secondary" as const, label: "초안" },
      PUBLISHED: { variant: "default" as const, label: "게시됨" },
      ENDED: { variant: "outline" as const, label: "종료됨" },
    };

    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-400">등록한 이벤트가 없습니다</p>
        <p className="text-sm text-zinc-500 mt-2">
          생일카페나 팬 이벤트를 등록해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <article className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={
                  event.imageUrl ||
                  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop"
                }
                alt={event.title}
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(event.status)}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1 mb-2">
                {event.title}
              </h3>

              <div className="space-y-2 text-sm text-zinc-300/90">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{event.celeb.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  {formatDateRange(event.startDate, event.endDate)}
                </div>
                {event.place && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    {event.place.name}
                  </div>
                )}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

