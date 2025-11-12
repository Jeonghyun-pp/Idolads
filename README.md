# 💜 FanPlace - 팬덤 플랫폼 MVP

덕플레이스 스타일의 팬덤 플랫폼입니다. 생일카페 탐색, 장소 대관, 팬 광고 집행을 한 곳에서 관리할 수 있습니다.

## 🎯 프로젝트 개요

- **로컬 우선(Local-first)**: 즉시 실행 가능한 개발 환경
- **배포 준비(Production-ready)**: Provider 패턴으로 쉬운 인프라 전환
- **이미지 중심**: 세련된 다크 모드 UI with 글래스모피즘
- **다국어 지원**: 한국어, 영어, 일본어, 중국어

## 🛠️ 기술 스택

### Core
- **Next.js 14** (App Router, Server Actions, Route Handlers)
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL** (Database)

### Authentication & Payments
- **NextAuth.js** (Credentials + OAuth ready)
- **Stripe** (Test mode → Live 전환 가능)

### UI & Styling
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (Animations)
- **lucide-react** (Icons)

### Optional
- **Mapbox GL JS** (Maps - with mock fallback)
- **FullCalendar** (Calendar view)
- **next-intl** (Internationalization)

## 📦 로컬 실행

### Windows (PowerShell)

```powershell
# 1. 저장소 클론
git clone <repository-url>
cd fanplace-platform

# 2. 의존성 설치
pnpm install

# 3. PostgreSQL 시작 (Docker)
docker-compose up -d

# 4. 환경 변수 설정
Copy-Item env.example .env.local
# .env.local 파일을 열어 필요한 값을 설정하세요

# 5. 데이터베이스 설정
pnpm db:migrate
pnpm db:generate
pnpm db:seed

# 6. 개발 서버 시작
pnpm dev
```

### macOS / Linux

```bash
# 1. 저장소 클론
git clone <repository-url>
cd fanplace-platform

# 2. 의존성 설치
pnpm install

# 3. PostgreSQL 시작 (Docker)
docker-compose up -d

# 4. 환경 변수 설정
cp env.example .env.local
# .env.local 파일을 열어 필요한 값을 설정하세요

# 5. 데이터베이스 설정
pnpm db:migrate
pnpm db:generate
pnpm db:seed

# 6. 개발 서버 시작
pnpm dev
```

### 접속

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 테스트 계정

시드 데이터에 포함된 테스트 계정:

- **관리자**: `admin@fanplace.local` / `admin123`
- **팬**: `fan@fanplace.local` / `fan123`
- **주최자**: `promoter@fanplace.local` / `promoter123`
- **광고주**: `advertiser@fanplace.local` / `advertiser123`

## 🗺️ 사이트 구조

```
/                홈 (Hero + 이벤트 + 광고 하이라이트)
/events          이벤트 리스트 (카드/달력/지도 전환)
/events/[id]     이벤트 상세
/places          장소 리스트 & 지도
/places/[id]     장소 상세 + 대관 문의
/ads             광고 상품 소개
/ads/checkout    광고 결제 (Stripe Test)
/account         내 주문/이벤트/문의
/admin           관리자 대시보드 (심사/게시/증빙)
/auth/signin     로그인
/auth/signup     회원가입
```

## 🔑 주요 기능

### 이벤트 탐색
- 필터링 (셀럽/지역/날짜/특전)
- 정렬 (인기순/시작일/최신)
- 카드/달력/지도 뷰 전환
- 이벤트 상세 정보 & 갤러리

### 장소 대관
- 장소 검색 및 지도 탐색
- 대관 문의 생성
- 운영자 승인 프로세스 (REQUESTED → CONNECTED)

### 광고 집행
1. **상품 선택 & 결제**: Stripe Test Mode
2. **소재 제출 & 심사**: 디자인 업로드 → 관리자 검토
3. **광고 게시**: 승인된 소재로 게시
4. **증빙 확인**: 현장 사진 제공

### 관리자 기능
- 심사 큐 관리 (승인/반려)
- 게시 관리 (활성 광고 모니터링)
- 대관 문의 처리
- 통계 대시보드

## 🧩 Provider 패턴 (로컬 → 프로덕션 전환)

### 결제 Provider (`lib/payments/`)
- **로컬**: `StripePaymentProvider` (Test Mode)
- **전환**: `PAYMENT_PROVIDER=stripe` + Live Keys
- **확장**: `TossPaymentsProvider` 등 추가 가능

