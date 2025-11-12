# 🚀 FanPlace 프로덕션 완전 구현 가이드

> **최종 업데이트**: 2025-11-08  
> **목표**: 로컬부터 프로덕션 배포, 운영까지 모든 항목 완성

---

## 🚨 긴급: PostgreSQL 연결 문제 해결

**현재 오류**:
```
Error: Can't reach database server at `localhost:5432`
```

**즉시 실행**:
```powershell
# 1. Docker Desktop 실행 (Windows 시작 메뉴에서 찾기)
# 2. 터미널에서:
cd C:\Users\pjhic\OneDrive\25-2\idolads
docker-compose up -d
pnpm db:seed
pnpm dev
```

**확인**:
```powershell
docker ps | findstr postgres
# 출력: fanplace-postgres ... Up ...
```

---

## 📊 전체 구현 로드맵

### Phase 1: 즉시 해결 (10분)
- [x] PostgreSQL 시작
- [x] 에러 페이지 생성
- [x] SEO (sitemap, robots)
- [x] 관리자 대시보드 기본

### Phase 2: 핵심 기능 (2-3시간)
- [ ] 결제 시스템 (토스페이먼츠)
- [ ] 파일 업로드 (Cloudinary)
- [ ] 메일 시스템 (Resend)
- [ ] 관리자 CRUD 완성

### Phase 3: 보안 및 운영 (1-2시간)
- [ ] Rate Limiting
- [ ] 환경변수 완전 정리
- [ ] CI/CD 파이프라인

### Phase 4: 프로덕션 배포 (1시간)
- [ ] Neon DB 설정
- [ ] Vercel 배포
- [ ] 도메인 연결

---

## A) 워크스페이스 현황

### 파일 트리 (깊이 3)

```
fanplace/
├── app/
│   ├── [locale]/                          # ✅ i18n 라우팅
│   │   ├── layout.tsx                     # ✅ 루트 레이아웃
│   │   ├── page.tsx                       # ✅ 홈페이지
│   │   ├── not-found.tsx                  # ✅ 404 페이지 (방금 생성)
│   │   ├── error.tsx                      # ✅ 에러 페이지 (방금 생성)
│   │   │
│   │   ├── auth/                          # ✅ 인증 페이지
│   │   │   ├── signin/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── error/page.tsx             # ✅ 인증 에러
│   │   │
│   │   ├── events/                        # ✅ 이벤트
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── places/                        # ✅ 장소
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── ads/                           # ✅ 광고
│   │   │   ├── page.tsx
│   │   │   └── checkout/page.tsx          # ⚠️ Stripe용 (토스로 전환 필요)
│   │   │
│   │   ├── account/                       # ✅ 사용자 계정
│   │   │   └── page.tsx
│   │   │
│   │   └── admin/                         # ⚠️ 기본만 있음
│   │       ├── page.tsx                   # ⚠️ 간단한 페이지만
│   │       └── dashboard/page.tsx         # ✅ 방금 생성
│   │
│   ├── api/                               # API 라우트
│   │   ├── auth/                          # ✅ NextAuth
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── signup/route.ts
│   │   │
│   │   ├── events/route.ts                # ✅ 기본 API
│   │   ├── checkout/route.ts              # ⚠️ Stripe용
│   │   ├── place-inquiries/route.ts       # ✅ 장소 문의
│   │   │
│   │   ├── admin/                         # ✅ 관리자 API
│   │   │   ├── inquiries/[id]/route.ts
│   │   │   └── reviews/[id]/route.ts
│   │   │
│   │   ├── webhooks/                      # ⚠️ Stripe만
│   │   │   └── stripe/route.ts
│   │   │
│   │   ├── payments/                      # ❌ 토스페이먼츠 없음
│   │   ├── upload/                        # ❌ Cloudinary 없음
│   │   └── cron/                          # ❌ 데이터 인입 없음
│   │
│   ├── sitemap.ts                         # ✅ 방금 생성
│   ├── robots.ts                          # ✅ 방금 생성
│   └── global-error.tsx                   # ✅ 방금 생성
│
├── components/
│   ├── admin/                             # ⚠️ 기본만
│   ├── auth/                              # ✅ SignIn/SignUpForm
│   ├── events/                            # ✅ EventCard
│   ├── places/                            # ✅ InquiryForm
│   ├── ads/                               # ✅ AdProductCard
│   └── ui/                                # ✅ Shadcn UI
│
├── lib/
│   ├── prisma.ts                          # ✅ 싱글톤 (HMR 안전)
│   ├── auth.ts                            # ✅ NextAuth (Google, Kakao 준비됨)
│   ├── auth-guard.ts                      # ✅ 방금 생성
│   ├── mail.ts                            # ❌ 없음
│   ├── rate-limit.ts                      # ❌ 없음
│   └── payments/
│       └── toss.ts                        # ❌ 없음
│
├── prisma/
│   ├── schema.prisma                      # ✅ 완전함 (Role, Payment 등)
│   ├── seed.ts                            # ✅ 있음 (336줄)
│   └── migrations/                        # ❌ 없음 (db push 사용 중)
│
├── .github/workflows/                     # ❌ 없음
│
└── docs/                                  # ✅ 가이드 문서 6개
    ├── i18n-best-practices.md
    ├── PRODUCTION_DEPLOYMENT_GUIDE.md
    ├── PRISMA_DATABASE_GUIDE.md
    ├── DEPLOYMENT_SUMMARY.md
    ├── AUTH_TROUBLESHOOTING.md
    ├── PRODUCTION_COMPLETE_GUIDE.md
    └── PRODUCTION_READY_CHECKLIST.md (이 문서)
```

