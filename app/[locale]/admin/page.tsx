import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewQueue from "@/components/admin/ReviewQueue";
import PostingsManager from "@/components/admin/PostingsManager";
import InquiriesManager from "@/components/admin/InquiriesManager";
import { BarChart3, FileCheck, MessageSquare, Package } from "lucide-react";

export const metadata = {
  title: "관리자 대시보드 - FanPlace",
  description: "광고 심사, 게시 관리, 문의 관리",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch admin data
  const [reviews, postings, inquiries, stats] = await Promise.all([
    prisma.adReview.findMany({
      where: {
        status: { in: ["SUBMITTED", "REJECTED"] },
      },
      include: {
        order: {
          include: {
            product: true,
            user: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.adPosting.findMany({
      include: {
        order: {
          include: {
            product: true,
            user: true,
          },
        },
        proofs: true,
      },
      orderBy: { startDate: "desc" },
      take: 20,
    }),
    prisma.placeInquiry.findMany({
      where: {
        status: "REQUESTED",
      },
      include: {
        place: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    {
      pendingReviews: await prisma.adReview.count({
        where: { status: "SUBMITTED" },
      }),
      activePostings: await prisma.adPosting.count({
        where: {
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
      pendingInquiries: await prisma.placeInquiry.count({
        where: { status: "REQUESTED" },
      }),
      totalOrders: await prisma.order.count({
        where: { status: "PAID" },
      }),
    },
  ]);

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            관리자 대시보드
          </h1>
          <p className="mt-2 text-zinc-400">
            광고 심사, 게시 관리, 문의 관리
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.pendingReviews}
                </p>
                <p className="text-sm text-zinc-400">대기중 심사</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.activePostings}
                </p>
                <p className="text-sm text-zinc-400">활성 게시</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.pendingInquiries}
                </p>
                <p className="text-sm text-zinc-400">미처리 문의</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-zinc-400">총 주문</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="reviews">
              심사 ({stats.pendingReviews})
            </TabsTrigger>
            <TabsTrigger value="postings">게시 관리</TabsTrigger>
            <TabsTrigger value="inquiries">
              문의 ({stats.pendingInquiries})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <ReviewQueue reviews={reviews} />
          </TabsContent>

          <TabsContent value="postings">
            <PostingsManager postings={postings} />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesManager inquiries={inquiries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

