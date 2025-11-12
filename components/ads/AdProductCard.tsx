"use client";

import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  priceKRW: number;
  termMonths: number;
  features: string[];
  imageUrl: string;
  href?: string;
};

export default function AdProductCard({
  id,
  title,
  priceKRW,
  termMonths,
  features,
  imageUrl,
  href,
}: Props) {
  const checkoutUrl = href || `/ads/checkout?product=${id}`;

  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all">
      <div className="relative aspect-video">
        <Image
          src={imageUrl}
          alt="광고 예시 이미지"
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-white/90 text-xs">
          <span className="font-semibold">{termMonths}개월</span>
          <span className="opacity-90">상품</span>
        </div>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="text-base md:text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-zinc-300/90 tabular-nums">
          {formatCurrency(priceKRW)} / {termMonths}개월
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-200/90">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <Link
            href={checkoutUrl}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition"
          >
            구매하기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

