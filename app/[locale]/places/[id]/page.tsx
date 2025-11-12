import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Users, DollarSign, Calendar, Info } from "lucide-react";
import InquiryForm from "@/components/places/InquiryForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const place = await prisma.place.findUnique({
    where: { id: params.id },
  });

  if (!place) {
    return {
      title: "장소를 찾을 수 없습니다",
    };
  }

  return {
    title: `${place.name} - FanPlace`,
    description: place.description || `${place.name}에서 특별한 이벤트를 계획하세요`,
  };
}

export default async function PlaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const place = await prisma.place.findUnique({
    where: { id: params.id },
  });

  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Gallery */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <Image
          src={
            place.imageUrls[0] ||
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&h=900&fit=crop"
          }
          alt={place.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {place.region && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm mb-4">
                {place.region}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {place.name}
            </h1>
            {place.address && (
              <p className="text-zinc-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {place.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {place.capacity && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">수용 인원</p>
                    <p className="text-sm font-medium text-white">
                      최대 {place.capacity}명
                    </p>
                  </div>
                </div>
              )}

              {place.priceRange && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/20">
                    <DollarSign className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">가격대</p>
                    <p className="text-sm font-medium text-white">
                      {place.priceRange}
                    </p>
                  </div>
                </div>
              )}

              {place.rentalAvailable && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">대관 가능</p>
                    <p className="text-sm font-medium text-white">예약 가능</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {place.description && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                  장소 소개
                </h2>
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {place.description}
                </p>
              </div>
            )}

            {/* Rental Rules */}
            {place.rentalRules && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  대관 안내
                </h2>
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {place.rentalRules}
                </p>
              </div>
            )}

            {/* Map */}
            {place.latitude && place.longitude && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">위치</h2>
                <div className="aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <p className="text-zinc-400">
                    지도 뷰는 개발 중입니다 (Mapbox 통합 필요)
                  </p>
                </div>
                <p className="mt-3 text-sm text-zinc-300">{place.address}</p>
              </div>
            )}

            {/* Gallery */}
            {place.imageUrls.length > 1 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  갤러리
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {place.imageUrls.slice(1).map((url: any, idx: any) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`${place.name} 갤러리 ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inquiry Form */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                대관 문의
              </h3>
              {session ? (
                <InquiryForm placeId={place.id} userId={(session.user as any)?.id as string} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-zinc-400 mb-4">
                    대관 문의를 하려면 로그인이 필요합니다
                  </p>
                  <a
                    href="/auth/signin"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 transition"
                  >
                    로그인하기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

