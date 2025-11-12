"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 콘솔에 로깅 (프로덕션에서는 Sentry로 전송)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-zinc-400 mb-4">
            페이지를 표시하는 중 오류가 발생했습니다.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-400">
                개발자 정보
              </summary>
              <pre className="mt-2 p-4 bg-black/50 rounded-lg text-xs text-red-400 overflow-auto">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}

