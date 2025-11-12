# ✅ FanPlace 프로덕션 준비 완전 체크리스트

> **작성일**: 2025-11-08  
> **목표**: 로컬 개발 → 프로덕션 배포까지 모든 항목 검증

---

## 🚨 현재 긴급 해결 필요

### PostgreSQL 연결 오류

```
Error: Can't reach database server at `localhost:5432`
```

**즉시 실행**:
```powershell
# 1. Docker Desktop 실행 (Windows 시작 메뉴)
# 2. 터미널에서:
cd C:\Users\pjhic\OneDrive\25-2\idolads
docker-compose up -d
pnpm db:seed
pnpm dev
```

---

## 📋 프로덕션 갭 분석표

| 항목 | 현재 상태 | 필요 상태 | 우선순위 | 작업 |
|------|-----------|-----------|----------|------|
| **인프라** |
| PostgreSQL | ⚠️ Docker 미실행 | ✅ Neon/Supabase | 🔴 필수 | Docker 시작 또는 Neon 연결 |
| Prisma 마이그레이션 | ❌ db push 사용 | ✅ migrate files | 🔴 필수 | `prisma migrate dev --name init` |
| 환경변수 관리 | ⚠️ .env.local만 | ✅ Production 분리 | 🔴 필수 | .env 문서화 |
| **인증** |
| NextAuth 기본 | ✅ 구현됨 | ✅ | ✅ | - |
| 소셜 로그인 | ⚠️ 코드만 | ✅ OAuth 설정 | 🟡 권장 | Google/Kakao 키 발급 |
| RBAC (Role) | ✅ User.role | ✅ | ✅ | - |
| **관리자** |
| 대시보드 | ❌ 없음 | ✅ /admin | 🔴 필수 | 대시보드 페이지 생성 |
| Events CRUD | ❌ 없음 | ✅ | 🔴 필수 | CRUD 페이지 생성 |
| Ads CRUD | ❌ 없음 | ✅ | 🔴 필수 | CRUD 페이지 생성 |
| **결제** |
| 결제 시스템 | ❌ 없음 | ✅ 토스페이먼츠 | 🔴 필수 | API + Widget 구현 |
| Webhook | ❌ 없음 | ✅ 서명 검증 | 🔴 필수 | Webhook 핸들러 |
| **스토리지** |
| 이미지 업로드 | ❌ 없음 | ✅ Cloudinary | 🔴 필수 | 서명 API + 컴포넌트 |
| next.config images | ⚠️ 부분적 | ✅ remotePatterns | 🟡 권장 | Cloudinary 도메인 추가 |
| **메일** |
| 메일 시스템 | ❌ 없음 | ✅ Resend | 🟡 권장 | lib/mail.ts 생성 |
| 이메일 템플릿 | ❌ 없음 | ✅ | 🟡 권장 | 회원가입, 영수증 |
| **보안** |
| 보안 헤더 | ❌ 없음 | ✅ CSP 등 | 🔴 필수 | next.config headers |
| Rate Limiting | ❌ 없음 | ✅ Upstash | 🟡 권장 | lib/rate-limit.ts |
| CSRF 보호 | ⚠️ NextAuth | ✅ | ✅ | - |
| **모니터링** |
| 에러 추적 | ❌ 없음 | ✅ Sentry | 🟡 권장 | Sentry 설정 |
| Uptime | ❌ 없음 | ✅ | 🟢 선택 | UptimeRobot 등 |
| 로깅 | ⚠️ console만 | ✅ 구조화 | 🟡 권장 | pino/winston |
| **데이터** |
| 시드 스크립트 | ✅ 있음 | ✅ | ✅ | - |
| 자동 인입 | ❌ 없음 | ✅ CRON API | 🟢 선택 | /api/cron/sync |
| **SEO** |
| sitemap.xml | ❌ 없음 | ✅ | 🔴 필수 | app/sitemap.ts |
| robots.txt | ❌ 없음 | ✅ | 🔴 필수 | app/robots.ts |
| 약관/개인정보 | ❌ 없음 | ✅ | 🔴 필수 | 페이지 생성 |
| **에러 처리** |
| not-found.tsx | ❌ 없음 | ✅ | 🔴 필수 | 404 페이지 |
| error.tsx | ❌ 없음 | ✅ | 🔴 필수 | 에러 경계 |
| global-error.tsx | ❌ 없음 | ✅ | 🟡 권장 | 루트 에러 |
| **CI/CD** |
| GitHub Actions | ❌ 없음 | ✅ | 🔴 필수 | 워크플로우 생성 |
| 배포 스크립트 | ❌ 없음 | ✅ | 🟡 권장 | deploy.sh |

