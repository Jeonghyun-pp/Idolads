// ============================================
// Rate Limiting Utility
// ============================================
// Upstash Redis 기반 Rate Limiting
// 
// 사용법:
// import { rateLimit } from '@/lib/rate-limit';
// const { success } = await rateLimit(ip, 10, 60);
// ============================================

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60 // seconds
): Promise<RateLimitResult> {
  // Upstash Redis가 설정되지 않은 경우 (개발 환경)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }

  try {
    const { Redis } = await import('@upstash/redis');
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowMs = window * 1000;

    // Sliding window 방식
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.pexpire(key, windowMs);
    }

    const ttl = await redis.pttl(key);
    const reset = now + (ttl > 0 ? ttl : windowMs);
    const remaining = Math.max(0, limit - count);

    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // 에러 시 허용 (fail-open)
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }
}

// ============================================
// IP 주소 추출
// ============================================
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

