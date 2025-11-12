import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Users, Calendar, MapPin, Megaphone } from 'lucide-react';

export default async function AdminDashboard() {
  // 관리자 권한 체크
  await requireAdmin();

  // 통계 데이터 가져오기
  const [userCount, eventCount, placeCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.place.count(),
    prisma.order.count(),
  ]);

  const stats = [
    { label: '총 사용자', value: userCount, icon: Users, color: 'purple' },
    { label: '총 이벤트', value: eventCount, icon: Calendar, color: 'blue' },
    { label: '등록 장소', value: placeCount, icon: MapPin, color: 'green' },
    { label: '총 주문', value: orderCount, icon: Megaphone, color: 'orange' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          관리자 대시보드
        </h1>
        <p className="mt-2 text-zinc-400">
          FanPlace 플랫폼 관리
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/ko/admin/events"
          className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <Calendar className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white">이벤트 관리</h3>
          <p className="text-sm text-zinc-400 mt-1">
            이벤트 생성, 수정, 삭제
          </p>
        </a>

        <a
          href="/ko/admin/places"
          className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <MapPin className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white">장소 관리</h3>
          <p className="text-sm text-zinc-400 mt-1">
            장소 등록 및 관리
          </p>
        </a>

        <a
          href="/ko/admin/orders"
          className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <Megaphone className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="text-lg font-semibold text-white">주문 관리</h3>
          <p className="text-sm text-zinc-400 mt-1">
            결제 및 주문 내역
          </p>
        </a>
      </div>
    </div>
  );
}

