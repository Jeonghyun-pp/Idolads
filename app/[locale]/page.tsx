// app/page.tsx
import Hero from "@/components/landing/Hero";
import EventCard from "@/components/events/EventCard";
import AdProductCard from "@/components/ads/AdProductCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ✅ i18n
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home"); // 네임스페이스: "home"

  // Fetch featured events
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: {
      celeb: true,
      place: true,
    },
    orderBy: { startDate: "asc" },
    take: 6,
  });

  // Fetch ad products
  const adProducts = await prisma.adProduct.findMany({
    where: { active: true },
    orderBy: { priceKRW: "asc" },
    take: 3,
  });

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Featured Events */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {t("upcomingEvents.title")}
              </h2>
              <p className="mt-2 text-zinc-400">
                {t("upcomingEvents.subtitle")}
              </p>
            </div>
            <Link
              href="/events"
              className="hidden md:inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
            >
              {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard
                key={event.id}
                id={event.id}
                imageUrl={
                  event.imageUrl ||
                  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1200&fit=crop"
                }
                celebName={event.celeb.name}
                title={event.title}
                startDate={event.startDate}
                endDate={event.endDate}
                place={event.place?.name || t("upcomingEvents.unknownPlace")}
                perks={event.perks}
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
            >
              {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Products */}
      <section className="py-16 md:py-24 bg-white/[0.02]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {t("ads.title")}
              </h2>
              <p className="mt-2 text-zinc-400">{t("ads.subtitle")}</p>
            </div>
            <Link
              href="/ads"
              className="hidden md:inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
            >
              {t("common.learnMore")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adProducts.map((product: any) => (
              <AdProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                priceKRW={product.priceKRW}
                termMonths={product.termMonths}
                features={product.features}
                imageUrl={
                  product.imageUrl ||
                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
                }
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/ads"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
            >
              {t("common.learnMore")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {t("cta.title")}
              </h2>
              <p className="mt-3 text-zinc-300 max-w-2xl">
                {t("cta.subtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 bg-white text-black font-medium hover:bg-white/90 transition"
                >
                  {t("cta.startNow")} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/places"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
                >
                  {t("cta.browsePlaces")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
