import SignInForm from "@/components/auth/SignInForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
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
            <h1 className="text-2xl md:text-3xl font-bold text-white">로그인</h1>
            <p className="mt-2 text-sm text-zinc-400">
              FanPlace에 오신 것을 환영합니다
            </p>
          </div>

          <SignInForm />

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-zinc-400">
              테스트 계정으로 로그인
            </p>
            <div className="mt-3 space-y-2 text-xs text-zinc-500">
              <p>• 관리자: admin@fanplace.local / admin123</p>
              <p>• 팬: fan@fanplace.local / fan123</p>
              <p>• 주최자: promoter@fanplace.local / promoter123</p>
              <p>• 광고주: advertiser@fanplace.local / advertiser123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

