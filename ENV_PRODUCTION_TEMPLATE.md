# 🔐 프로덕션 환경변수 템플릿

## Vercel 설정 방법

Vercel Dashboard → Project → Settings → Environment Variables에 아래 값들을 입력하세요.

---

## 필수 환경변수

### Database (Neon)
```bash
# Neon Console → Connection Details
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/fanplatform?sslmode=require"
```

### Authentication
```bash
# Production URL
NEXTAUTH_URL="https://fanplace.com"

# Secret (생성 명령: openssl rand -base64 32)
NEXTAUTH_SECRET="your-32-char-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Kakao OAuth
KAKAO_CLIENT_ID="xxx"
KAKAO_CLIENT_SECRET="xxx"
```

### Payment (토스페이먼츠)
```bash
# 테스트: test_sk_xxx, 프로덕션: live_sk_xxx
NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_xxx"
TOSS_SECRET_KEY="live_sk_xxx"
```

### Storage (Cloudinary)
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"
NEXT_PUBLIC_CLOUDINARY_API_KEY="123456"
CLOUDINARY_API_SECRET="xxx"
```

### Email (Resend)
```bash
RESEND_API_KEY="re_xxx"
EMAIL_FROM="FanPlace <noreply@fanplace.com>"
```

### Monitoring (Sentry)
```bash
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="fanplace"
SENTRY_AUTH_TOKEN="xxx"
```

### Security (Upstash Redis)
```bash
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

### Internal
```bash
# CRON 보안 키 (생성: openssl rand -hex 32)
CRON_SECRET="your-secure-cron-secret"

# Admin API 키
ADMIN_API_KEY="your-admin-api-key"
```

### Public
```bash
NEXT_PUBLIC_APP_URL="https://fanplace.com"
```

---

## 환경별 설정

| 환경 | NEXTAUTH_URL | DATABASE_URL |
|------|--------------|--------------|
| Development | http://localhost:3000 | localhost:5432 |
| Preview | https://preview-xxx.vercel.app | Neon Preview DB |
| Production | https://fanplace.com | Neon Production DB |

---

## 보안 체크리스트

- [ ] NEXTAUTH_SECRET은 32자 이상
- [ ] 모든 SECRET/KEY는 안전하게 보관
- [ ] .env.local은 .gitignore에 포함
- [ ] Production 키는 별도 관리
- [ ] API 키는 정기적으로 갱신

