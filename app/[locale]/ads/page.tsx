import { prisma } from "@/lib/prisma";
import AdProductCard from "@/components/ads/AdProductCard";
import { CheckCircle2, TrendingUp, Shield } from "lucide-react";

export const metadata = {
  title: "광고 - FanPlace",
  description: "내 아이돌을 세상에 알리는 가장 특별한 방법",
};

export default async function AdsPage() {
  const products = await prisma.adProduct.findMany({
    where: { active: true },
    orderBy: { priceKRW: "asc" },
  });

  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            팬 광고로{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              세상을 물들이세요
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
            지하철, 버스, 빌보드를 통해 내 아이돌의 생일과 특별한 순간을 축하하세요.
            FanPlace가 광고 집행부터 증빙까지 모든 과정을 지원합니다.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                간편한 집행
              </h3>
              <p className="text-sm text-zinc-400">
                복잡한 절차 없이 온라인으로 쉽게 광고를 신청하세요
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                최대 노출
              </h3>
              <p className="text-sm text-zinc-400">
                주요 거점에 광고를 배치하여 최대 효과를 경험하세요
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                투명한 증빙
              </h3>
              <p className="text-sm text-zinc-400">
                현장 사진과 리포트로 광고 집행을 투명하게 확인하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              광고 상품
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              다양한 위치와 기간의 광고 상품을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
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
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 md:py-24 bg-white/[0.02]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              광고 집행 절차
            </h2>
            <p className="text-zinc-400">
              간단한 4단계로 광고를 집행하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "상품 선택 & 결제",
                description: "원하는 광고 상품을 선택하고 안전하게 결제하세요",
              },
              {
                step: "2",
                title: "소재 제출 & 심사",
                description: "광고 디자인을 업로드하면 전문가가 검토합니다",
              },
              {
                step: "3",
                title: "광고 게시",
                description: "승인된 소재로 광고가 집행됩니다",
              },
              {
                step: "4",
                title: "증빙 확인",
                description: "현장 사진과 리포트를 받아보세요",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
                특별한 순간을 더 특별하게 만들어보세요
              </p>
              <a
                href="#products"
                className="inline-flex items-center justify-center rounded-2xl px-8 py-3 bg-white text-black font-medium hover:bg-white/90 transition"
              >
                상품 보러가기
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