---

## 🔴 필수 작업 (프로덕션 배포 전 필수)

### 1. PostgreSQL 시작 및 마이그레이션

```powershell
# Docker Desktop 실행 후
docker-compose up -d
pnpm prisma migrate dev --name init
pnpm db:seed
```

### 2. 관리자 대시보드 구현

**파일 생성 필요**:
- `app/[locale]/admin/dashboard/page.tsx`
- `app/[locale]/admin/events/page.tsx`
- `app/[locale]/admin/events/new/page.tsx`
- `app/[locale]/admin/events/[id]/edit/page.tsx`

### 3. 결제 시스템

**파일 생성 필요**:
- `app/api/payments/toss/create/route.ts`
- `app/api/payments/toss/confirm/route.ts`
- `app/api/webhooks/toss/route.ts`
- `lib/payments.ts`

### 4. 파일 업로드

**파일 생성 필요**:
- `app/api/upload/signature/route.ts`
- `components/upload/ImageUploader.tsx`

### 5. 보안 헤더

**파일 수정 필요**:
- `next.config.mjs` - headers 추가

### 6. SEO 페이지

**파일 생성 필요**:
- `app/sitemap.ts`
- `app/robots.ts`
- `app/[locale]/terms/page.tsx`
- `app/[locale]/privacy/page.tsx`

### 7. 에러 페이지

**파일 생성 필요**:
- `app/[locale]/not-found.tsx`
- `app/[locale]/error.tsx`
- `app/global-error.tsx`

### 8. CI/CD

**파일 생성 필요**:
- `.github/workflows/preview.yml`
- `.github/workflows/production.yml`

---

## 🟡 권장 작업

### 9. Rate Limiting

**파일 생성 필요**:
- `lib/rate-limit.ts`

### 10. 메일 시스템

**파일 생성 필요**:
- `lib/mail.ts`
- `emails/Welcome.tsx`
- `emails/Receipt.tsx`

### 11. 모니터링

**파일 생성 필요**:
- `sentry.client.config.ts`
- `sentry.server.config.ts`

---

## 📝 갭 분석 상세

### 현재 프로젝트 구조

```
fanplace/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          ✅ 존재
│   │   ├── page.tsx             ✅ 존재
│   │   ├── auth/
│   │   │   ├── signin/          ✅ 존재
│   │   │   └── signup/          ✅ 존재
│   │   ├── events/              ✅ 존재
│   │   ├── places/              ✅ 존재
│   │   ├── ads/                 ✅ 존재
│   │   ├── account/             ✅ 존재
│   │   └── admin/               ⚠️ 기본만 (CRUD 없음)
│   │
│   └── api/
│       ├── auth/                ✅ NextAuth
│       ├── events/              ✅ 기본 API
│       ├── checkout/            ✅ 기본
│       ├── webhooks/            ⚠️ Stripe만
│       ├── upload/              ❌ 없음
│       ├── payments/            ❌ 없음
│       └── cron/                ❌ 없음
│
├── lib/
│   ├── prisma.ts                ✅ 싱글톤
│   ├── auth.ts                  ✅ NextAuth
│   ├── auth-guard.ts            ✅ 방금 생성
│   ├── mail.ts                  ❌ 없음
│   ├── rate-limit.ts            ❌ 없음
│   └── payments/
│       └── toss.ts              ❌ 없음
│
├── components/
│   ├── admin/                   ⚠️ 기본만
│   └── upload/                  ❌ 없음
│
├── prisma/
│   ├── schema.prisma            ✅ 완전함
│   ├── seed.ts                  ✅ 있음
│   └── migrations/              ❌ 없음 (db push 사용 중)
│
├── .github/workflows/           ❌ 없음
│
└── docs/                        ✅ 4개 가이드 있음
```

---

## 🎯 프로덕션 필수 파일 생성 (우선순위 순)

이제 필수 파일들을 하나씩 생성하겠습니다...


