"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Posting = {
  id: string;
  startDate: Date;
  endDate: Date;
  locations: string[];
  order: {
    orderNumber: string;
    product: {
      title: string;
    };
    user: {
      name: string | null;
    };
  };
  proofs: {
    id: string;
    imageUrl: string;
    location: string;
  }[];
};

export default function PostingsManager({ postings }: { postings: Posting[] }) {
  const isActive = (posting: Posting) => {
    const now = new Date();
    return posting.startDate <= now && posting.endDate >= now;
  };

  if (postings.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <p className="text-zinc-400">게시 중인 광고가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {postings.map((posting) => (
        <div
          key={posting.id}
          className="rounded-2xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {posting.order.product.title}
              </h3>
              <p className="text-sm text-zinc-400">
                주문번호: {posting.order.orderNumber}
              </p>
              <p className="text-sm text-zinc-400">
                고객: {posting.order.user.name || "이름 없음"}
              </p>
            </div>
            <Badge variant={isActive(posting) ? "default" : "outline"}>
              {isActive(posting) ? "게시중" : "게시완료"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-zinc-500 mb-1">게시 기간</p>
              <p className="text-sm text-zinc-300">
                {formatDate(posting.startDate)} - {formatDate(posting.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">게시 위치</p>
              <div className="flex flex-wrap gap-2">
                {posting.locations.map((loc) => (
                  <span
                    key={loc}
                    className="px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-zinc-300"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {posting.proofs.length > 0 && (
            <div>
              <p className="text-sm text-zinc-500 mb-2">증빙 사진 ({posting.proofs.length})</p>
              <div className="flex gap-2 overflow-x-auto">
                {posting.proofs.slice(0, 3).map((proof) => (
                  <div
                    key={proof.id}
                    className="shrink-0 w-24 h-24 rounded-lg bg-white/5 border border-white/10"
                  >
                    {/* Proof image preview */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

