"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "FAN" as "FAN" | "PROMOTER" | "CAFE_OWNER" | "ADVERTISER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="홍길동"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="최소 6자 이상"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">역할</Label>
        <Select
          value={formData.role}
          onValueChange={(value: any) => setFormData({ ...formData, role: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FAN">팬</SelectItem>
            <SelectItem value="PROMOTER">주최자</SelectItem>
            <SelectItem value="CAFE_OWNER">카페 운영자</SelectItem>
            <SelectItem value="ADVERTISER">광고주</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "가입 중..." : "회원가입"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/signin" className="text-purple-400 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}