```typescript
// lib/payments/provider.ts
export async function getPaymentProvider(): Promise<PaymentProvider> {
  const provider = process.env.PAYMENT_PROVIDER || 'stripe';
  // 동적 import로 Provider 로드
}
```

### 스토리지 Provider (`lib/storage/`)
- **로컬**: `LocalStorageProvider` (./public/uploads)
- **전환**: `STORAGE_PROVIDER=s3` + AWS Credentials

```typescript
// lib/storage/provider.ts
export async function getStorageProvider(): Promise<StorageProvider> {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  // 로컬 또는 S3 Provider 반환
}
```

### 지도 Provider (`lib/maps/`)
- **로컬**: `MockMapProvider` (지도 없이 개발)
- **전환**: `MAP_PROVIDER=mapbox` + Token

## 📚 데이터 모델

### 주요 테이블
- `User`: 사용자 (role: FAN/PROMOTER/CAFE_OWNER/ADVERTISER/ADMIN)
- `Celeb`: 연예인
- `Event`: 생일카페 이벤트
- `Place`: 장소 (대관 가능 여부)
- `PlaceInquiry`: 대관 문의
- `AdProduct`: 광고 상품
- `Order`: 주문
- `AdReview`: 광고 심사
- `AdPosting`: 광고 게시
- `AdProof`: 증빙 사진

### 주요 Enum
- `Role`: FAN, PROMOTER, CAFE_OWNER, ADVERTISER, ADMIN
- `EventStatus`: DRAFT, PUBLISHED, ENDED
- `OrderStatus`: PENDING, PAID, REJECTED, REFUNDED
- `ReviewStatus`: SUBMITTED, APPROVED, REJECTED
- `InquiryStatus`: REQUESTED, CONNECTED, DECLINED

## 🌐 다국어 (next-intl)

현재는 한국어 중심으로 구현되어 있으며, `next-intl` 패키지가 설치되어 있습니다.

프로덕션에서 다국어를 활성화하려면:
1. `i18n/` 디렉토리에 번역 파일 추가 (ko.json, en.json, ja.json, zh.json)
2. `app/[locale]/layout.tsx` 구조로 라우팅 변경
3. 컴포넌트에서 `useTranslations()` hook 사용

## 🚀 프로덕션 배포 가이드 (Prod Playbook)

### 1️⃣ 배포 환경 설정

#### Vercel (추천)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경 변수 설정
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_SECRET_KEY
# ... 필요한 모든 환경 변수 추가
```

#### 데이터베이스
- **Supabase** 또는 **Neon** (PostgreSQL)
- `DATABASE_URL` 환경 변수 업데이트
- 마이그레이션 실행: `pnpm prisma migrate deploy`

#### 스토리지
- **AWS S3** 또는 **Cloudflare R2**
- 환경 변수 설정:
  ```
  STORAGE_PROVIDER=s3
  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  AWS_REGION=us-east-1
  AWS_S3_BUCKET=fanplace-uploads
  ```

#### 지도
- **Mapbox** 계정 생성 및 토큰 발급
  ```
  MAP_PROVIDER=mapbox
  MAPBOX_TOKEN=pk.YOUR_MAPBOX_TOKEN
  ```

#### 결제 (Stripe Live)
- Stripe Dashboard에서 Live Mode 활성화
- Live Keys로 환경 변수 업데이트
- Webhook 설정: `https://yourdomain.com/api/webhooks/stripe`
  ```
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### 2️⃣ 보안 체크리스트

#### 필수 보안 조치
- [ ] `NEXTAUTH_SECRET` 강력한 랜덤 문자열로 변경 (32+ chars)
- [ ] Stripe Webhook 서명 검증 활성화 (`STRIPE_WEBHOOK_SECRET`)
- [ ] CORS 설정 (`next.config.mjs`)
- [ ] Rate Limiting 구현 (예: `@vercel/edge`)
- [ ] 업로드 파일 검증 (MIME type, 크기 제한)
- [ ] RBAC 서버사이드 검증 (모든 `/admin` API)
- [ ] SQL Injection 방지 (Prisma 사용으로 기본 방어)
- [ ] XSS 방지 (React의 자동 이스케이핑 + CSP 헤더)

#### 보안 헤더 추가 (`next.config.mjs`)
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // CSP, HSTS 등 추가
      ],
    },
  ];
}
```

#### 환경 변수 관리
- 프로덕션 환경에서는 `.env.local` 사용 금지
- Vercel/AWS 등 플랫폼의 환경 변수 관리 UI 사용
- 정기적으로 시크릿 키 로테이션

