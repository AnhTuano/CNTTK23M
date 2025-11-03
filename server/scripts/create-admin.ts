import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'dtc245200672@ictu.edu.vn';
    const password = 'Anhtu2609!!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists. Updating to Admin role...');
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'Admin',
          name: 'Admin',
          locked: false
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      console.log('✅ Admin user updated successfully:');
      console.log(updatedUser);
    } else {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin',
          role: 'Admin',
          major: 'ICTU',
          mustChangePassword: false,
          locked: false
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      console.log('✅ Admin user created successfully:');
      console.log(user);
    }

    console.log('\n📧 Email: dtc245200672@ictu.edu.vn');
    console.log('🔑 Password: Anhtu2609!!');
    console.log('👤 Role: Admin');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
