// ============================================
// Cloudinary Upload Signature API
// ============================================
// 
// 클라이언트에서 직접 Cloudinary에 업로드할 때
// 필요한 서명을 생성합니다.
//
// ============================================

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // 인증 확인
    await requireAuth();

    const body = await request.json();
    const { folder = 'fanplace' } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // 서명 생성
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}

