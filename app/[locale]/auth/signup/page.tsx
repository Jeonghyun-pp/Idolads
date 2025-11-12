import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">회원가입</h1>
            <p className="mt-2 text-sm text-zinc-400">
              FanPlace 커뮤니티에 참여하세요
            </p>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  );
}

