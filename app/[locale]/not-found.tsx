import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-zinc-400">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지
          </button>
        </div>
      </div>
    </div>
  );
}

