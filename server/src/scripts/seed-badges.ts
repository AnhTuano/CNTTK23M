import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBadges() {
  const badges = [
    {
      id: 'NGUOI_DONG_GOP_HANG_DAU',
      name: 'Người đóng góp hàng đầu',
      description: 'Đạt điểm cao nhất trên bảng thành tích!',
      icon: 'Trophy',
      color: 'text-yellow-400'
    },
    {
      id: 'NGUOI_DANG_BAI_TICH_CUC',
      name: 'Người đăng bài tích cực',
      description: 'Đã đăng hơn 10 thông báo.',
      icon: 'Newspaper',
      color: 'text-blue-500'
    },
    {
      id: 'THU_THU',
      name: 'Thủ thư',
      description: 'Đã chia sẻ hơn 10 tài liệu.',
      icon: 'Book',
      color: 'text-green-500'
    },
    {
      id: 'NGUOI_GIAO_TIEP',
      name: 'Người giao tiếp',
      description: 'Đã viết hơn 50 bình luận.',
      icon: 'MessageSquare',
      color: 'text-purple-500'
    },
    {
      id: 'NGUOI_TIEN_PHONG',
      name: 'Người tiên phong',
      description: 'Đã tạo bài đăng đầu tiên.',
      icon: 'Sparkles',
      color: 'text-pink-500'
    }
  ];

  console.log('🌱 Seeding badges...');

  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({
      where: { id: badge.id }
    });

    if (!existing) {
      await prisma.badge.create({
        data: badge
      });
      console.log(`✅ Created badge: ${badge.name}`);
    } else {
      console.log(`⏭️  Badge already exists: ${badge.name}`);
    }
  }

  console.log('🎉 Badge seeding completed!');
}

seedBadges()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
