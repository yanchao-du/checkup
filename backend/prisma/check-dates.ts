import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDates() {
  const patients = await prisma.medicalSubmission.findMany({
    where: { id: { startsWith: 'patient-' } },
    select: { examinationDate: true, patientName: true },
    take: 10,
    orderBy: { examinationDate: 'desc' }
  });
  
  console.log('📅 Sample examination dates:\n');
  patients.forEach(p => {
    if (p.examinationDate) {
      const monthsAgo = Math.round((new Date().getTime() - p.examinationDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      console.log(`  ${p.patientName}: ${p.examinationDate.toISOString().split('T')[0]} (${monthsAgo} months ago)`);
    }
  });
  
  await prisma.$disconnect();
}

checkDates();
