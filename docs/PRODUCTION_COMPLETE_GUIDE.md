# 🚀 FanPlace 프로덕션 배포 완전 가이드

> **최종 업데이트**: 2025-11-08  
> **목표**: 로컬 개발부터 프로덕션 배포까지 완벽한 운영 환경 구축

---

## 📋 목차

- [A) 배포 전략](#a-배포-전략)
- [B) 운영 데이터베이스](#b-운영-데이터베이스)
- [C) 인증 시스템](#c-인증-시스템)
- [D) 결제 시스템](#d-결제-시스템)
- [E) 파일 스토리지](#e-파일-스토리지)
- [F) 메일 시스템](#f-메일-시스템)
- [G) 보안 및 모니터링](#g-보안-및-모니터링)
- [H) CI/CD](#h-cicd)
- [I) 산출물](#i-산출물)
- [J) 데이터 자동화](#j-데이터-자동화)

---

## A) 배포 전략

### A-1) Vercel 배포 (권장)

#### 환경변수 전체 목록

```bash
# ============================================
# 필수 환경변수 (Production)
# ============================================

# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Auth
NEXTAUTH_URL="https://fanplace.com"
NEXTAUTH_SECRET="[openssl rand -base64 32]"

# Payment
TOSS_SECRET_KEY="live_sk_..."
TOSS_CLIENT_KEY="live_ck_..."

# Storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@fanplace.com"

# Monitoring
SENTRY_DSN="https://..."

# Security
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

#### Vercel 설정 단계

**1. Vercel 프로젝트 생성**

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 링크
vercel link
```

**2. 환경변수 설정**

Vercel Dashboard → Settings → Environment Variables:

| 변수 | Production | Preview | Development |
|------|------------|---------|-------------|
| DATABASE_URL | Neon Production | Neon Preview | Local |
| NEXTAUTH_URL | https://fanplace.com | https://preview.vercel.app | http://localhost:3000 |
| NEXTAUTH_SECRET | ✅ | ✅ | ✅ |

**3. Build 설정**

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**4. 배포**

```bash
# Preview 배포
vercel

# Production 배포
vercel --prod
```

---

### A-2) Docker + Nginx (대안)

이 내용은 이미 작성된 `PRODUCTION_DEPLOYMENT_GUIDE.md`를 참조하세요.

---

## B) 운영 데이터베이스

### Neon (권장)

**장점**:
- ✅ Serverless PostgreSQL
- ✅ 자동 스케일링
- ✅ Generous free tier
- ✅ Connection pooling 내장

**설정 방법**:

1. **Neon 프로젝트 생성**
   ```
   https://console.neon.tech
   → New Project → "fanplace-prod"
   ```

2. **연결 문자열 복사**
   ```bash
   # Pooled connection (Serverless functions)
   DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/fanplatform?sslmode=require"
   
   # Direct connection (Prisma Migrate)
   DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/fanplatform?sslmode=require"
   ```

3. **Prisma 설정**
   ```typescript
   // lib/prisma.ts는 이미 최적화되어 있음
   // Neon은 자동으로 connection pooling 제공
   ```

4. **마이그레이션 실행**
   ```bash
   # 로컬에서 테스트
   DATABASE_URL="..." pnpm prisma migrate deploy
   
   # Vercel에서 자동 실행 (vercel-build 스크립트)
   ```

---

## C) 인증 시스템

### C-1) 소셜 로그인 추가

현재 Credentials 방식만 구현되어 있습니다. Google과 Kakao를 추가하겠습니다.

#### Google OAuth 설정

**1. Google Cloud Console**
```
https://console.cloud.google.com
→ APIs & Services → Credentials
→ Create OAuth Client ID
→ Web application

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google (개발)
- https://fanplace.com/api/auth/callback/google (프로덕션)
```

**2. 환경변수 추가**
```bash
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

**3. lib/auth.ts 수정**
```typescript
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... 기존 Credentials
]
```

#### Kakao OAuth 설정

**1. Kakao Developers**
```
https://developers.kakao.com
→ 내 애플리케이션 → 애플리케이션 추가하기
→ 플랫폼 설정 → Web
→ Redirect URI: http://localhost:3000/api/auth/callback/kakao
```

**2. 환경변수 추가**
```bash
KAKAO_CLIENT_ID="xxx"
KAKAO_CLIENT_SECRET="xxx"
```

**3. lib/auth.ts 수정**
```typescript
import KakaoProvider from 'next-auth/providers/kakao';

providers: [
  KakaoProvider({
    clientId: process.env.KAKAO_CLIENT_ID!,
    clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  }),
]
```

---

## D) 결제 시스템

### 토스페이먼츠 (권장)

#### D-1) 설정

**1. 토스페이먼츠 가입**
```
https://developers.tosspayments.com
→ 회원가입 → 개발자센터 → API 키 발급
```

**2. 환경변수**
```bash
# 테스트
TOSS_SECRET_KEY="test_sk_..."
TOSS_CLIENT_KEY="test_ck_..."

# 프로덕션
TOSS_SECRET_KEY="live_sk_..."
TOSS_CLIENT_KEY="live_ck_..."
```

#### D-2) 결제 플로우

```
1. 사용자가 "결제하기" 클릭
   ↓
2. 클라이언트에서 토스 결제 위젯 호출
   ↓
3. 사용자 결제 정보 입력
   ↓
