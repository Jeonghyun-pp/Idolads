import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt', // JWT 전략 (serverless 환경에 적합)
  },
  pages: {
    signIn: '/ko/auth/signin',
    error: '/ko/auth/error',
  },
  providers: [
    // ============================================
    // Google OAuth
    // ============================================
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),

    // ============================================
    // Kakao OAuth
    // ============================================
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
          }),
        ]
      : []),

    // ============================================
    // Credentials (이메일/비밀번호)
    // ============================================
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('등록되지 않은 이메일입니다.');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      
      // OAuth 로그인 시 role 설정
      if (account && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role || 'FAN';
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  events: {
    // 사용자 생성 시 이벤트 (메일 발송 등)
    async createUser(message) {
      console.log('New user created:', message.user.email);
      // TODO: Welcome email 발송
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ============================================
// RBAC 헬퍼 함수
// ============================================
export async function requireAuth(allowedRoles?: string[]) {
  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  if (allowedRoles && !allowedRoles.includes((session.user as any).role)) {
    throw new Error('Forbidden');
  }

  return session;
}

