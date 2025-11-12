# 🔐 인증(Auth) 문제 해결 가이드

## 🚨 문제: 로그인/회원가입 페이지 오류

### 원인 분석

**문제 1: i18n 라우팅과 NextAuth 경로 불일치**
- NextAuth pages 설정: `/auth/signin`
- 실제 파일 위치: `app/[locale]/auth/signin/page.tsx`
- 필요한 URL: `/ko/auth/signin`

**문제 2: Middleware가 API 라우트에도 적용됨**
- `/api/auth/*` 경로도 i18n 처리됨
- NextAuth API가 오작동

---

## ✅ 해결 방법

### 1. Middleware 수정 ✅ (완료)

```typescript
// middleware.ts
export const config = {
  // API, Next.js 내부 파일, 정적 파일 제외
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
```

**효과**: API 라우트가 i18n 처리에서 제외됨

---

### 2. NextAuth Pages 설정 수정 ✅ (완료)

```typescript
// lib/auth.ts
pages: {
  signIn: '/ko/auth/signin',  // locale prefix 추가
  error: '/ko/auth/error',
}
```

**주의**: 현재는 기본 locale(ko)로만 설정됨. 다른 locale 지원하려면 추가 작업 필요.

---

### 3. Error 페이지 생성 ✅ (완료)

```
app/[locale]/auth/error/page.tsx
```

---

## 🔧 개발 서버 재시작

```bash
# Ctrl+C로 기존 서버 중지 후
pnpm dev
```

---

## 🧪 테스트 방법

### 1. 홈페이지 접속
```
http://localhost:3000
→ http://localhost:3000/ko (자동 리다이렉트)
```

### 2. 로그인 페이지 접속
```
http://localhost:3000/ko/auth/signin
```

**예상 결과**: 로그인 폼이 정상 표시됨

### 3. 로그인 테스트
```
이메일: admin@fanplace.local
비밀번호: admin123
```

**예상 결과**: 로그인 성공 후 홈으로 리다이렉트

---

## 🌐 다국어 로그인 지원 (선택사항)

현재는 `/ko/auth/signin`으로 고정되어 있습니다. 

다른 locale에서도 로그인하려면:

### 방법 A: 동적 Pages 설정 (권장)

```typescript
// lib/auth.ts 수정
import { headers } from 'next/headers';

export const authOptions: NextAuthOptions = {
  // ... 기존 설정
  pages: {
    signIn: (req) => {
      // 현재 locale 감지
      const locale = req.headers.get('x-next-intl-locale') || 'ko';
      return `/${locale}/auth/signin`;
    },
  },
};
```

**주의**: NextAuth v4는 동적 pages를 지원하지 않음. v5로 업그레이드 필요.

### 방법 B: 모든 locale에 signIn 함수 호출 시 callbackUrl 지정

```typescript
// SignInForm.tsx에서
import { signIn } from 'next-auth/react';

const handleSubmit = async (e) => {
  await signIn('credentials', {
    email,
    password,
    callbackUrl: window.location.origin + window.location.pathname,
  });
};
```

---

## 🐛 여전히 문제가 있다면?

### 체크리스트

- [ ] `pnpm dev` 재시작했는가?
- [ ] `.env.local`에 `NEXTAUTH_SECRET` 있는가?
- [ ] `.env.local`에 `NEXTAUTH_URL=http://localhost:3000` 있는가?
- [ ] `DATABASE_URL` 정상 작동하는가?
- [ ] 브라우저 캐시 삭제했는가?
- [ ] 콘솔/터미널 에러 메시지 확인했는가?

### 일반적인 에러

**1. "NEXTAUTH_SECRET is required"**
```bash
# .env.local에 추가
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

**2. "Database connection error"**
```bash
# PostgreSQL 실행 확인
docker ps | grep postgres

# 없으면 실행
pnpm docker:up
```

**3. "Cannot find module '@/lib/auth'"**
```bash
# Prisma Client 재생성
pnpm prisma generate
```

**4. "prisma.user is not a function"**
```bash
# DB 스키마 적용
pnpm prisma db push
```

---

## 📊 배포 시 추가 설정

### Vercel 배포

```bash
# Environment Variables 설정
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=[32자 이상 랜덤 문자열]
DATABASE_URL=postgresql://...
```

### Docker 배포

```yaml
# docker-compose.yml
environment:
  NEXTAUTH_URL: https://your-domain.com
  NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
```

---

## 🎯 정리

✅ **완료된 수정**:
1. Middleware에서 API 라우트 제외
2. NextAuth pages 설정에 locale prefix 추가
3. Error 페이지 생성

✅ **테스트 필요**:
1. `/ko/auth/signin` 접속
2. 로그인 기능 테스트
3. 다른 locale (`/en/auth/signin`) 테스트

✅ **추가 권장사항**:
1. 다국어 로그인 지원 (callbackUrl 사용)
2. 에러 메시지 다국어화
3. 로그인 후 리다이렉트 URL 커스터마이징

---

**작성일**: 2025-11-08  
**프로젝트**: FanPlace

