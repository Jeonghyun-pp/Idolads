"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Check, X, ExternalLink } from "lucide-react";

type Review = {
  id: string;
  status: string;
  designUrls: string[];
  copyText: string | null;
  targetDate: Date | null;
  createdAt: Date;
  order: {
    orderNumber: string;
    amount: number;
    product: {
      title: string;
    };
    user: {
      name: string | null;
      email: string | null;
    };
  };
};

export default function ReviewQueue({ reviews }: { reviews: Review[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleReview = async (reviewId: string, status: "APPROVED" | "REJECTED") => {
    setLoading(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Review action failed:", error);
    } finally {
      setLoading(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <p className="text-zinc-400">대기중인 심사가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {review.order.product.title}
              </h3>
              <p className="text-sm text-zinc-400">
                주문번호: {review.order.orderNumber}
              </p>
              <p className="text-sm text-zinc-400">
                고객: {review.order.user.name || "이름 없음"} ({review.order.user.email || "이메일 없음"})
              </p>
            </div>
            <Badge variant={review.status === "SUBMITTED" ? "secondary" : "destructive"}>
              {review.status === "SUBMITTED" ? "심사대기" : "반려됨"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-zinc-500 mb-1">신청일</p>
              <p className="text-sm text-zinc-300">{formatDate(review.createdAt)}</p>
            </div>
            {review.targetDate && (
              <div>
                <p className="text-sm text-zinc-500 mb-1">희망 게시일</p>
                <p className="text-sm text-zinc-300">{formatDate(review.targetDate)}</p>
              </div>
            )}
          </div>

          {review.copyText && (
            <div className="mb-4">
              <p className="text-sm text-zinc-500 mb-2">문구</p>
              <p className="text-sm text-zinc-300 p-3 rounded-lg bg-white/5 border border-white/10">
                {review.copyText}
              </p>
            </div>
          )}

          {review.designUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-zinc-500 mb-2">소재 파일</p>
              <div className="flex flex-wrap gap-2">
                {review.designUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 transition"
                  >
                    파일 {idx + 1} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={() => handleReview(review.id, "APPROVED")}
              disabled={loading === review.id}
              className="gap-2"
              variant="default"
            >
              <Check className="w-4 h-4" />
              승인
            </Button>
            <Button
              onClick={() => handleReview(review.id, "REJECTED")}
              disabled={loading === review.id}
              className="gap-2"
              variant="destructive"
            >
              <X className="w-4 h-4" />
              반려
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

