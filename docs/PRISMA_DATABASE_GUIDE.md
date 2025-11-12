# 🗃️ Prisma + PostgreSQL 운영 가이드

> **프로젝트**: FanPlace  
> **ORM**: Prisma  
> **DB**: PostgreSQL 16

---

## 📑 목차

1. [스키마 변경 플로우](#1-스키마-변경-플로우)
2. [초기 데이터 시드](#2-초기-데이터-시드)
3. [관리자 데이터 운영](#3-관리자-데이터-운영)
4. [보안 및 성능](#4-보안-및-성능)
5. [백업 및 복구](#5-백업-및-복구)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 스키마 변경 플로우

### 🔄 개발 환경 vs 프로덕션 환경

| 환경 | 명령어 | 목적 | 데이터 보존 |
|------|--------|------|-------------|
| **개발** | `prisma db push` | 빠른 프로토타입 | ⚠️ 손실 가능 |
| **개발** | `prisma migrate dev` | 마이그레이션 생성 | ✅ 보존 |
| **프로덕션** | `prisma migrate deploy` | 마이그레이션 적용 | ✅ 보존 |

### A. 개발 환경: db push vs migrate dev

#### `prisma db push` (현재 사용 중)

**언제 사용**:
- 프로토타입 단계
- 스키마를 빠르게 실험하고 싶을 때
- 로컬 개발 DB (데이터 손실 OK)

**장점**:
- 빠름 (마이그레이션 파일 생성 안 함)
- 간단함

**단점**:
- ⚠️ 마이그레이션 히스토리 없음
- ⚠️ 프로덕션 사용 불가
- ⚠️ 데이터 손실 위험

**사용법**:
```bash
# schema.prisma 수정 후
pnpm prisma db push

# Prisma Client 재생성
pnpm prisma generate
```

#### `prisma migrate dev` (권장)

**언제 사용**:
- 프로덕션 준비 단계
- 팀 협업
- 스키마 변경 히스토리 관리

**장점**:
- ✅ 마이그레이션 파일 생성 (`prisma/migrations/`)
- ✅ 롤백 가능
- ✅ 팀원과 공유 가능 (Git)

**사용법**:
```bash
# 1. schema.prisma 수정
# 예: User 모델에 phoneNumber 필드 추가

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  phoneNumber String?  // ✅ 추가
  ...
}

# 2. 마이그레이션 생성
pnpm prisma migrate dev --name add_user_phone_number

# 3. 자동으로:
#    - 마이그레이션 SQL 파일 생성 (prisma/migrations/)
#    - DB에 적용
#    - Prisma Client 재생성
```

**생성된 파일**:
```
prisma/migrations/
└── 20251108070000_add_user_phone_number/
    └── migration.sql
```

```sql
-- migration.sql
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
```

### B. 프로덕션 환경: migrate deploy

**프로덕션 배포 플로우**:

```bash
# ==========================================
# 로컬 (개발자)
# ==========================================

# 1. 스키마 변경
# schema.prisma 수정

# 2. 마이그레이션 생성 (로컬 DB에 적용됨)
pnpm prisma migrate dev --name your_change_name

# 3. Git에 커밋
git add prisma/migrations
git commit -m "feat: add user phone number"
git push origin main

# ==========================================
# 프로덕션 서버 (CI/CD 또는 수동)
# ==========================================

# 4. 코드 pull
git pull origin main

# 5. 마이그레이션 적용 (데이터 보존)
pnpm prisma migrate deploy

# 6. 애플리케이션 재시작
# Vercel: 자동
# Docker: docker-compose restart app
# PM2: pm2 restart fanplace
```

### C. 마이그레이션 충돌 해결

#### 시나리오: 두 개발자가 동시에 스키마 수정

```bash
# 개발자 A: User에 phoneNumber 추가
# 개발자 B: User에 address 추가

# 충돌 발생 시 해결:

# 1. 최신 코드 pull
git pull origin main

# 2. 마이그레이션 상태 확인
pnpm prisma migrate status

# 3. 충돌 해결
#    - schema.prisma 병합 (Git conflict 해결)
#    - 새 마이그레이션 생성

pnpm prisma migrate dev --name merge_user_fields

# 4. 푸시
git push origin main
```

### D. 마이그레이션 롤백

⚠️ **Prisma는 자동 롤백을 지원하지 않습니다!**

**수동 롤백 방법**:

```bash
# 1. 백업 복원
psql -U postgres -d fanplatform < backups/before_migration.sql

# 2. 또는: 역방향 SQL 작성
# prisma/migrations/20251108_rollback/migration.sql
ALTER TABLE "User" DROP COLUMN "phoneNumber";

# 3. 수동 적용
psql -U postgres -d fanplatform -f prisma/migrations/20251108_rollback/migration.sql

# 4. schema.prisma도 원복
git revert HEAD
```

**롤백 예방 (권장)**:
```bash
# 프로덕션 적용 전 스테이징에서 테스트
# 1. 스테이징 DB 백업
# 2. 마이그레이션 적용
# 3. 애플리케이션 테스트
# 4. 문제 없으면 프로덕션 적용
```

---

## 2. 초기 데이터 시드

### A. 시드 파일 구조

**현재 시드**: `prisma/seed.ts` (336줄)

**포함 데이터**:
- 4개 테스트 계정 (Admin, Fan, Promoter, Advertiser)
- 3명 Celeb (아이유, 지민, 윈터)
- 3개 Place (카페 덕후, 홍대 팬스페이스, 명동 K-POP 카페)
- 3개 Event (생일 카페)
- 3개 AdProduct (지하철, 버스, 빌보드)
- 1개 샘플 Order (전체 워크플로우)

### B. 시드 실행

```bash
# 1. package.json에 스크립트 추가 (이미 있음)
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}

# 2. 시드 실행
pnpm db:seed

# 3. 또는 마이그레이션 + 시드
pnpm prisma migrate reset
# → DB 초기화 + 마이그레이션 + 시드 자동 실행
```

### C. 환경별 시드 전략

#### 로컬 개발
```typescript
// prisma/seed.development.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 대량의 테스트 데이터
  const users = await Promise.all(
    Array.from({ length: 100 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `user${i}@test.local`,
          name: `Test User ${i}`,
          password: await hash('test123', 12),
          role: 'FAN',
        },
      })
    )
  );
  
  // 많은 이벤트, 장소 등...
}
```

#### 스테이징
```typescript
// prisma/seed.staging.ts
async function main() {
  // 프로덕션 유사 데이터 (소량)
  // 실제 시나리오 테스트용
}
```

#### 프로덕션
```typescript
// prisma/seed.production.ts
async function main() {
  // ⚠️ 최소한의 초기 데이터만
  
  // 1. Admin 계정 1개
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      name: 'Admin',
      password: await hash(process.env.ADMIN_PASSWORD, 12),
      role: 'ADMIN',
    },
  });
  
  // 2. 필수 설정값
  // 3. 절대 테스트 데이터 포함 금지!
}
```

**실행**:
```bash
# 환경별 실행
NODE_ENV=development tsx prisma/seed.development.ts
NODE_ENV=staging tsx prisma/seed.staging.ts
NODE_ENV=production tsx prisma/seed.production.ts
```

### D. 타입세이프 시드 템플릿

```typescript
// prisma/seed.helpers.ts
import { PrismaClient, User, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

export async function createUser(
  prisma: PrismaClient,
  data: CreateUserInput
): Promise<User> {
  const hashedPassword = await hash(data.password, 12);
  
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      ...data,
      password: hashedPassword,
    },
  });
}

// 사용
import { createUser } from './seed.helpers';

const admin = await createUser(prisma, {
  email: 'admin@fanplace.com',
  name: 'Admin',
  password: 'secure_password',
  role: 'ADMIN',
});
```

---

## 3. 관리자 데이터 운영

### A. 안전한 읽기/쓰기 패턴

#### ✅ 서버 컴포넌트에서 Prisma 사용

```tsx
// app/[locale]/admin/page.tsx (서버 컴포넌트)
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  // ✅ 안전: 서버에서만 실행
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      // ⚠️ 패스워드 제외!
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  
  return <UsersList users={users} />;
}
```

#### ✅ API Route에서 Prisma 사용

```typescript
// app/api/admin/users/route.ts
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  // 1. 인증 체크
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 2. Prisma 쿼리
  const users = await prisma.user.findMany({
    where: {
      // 필터링
    },
    select: {
      // 필요한 필드만
    },
  });
  
  return Response.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const data = await request.json();
  
  // ✅ 트랜잭션 사용 (여러 작업 원자성)
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data });
    await tx.auditLog.create({
      data: {
        action: 'USER_CREATED',
        userId: session.user.id,
        targetId: user.id,
      },
    });
    return user;
  });
  
  return Response.json(result);
}
```

#### ❌ 클라이언트 컴포넌트에서 Prisma 사용 금지

```tsx
// ❌ 절대 이렇게 하지 마세요!
"use client";
import { prisma } from '@/lib/prisma';

export function UserList() {
  // ❌ 브라우저에서 실행 불가 + 보안 위험
  const users = await prisma.user.findMany();
}

// ✅ 대신 API 호출
"use client";
import { useEffect, useState } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

### B. PrismaClient 연결 관리

#### 싱글톤 패턴 (현재 구현)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

// 개발 환경에서만 글로벌 캐싱
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**왜 필요한가?**:
- Next.js 개발 모드: Hot Reload 시 새 인스턴스 생성 방지
- 프로덕션: 각 서버리스 함수마다 1개 인스턴스

#### Connection Pool 설정

```typescript
// lib/prisma.ts (프로덕션 최적화)
export const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // ✅ Connection Pool 설정
  // DATABASE_URL에 추가:
  // postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
});
```

**Vercel 환경**:
```bash
# .env (Vercel)
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

**Docker 환경**:
```bash
# .env.production
DATABASE_URL="postgresql://user:pass@postgres:5432/db?connection_limit=50&pool_timeout=10"
```

### C. Prisma Studio 사용

#### 로컬 개발

```bash
# Prisma Studio 실행
pnpm prisma studio

# 브라우저 자동 열림: http://localhost:5555
# - 모든 모델 탐색
# - CRUD 작업
# - 관계 시각화
```

#### 프로덕션 (보안 주의)

```bash
# ⚠️ 프로덕션 DB에 직접 연결하지 마세요!
# 대신: 터널 또는 읽기 전용 복제본 사용

# SSH 터널 예시
ssh -L 5432:localhost:5432 user@production-server

# 로컬에서 Prisma Studio 실행 (터널을 통해 연결)
DATABASE_URL="postgresql://..." pnpm prisma studio
```

**대안**: pgAdmin 사용 (읽기 전용 계정)

```sql
-- 읽기 전용 사용자 생성
CREATE USER readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE fanplatform TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly;
```

---

## 4. 보안 및 성능

### A. 최소 권한 DB 계정

#### 개발 환경
```sql
-- 모든 권한 (개발용)
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE fanplatform TO dev_user;
```

#### 프로덕션 환경
```sql
-- 1. 애플리케이션 계정 (최소 권한)
CREATE USER app_user WITH PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE fanplatform TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 2. 마이그레이션 계정 (DDL 권한)
CREATE USER migration_user WITH PASSWORD 'another_strong_password';
GRANT ALL PRIVILEGES ON DATABASE fanplatform TO migration_user;

-- 사용:
# 애플리케이션
DATABASE_URL="postgresql://app_user:...@host:5432/fanplatform"

# 마이그레이션 (CI/CD only)
MIGRATION_DATABASE_URL="postgresql://migration_user:...@host:5432/fanplatform"
```

### B. DATABASE_URL 보안

#### ❌ 잘못된 방법
```typescript
// config.ts
export const DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
```

#### ✅ 올바른 방법
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

**Vercel**:
```
Settings → Environment Variables
→ DATABASE_URL (Encrypted)
```

**Docker**:
```bash
# Docker Secrets 사용
echo "postgresql://..." | docker secret create db_url -

# docker-compose.yml
services:
  app:
    secrets:
      - db_url
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
```

### C. 쿼리 로깅 및 마스킹

```typescript
// lib/prisma.ts (프로덕션)
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

// 민감한 정보 마스킹
prisma.$on('query', (e) => {
  // ⚠️ 패스워드, 토큰 등 마스킹
  const masked = e.query.replace(/password = '.*?'/g, "password = '***'");
  console.log('Query:', masked);
  console.log('Duration:', e.duration + 'ms');
});

prisma.$on('error', (e) => {
  console.error('Prisma Error:', e.message);
  // Sentry 등으로 전송
});
```

### D. N+1 쿼리 방지

#### ❌ N+1 쿼리 문제

```typescript
// 이벤트 목록 + 각 이벤트의 Celeb 정보
const events = await prisma.event.findMany(); // 1 query

for (const event of events) {
  const celeb = await prisma.celeb.findUnique({
    where: { id: event.celebId },
  }); // N queries
}
// 총 1 + N queries (매우 느림)
```

#### ✅ include/select 사용

```typescript
const events = await prisma.event.findMany({
  include: {
    celeb: true,      // JOIN으로 한 번에 가져옴
    place: true,
  },
}); // 1 query only
```

#### ✅ 중첩 관계

```typescript
const events = await prisma.event.findMany({
  include: {
    celeb: true,
    place: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        // password 제외!
      },
    },
  },
});
```

### E. 인덱스 기본 가이드

#### 인덱스가 필요한 경우

```prisma
// schema.prisma

model Event {
  id        String   @id @default(cuid())
  title     String
  status    EventStatus
  celebId   String
  placeId   String
  startDate DateTime
  
  // ✅ 자주 WHERE 조건에 사용되는 필드
  @@index([status])           // WHERE status = 'PUBLISHED'
  @@index([celebId])          // WHERE celebId = '...'
  @@index([startDate])        // WHERE startDate > NOW()
  
  // ✅ 복합 인덱스 (함께 사용되는 필드)
  @@index([status, startDate]) // WHERE status = 'PUBLISHED' AND startDate > NOW()
}

model User {
  id    String @id @default(cuid())
  email String @unique  // ✅ unique = 자동 인덱스
  role  Role
  
  @@index([role])  // WHERE role = 'ADMIN'
}
```

#### 성능 모니터링

```bash
# PostgreSQL 느린 쿼리 로깅
# postgresql.conf
log_min_duration_statement = 1000  # 1초 이상 쿼리 로깅

# 로그 확인
tail -f /var/log/postgresql/postgresql.log
```

### F. pgBouncer 도입 시점

**언제 도입?**:
- Connection Pool 고갈 (max connections exceeded)
- Serverless 환경 (Vercel, AWS Lambda)
- 동시 접속자 1000명 이상

**설정 예시**:
```bash
# docker-compose.yml
services:
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    environment:
      DATABASES_HOST: postgres
      DATABASES_PORT: 5432
      DATABASES_USER: postgres
      DATABASES_PASSWORD: ${POSTGRES_PASSWORD}
      DATABASES_DBNAME: fanplatform
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 20
    ports:
      - "6432:6432"

  app:
    environment:
      # pgBouncer를 통해 연결
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@pgbouncer:6432/fanplatform
```

---

## 5. 백업 및 복구

### A. 자동 백업 스크립트

```bash
# scripts/backup.sh
#!/bin/bash

set -e

# 환경변수 로드
source .env.production

# 백업 디렉토리
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# 타임스탬프
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fanplatform_$TIMESTAMP.sql"

echo "🔄 Starting backup..."

# PostgreSQL 덤프
docker exec fanplace-postgres pg_dump -U postgres fanplatform > $BACKUP_FILE

# 압축
gzip $BACKUP_FILE

echo "✅ Backup completed: ${BACKUP_FILE}.gz"

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "🧹 Cleaned old backups"
```

### B. Cron 설정 (자동 백업)

```bash
# crontab -e
# 매일 새벽 3시 백업
0 3 * * * /path/to/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### C. 복구

```bash
# scripts/restore.sh
#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE=$1

echo "⚠️  WARNING: This will overwrite the database!"
echo "Backup file: $BACKUP_FILE"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted"
  exit 0
fi

echo "🔄 Restoring..."

# 압축 해제
gunzip -c $BACKUP_FILE > /tmp/restore.sql

# DB 복원
docker exec -i fanplace-postgres psql -U postgres fanplatform < /tmp/restore.sql

# 임시 파일 삭제
rm /tmp/restore.sql

echo "✅ Restore completed"
```

### D. S3/R2 백업 (권장)

```bash
# AWS CLI 설치
sudo apt-get install awscli

# 백업 업로드
aws s3 cp backups/fanplatform_$TIMESTAMP.sql.gz \
  s3://fanplace-backups/database/ \
  --storage-class GLACIER

# Cron에 추가
0 4 * * * aws s3 sync /path/to/backups s3://fanplace-backups/database/ --storage-class GLACIER
```

---

## 6. 트러블슈팅

### 문제 1: "Too many connections"

**원인**: Connection Pool 고갈

**해결**:
```bash
# 1. 현재 연결 수 확인
docker exec fanplace-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 2. DATABASE_URL에 connection_limit 추가
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"

# 3. 또는 pgBouncer 도입
```

### 문제 2: "Prisma Client validation error"

**원인**: schema.prisma와 Prisma Client 불일치

**해결**:
```bash
# Prisma Client 재생성
pnpm prisma generate

# 또는 전체 재빌드
rm -rf node_modules/.prisma
pnpm install
```

### 문제 3: 마이그레이션 실패

**원인**: 스키마 변경이 기존 데이터와 충돌

**해결**:
```bash
# 1. 마이그레이션 상태 확인
pnpm prisma migrate status

# 2. 문제 마이그레이션 롤백 (수동)
# 백업 복원 후 재시도

# 3. 또는 개발 환경에서 리셋
pnpm prisma migrate reset
```

### 문제 4: 성능 느림

**진단**:
```typescript
// lib/prisma.ts
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn('Slow query:', e.query);
    console.warn('Duration:', e.duration + 'ms');
  }
});
```

**해결**:
1. N+1 쿼리 확인 → `include` 사용
2. 인덱스 추가
3. `select`로 필요한 필드만 가져오기
4. 페이지네이션 구현

---

## 📝 체크리스트

### 개발 환경
- [ ] `prisma migrate dev` 사용 시작
- [ ] 시드 파일 작성
- [ ] Prisma Studio로 데이터 확인

### 프로덕션 준비
- [ ] 마이그레이션 파일 생성됨
- [ ] 읽기 전용 DB 계정 생성
- [ ] DATABASE_URL 환경변수로 관리
- [ ] 백업 스크립트 작성
- [ ] 복구 테스트 완료

### 보안
- [ ] 패스워드 암호화 (bcrypt)
- [ ] SQL Injection 방지 (Prisma 자동)
- [ ] 민감한 필드 로깅 제외
- [ ] 최소 권한 원칙

### 성능
- [ ] N+1 쿼리 확인
- [ ] 인덱스 추가
- [ ] Connection Pool 설정
- [ ] 느린 쿼리 모니터링

---

**다음**: [CI/CD 파이프라인 가이드](./CI_CD_GUIDE.md)

