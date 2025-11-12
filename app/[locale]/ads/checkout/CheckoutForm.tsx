"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { CreditCard, Shield } from "lucide-react";

type Product = {
  id: string;
  title: string;
  priceKRW: number;
  termMonths: number;
  features: string[];
  imageUrl: string | null;
};

type Props = {
  product: Product;
  userId: string;
};

export default function CheckoutForm({ product, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "결제 초기화에 실패했습니다.");
        return;
      }

      // Redirect to Stripe Checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err) {
      setError("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Order Summary */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">주문 상품</h2>

          <div className="flex gap-4">
            <div className="relative w-32 h-24 rounded-lg overflow-hidden shrink-0">
              <Image
                src={
                  product.imageUrl ||
                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop"
                }
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {product.title}
              </h3>
              <p className="text-sm text-zinc-400 mb-3">
                {product.termMonths}개월 상품
              </p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(product.priceKRW)}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">포함 내용</h4>
            <ul className="space-y-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm text-zinc-300 flex items-start gap-2"
                >
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            주문 후 진행 절차
          </h2>
          <ol className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <span>
                결제 완료 후 광고 소재(디자인 파일)를 업로드해주세요
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <span>전문가가 소재를 검토하고 승인합니다 (1-2 영업일)</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <span>승인된 소재로 광고가 집행됩니다</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                4
              </span>
              <span>현장 사진과 증빙 자료를 받아보세요</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sticky top-20">
          <h2 className="text-xl font-semibold text-white mb-6">결제 정보</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">상품 금액</span>
              <span className="text-white">{formatCurrency(product.priceKRW)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">부가세 (VAT)</span>
              <span className="text-white">포함</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <span className="font-semibold text-white">총 결제 금액</span>
              <span className="font-semibold text-white text-lg">
                {formatCurrency(product.priceKRW)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full gap-2"
            size="lg"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "처리 중..." : "결제하기"}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Shield className="w-4 h-4" />
            <span>Stripe로 안전하게 결제됩니다</span>
          </div>
        </div>
      </div>
    </div>
  );
}

