import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUsers() {
  console.log('📋 Listing all users...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locked: true
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${users.length} users:\n`);
    
    users.forEach(user => {
      const lockedStatus = user.locked ? '🔒 LOCKED' : '🔓 Active';
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${lockedStatus}`);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Failed to list users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
