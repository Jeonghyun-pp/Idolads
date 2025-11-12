# 🚀 FanPlace 프로덕션 배포 완전 가이드

> **작성일**: 2025-11-08  
> **프로젝트**: FanPlace (팬덤 플랫폼)  
> **스택**: Next.js 14 + Prisma + PostgreSQL + next-intl

---

## 📑 목차

1. [프로젝트 구조 분석](#1-프로젝트-구조-분석)
2. [i18n 라우팅 동작 흐름](#2-i18n-라우팅-동작-흐름)
3. [잠재적 문제 스캔](#3-잠재적-문제-스캔)
4. [Vercel 배포 가이드](#4-vercel-배포-가이드)
5. [Docker 배포 가이드](#5-docker-배포-가이드)
6. [Prisma DB 운영 가이드](#6-prisma-db-운영-가이드)
7. [CI/CD 파이프라인](#7-cicd-파이프라인)
8. [보안 체크리스트](#8-보안-체크리스트)
9. [성능 최적화](#9-성능-최적화)

---

## 1. 프로젝트 구조 분석

### 📁 전체 폴더 트리

```
fanplace/
├── app/                                    # Next.js 14 App Router
│   ├── [locale]/                          # ✅ i18n 다국어 라우팅 (ko, en, ja, zh)
│   │   ├── layout.tsx                     # 루트 레이아웃 (메타데이터, providers, Header)
│   │   ├── page.tsx                       # 홈페이지 (이벤트/광고 표시)
│   │   ├── providers.tsx                  # 클라이언트 providers (NextAuth SessionProvider)
│   │   │
│   │   ├── account/                       # 사용자 계정 페이지
│   │   │   └── page.tsx                   # 내 이벤트, 주문, 문의 관리
│   │   │
│   │   ├── admin/                         # 관리자 페이지 (ADMIN role only)
│   │   │   └── page.tsx                   # 문의/리뷰/게시물 관리
│   │   │
│   │   ├── ads/                           # 광고 상품 페이지
│   │   │   ├── page.tsx                   # 광고 상품 목록
│   │   │   └── checkout/                  # 광고 구매 결제
│   │   │       ├── CheckoutForm.tsx       # 결제 폼 (Stripe)
│   │   │       └── page.tsx               # 결제 페이지
│   │   │
│   │   ├── auth/                          # 인증 페이지
│   │   │   ├── signin/
│   │   │   │   └── page.tsx               # 로그인
│   │   │   └── signup/
│   │   │       └── page.tsx               # 회원가입
│   │   │
│   │   ├── events/                        # 이벤트 페이지
│   │   │   ├── page.tsx                   # 이벤트 목록
│   │   │   ├── EventsContent.tsx          # 클라이언트 컴포넌트 (필터/정렬)
│   │   │   └── [id]/
│   │   │       └── page.tsx               # 이벤트 상세
│   │   │
│   │   └── places/                        # 장소 페이지
│   │       ├── page.tsx                   # 장소 목록 (지도/리스트)
│   │       └── [id]/
│   │           └── page.tsx               # 장소 상세 + 문의
│   │
│   ├── api/                               # API 라우트 (middleware 제외됨)
│   │   ├── admin/                         # 관리자 API
│   │   │   ├── inquiries/[id]/route.ts   # 문의 처리
│   │   │   └── reviews/[id]/route.ts     # 리뷰 승인/거부
│   │   │
│   │   ├── auth/                          # 인증 API
│   │   │   ├── [...nextauth]/route.ts    # NextAuth.js 핸들러
│   │   │   └── signup/route.ts            # 회원가입 API
│   │   │
│   │   ├── checkout/route.ts              # 결제 생성 API (Stripe)
│   │   ├── events/route.ts                # 이벤트 CRUD API
│   │   ├── place-inquiries/route.ts       # 장소 문의 API
│   │   │
│   │   └── webhooks/                      # 외부 서비스 Webhook
│   │       └── stripe/route.ts            # Stripe 결제 확인 Webhook
│   │
│   └── globals.css                        # Tailwind CSS 전역 스타일
│
├── components/                            # React 컴포넌트
│   ├── account/                           # 계정 관련 컴포넌트
│   │   ├── EventsList.tsx                 # 내 이벤트 목록
│   │   ├── InquiriesList.tsx              # 내 문의 목록
│   │   └── OrdersList.tsx                 # 내 주문 목록
│   │
│   ├── admin/                             # 관리자 컴포넌트
│   │   ├── InquiriesManager.tsx           # 문의 관리
│   │   ├── PostingsManager.tsx            # 광고 게시 관리
│   │   └── ReviewQueue.tsx                # 광고 리뷰 큐
│   │
│   ├── ads/
│   │   └── AdProductCard.tsx              # 광고 상품 카드
│   │
│   ├── auth/
│   │   ├── SignInForm.tsx                 # 로그인 폼
│   │   └── SignUpForm.tsx                 # 회원가입 폼
│   │
│   ├── events/
│   │   └── EventCard.tsx                  # 이벤트 카드
│   │
│   ├── landing/
│   │   └── Hero.tsx                       # 랜딩 히어로 섹션
│   │
│   ├── layout/
│   │   └── Header.tsx                     # ✅ 글로벌 헤더 (locale 전환, 네비게이션)
│   │
│   ├── places/
│   │   └── InquiryForm.tsx                # 장소 문의 폼
│   │
│   └── ui/                                # Shadcn UI 컴포넌트
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── tabs.tsx
│
├── lib/                                   # 유틸리티 라이브러리
│   ├── auth.ts                            # ✅ NextAuth.js 설정 (credentials, session)
│   ├── auth-bcryptjs.d.ts                 # bcryptjs 타입 선언
│   │
│   ├── navigation.ts                      # ✅ next-intl navigation (locale-aware Link/Router)
│   │
│   ├── prisma.ts                          # ✅ PrismaClient 싱글톤 (HMR 안전)
│   │
│   ├── maps/                              # 지도 프로바이더 추상화
│   │   ├── provider.ts                    # 프로바이더 인터페이스
│   │   ├── mapbox.ts                      # Mapbox 구현
│   │   └── mock.ts                        # Mock (개발용)
│   │
│   ├── payments/                          # 결제 프로바이더 추상화
│   │   ├── provider.ts                    # 결제 인터페이스
│   │   └── stripe.ts                      # Stripe 구현
│   │
│   ├── storage/                           # 파일 스토리지 추상화
│   │   ├── provider.ts                    # 스토리지 인터페이스
│   │   ├── local.ts                       # 로컬 파일시스템
│   │   └── s3.ts                          # AWS S3/Cloudflare R2
│   │
│   └── utils.ts                           # 공통 유틸리티 (cn 등)
│
├── i18n/                                  # ✅ 다국어 설정
│   ├── messages/                          # 번역 메시지 파일
│   │   ├── ko.json                        # 한국어
│   │   ├── en.json                        # 영어
│   │   ├── ja.json                        # 일본어
│   │   └── zh.json                        # 중국어
│   │
│   └── request.ts                         # ✅ next-intl 요청 설정 (fallback, timezone)
│
├── prisma/                                # ✅ Prisma ORM
│   ├── schema.prisma                      # ✅ DB 스키마 (User, Event, Place, Order 등)
│   ├── seed.ts                            # ✅ 초기 데이터 시드
│   └── migrations/                        # 마이그레이션 파일 (아직 없음 - db push 사용 중)
│
├── docs/                                  # 문서
│   └── i18n-best-practices.md             # i18n 모범 사례
│
├── public/                                # 정적 파일 (이미지, 폰트 등)
│   └── uploads/                           # 업로드된 파일 (로컬 개발용)
│
├── middleware.ts                          # ✅ Next.js 미들웨어 (i18n 라우팅)
├── next.config.mjs                        # ✅ Next.js 설정 (next-intl 플러그인)
├── tailwind.config.ts                     # Tailwind CSS 설정
├── tsconfig.json                          # TypeScript 설정
├── postcss.config.mjs                     # PostCSS 설정
│
├── .env.example                           # ✅ 환경변수 템플릿
├── .env.local                             # 로컬 환경변수 (gitignore)
│
├── package.json                           # 의존성 및 스크립트
├── pnpm-lock.yaml                         # pnpm 잠금 파일
├── pnpm-workspace.yaml                    # pnpm 워크스페이스 설정
│
├── docker-compose.yml                     # ✅ Docker 개발 환경 (PostgreSQL)
│
└── README.md                              # 프로젝트 README
```

### 🔍 주요 파일 역할 설명

#### 핵심 설정 파일

| 파일 | 역할 | 주의사항 |
|------|------|----------|
| `middleware.ts` | i18n 라우팅, locale 리다이렉트 | ✅ API 라우트 제외 필수 |
| `i18n/request.ts` | next-intl 설정, 메시지 로드, fallback | ✅ timezone, 메시지 fallback 구현됨 |
| `lib/prisma.ts` | Prisma 싱글톤 (HMR 안전) | ✅ 프로덕션에서 글로벌 캐싱 비활성화 |
| `lib/auth.ts` | NextAuth.js 인증 설정 | ✅ `NEXTAUTH_SECRET` 필수 |
| `lib/navigation.ts` | locale-aware Link/Router | ✅ next/link 대신 사용 |

#### 데이터베이스

| 파일 | 역할 | 주의사항 |
|------|------|----------|
| `prisma/schema.prisma` | DB 스키마 (338줄) | ✅ User, Event, Place, Order, AdProduct 등 |
| `prisma/seed.ts` | 초기 데이터 | ✅ 테스트 계정 4개, 샘플 데이터 포함 |
| `prisma/migrations/` | 마이그레이션 | ⚠️ 현재 없음 (db push 사용 중) |

#### 환경 변수

| 파일 | 역할 | 주의사항 |
|------|------|----------|
| `.env.example` | 환경변수 템플릿 (116줄) | ✅ 모든 설정 문서화됨 |
| `.env.local` | 로컬 개발 환경변수 | ⚠️ Git 커밋 금지 (.gitignore) |
| `.env.production` | 프로덕션 환경변수 | ⚠️ Vercel/Docker에서 별도 설정 |

---

## 2. i18n 라우팅 동작 흐름

### 🔄 라우팅 흐름도

```
사용자 요청: https://fanplace.com/
           ↓
    [middleware.ts 실행]
           ↓
  1. matcher 확인
     /((?!api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml).*)
           ↓
  2. locale 감지
     - URL에 locale 없음
     - Accept-Language 헤더 확인: "ko-KR"
     - defaultLocale: "ko"
           ↓
  3. 리다이렉트
     → https://fanplace.com/ko
           ↓
    [app/[locale]/layout.tsx]
           ↓
  4. params.locale = "ko"
  5. generateMetadata() 실행 → SEO 메타 태그 생성
  6. getMessages() → i18n/messages/ko.json 로드
           ↓
    [app/[locale]/page.tsx]
           ↓
  7. getTranslations("home") → 번역 로드
  8. Prisma 데이터 fetch (events, adProducts)
  9. 렌더링
```

### 🌐 Locale 전환 흐름

```
사용자: 언어 전환 (한국어 → 영어)
           ↓
  [Header.tsx] 
  Globe 아이콘 → Dropdown → "English" 클릭
           ↓
  getLocalizedPath("en", "/events")
  → "/en/events"
           ↓
  <a href="/en/events">
           ↓
    [middleware.ts]
           ↓
  locale = "en" 감지
  → app/[locale]/events/page.tsx
           ↓
  params.locale = "en"
  getMessages() → i18n/messages/en.json
           ↓
  영어 페이지 렌더링
```

### 📍 Link 컴포넌트 패턴

```tsx
// ❌ 잘못된 방법 (locale 누락)
import Link from "next/link";
<Link href="/events">이벤트</Link>
// → /events (404)

// ✅ 올바른 방법 (locale 자동 추가)
import { Link } from "@/lib/navigation";
<Link href="/events">이벤트</Link>
// → /ko/events (현재 locale이 ko인 경우)
```

---

## 3. 잠재적 문제 스캔

### 🔴 높은 위험도

#### ❌ 마이그레이션 파일 없음
```
현재 상태: prisma db push 사용
문제점: 프로덕션에서 스키마 변경 시 데이터 손실 위험
해결책: prisma migrate dev로 마이그레이션 생성 필요
```

**조치 필요**:
```bash
# 기존 DB 스키마 → 마이그레이션 변환
pnpm prisma migrate dev --name init

# 이후 변경사항은 항상 migrate 사용
pnpm prisma migrate dev --name add_some_feature
```

#### ❌ DATABASE_URL 보안
```
현재: .env.local에 평문 저장
위험: 실수로 커밋 시 노출
```

**프로덕션 조치**:
- Vercel: Environment Variables에 저장
- Docker: `.env.production` + Docker Secrets
- 절대 코드에 하드코딩 금지

### 🟡 중간 위험도

#### ⚠️ Prisma 클라이언트 컴포넌트 사용 금지
```tsx
// ❌ 클라이언트 컴포넌트에서 Prisma 사용
"use client";
import { prisma } from "@/lib/prisma";

// ✅ 서버 컴포넌트 또는 API 라우트에서만 사용
// app/[locale]/page.tsx (서버 컴포넌트)
import { prisma } from "@/lib/prisma";
```

**스캔 결과**: ✅ 현재 프로젝트는 올바르게 사용 중

#### ⚠️ Edge Runtime에서 Prisma 사용 불가
```typescript
// ❌ Edge Runtime + Prisma
export const runtime = 'edge';
import { prisma } from "@/lib/prisma";

// ✅ Node.js Runtime 사용 (기본값)
// export const runtime = 'nodejs'; // 생략 가능
```

**스캔 결과**: ✅ Edge runtime 미사용

### 🟢 낮은 위험도 (확인 필요)

#### ℹ️ 이미지 최적화
```typescript
// next.config.mjs
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: '**.cloudfront.net' },
  ],
}
```

**프로덕션 권장**:
- Unsplash 대신 Cloudinary/S3 사용
- WebP/AVIF 포맷 활성화

#### ℹ️ 환경변수 검증
```typescript
// lib/env.ts (권장 생성)
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
});

export const env = envSchema.parse(process.env);
```

---

## 4. Vercel 배포 가이드

### 📦 Vercel 배포 (권장)

#### A. 사전 준비

1. **GitHub Repository 연결**
   ```bash
   # 프로젝트를 GitHub에 푸시
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fanplace.git
   git push -u origin main
   ```

2. **PostgreSQL 데이터베이스 준비**
   
   **옵션 A**: Vercel Postgres (권장)
   ```bash
   # Vercel 대시보드에서:
   # Project → Storage → Create Database → Postgres
   # 자동으로 DATABASE_URL 환경변수 설정됨
   ```

   **옵션 B**: Supabase
   ```
   1. https://supabase.com 가입
   2. New Project 생성
   3. Settings → Database → Connection String 복사
   ```

   **옵션 C**: Neon
   ```
   1. https://neon.tech 가입
   2. New Project 생성
   3. Connection String 복사
   ```

#### B. Vercel 프로젝트 설정

1. **Vercel에서 Import**
   ```
   https://vercel.com/new
   → Import Git Repository
   → GitHub 저장소 선택
   ```

2. **환경 변수 설정**
   
   Vercel Dashboard → Project Settings → Environment Variables:

   ```bash
   # 필수 변수
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="[32자 이상 랜덤 문자열]"
   NEXTAUTH_URL="https://fanplace.vercel.app"

   # 결제 (Stripe)
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # 스토리지 (S3)
   STORAGE_PROVIDER="s3"
   AWS_ACCESS_KEY_ID="..."
   AWS_SECRET_ACCESS_KEY="..."
   AWS_S3_BUCKET="fanplace-prod"
   AWS_REGION="ap-northeast-2"

   # 지도 (Mapbox)
   MAP_PROVIDER="mapbox"
   MAPBOX_TOKEN="pk...."

   # 모니터링 (선택)
   SENTRY_DSN="https://..."
   ```

   **NEXTAUTH_SECRET 생성**:
   ```bash
   openssl rand -base64 32
   ```

3. **빌드 설정**
   
   Vercel Dashboard → Project Settings → Build & Development:
   
   ```
   Framework Preset: Next.js
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

4. **Prisma 설정**
   
   `package.json`에 빌드 스크립트 추가:
   ```json
   {
     "scripts": {
       "build": "prisma generate && next build",
       "vercel-build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```

5. **배포**
   ```bash
   # 자동 배포: main 브랜치에 푸시하면 자동 배포
   git push origin main

   # 수동 배포: Vercel CLI 사용
   npm i -g vercel
   vercel --prod
   ```

#### C. Prisma 마이그레이션 (Vercel)

```bash
# 로컬에서 마이그레이션 생성
pnpm prisma migrate dev --name init

# migrations 폴더를 Git에 커밋
git add prisma/migrations
git commit -m "Add initial migration"
git push

# Vercel 배포 시 자동으로 prisma migrate deploy 실행됨
```

#### D. Stripe Webhook 설정

1. **Webhook 엔드포인트 등록**
   ```
   Stripe Dashboard → Developers → Webhooks
   → Add endpoint
   → URL: https://fanplace.vercel.app/api/webhooks/stripe
   ```

2. **Webhook Secret 복사**
   ```bash
   # Vercel 환경변수에 추가
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

#### E. 도메인 설정

```
Vercel Dashboard → Project → Settings → Domains
→ Add: fanplace.com
→ DNS 설정:
  - A 레코드: 76.76.21.21
  - CNAME: cname.vercel-dns.com
```

#### F. 성능 최적화 (Vercel)

```typescript
// next.config.mjs
export default withNextIntl({
  // ✅ 이미지 최적화
  images: {
    domains: ['your-cdn.cloudfront.net'],
    formats: ['image/avif', 'image/webp'],
  },

  // ✅ 압축
  compress: true,

  // ✅ 헤더
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
        ],
      },
    ];
  },
});
```

---

## 5. Docker 배포 가이드

### 🐳 Docker + Nginx + PM2 (Self-Hosted)

#### A. Dockerfile 생성

```dockerfile
# Dockerfile
# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# Prisma 생성
RUN pnpm prisma generate

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# deps에서 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.prisma ./.prisma

# 소스 복사
COPY . .

# 환경변수 (빌드 시 필요한 것만)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 빌드
RUN pnpm build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 비root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.prisma ./.prisma

# 권한 설정
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

#### B. docker-compose.yml (프로덕션)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # PostgreSQL 데이터베이스
  postgres:
    image: postgres:16-alpine
    container_name: fanplace-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-fanplatform}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fanplace-network

  # Next.js 애플리케이션
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: fanplace-app
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-fanplatform}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - fanplace-network
    volumes:
      - ./public/uploads:/app/public/uploads
    command: sh -c "npx prisma migrate deploy && node server.js"

  # Nginx 리버스 프록시
  nginx:
    image: nginx:alpine
    container_name: fanplace-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./public:/usr/share/nginx/html/public:ro
    depends_on:
      - app
    networks:
      - fanplace-network

  # pgAdmin (선택사항 - 개발/스테이징 only)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: fanplace-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@fanplace.local
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
      PGADMIN_LISTEN_PORT: 80
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - fanplace-network
    profiles:
      - dev

networks:
  fanplace-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

#### C. Nginx 설정

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 로깅
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # 성능 최적화
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # HTTP → HTTPS 리다이렉트
    server {
        listen 80;
        server_name fanplace.com www.fanplace.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS 서버
    server {
        listen 443 ssl http2;
        server_name fanplace.com www.fanplace.com;

        # SSL 인증서 (Let's Encrypt)
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 보안 헤더
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # 정적 파일 캐싱
        location /_next/static/ {
            proxy_pass http://app:3000;
            proxy_cache_valid 200 60m;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location /uploads/ {
            alias /usr/share/nginx/html/public/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 라우트 (Rate Limiting)
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Next.js 애플리케이션
        location / {
            limit_req zone=general burst=50 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
        }
    }
}
```

#### D. 환경변수 파일

```bash
# .env.production
NODE_ENV=production

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE
POSTGRES_DB=fanplatform
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD_HERE@postgres:5432/fanplatform

# Auth
NEXTAUTH_SECRET=YOUR_32_CHAR_SECRET_HERE
NEXTAUTH_URL=https://fanplace.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=fanplace-prod
AWS_REGION=ap-northeast-2

# Monitoring
SENTRY_DSN=https://...

# pgAdmin
PGADMIN_PASSWORD=admin_password_here
```

**보안 주의**:
```bash
# .env.production을 Git에 커밋하지 마세요!
echo ".env.production" >> .gitignore
```

#### E. 배포 스크립트

```bash
# deploy.sh
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# 1. Git pull
echo "📥 Pulling latest code..."
git pull origin main

# 2. 환경변수 체크
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    exit 1
fi

# 3. Docker 이미지 빌드
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. 데이터베이스 백업
echo "💾 Backing up database..."
docker exec fanplace-postgres pg_dump -U postgres fanplatform > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 5. 컨테이너 재시작
echo "🔄 Restarting containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 6. 헬스체크
echo "🏥 Health check..."
sleep 10
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment completed!"
```

실행 권한:
```bash
chmod +x deploy.sh
```

#### F. SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot

# 인증서 발급
sudo certbot certonly --standalone -d fanplace.com -d www.fanplace.com

# 인증서 복사
sudo cp /etc/letsencrypt/live/fanplace.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/fanplace.com/privkey.pem ./nginx/ssl/

# 자동 갱신 설정 (crontab)
sudo crontab -e
# 추가:
0 0 1 * * certbot renew --quiet && systemctl reload nginx
```

---

이 가이드의 계속은 다음 파일에서 작성하겠습니다...

