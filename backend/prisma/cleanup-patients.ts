import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up old patient mock data...');
  
  const result = await prisma.medicalSubmission.deleteMany({
    where: {
      id: {
        startsWith: 'patient-',
      },
    },
  });
  
  console.log(`✅ Deleted ${result.count} patient records`);
}

cleanup()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
