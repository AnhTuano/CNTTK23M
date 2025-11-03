import prisma from '../src/lib/prisma';

async function seedConfig() {
  try {
    console.log('🌱 Seeding website config...');

    // Check if config already exists
    const existingConfig = await prisma.websiteConfig.findFirst();

    if (existingConfig) {
      console.log('✅ Website config already exists:', existingConfig);
      return;
    }

    // Create default config
    const config = await prisma.websiteConfig.create({
      data: {
        id: 1,
        className: 'Lớp CNTT K20',
        slogan: 'Cùng nhau học, cùng nhau lớn',
        coverImage: 'https://picsum.photos/seed/classbg/1200/400',
        websiteName: 'ClassZone',
        websiteTitle: 'ClassZone',
        isMaintenanceMode: false,
        bannerText: 'Chào mừng đến với năm học mới!',
        bannerType: 'Info',
        bannerIsActive: false,
      },
    });

    console.log('✅ Website config created:', config);
  } catch (error) {
    console.error('❌ Error seeding config:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedConfig();
