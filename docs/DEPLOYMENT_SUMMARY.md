# 🚀 FanPlace 배포 완전 가이드 - 최종 요약

> **작성일**: 2025-11-08  
> **프로젝트**: FanPlace (팬덤 플랫폼)  
> **준비 상태**: ✅ 프로덕션 배포 준비 완료

---

## 📋 목차

1. [프로젝트 현황](#1-프로젝트-현황)
2. [배포 방법 선택](#2-배포-방법-선택)
3. [빠른 시작 가이드](#3-빠른-시작-가이드)
4. [체크리스트](#4-체크리스트)
5. [트러블슈팅](#5-트러블슈팅)

---

## 1. 프로젝트 현황

### ✅ 완료된 최적화 (2025-11-08)

| 항목 | 상태 | 설명 |
|------|------|------|
| **i18n 라우팅** | ✅ | next-intl, locale prefix, 언어 전환 |
| **SEO 최적화** | ✅ | generateMetadata, hreflang, sitemap |
| **에러 핸들링** | ✅ | Prisma try-catch, graceful degradation |
| **보안** | ✅ | 환경변수 분리, 최소 권한 DB |
| **성능** | ✅ | 정적 생성, 이미지 최적화, middleware 최적화 |
| **Docker** | ✅ | Dockerfile.production, docker-compose.production.yml |
| **CI/CD** | ✅ | GitHub Actions workflow |
| **헬스체크** | ✅ | /api/health endpoint |
| **배포 스크립트** | ✅ | deploy-production.sh |

### 📁 프로젝트 구조

```
fanplace/
├── app/
│   ├── [locale]/              # ✅ i18n 다국어 라우팅
│   │   ├── layout.tsx         # SEO, generateStaticParams
│   │   ├── page.tsx           # 홈페이지
│   │   ├── events/            # 이벤트 페이지
│   │   ├── places/            # 장소 페이지
│   │   ├── ads/               # 광고 페이지
│   │   ├── auth/              # 인증 페이지
│   │   ├── account/           # 계정 관리
│   │   └── admin/             # 관리자 페이지
│   └── api/                   # API 라우트 (middleware 제외)
│       ├── auth/              # NextAuth.js
│       ├── checkout/          # Stripe 결제
│       ├── webhooks/          # Webhook 핸들러
│       └── health/            # ✅ 헬스체크
│
├── components/                # React 컴포넌트
├── lib/                       # 유틸리티
│   ├── prisma.ts              # ✅ Prisma 싱글톤
│   ├── navigation.ts          # ✅ locale-aware Link
│   └── auth.ts                # NextAuth.js 설정
│
├── i18n/                      # ✅ 다국어
│   ├── messages/              # 번역 파일 (ko, en, ja, zh)
│   └── request.ts             # next-intl 설정
│
├── prisma/
│   ├── schema.prisma          # DB 스키마
│   ├── seed.ts                # 초기 데이터
│   └── migrations/            # ⚠️ 없음 (생성 필요)
│
├── docs/                      # ✅ 문서
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md
│   ├── PRISMA_DATABASE_GUIDE.md
│   ├── i18n-best-practices.md
│   └── DEPLOYMENT_SUMMARY.md (이 문서)
│
├── scripts/
│   └── deploy-production.sh  # ✅ 배포 스크립트
│
├── .github/workflows/
│   └── deploy.yml             # ✅ CI/CD
│
├── Dockerfile.production      # ✅ 프로덕션 Docker
├── docker-compose.production.yml
├── middleware.ts              # ✅ i18n 미들웨어
├── next.config.mjs            # ✅ standalone 모드
└── .env.production            # 프로덕션 환경변수 (생성 필요)
```

---

## 2. 배포 방법 선택

### 옵션 A: Vercel (권장 - 가장 간단)

**장점**:
- ✅ Zero-config 배포
- ✅ 자동 HTTPS
- ✅ 글로벌 CDN
- ✅ Serverless Functions
- ✅ 자동 스케일링

**단점**:
- ❌ 비용 (트래픽 많을 시)
- ❌ Vendor Lock-in

**비용** (2025년 기준):
- Hobby: $0 (개인 프로젝트)
- Pro: $20/월 (상용)
- Vercel Postgres: $0.27/GB

**사용 시나리오**:
- 빠른 프로토타입
- 중소 규모 서비스
- DevOps 리소스 부족

**배포 시간**: ~10분

---

### 옵션 B: Docker + VPS (비용 절감)

**장점**:
- ✅ 완전한 제어
- ✅ 저렴한 비용
- ✅ 커스터마이징 자유

**단점**:
- ❌ 직접 관리 필요
- ❌ 초기 설정 시간
- ❌ 스케일링 수동

**비용**:
- VPS (4GB RAM): $20/월
- PostgreSQL: 무료 (self-hosted)

**사용 시나리오**:
- 비용 최소화
- 완전한 제어 필요
- DevOps 경험 있음

**배포 시간**: ~1시간 (초기 설정)

---

### 비교표

| 항목 | Vercel | Docker + VPS |
|------|--------|--------------|
| 초기 설정 난이도 | ⭐ 쉬움 | ⭐⭐⭐ 어려움 |
| 운영 난이도 | ⭐ 쉬움 | ⭐⭐⭐⭐ 복잡 |
| 비용 (월 1만 방문자) | $20 | $20 |
| 비용 (월 10만 방문자) | $100+ | $50 |
| 확장성 | 자동 | 수동 |
| 커스터마이징 | 제한적 | 완전 |
| HTTPS | 자동 | 수동 (Let's Encrypt) |
| CI/CD | 내장 | 직접 구축 |

---

## 3. 빠른 시작 가이드

### 🚀 Vercel 배포 (10분)

#### 1. 사전 준비

```bash
# 1. GitHub에 코드 푸시
git add .
git commit -m "Ready for production"
git push origin main

# 2. Vercel Postgres 생성 (선택사항)
# https://vercel.com/dashboard → Storage → Create Database → Postgres

# 또는 외부 DB 사용 (Supabase, Neon 등)
```

#### 2. Vercel 프로젝트 생성

```
1. https://vercel.com/new
2. Import Git Repository → GitHub 저장소 선택
3. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: pnpm build
   - Output Directory: .next
```

#### 3. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables:

```bash
# 필수
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=[openssl rand -base64 32]
NEXTAUTH_URL=https://your-project.vercel.app

# 결제
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 스토리지 (S3)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=fanplace-prod
AWS_REGION=ap-northeast-2

# 지도
MAP_PROVIDER=mapbox
MAPBOX_TOKEN=pk...
```

#### 4. 마이그레이션 실행

```bash
# package.json에 추가 (이미 있음)
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}

# Git 푸시하면 자동 실행됨
git push origin main
```

#### 5. 도메인 설정 (선택사항)

```
Vercel Dashboard → Settings → Domains
→ Add: fanplace.com

DNS 설정:
A 레코드: 76.76.21.21
CNAME: cname.vercel-dns.com
```

---

### 🐳 Docker 배포 (1시간)

#### 1. VPS 준비

```bash
# Ubuntu 22.04 서버에 SSH 접속
ssh root@your-server-ip

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose 설치
sudo apt-get install docker-compose-plugin

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
```

#### 2. 프로젝트 클론

```bash
# Git 설치
sudo apt-get update
sudo apt-get install git

# 프로젝트 클론
cd /opt
git clone https://github.com/YOUR_USERNAME/fanplace.git
cd fanplace
```

#### 3. 환경 변수 설정

```bash
# .env.production 생성
cp .env.example .env.production

# 편집
nano .env.production

# 필수 값 입력:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - STRIPE_SECRET_KEY
# 등
```

#### 4. SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot

# 인증서 발급
sudo certbot certonly --standalone -d fanplace.com -d www.fanplace.com

# 인증서 복사
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/fanplace.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/fanplace.com/privkey.pem nginx/ssl/

# 자동 갱신
sudo crontab -e
# 추가: 0 0 1 * * certbot renew --quiet
```

#### 5. 배포 실행

```bash
# 배포 스크립트 실행 권한 부여
chmod +x scripts/deploy-production.sh

# 배포
./scripts/deploy-production.sh
```

#### 6. 확인

```bash
# 헬스체크
curl http://localhost:3000/api/health

# 로그 확인
docker-compose -f docker-compose.production.yml logs -f app

# 접속 테스트
curl https://fanplace.com
```

---

## 4. 체크리스트

### 배포 전 필수 체크

- [ ] **마이그레이션 생성**
  ```bash
  pnpm prisma migrate dev --name init
  git add prisma/migrations
  git commit -m "Add initial migration"
  ```

- [ ] **환경 변수 준비**
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_SECRET (32자 이상)
  - [ ] STRIPE_SECRET_KEY
  - [ ] AWS S3 credentials (프로덕션용)
  - [ ] MAPBOX_TOKEN

- [ ] **데이터베이스 준비**
  - [ ] PostgreSQL 16+ 실행 중
  - [ ] 연결 테스트 완료
  - [ ] 백업 설정

- [ ] **도메인 준비**
  - [ ] DNS 설정
  - [ ] SSL 인증서 (Vercel은 자동)

### 배포 후 확인

- [ ] **기능 테스트**
  - [ ] / → /ko 리다이렉트
  - [ ] 언어 전환 (한/영/일/중)
  - [ ] 로그인/회원가입
  - [ ] 이벤트 목록 표시
  - [ ] 결제 흐름 (Stripe)

- [ ] **성능 테스트**
  - [ ] Lighthouse 점수 90+
  - [ ] 헬스체크 응답 200ms 이하
  - [ ] 이미지 최적화 확인

- [ ] **모니터링 설정**
  - [ ] UptimeRobot 또는 Pingdom
  - [ ] Sentry (에러 추적)
  - [ ] Vercel Analytics (선택)

- [ ] **백업 설정**
  - [ ] 자동 DB 백업 (daily)
  - [ ] S3 백업 업로드

---

## 5. 트러블슈팅

### 문제 1: 빌드 실패 - "Module not found"

**원인**: 의존성 설치 문제

**해결**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules .next
pnpm install
pnpm build
```

### 문제 2: 404 오류 - 모든 페이지

**원인**: middleware.ts matcher 문제

**해결**:
```typescript
// middleware.ts 확인
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### 문제 3: Database connection error

**원인**: DATABASE_URL 오류

**해결**:
```bash
# 연결 문자열 확인
echo $DATABASE_URL

# 형식:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Connection pool 설정 추가
# postgresql://...?connection_limit=10&pool_timeout=20
```

### 문제 4: Prisma Client 에러

**원인**: 생성되지 않음

**해결**:
```bash
pnpm prisma generate
```

### 문제 5: 헬스체크 실패

**원인**: DB 연결 또는 메모리 문제

**해결**:
```bash
# 로그 확인
docker-compose -f docker-compose.production.yml logs app

# DB 연결 테스트
docker exec fanplace-postgres-prod psql -U postgres -d fanplatform -c "SELECT 1"
```

---

## 📞 지원 및 문서

### 📚 작성된 가이드

1. **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)**
   - 프로젝트 구조 상세 분석
   - i18n 라우팅 흐름도
   - 잠재적 문제 스캔
   - Vercel 배포 가이드
   - Docker 배포 가이드

2. **[PRISMA_DATABASE_GUIDE.md](./PRISMA_DATABASE_GUIDE.md)**
   - 스키마 변경 플로우
   - 마이그레이션 관리
   - 시드 데이터 전략
   - 보안 및 성능
   - 백업/복구

3. **[i18n-best-practices.md](./i18n-best-practices.md)**
   - next-intl 모범 사례
   - Link 컴포넌트 패턴
   - 번역 관리
   - SEO 최적화

### 🔧 생성된 파일

- `.github/workflows/deploy.yml` - CI/CD 파이프라인
- `Dockerfile.production` - 프로덕션 Docker 이미지
- `docker-compose.production.yml` - 프로덕션 컴포즈
- `app/api/health/route.ts` - 헬스체크 API
- `scripts/deploy-production.sh` - 배포 스크립트

### 📊 다음 단계 권장

1. **모니터링 설정**
   - Sentry: https://sentry.io
   - UptimeRobot: https://uptimerobot.com

2. **성능 최적화**
   - CDN 설정 (CloudFlare)
   - 이미지 최적화 (Cloudinary)
   - Database 인덱스 추가

3. **보안 강화**
   - CSP 헤더 설정
   - Rate Limiting
   - WAF (Web Application Firewall)

4. **백업 자동화**
   - 일일 백업 스크립트
   - S3 업로드 자동화
   - 복구 테스트

---

## ✅ 최종 체크

프로덕션 배포 전 최종 확인:

```bash
# 1. 로컬 빌드 테스트
pnpm build
pnpm start

# 2. 모든 locale 테스트
curl http://localhost:3000/ko
curl http://localhost:3000/en
curl http://localhost:3000/ja
curl http://localhost:3000/zh

# 3. API 테스트
curl http://localhost:3000/api/health

# 4. Lighthouse 테스트
# Chrome DevTools → Lighthouse → Generate report

# 5. 환경 변수 검증
# 모든 필수 변수가 설정되어 있는지 확인
```

---

## 🎉 배포 준비 완료!

모든 파일이 준비되었습니다. 위의 가이드에 따라 배포를 진행하세요.

**질문이나 문제가 있으면**:
- [GitHub Issues](https://github.com/YOUR_USERNAME/fanplace/issues)
- [Discussion](https://github.com/YOUR_USERNAME/fanplace/discussions)

**Good Luck! 🚀**

---

**마지막 업데이트**: 2025-11-08  
**작성자**: Development Team

