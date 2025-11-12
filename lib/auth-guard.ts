// ============================================
// 인증 가드 유틸리티
// ============================================
// 
// 서버 컴포넌트에서 인증 및 권한 체크
//
// ============================================

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

/**
 * 현재 세션을 가져옵니다
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

/**
 * 현재 사용자를 가져옵니다 (인증 필요)
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect('/ko/auth/signin');
  }
  
  return session;
}

/**
 * 특정 역할이 필요한 페이지 보호
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const userRole = (session.user as any).role as Role;
  
  if (!allowedRoles.includes(userRole)) {
    redirect('/ko'); // 권한 없으면 홈으로
  }
  
  return session;
}

/**
 * 관리자 전용 페이지 보호
 */
export async function requireAdmin() {
  return requireRole(['ADMIN']);
}

/**
 * 사용자 ID 가져오기
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await requireAuth();
  return (session.user as any).id;
}