4. 토스페이먼츠 서버 승인
   ↓
5. Success URL로 리다이렉트
   ↓
6. 서버에서 결제 검증 (paymentKey, orderId, amount)
   ↓
7. DB에 결제 상태 업데이트
   ↓
8. Webhook으로 최종 확인
```

#### D-3) 구현 예시

**결제 위젯 페이지** (`app/[locale]/ads/checkout/page.tsx`)
```typescript
'use client';

import { useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

export default function CheckoutPage() {
  useEffect(() => {
    loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!).then(tossPayments => {
      tossPayments.payment({
        amount: 100000,
        orderId: 'ORDER-' + Date.now(),
        orderName: '지하철 광고 상품',
        successUrl: window.location.origin + '/api/payments/toss/success',
        failUrl: window.location.origin + '/api/payments/toss/fail',
      });
    });
  }, []);

  return <div>결제 진행 중...</div>;
}
```

**결제 승인 API** (`app/api/payments/toss/success/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { paymentKey, orderId, amount } = await request.json();

  try {
    // 1. 토스페이먼츠 승인 요청
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const payment = await response.json();

    if (!response.ok) {
      throw new Error(payment.message);
    }

    // 2. DB 업데이트
    await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        status: 'PAID',
        paymentIntentId: paymentKey,
        paidAt: new Date(),
      },
    });

    // 3. 이메일 발송 (선택)
    // await sendReceiptEmail(orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

**Webhook 핸들러** (`app/api/webhooks/toss/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('toss-signature');

  // 서명 검증
  const expectedSignature = crypto
    .createHmac('sha256', process.env.TOSS_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64');

  if (signature !== expectedSignature) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.eventType) {
    case 'PAYMENT_CONFIRMED':
      // 결제 확정
      await prisma.order.update({
        where: { paymentIntentId: event.data.paymentKey },
        data: { status: 'CONFIRMED' },
      });
      break;

    case 'PAYMENT_CANCELED':
      // 결제 취소
      await prisma.order.update({
        where: { paymentIntentId: event.data.paymentKey },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
      break;
  }

  return NextResponse.json({ received: true });
}
```

---

## E) 파일 스토리지

### Cloudinary (권장)

#### E-1) 설정

**1. Cloudinary 가입**
```
https://cloudinary.com/users/register/free
```

**2. Dashboard에서 크레덴셜 복사**
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="xxx"
```

#### E-2) 업로드 구현

**서명 생성 API** (`app/api/upload/signature/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'fanplace' },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({ timestamp, signature });
}
```

**업로드 컴포넌트** (`components/upload/ImageUploader.tsx`)
```typescript
'use client';

import { useState } from 'react';

export function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. 서명 받기
      const { timestamp, signature } = await fetch('/api/upload/signature').then(r => r.json());

      // 2. Cloudinary에 직접 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('folder', 'fanplace');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      onUpload(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleUpload}
      disabled={uploading}
    />
  );
}
```

#### E-3) Next.js 이미지 도메인 설정

```typescript
// next.config.mjs
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};
```

---

## F) 메일 시스템

### Resend (권장)

#### F-1) 설정

**1. Resend 가입**
```
https://resend.com
→ API Keys → Create API Key
```

**2. 도메인 인증**
```
Dashboard → Domains → Add Domain
→ DNS 레코드 추가 (SPF, DKIM)
```

**3. 환경변수**
```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="FanPlace <noreply@fanplace.com>"
```

#### F-2) 메일 유틸리티

**lib/email.ts**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'FanPlace에 오신 것을 환영합니다!',
    html: `
      <h1>안녕하세요, ${name}님!</h1>
      <p>FanPlace 회원가입을 완료했습니다.</p>
      <p><a href="${process.env.NEXTAUTH_URL}">지금 시작하기</a></p>
    `,
  });
}

export async function sendReceiptEmail(to: string, orderId: string, amount: number) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `[FanPlace] 결제 영수증 (주문번호: ${orderId})`,
    html: `
      <h1>결제가 완료되었습니다</h1>
      <p>주문번호: ${orderId}</p>
      <p>결제금액: ${amount.toLocaleString()}원</p>
      <p><a href="${process.env.NEXTAUTH_URL}/account/orders">주문 내역 확인</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: '[FanPlace] 비밀번호 재설정',
    html: `
      <h1>비밀번호 재설정</h1>
      <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>이 링크는 1시간 동안 유효합니다.</p>
    `,
  });
}
```

---

## G) 보안 및 모니터링

### G-1) 보안 헤더

**next.config.mjs**
```typescript
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};
```

### G-2) Rate Limiting

**lib/rate-limit.ts**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`;
  
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window);
  }
  
  const remaining = Math.max(0, limit - count);
  
  return {
    success: count <= limit,
    remaining,
  };
}
```

**사용 예시** (`app/api/auth/signup/route.ts`)
```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  const { success, remaining } = await rateLimit(ip, 5, 3600); // 5 requests per hour
  
  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: { 'X-RateLimit-Remaining': remaining.toString() },
    });
  }
  
  // ... 회원가입 로직
}
```

### G-3) Sentry (에러 추적)

**설치**
```bash
pnpm add @sentry/nextjs
```

**sentry.client.config.ts**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**sentry.server.config.ts**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

이 가이드는 매우 방대하므로, 계속해서 나머지 섹션들을 작성하겠습니다...

---

**다음 섹션 계속...**



