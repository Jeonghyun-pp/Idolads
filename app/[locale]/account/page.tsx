import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersList from "@/components/account/OrdersList";
import EventsList from "@/components/account/EventsList";
import InquiriesList from "@/components/account/InquiriesList";

export const metadata = {
  title: "내 계정 - FanPlace",
  description: "내 주문, 이벤트, 문의 내역을 확인하세요",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  const userId = (session.user as any)?.id as string;

  // Fetch user data
  const [orders, events, inquiries] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        product: true,
        review: true,
        posting: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.findMany({
      where: { userId },
      include: {
        celeb: true,
        place: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.placeInquiry.findMany({
      where: { userId },
      include: {
        place: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">내 계정</h1>
          <p className="mt-2 text-zinc-400">
            {session.user?.name} ({session.user?.email})
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            <TabsTrigger value="events">내 이벤트</TabsTrigger>
            <TabsTrigger value="inquiries">문의 내역</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersList orders={orders} />
          </TabsContent>

          <TabsContent value="events">
            <EventsList events={events} />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesList inquiries={inquiries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

