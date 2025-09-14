import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
        console.log('Admin already exists');
        return;
    }
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
        data: { username: 'Admin', email: adminEmail, password: hash, role: 'ADMIN' },
    });
    console.log('Seeded admin:', adminEmail);
}
main().finally(async () => prisma.$disconnect());
