import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up sample submissions...\n');

  // Sample submission patient names from seed.ts
  const samplePatientNames = [
    'Maria Santos',
    'Chen Li Hua',
    'Nguyen Thi Mai',
    'Lim Siew Hong',
  ];

  // First, delete related audit logs
  const auditLogsDeleted = await prisma.auditLog.deleteMany({
    where: {
      submission: {
        patientName: {
          in: samplePatientNames,
        },
      },
    },
  });

  console.log(`✅ Deleted ${auditLogsDeleted.count} audit logs`);

  // Then delete the submissions
  const result = await prisma.medicalSubmission.deleteMany({
    where: {
      patientName: {
        in: samplePatientNames,
      },
    },
  });

  console.log(`✅ Deleted ${result.count} sample submissions`);
  console.log('\n🎉 Cleanup completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
