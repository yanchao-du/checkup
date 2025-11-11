import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding missing nurse-clinic relationships...');

  // Get the HealthFirst clinic
  const clinic = await prisma.clinic.findUnique({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
  });

  if (!clinic) {
    console.log('❌ HealthFirst clinic not found');
    return;
  }

  // Get nurses that have direct clinicId but no NurseClinic relationship
  const nurses = await prisma.user.findMany({
    where: {
      role: 'nurse',
      clinicId: clinic.id,
    },
  });

  console.log(`📋 Found ${nurses.length} nurses with direct clinic assignment`);

  for (const nurse of nurses) {
    // Check if relationship already exists
    const existing = await prisma.nurseClinic.findUnique({
      where: {
        nurseId_clinicId: {
          nurseId: nurse.id,
          clinicId: clinic.id,
        },
      },
    });

    if (existing) {
      console.log(`✓ ${nurse.name} already has NurseClinic relationship`);
      continue;
    }

    // Create the relationship
    await prisma.nurseClinic.create({
      data: {
        nurseId: nurse.id,
        clinicId: clinic.id,
        isPrimary: true,
      },
    });

    console.log(`✅ Added NurseClinic relationship for ${nurse.name}`);
  }

  console.log('🎉 Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
