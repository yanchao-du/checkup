import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showSuffixExamples() {
  const patients = await prisma.medicalSubmission.findMany({
    where: { 
      id: { startsWith: 'patient-' },
      patientName: { contains: ' ' }
    },
    select: { patientName: true, patientNric: true },
    orderBy: { patientName: 'asc' },
    take: 50
  });
  
  console.log('📋 Examples of names with letter suffixes:\n');
  
  // Show first few from different suffix groups
  const shown = new Set();
  patients.forEach(p => {
    const match = p.patientName.match(/ ([A-Z]+)$/);
    if (match) {
      const suffix = match[1];
      if (!shown.has(suffix) && shown.size < 10) {
        console.log(`  ${p.patientNric}: ${p.patientName}`);
        shown.add(suffix);
      }
    }
  });
  
  await prisma.$disconnect();
}

showSuffixExamples();