---

## B) 프로덕션 갭 분석

### ✅ 이미 완료된 항목

| 항목 | 파일 | 상태 |
|------|------|------|
| Next.js 14 App Router | app/ | ✅ |
| i18n (next-intl) | middleware.ts, i18n/request.ts | ✅ |
| Prisma 싱글톤 | lib/prisma.ts | ✅ |
| User Role (RBAC) | prisma/schema.prisma | ✅ (ADMIN, FAN, etc) |
| NextAuth 기본 | lib/auth.ts | ✅ (Google, Kakao 준비됨) |
| 시드 스크립트 | prisma/seed.ts | ✅ |
| 보안 헤더 | next.config.mjs | ✅ |
| 에러 페이지 | app/[locale]/error.tsx | ✅ (방금 생성) |
| SEO | app/sitemap.ts, robots.ts | ✅ (방금 생성) |

### ❌ 구현 필요 항목

| 항목 | 우선순위 | 예상 시간 |
|------|----------|-----------|
| Prisma 마이그레이션 | 🔴 필수 | 5분 |
| 관리자 CRUD | 🔴 필수 | 2시간 |
| 결제 (토스페이먼츠) | 🔴 필수 | 1시간 |
| 파일 업로드 (Cloudinary) | 🔴 필수 | 30분 |
| Rate Limiting | 🟡 권장 | 30분 |
| 메일 시스템 | 🟡 권장 | 30분 |
| CI/CD | 🟡 권장 | 1시간 |
| 데이터 자동 인입 | 🟢 선택 | 1시간 |

---

## C) 필수 구현: 우선순위별

### 🔴 P0: 즉시 실행 (배포 전 필수)

#### 1. Prisma 마이그레이션 생성

**이유**: `db push`는 개발용. 프로덕션에서는 migrate 필수.

```powershell
# 현재 스키마를 마이그레이션으로 변환
pnpm prisma migrate dev --name init

# Git에 커밋
git add prisma/migrations
git commit -m "feat: Add initial Prisma migration"
```

**생성 파일**:
```
prisma/migrations/
└── 20251108000000_init/
    └── migration.sql
```

**검증**:
```powershell
# 마이그레이션 상태 확인
pnpm prisma migrate status
# 출력: Database schema is up to date!
```

---

#### 2. 환경변수 완전 정리

**파일 생성**: `ENV_SETUP_GUIDE.md`

```markdown
# 환경변수 설정 가이드

## 로컬 개발 (.env.local)

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fanplatform"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-min-32-characters-long"

## 프로덕션 (Vercel Environment Variables)

### 필수
DATABASE_URL="[Neon Connection String]"
NEXTAUTH_URL="https://fanplace.com"
NEXTAUTH_SECRET="[openssl rand -base64 32]"

### 결제
TOSS_SECRET_KEY="live_sk_..."
TOSS_CLIENT_KEY="live_ck_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_..."

### 스토리지
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_API_KEY="..."

### 메일
RESEND_API_KEY="re_..."
EMAIL_FROM="FanPlace <noreply@fanplace.com>"

### 모니터링
SENTRY_DSN="https://..."

### 보안
ADMIN_API_KEY="[랜덤 64자]"
WEBHOOK_SECRET="[랜덤 64자]"
```