### 3️⃣ 성능 최적화

#### 이미지 최적화
- `next/image` 사용 (자동 최적화)
- CDN 연동 (Vercel Edge Network 또는 CloudFront)
- `sizes` prop 정확히 지정
- `priority` prop으로 LCP 이미지 우선 로드

#### 데이터 페칭
- ISR (Incremental Static Regeneration) 활용
- `revalidatePath()` / `revalidateTag()` 사용
- 페이지네이션 또는 Infinite Scroll 구현

#### 코드 스플리팅
- 무거운 라이브러리는 Dynamic Import
  ```typescript
  const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
  const Map = dynamic(() => import('@/components/Map'), { ssr: false });
  ```

#### 성능 목표
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1
- Lighthouse 점수 90+

### 4️⃣ 모니터링 & 분석

#### 에러 추적
- **Sentry** 연동
  ```typescript
  // app/error.tsx
  import * as Sentry from "@sentry/nextjs";
  Sentry.captureException(error);
  ```

#### 분석 도구
- **Vercel Analytics** (Web Vitals)
- **PostHog** 또는 **Google Analytics 4** (사용자 행동 분석)

#### 로깅
- Vercel Logs 또는 Datadog/LogRocket
- 중요 이벤트 로깅 (결제, 심사, 게시 등)

#### 업타임 모니터링
- **UptimeRobot** 또는 **Pingdom**
- 주요 엔드포인트 health check

### 5️⃣ CI/CD 파이프라인

#### GitHub Actions 예시
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
```

#### Preview Deployments
- Vercel은 자동으로 PR마다 Preview URL 생성
- 팀원이 프로덕션 배포 전 테스트 가능

### 6️⃣ 백업 & 복구

#### 데이터베이스 백업
- Supabase/Neon: 자동 백업 기능 활용
- 정기 백업 스케줄 설정 (일일/주간)
- 백업 복구 테스트 주기적으로 수행

#### 재해 복구 계획
- RTO (Recovery Time Objective): 목표 복구 시간
- RPO (Recovery Point Objective): 허용 가능한 데이터 손실 시간
- 장애 대응 매뉴얼 작성

## 🧪 테스트

### Vitest (단위 테스트)
```bash
pnpm test
```

### Playwright (E2E 테스트)
```bash
pnpm test:e2e
```

*현재 테스트는 설정만 되어 있으며, 실제 테스트 코드는 프로젝트 요구사항에 맞춰 작성해야 합니다.*

## 📝 Prisma 명령어

```bash
# 마이그레이션 생성 및 적용
pnpm db:migrate

# Prisma Client 재생성
pnpm db:generate

# 시드 데이터 삽입
pnpm db:seed

# Prisma Studio 실행 (GUI)
pnpm db:studio

# 스키마와 DB 동기화 (개발용)
pnpm db:push
```

## 🐛 트러블슈팅

### PostgreSQL 연결 오류
```
Error: Can't reach database server at `localhost:5432`
```
**해결**: Docker 컨테이너 상태 확인
```bash
docker ps
docker-compose logs postgres
```

### Prisma Client 오류
```
Error: Cannot find module '@prisma/client'
```
**해결**: Prisma Client 재생성
```bash
pnpm db:generate
```

### Stripe Webhook 오류 (로컬)
로컬 개발 시 Stripe Webhook을 테스트하려면 Stripe CLI 사용:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 이미지 업로드 오류
- `UPLOAD_DIR` 경로 확인
- 디렉토리 쓰기 권한 확인
- 파일 크기 제한 확인 (Next.js `bodySizeLimit`)

## 🤝 기여

이 프로젝트는 MVP 템플릿입니다. 프로덕션 사용 시 아래 사항을 고려하세요:

- [ ] Rate Limiting 구현
- [ ] 이메일 알림 시스템
- [ ] 실시간 알림 (WebSocket/SSE)
- [ ] 고급 검색 & 필터링
- [ ] 소셜 공유 최적화 (OG 이미지 동적 생성)
- [ ] SEO 개선 (구조화된 데이터)
- [ ] 접근성 (WCAG 2.1 AA)
- [ ] 모바일 앱 (React Native 등)

## 📄 라이선스

MIT License

---

**💜 Happy Coding! 팬덤의 힘을 세상에!**

프로젝트 관련 문의: [your-email@example.com](mailto:your-email@example.com)

