import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fanplace.local' },
    update: {},
    create: {
      email: 'admin@fanplace.local',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Create test users
  const fanPassword = await hash('fan123', 12);
  const fan = await prisma.user.upsert({
    where: { email: 'fan@fanplace.local' },
    update: {},
    create: {
      email: 'fan@fanplace.local',
      name: '팬 유저',
      password: fanPassword,
      role: 'FAN',
    },
  });

  const promoterPassword = await hash('promoter123', 12);
  const promoter = await prisma.user.upsert({
    where: { email: 'promoter@fanplace.local' },
    update: {},
    create: {
      email: 'promoter@fanplace.local',
      name: '주최자 유저',
      password: promoterPassword,
      role: 'PROMOTER',
    },
  });

  const advertiserPassword = await hash('advertiser123', 12);
  const advertiser = await prisma.user.upsert({
    where: { email: 'advertiser@fanplace.local' },
    update: {},
    create: {
      email: 'advertiser@fanplace.local',
      name: '광고주 유저',
      password: advertiserPassword,
      role: 'ADVERTISER',
    },
  });
  console.log('✅ Test users created');

  // Create celebs
  const celebs = await Promise.all([
    prisma.celeb.create({
      data: {
        name: '아이유',
        nameEn: 'IU',
        nameJa: 'アイユー',
        nameZh: 'IU',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
        group: 'Solo',
        birthDate: new Date('1993-05-16'),
      },
    }),
    prisma.celeb.create({
      data: {
        name: '지민',
        nameEn: 'Jimin',
        nameJa: 'ジミン',
        nameZh: '智旻',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        group: 'BTS',
        birthDate: new Date('1995-10-13'),
      },
    }),
    prisma.celeb.create({
      data: {
        name: '윈터',
        nameEn: 'Winter',
        nameJa: 'ウィンター',
        nameZh: 'Winter',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
        group: 'aespa',
        birthDate: new Date('2001-01-01'),
      },
    }),
  ]);
  console.log('✅ Celebs created');

  // Create places
  const places = await Promise.all([
    prisma.place.create({
      data: {
        name: '카페 덕후',
        nameEn: 'Cafe Deokhu',
        address: '서울특별시 강남구 테헤란로 123',
        region: '강남',
        description: '팬 이벤트에 최적화된 카페입니다. 넓은 공간과 완벽한 인테리어를 제공합니다.',
        imageUrls: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=600&fit=crop',
        ],
        latitude: 37.5012,
        longitude: 127.0396,
        rentalAvailable: true,
        rentalRules: '최소 3일 전 예약 필수. 장식 설치 가능. 음료 및 디저트 제공.',
        capacity: 50,
        priceRange: '₩500,000 - ₩1,000,000',
      },
    }),
    prisma.place.create({
      data: {
        name: '홍대 팬스페이스',
        nameEn: 'Hongdae Fan Space',
        address: '서울특별시 마포구 홍익로 456',
        region: '홍대',
        description: '젊은 팬들이 모이는 핫플레이스. 포토존과 굿즈 판매 공간 완비.',
        imageUrls: [
          'https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=800&h=600&fit=crop',
        ],
        latitude: 37.5563,
        longitude: 126.9239,
        rentalAvailable: true,
        rentalRules: '주말 예약 우선. 음향 시설 제공.',
        capacity: 30,
        priceRange: '₩300,000 - ₩700,000',
      },
    }),
    prisma.place.create({
      data: {
        name: '명동 K-POP 카페',
        nameEn: 'Myeongdong K-POP Cafe',
        address: '서울특별시 중구 명동길 789',
        region: '명동',
        description: '외국인 팬들도 많이 찾는 관광 명소. 접근성이 뛰어납니다.',
        imageUrls: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
        ],
        latitude: 37.5636,
        longitude: 126.9834,
        rentalAvailable: true,
        capacity: 40,
        priceRange: '₩400,000 - ₩900,000',
      },
    }),
  ]);
  console.log('✅ Places created');

  // Create events
  const now = new Date();
  const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
  const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days
  const futureDate3 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // +21 days

  await Promise.all([
    prisma.event.create({
      data: {
        title: '아이유 생일 카페 ☕️🎂',
        titleEn: 'IU Birthday Cafe',
        description: '아이유 생일을 축하하는 특별한 카페 이벤트입니다. 포토카드, 컵홀더, 특제 음료 제공!',
        imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1200&fit=crop',
        startDate: futureDate1,
        endDate: new Date(futureDate1.getTime() + 3 * 24 * 60 * 60 * 1000),
        perks: ['포토카드 3종', '컵홀더', '특제 음료', '포토존'],
        status: 'PUBLISHED',
        celebId: celebs[0].id,
        placeId: places[0].id,
        userId: promoter.id,
      },
    }),
    prisma.event.create({
      data: {
        title: '지민 생일 기념 전시회 🎨',
        titleEn: 'Jimin Birthday Exhibition',
        description: '지민의 생일을 기념하는 팬아트 전시와 함께하는 특별한 이벤트!',
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop',
        startDate: futureDate2,
        endDate: new Date(futureDate2.getTime() + 5 * 24 * 60 * 60 * 1000),
        perks: ['한정판 포스터', '엽서 세트', '스티커', '포토북'],
        status: 'PUBLISHED',
        celebId: celebs[1].id,
        placeId: places[1].id,
        userId: promoter.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Winter 응원 카페 ❄️',
        titleEn: 'Winter Support Cafe',
        description: '윈터를 응원하는 팬들의 모임. 따뜻한 음료와 함께 즐기는 팬 이벤트!',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
        startDate: futureDate3,
        endDate: new Date(futureDate3.getTime() + 4 * 24 * 60 * 60 * 1000),
        perks: ['포토카드', '키링', '머그컵', '포토존 이용권'],
        status: 'PUBLISHED',
        celebId: celebs[2].id,
        placeId: places[2].id,
        userId: promoter.id,
      },
    }),
  ]);
  console.log('✅ Events created');

  // Create ad products
  const adProducts = await Promise.all([
    prisma.adProduct.create({
      data: {
        title: '지하철 스크린도어 광고 (1개월)',
        titleEn: 'Subway Screen Door Ad (1 Month)',
        description: '강남역 2호선 스크린도어 광고. 하루 평균 10만명 노출.',
        priceKRW: 2000000,
        termMonths: 1,
        features: [
          '강남역 2호선 (10개 위치)',
          '하루 평균 10만명 노출',
          '디자인 검수 포함',
          '설치 및 철거 서비스',
          '현장 인증 사진 제공',
        ],
        placement: ['subway'],
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
        active: true,
      },
    }),
    prisma.adProduct.create({
      data: {
        title: '버스 랩핑 광고 (3개월)',
        titleEn: 'Bus Wrapping Ad (3 Months)',
        description: '서울 시내버스 전면 랩핑. 이동하는 광고판으로 최대 노출 효과.',
        priceKRW: 5000000,
        termMonths: 3,
        features: [
          '시내버스 5대 (강남/홍대 노선)',
          '3개월 장기 집행',
          '전면 랩핑 (양면)',
          '디자인 제작 지원',
          '월별 노출 리포트',
        ],
        placement: ['bus'],
        imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
        active: true,
      },
    }),
    prisma.adProduct.create({
      data: {
        title: '디지털 빌보드 (6개월)',
        titleEn: 'Digital Billboard (6 Months)',
        description: '타임스퀘어 디지털 빌보드. 프리미엄 위치의 압도적 노출.',
        priceKRW: 15000000,
        termMonths: 6,
        features: [
          '타임스퀘어 메인 빌보드',
          '15초 영상 광고 (시간당 6회 노출)',
          '6개월 장기 계약',
          '영상 제작 컨설팅',
          '실시간 노출 모니터링',
        ],
        placement: ['billboard', 'digital'],
        imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop',
        active: true,
      },
    }),
  ]);
  console.log('✅ Ad products created');

  // Create sample order with full workflow
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: 'PAID',
      amount: adProducts[0].priceKRW,
      currency: 'KRW',
      paymentProvider: 'stripe',
      paymentIntentId: 'pi_test_sample123',
      productId: adProducts[0].id,
      userId: advertiser.id,
    },
  });

  await prisma.adReview.create({
    data: {
      status: 'APPROVED',
      designUrls: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop'],
      copyText: '사랑해요 지민! 생일 축하해요 🎉',
      targetDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      reviewedAt: now,
      orderId: sampleOrder.id,
    },
  });

  const posting = await prisma.adPosting.create({
    data: {
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
      locations: ['강남역 2호선 1-4', '강남역 2호선 1-5'],
      orderId: sampleOrder.id,
    },
  });

  await prisma.adProof.create({
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
      location: '강남역 2호선 1-4',
      takenAt: now,
      postingId: posting.id,
    },
  });

  console.log('✅ Sample order workflow created');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Test accounts:');
  console.log('  Admin: admin@fanplace.local / admin123');
  console.log('  Fan: fan@fanplace.local / fan123');
  console.log('  Promoter: promoter@fanplace.local / promoter123');
  console.log('  Advertiser: advertiser@fanplace.local / advertiser123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