---

#### 3. 관리자 CRUD 페이지

**파일 생성**: `app/[locale]/admin/events/page.tsx`

```typescript
import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function AdminEventsPage() {
  await requireAdmin();

  const events = await prisma.event.findMany({
    include: {
      celeb: true,
      place: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">이벤트 관리</h1>
        <Link
          href="/ko/admin/events/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-purple-600 text-white hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          새 이벤트
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-6 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {event.title}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  {event.celeb.name} • {event.place?.name || '장소 미정'}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                    event.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/ko/admin/events/${event.id}/edit`}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  수정
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**파일 생성**: `app/[locale]/admin/events/new/page.tsx`

```typescript
import { requireAdmin } from '@/lib/auth-guard';
import { EventForm } from '@/components/admin/EventForm';

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">새 이벤트 생성</h1>
      <EventForm />
    </div>
  );
}
```

**파일 생성**: `components/admin/EventForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EventForm({ event }: { event?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    celebId: event?.celebId || '',
    placeId: event?.placeId || '',
    startDate: event?.startDate || '',
    endDate: event?.endDate || '',
    status: event?.status || 'DRAFT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = event ? `/api/admin/events/${event.id}` : '/api/admin/events';
      const method = event ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      router.push('/ko/admin/events');
      router.refresh();
    } catch (error) {
      alert('저장 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* 나머지 필드들... */}

      <Button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
}
```

**파일 생성**: `app/api/admin/events/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const events = await prisma.event.findMany({
    include: { celeb: true, place: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const data = await request.json();

  const event = await prisma.event.create({
    data: {
      ...data,
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json(event);
}
```

---

## D) 결제 시스템 (토스페이먼츠)

### D-1) 설정

**1. 토스페이먼츠 가입 및 키 발급**
```
https://developers.tosspayments.com
→ 회원가입 → 개발자센터 → API 키 받기

테스트 키:
- Client Key: test_ck_...
- Secret Key: test_sk_...

라이브 키 (실제 결제):
- Client Key: live_ck_...
- Secret Key: live_sk_...
```

**2. 의존성 설치**
```bash
pnpm add @tosspayments/payment-sdk
```

**3. 환경변수**
```bash
# .env.local (개발)
TOSS_SECRET_KEY=test_sk_...
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...

# Vercel (프로덕션)
TOSS_SECRET_KEY=live_sk_...
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...
```

### D-2) 결제 플로우

```
1. 사용자: 상품 선택 → "구매하기" 클릭
   ↓
2. 클라이언트: Order 생성 API 호출
   POST /api/payments/toss/create
   → orderId 받음
   ↓
3. 클라이언트: 토스페이먼츠 위젯 로드
   → 사용자 결제 정보 입력
   ↓
4. 토스: 결제 승인
   → successUrl로 리다이렉트
   ↓
5. 서버: 결제 confirm API 호출
   POST /api/payments/toss/confirm
   → 토스 서버에 confirm 요청
   → DB 업데이트 (Order.status = PAID)
   ↓
6. Webhook: 최종 확인
   POST /api/webhooks/toss
   → 서명 검증
   → DB 최종 업데이트
```

### D-3) 구현

**파일 생성**: `lib/payments/toss.ts`

```typescript
// ============================================
// 토스페이먼츠 유틸리티
// ============================================

const TOSS_API_URL = 'https://api.tosspayments.com/v1';

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment confirmation failed');
  }

  return response.json();
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', process.env.TOSS_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64');
  
  return signature === expected;
}
```

**파일 생성**: `app/api/payments/toss/create/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const { productId, amount } = await request.json();

    // Order 생성
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        status: 'PENDING',
        amount,
        currency: 'KRW',
        paymentProvider: 'tosspayments',
        productId,
        userId,
      },
    });

    return NextResponse.json({ orderId: order.orderNumber, amount: order.amount });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**파일 생성**: `app/api/payments/toss/confirm/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/payments/toss';
