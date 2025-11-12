import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "./providers";
import Header from "@/components/layout/Header";

// ✅ i18n 추가
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FanPlace - 팬덤 플랫폼",
  description:
    "생일카페를 찾고, 대관하고, 팬 광고를 집행하세요. 이미지 중심의 세련된 경험을 제공합니다.",
  keywords: ["팬덤", "생일카페", "팬카페", "광고", "K-POP", "아이돌"],
  openGraph: {
    title: "FanPlace - 팬덤 플랫폼",
    description: "생일카페를 찾고, 대관하고, 팬 광고를 집행하세요.",
    type: "website",
    locale: "ko_KR",
  },
};

// ✅ async 함수로 바꿔야 함 (서버에서 messages를 로드하기 때문)
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 현재 locale의 번역 메시지를 가져옴
  const messages = await getMessages();

  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>
        {/* ✅ NextIntl Provider로 전체 앱을 감싸줌 */}
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-white/10 py-6 md:py-8">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-zinc-400">
                      © 2025 FanPlace. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-zinc-400">
                      <a
                        href="/terms"
                        className="hover:text-white transition-colors"
                      >
                        이용약관
                      </a>
                      <a
                        href="/privacy"
                        className="hover:text-white transition-colors"
                      >
                        개인정보처리방침
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
