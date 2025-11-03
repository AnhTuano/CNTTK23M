import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAdminRole() {
  const email = 'tuannd.23ai@vku.udn.vn'; // Thay bằng email của bạn
  
  console.log(`🔧 Fixing admin role for ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (Current role: ${user.role})`);

    if (user.role === 'Admin') {
      console.log(`✅ User is already an Admin`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'Admin' }
    });

    console.log(`✅ Updated ${updatedUser.name} to Admin role`);
    console.log(`✅ Previous role: ${user.role} → New role: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ Failed to fix admin role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
