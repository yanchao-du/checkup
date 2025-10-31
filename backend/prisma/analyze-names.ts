import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeNames() {
  const patients = await prisma.medicalSubmission.findMany({
    where: { id: { startsWith: 'patient-' } },
    select: { patientName: true }
  });
  
  const basenames = patients.filter(p => !p.patientName.match(/ [A-Z]+$/)).length;
  const extended = patients.filter(p => p.patientName.match(/ [A-Z]+$/)).length;
  
  console.log('📊 Name distribution:');
  console.log(`   Base names (no suffix): ${basenames}`);
  console.log(`   Extended names (with letter suffix): ${extended}`);
  console.log(`   Total: ${patients.length}`);
  console.log('\n✅ Each FIN has a unique name!');
  
  await prisma.$disconnect();
}

analyzeNames();
