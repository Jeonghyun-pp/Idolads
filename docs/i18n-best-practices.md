# 🌐 Next.js + next-intl 실무 가이드

## 📋 목차
1. [Middleware 최적화](#middleware-최적화)
2. [라우팅 및 링크 관리](#라우팅-및-링크-관리)
3. [번역 메시지 관리](#번역-메시지-관리)
4. [정적 생성 및 SEO](#정적-생성-및-seo)
5. [에러 핸들링](#에러-핸들링)
6. [성능 최적화](#성능-최적화)
7. [흔한 빌드 경고 예방](#흔한-빌드-경고-예방)

---

## 1️⃣ Middleware 최적화

### ✅ 현재 설정
```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml).*)",
    "/",
  ],
};
```

### 📝 설명
- **API 라우트 제외**: `/api/*` - 백엔드 API는 다국어 처리 불필요
- **정적 파일 제외**: `_next/static`, `favicon.ico` - 성능 최적화
- **SEO 파일 제외**: `robots.txt`, `sitemap.xml` - 검색엔진 크롤러 최적화
- **루트 경로 포함**: `/` - 기본 locale로 리다이렉트

### 🎯 localePrefix 옵션

| 옵션 | 설명 | 사용 시나리오 |
|------|------|---------------|
| `"always"` | 항상 `/ko`, `/en` 등 prefix 사용 | **✅ 권장**: SEO 및 명확한 URL 구조 |
| `"as-needed"` | 기본 locale은 prefix 없음 (`/` → 한국어) | 단일 국가 중심 서비스 |
| `"never"` | locale prefix 없음 | 다국어 미지원 (권장하지 않음) |

**✅ 현재 프로젝트: `"always"` 사용 중 (권장)**

---

## 2️⃣ 라우팅 및 링크 관리

### ✅ locale-aware Link 사용

**❌ 잘못된 방법**
```tsx
import Link from "next/link";

<Link href="/events">이벤트</Link>
// 문제: locale이 자동으로 추가되지 않아 404 발생
```

**✅ 올바른 방법**
```tsx
import { Link } from "@/lib/navigation";

<Link href="/events">이벤트</Link>
// 현재 locale이 "ko"라면 자동으로 "/ko/events"로 라우팅
```

### 🔧 언어 전환 구현

```tsx
import { usePathname } from "@/lib/navigation";
import { getLocalizedPath } from "@/lib/navigation";

function LanguageSwitcher() {
  const pathname = usePathname();
  
  return (
    <a href={getLocalizedPath("en", pathname)}>
      Switch to English
    </a>
  );
}
```

### 📦 헬퍼 함수 위치
- `lib/navigation.ts` - locale-aware 네비게이션 유틸리티

---

## 3️⃣ 번역 메시지 관리

### 📁 구조
```
i18n/
├── messages/
│   ├── ko.json    # 한국어 (기본)
│   ├── en.json    # 영어
│   ├── ja.json    # 일본어
│   └── zh.json    # 중국어
└── request.ts     # next-intl 설정
```

### ✅ 메시지 구조화

**권장 패턴**
```json
{
  "common": {
    "buttons": {
      "save": "저장",
      "cancel": "취소",
      "delete": "삭제"
    },
    "validation": {
      "required": "필수 입력 항목입니다"
    }
  },
  "pages": {
    "home": {
      "title": "홈",
      "description": "..."
    }
  }
}
```

### 🔧 사용 예시

**서버 컴포넌트**
```tsx
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("pages.home");
  return <h1>{t("title")}</h1>;
}
```

**클라이언트 컴포넌트**
```tsx
"use client";
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations("common.buttons");
  return <button>{t("save")}</button>;
}
```

### ✅ Fallback 처리

현재 설정 (`i18n/request.ts`):
```typescript
try {
  messages = (await import(`./messages/${locale}.json`)).default;
} catch (error) {
  // 메시지 로드 실패 시 기본 locale로 폴백
  messages = (await import(`./messages/${defaultLocale}.json`)).default;
}
```

**장점**:
- 메시지 파일 누락 시에도 서비스 정상 동작
- 개발 중 일부 번역이 완료되지 않아도 빌드 성공

---

## 4️⃣ 정적 생성 및 SEO

### ✅ generateStaticParams 구현

**위치**: `app/[locale]/layout.tsx`

```typescript
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**효과**:
- 빌드 시 모든 locale 버전을 미리 생성 → 빠른 로딩
- 정적 HTML 생성 → SEO 최적화

### ✅ 동적 메타데이터

```typescript
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // locale별로 다른 메타데이터 반환
  return {
    title: "...",
    description: "...",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ko: "/ko",
        en: "/en",
        ja: "/ja",
        zh: "/zh",
      },
    },
  };
}
```

**SEO 이점**:
- 검색엔진에 다국어 페이지 알림
- hreflang 태그 자동 생성
- 중복 콘텐츠 방지

### 🔧 Sitemap 생성 (권장)

```typescript
// app/sitemap.ts
import { locales } from "@/i18n/request";

export default function sitemap() {
  const urls = [];
  
  locales.forEach((locale) => {
    urls.push({
      url: `https://fanplace.com/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    });
    
    // 다른 페이지들도 추가
    urls.push({
      url: `https://fanplace.com/${locale}/events`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    });
  });
  
  return urls;
}
```

---

## 5️⃣ 에러 핸들링

### ✅ Prisma 호출 에러 처리

**현재 구현** (`app/[locale]/page.tsx`):
```typescript
let events = [];
try {
  events = await prisma.event.findMany({...});
} catch (error) {
  console.error("Failed to fetch events:", error);
  // 빈 배열로 폴백 → 페이지는 계속 렌더링
}

// UI에서 빈 데이터 처리
{events.length > 0 ? (
  // 데이터 렌더링
) : (
  <div>현재 표시할 이벤트가 없습니다.</div>
)}
```

**장점**:
- 데이터베이스 연결 실패 시에도 500 대신 정상 페이지 표시
- 사용자에게 친화적인 메시지 제공
- Graceful degradation (점진적 기능 저하)

### 🔧 Error Boundary (권장)

```tsx
// app/[locale]/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

### 🔧 Not Found 페이지

```tsx
// app/[locale]/not-found.tsx
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");
  
  return (
    <div>
      <h1>{t("404.title")}</h1>
      <p>{t("404.description")}</p>
    </div>
  );
}
```

---

## 6️⃣ 성능 최적화

### ✅ 이미지 최적화

**next.config.mjs**:
```javascript
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};
```

**사용**:
```tsx
import Image from "next/image";

<Image 
  src="https://images.unsplash.com/photo-xxx"
  alt="..."
  width={800}
  height={600}
  priority // LCP 최적화
/>
```

### ✅ 동적 import (Code Splitting)

```tsx
import dynamic from "next/dynamic";

// 무거운 컴포넌트는 동적 로드
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>로딩 중...</p>,
  ssr: false, // 클라이언트에서만 로드
});
```

### 📊 성능 측정

```bash
# Lighthouse 점수 확인
pnpm build
pnpm start
# Chrome DevTools → Lighthouse 실행

# 번들 크기 분석
pnpm add -D @next/bundle-analyzer
```

---

## 7️⃣ 흔한 빌드 경고 예방

### ⚠️ 경고 1: "locale not found"

**원인**: `generateStaticParams`가 없거나 잘못 구현됨

**해결**:
```typescript
// app/[locale]/layout.tsx
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

### ⚠️ 경고 2: "Missing messages"

**원인**: 메시지 파일에 키가 누락됨

**해결**:
- TypeScript로 메시지 타입 정의
- 빌드 시 자동 검증

```typescript
// types/messages.ts
type Messages = typeof import("../i18n/messages/ko.json");
```

### ⚠️ 경고 3: "Middleware running on static files"

**원인**: matcher가 정적 파일을 포함함

**해결**:
```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### ⚠️ 경고 4: "Hydration mismatch"

**원인**: 서버와 클라이언트에서 다른 locale 사용

**해결**:
```tsx
// 클라이언트에서 locale 감지 시 useEffect 사용
const [locale, setLocale] = useState<string | null>(null);

useEffect(() => {
  setLocale(window.location.pathname.split("/")[1]);
}, []);

if (!locale) return null; // SSR 시 렌더링하지 않음
```

---

## 📝 체크리스트

### 필수 항목
- [x] `app/[locale]/` 폴더 구조 사용
- [x] middleware에 `localePrefix: "always"` 설정
- [x] `generateStaticParams` 구현
- [x] `generateMetadata`로 SEO 메타데이터 설정
- [x] locale-aware Link 사용 (`@/lib/navigation`)
- [x] Prisma 호출에 try-catch 추가
- [x] 번역 메시지 fallback 처리

### 권장 항목
- [x] 언어 전환 UI 구현
- [x] Error Boundary 추가
- [ ] Sitemap 생성
- [ ] robots.txt 설정
- [ ] 이미지 최적화 (next/image)
- [ ] 번들 크기 모니터링

---

## 🚀 배포 전 최종 확인

```bash
# 1. 빌드 테스트
pnpm build

# 2. 프로덕션 모드 로컬 테스트
pnpm start

# 3. 각 locale 확인
# http://localhost:3000/ko
# http://localhost:3000/en
# http://localhost:3000/ja
# http://localhost:3000/zh

# 4. SEO 확인
# - 메타 태그 확인
# - hreflang 태그 확인
# - sitemap.xml 접근 가능 여부

# 5. 성능 확인
# - Lighthouse 점수 (목표: 90+)
# - First Contentful Paint (목표: < 1.8s)
# - Largest Contentful Paint (목표: < 2.5s)
```

---

## 📚 추가 자료

- [next-intl 공식 문서](https://next-intl-docs.vercel.app/)
- [Next.js i18n 가이드](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Web.dev i18n 모범 사례](https://web.dev/i18n/)

---

**✨ 이 가이드를 따르면 안정적이고 유지보수 가능한 다국어 웹사이트를 구축할 수 있습니다!**

