"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Check, X } from "lucide-react";

type Inquiry = {
  id: string;
  message: string;
  eventDate: Date | null;
  status: string;
  createdAt: Date;
  place: {
    name: string;
  };
  user: {
    name: string | null;
    email: string | null;
  };
};

export default function InquiriesManager({ inquiries }: { inquiries: Inquiry[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleInquiry = async (inquiryId: string, status: "CONNECTED" | "DECLINED") => {
    setLoading(inquiryId);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Inquiry action failed:", error);
    } finally {
      setLoading(null);
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <p className="text-zinc-400">대기중인 문의가 없습니다</p>
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
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {inquiry.place.name}
              </h3>
              <p className="text-sm text-zinc-400">
                문의자: {inquiry.user.name || "이름 없음"} ({inquiry.user.email || "이메일 없음"})
              </p>
              <p className="text-sm text-zinc-400">
                문의일: {formatDate(inquiry.createdAt)}
              </p>
            </div>
            <Badge variant="secondary">접수됨</Badge>
          </div>

          {inquiry.eventDate && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">희망 이벤트 날짜</p>
              <p className="text-sm text-zinc-300">{formatDate(inquiry.eventDate)}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-zinc-500 mb-2">문의 내용</p>
            <p className="text-sm text-zinc-300 p-3 rounded-lg bg-white/5 border border-white/10">
              {inquiry.message}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={() => handleInquiry(inquiry.id, "CONNECTED")}
              disabled={loading === inquiry.id}
              className="gap-2"
              variant="default"
            >
              <Check className="w-4 h-4" />
              연결 완료
            </Button>
            <Button
              onClick={() => handleInquiry(inquiry.id, "DECLINED")}
              disabled={loading === inquiry.id}
              className="gap-2"
              variant="destructive"
            >
              <X className="w-4 h-4" />
              거절
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

