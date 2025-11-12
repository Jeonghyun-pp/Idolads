"use client";

import Image from "next/image";
import { Calendar, MapPin, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatDateRange } from "@/lib/utils";

type Props = {
  id: string;
  imageUrl: string;
  celebName: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  place: string;
  perks?: string[];
  onFavorite?: () => void;
  onShare?: () => void;
};

export default function EventCard({
  id,
  imageUrl,
  celebName,
  title,
  startDate,
  endDate,
  place,
  perks = [],
  onFavorite,
  onShare,
}: Props) {
  const [fav, setFav] = useState(false);

  return (
    <Link href={`/events/${id}`}>
      <article className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={imageUrl}
            alt={`${celebName} 생일카페 포스터`}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white/90 border border-white/10">
              {celebName}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setFav((v) => !v);
                onFavorite?.();
              }}
              aria-label="즐겨찾기"
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white/90 transition hover:bg-black/60 ${
                fav ? "ring-2 ring-pink-400/60" : ""
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? "fill-pink-400 text-pink-400" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onShare?.();
              }}
              aria-label="공유"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white/90 transition hover:bg-black/60"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold text-white line-clamp-2">
            {title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-300/90">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDateRange(startDate, endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{place}</span>
            </span>
          </div>
          {perks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {perks.slice(0, 4).map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-200/90"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

