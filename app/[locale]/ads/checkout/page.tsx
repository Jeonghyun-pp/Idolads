import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "결제 - FanPlace",
  description: "광고 상품 결제",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/ads/checkout");
  }

  const productId = searchParams.product as string | undefined;

  if (!productId) {
    redirect("/ads");
  }

  const product = await prisma.adProduct.findUnique({
    where: { id: productId, active: true },
  });

  if (!product) {
    redirect("/ads");
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">결제</h1>
          <p className="mt-2 text-zinc-400">
            광고 상품을 구매하고 집행을 시작하세요
          </p>
        </div>

        <CheckoutForm product={product} userId={(session.user as any)?.id as string} />
      </div>
    </div>
  );
}

