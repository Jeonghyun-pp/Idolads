"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  placeId: string;
  userId: string;
};

export default function InquiryForm({ placeId, userId }: Props) {
  const [message, setMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/place-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          userId,
          message,
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "문의 전송에 실패했습니다.");
        return;
      }

      setSuccess(true);
      setMessage("");
      setEventDate("");
    } catch (err) {
      setError("문의 전송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-white font-medium mb-2">문의가 전송되었습니다</p>
        <p className="text-sm text-zinc-400">
          운영자가 확인 후 연락드리겠습니다
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSuccess(false)}
          className="mt-4"
        >
          새 문의 작성
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="eventDate">희망 이벤트 날짜 (선택)</Label>
        <Input
          id="eventDate"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">문의 내용</Label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="대관 관련 문의사항을 입력해주세요..."
          rows={5}
          required
          disabled={loading}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "전송 중..." : "문의하기"}
      </Button>
    </form>
  );
}

