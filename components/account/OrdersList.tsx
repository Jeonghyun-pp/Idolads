"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: Date;
  product: {
    title: string;
    termMonths: number;
  };
  review: {
    status: string;
  } | null;
  posting: {
    startDate: Date;
    endDate: Date;
  } | null;
};

export default function OrdersList({ orders }: { orders: Order[] }) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: "secondary" as const, label: "대기중" },
      PAID: { variant: "default" as const, label: "결제완료" },
      REJECTED: { variant: "destructive" as const, label: "거절됨" },
      REFUNDED: { variant: "outline" as const, label: "환불됨" },
    };

    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getReviewStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      SUBMITTED: { color: "bg-slate-500/20 text-slate-300", label: "심사중" },
      APPROVED: { color: "bg-emerald-500/20 text-emerald-300", label: "승인됨" },
      REJECTED: { color: "bg-rose-500/20 text-rose-300", label: "반려됨" },
    };

    const config = variants[status] || { color: "bg-zinc-500/20 text-zinc-300", label: status };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-400">주문 내역이 없습니다</p>
        <Link
          href="/ads"
          className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition"
        >
          광고 상품 보기 <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-white/20 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {order.product.title}
                </h3>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm text-zinc-400">주문번호: {order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">
                {formatCurrency(order.amount, order.currency)}
              </p>
              <p className="text-sm text-zinc-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-zinc-500 mb-1">기간</p>
              <p className="text-sm text-zinc-300">{order.product.termMonths}개월</p>
            </div>
            {order.review && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">심사 상태</p>
                {getReviewStatusBadge(order.review.status)}
              </div>
            )}
            {order.posting && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">게시 기간</p>
                <p className="text-sm text-zinc-300">
                  {formatDate(order.posting.startDate)} - {formatDate(order.posting.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

