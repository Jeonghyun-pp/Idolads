import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["ko","en","ja","zh"],
  defaultLocale: "ko"
});

// 모든 경로에 미들웨어 적용 (API 라우트 제외)
export const config = {
  // API, Next.js 내부 파일, 정적 파일 제외
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
