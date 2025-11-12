import { Suspense } from "react";
import EventsContent from "./EventsContent";

export const metadata = {
  title: "이벤트 - FanPlace",
  description: "팬들이 준비한 생일카페와 특별한 이벤트를 찾아보세요",
};

export default function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">이벤트</h1>
          <p className="mt-2 text-zinc-400">
            팬들이 준비한 생일카페와 특별한 이벤트를 찾아보세요
          </p>
        </div>

        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <EventsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

