import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessages: Record<string, string> = {
    Configuration: "서버 설정에 문제가 있습니다.",
    AccessDenied: "접근이 거부되었습니다.",
    Verification: "인증 토큰이 만료되었습니다.",
    Default: "로그인 중 오류가 발생했습니다.",
  };

  const error = searchParams.error || "Default";
  const message = errorMessages[error] || errorMessages.Default;

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
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              인증 오류
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{message}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full rounded-xl bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-purple-700 transition"
            >
              다시 로그인하기
            </Link>
            <Link
              href="/"
              className="block w-full rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/15 transition"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