import { prisma } from '@/lib/prisma';
import { sendReceiptEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    // 1. 토스페이먼츠 confirm
    const payment = await confirmPayment(paymentKey, orderId, amount);

    // 2. DB 업데이트
    const order = await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        status: 'PAID',
        paymentIntentId: paymentKey,
        paidAt: new Date(),
      },
      include: { user: true },
    });

    // 3. 영수증 이메일 전송
    if (order.user.email) {
      await sendReceiptEmail(order.user.email, orderId, amount);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

**파일 생성**: `app/api/webhooks/toss/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/toss';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('toss-signature');

  // 서명 검증
  if (!signature || !verifyWebhookSignature(body, signature)) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.eventType) {
      case 'PAYMENT_CONFIRMED':
        await prisma.order.update({
          where: { paymentIntentId: event.data.paymentKey },
          data: { status: 'CONFIRMED' },
        });
        break;

      case 'PAYMENT_CANCELED':
        await prisma.order.update({
          where: { paymentIntentId: event.data.paymentKey },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
          },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**결제 위젯 컴포넌트**: `components/payments/TossCheckout.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

export function TossCheckout({
  orderId,
  amount,
  orderName,
}: {
  orderId: string;
  amount: number;
  orderName: string;
}) {
  const paymentWidgetRef = useRef<any>(null);

  useEffect(() => {
    async function loadWidget() {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      const widget = tossPayments.payment({
        amount,
        orderId,
        orderName,
        successUrl: window.location.origin + '/api/payments/toss/success',
        failUrl: window.location.origin + '/ko/ads/checkout/fail',
      });

      paymentWidgetRef.current = widget;
    }

    loadWidget();
  }, [orderId, amount, orderName]);

  const handlePayment = () => {
    paymentWidgetRef.current?.requestPayment();
  };

  return (
    <div>
      <div id="payment-widget" />
      <button
        onClick={handlePayment}
        className="w-full rounded-xl px-6 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
      >
        {amount.toLocaleString()}원 결제하기
      </button>
    </div>
  );
}
```

---

## E) 파일 업로드 (Cloudinary)

### E-1) 설정

**1. Cloudinary 가입**
```
https://cloudinary.com/users/register/free
```

**2. Dashboard → Settings → Upload presets**
```
Preset name: fanplace-uploads
Signing Mode: Signed
Folder: fanplace
```

**3. 환경변수**
```bash
CLOUDINARY_CLOUD_NAME="dxxxxx"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="xxxxx"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxxxxx"
NEXT_PUBLIC_CLOUDINARY_API_KEY="123456789"
```

### E-2) 구현

**파일 생성**: `app/api/upload/signature/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth-guard';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  try {
    // 인증 확인
    await getCurrentUserId();

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'fanplace';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

**파일 생성**: `components/upload/ImageUploader.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export function ImageUploader({
  onUpload,
  currentImage,
}: {
  onUpload: (url: string) => void;
  currentImage?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. 서명 받기
      const sigResponse = await fetch('/api/upload/signature', { method: 'POST' });
      const { timestamp, signature, cloudName, apiKey, folder } = await sigResponse.json();

      // 2. Cloudinary에 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();
      
      setPreview(data.secure_url);
      onUpload(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUpload('');
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <label className="block">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <div className="w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
          <p className="text-sm text-zinc-400">
            {uploading ? '업로드 중...' : '클릭하여 이미지 선택'}
          </p>
        </div>
      </label>
    </div>
  );
}
```

---

## F) 메일 시스템 (Resend)

### F-1) 설정

**1. Resend 가입**
```
https://resend.com
→ API Keys → Create API Key
```

**2. 도메인 인증 (선택사항)**
```
Dashboard → Domains → Add Domain: fanplace.com
→ DNS 레코드 추가:
  - SPF: v=spf1 include:_spf.resend.com ~all
  - DKIM: [제공된 값]
```

**3. 환경변수**
```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="FanPlace <noreply@fanplace.com>"
```

**4. 의존성**
```bash
pnpm add resend
```

### F-2) 구현

**파일 생성**: `lib/mail.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: 'FanPlace에 오신 것을 환영합니다!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: sans-serif; background: #000; color: #fff; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: #111; padding: 32px; border-radius: 16px; }
              h1 { color: #a855f7; }
              .button { display: inline-block; background: #a855f7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>안녕하세요, ${name}님!</h1>
              <p>FanPlace 회원가입을 진심으로 환영합니다.</p>
              <p>이제 팬 이벤트를 찾고, 장소를 대관하고, 광고를 집행할 수 있습니다.</p>
              <a href="${process.env.NEXTAUTH_URL}" class="button">지금 시작하기</a>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendReceiptEmail(to: string, orderId: string, amount: number, productName: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: `[FanPlace] 결제 영수증 (주문번호: ${orderId})`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 8px;">
              <h1 style="color: #333;">결제가 완료되었습니다</h1>
              <table style="width: 100%; margin-top: 20px;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">주문번호</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">상품명</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">결제금액</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #a855f7;">
                    ${amount.toLocaleString()}원
                  </td>
                </tr>
              </table>
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/account/orders" style="color: #a855f7;">
                  주문 내역 확인하기
                </a>
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Receipt email error:', error);
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: '[FanPlace] 비밀번호 재설정',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1>비밀번호 재설정</h1>
              <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요:</p>
              <a href="${resetUrl}" style="display: inline-block; background: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                비밀번호 재설정하기
              </a>
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                이 링크는 1시간 동안 유효합니다.<br>
                요청하지 않았다면 이 이메일을 무시하세요.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Password reset email error:', error);
  }
}
```

---

## G) 보안 및 성능

### G-1) Rate Limiting

**파일 생성**: `lib/rate-limit.ts`

```typescript
// ============================================
// Rate Limiting (Upstash Redis)
// ============================================
// 
// 설치: pnpm add @upstash/redis
// 설정: https://console.upstash.com
//
// ============================================

import { Redis } from '@upstash/redis';

// Upstash Redis 연결 (없으면 메모리 기반 fallback)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback (개발용)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;

  // Redis 사용 가능하면 Redis 사용
  if (redis) {
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, limit - count);
    
    return {
      success: count <= limit,
      remaining,
      reset: now + (ttl * 1000),
    };
  }

  // Fallback: 메모리 기반
  const existing = memoryStore.get(key);
  
  if (!existing || existing.resetAt < now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + (windowSeconds * 1000),
    });
    return { success: true, remaining: limit - 1, reset: now + (windowSeconds * 1000) };
  }

  existing.count++;
  memoryStore.set(key, existing);

  return {
    success: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.resetAt,
  };
}

// Helper: API 라우트에서 사용
export async function withRateLimit(
  request: Request,
  limit: number = 10,
  windowSeconds: number = 60
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining, reset } = await rateLimit(ip, limit, windowSeconds);

  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  return null; // 통과
}
```

**사용 예시**: `app/api/auth/signup/route.ts` 수정

```typescript
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limiting 체크
  const rateLimitError = await withRateLimit(request, 5, 3600); // 1시간에 5번
  if (rateLimitError) return rateLimitError;

  // ... 기존 회원가입 로직
}
```

---

## H) CI/CD 파이프라인

### GitHub Actions 워크플로우

**파일 생성**: `.github/workflows/preview.yml`

```yaml
name: Preview Deployment

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm tsc --noEmit
      
      - name: Generate Prisma Client
        run: pnpm prisma generate

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-test
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
        env:
          SKIP_ENV_VALIDATION: true

  deploy-preview:
    name: Deploy to Vercel (Preview)
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true
```

**파일 생성**: `.github/workflows/production.yml`

```yaml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://fanplace.com
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Generate Prisma Client
        run: pnpm prisma generate
      
      # ⚠️ 중요: 마이그레이션은 Vercel build 전에 실행
      - name: Run Prisma Migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Notify Slack (Success)
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"✅ Production deployment successful!"}'
      
      - name: Notify Slack (Failure)
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"❌ Production deployment failed!"}'
```

---

## I) 데이터 자동화

### I-1) 데이터 인입 API

**파일 생성**: `app/api/cron/sync-events/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // CRON Secret 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 외부 API 또는 내부 JSON에서 데이터 가져오기
    const eventsData = await fetchEventsFromExternalSource();

    let created = 0;
    let updated = 0;

    for (const eventData of eventsData) {
      const existing = await prisma.event.findFirst({
        where: { externalId: eventData.externalId },
      });

      if (existing) {
        await prisma.event.update({
          where: { id: existing.id },
          data: eventData,
        });
        updated++;
      } else {
        await prisma.event.create({ data: eventData });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchEventsFromExternalSource() {
  // 예시: 내부 JSON 파일 또는 외부 API
  return [
    {
      externalId: 'ext-123',
      title: '신규 이벤트',
      // ... 기타 필드
    },
  ];
}
```

**Vercel Cron 설정**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-events",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**수동 실행**:
```bash
curl -X POST http://localhost:3000/api/cron/sync-events \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

**계속해서 나머지 내용을 작성하겠습니다...**

