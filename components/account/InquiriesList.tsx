"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

type Inquiry = {
  id: string;
  message: string;
  status: string;
  eventDate: Date | null;
  createdAt: Date;
  place: {
    id: string;
    name: string;
  };
};

export default function InquiriesList({ inquiries }: { inquiries: Inquiry[] }) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      REQUESTED: { variant: "secondary" as const, label: "접수됨" },
      CONNECTED: { variant: "default" as const, label: "연결됨" },
      DECLINED: { variant: "destructive" as const, label: "거절됨" },
    };

    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-400">문의 내역이 없습니다</p>
        <Link
          href="/places"
          className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition"
        >
          장소 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className="rounded-2xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <Link
                href={`/places/${inquiry.place.id}`}
                className="text-lg font-semibold text-white hover:text-purple-400 transition"
              >
                {inquiry.place.name}
              </Link>
              <p className="text-sm text-zinc-400 mt-1">
                {formatDate(inquiry.createdAt)}
              </p>
            </div>
            {getStatusBadge(inquiry.status)}
          </div>

          {inquiry.eventDate && (
            <p className="text-sm text-zinc-400 mb-2">
              희망 날짜: {formatDate(inquiry.eventDate)}
            </p>
          )}

          <p className="text-sm text-zinc-300 line-clamp-3">{inquiry.message}</p>
        </div>
      ))}
    </div>
  );
}

