import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, DollarSign } from "lucide-react";

export const metadata = {
  title: "장소 - FanPlace",
  description: "생일카페와 이벤트를 위한 최적의 장소를 찾아보세요",
};

export default async function PlacesPage() {
  const places = await prisma.place.findMany({
    where: {
      rentalAvailable: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">장소</h1>
          <p className="mt-2 text-zinc-400">
            생일카페와 이벤트를 위한 최적의 장소를 찾아보세요
          </p>
        </div>

        {/* Map Placeholder */}
        <div className="mb-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <p className="text-zinc-400">
              지도 뷰는 개발 중입니다 (Mapbox 통합 필요)
            </p>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place: any) => (
            <Link key={place.id} href={`/places/${place.id}`}>
              <article className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={
                      place.imageUrls[0] ||
                      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop"
                    }
                    alt={place.name}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {place.region && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white/90 border border-white/10">
                        {place.region}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1">
                    {place.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-300/90 line-clamp-2">
                    {place.description || "장소 설명이 없습니다."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                    {place.capacity && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        최대 {place.capacity}명
                      </span>
                    )}
                    {place.priceRange && (
                      <span className="inline-flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {place.priceRange}
                      </span>
                    )}
                  </div>

                  {place.address && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{place.address}</span>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {places.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">등록된 장소가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

