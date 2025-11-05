import { PrismaClient } from '@prisma/client';
import { isValidNRIC } from '../src/common/utils/nric-validator';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying patient data...\n');

  // Count total patients
  const total = await prisma.medicalSubmission.count({
    where: {
      examType: 'SIX_MONTHLY_FMW',
    },
  });
  console.log(`✅ Total SIX_MONTHLY_FMW submissions: ${total}`);

  // Sample a few patients with height/weight
  const withHeightWeight = await prisma.medicalSubmission.findMany({
    where: {
      examType: 'SIX_MONTHLY_FMW',
      id: {
        startsWith: 'patient-',
      },
    },
    take: 3,
  });

  console.log('\n📋 Sample patients WITH height/weight:');
  withHeightWeight.forEach((patient, idx) => {
    console.log(`\n${idx + 1}. ${patient.patientName} (${patient.patientNric})`);
    console.log(`   DOB: ${patient.patientDob?.toISOString().split('T')[0]}`);
    console.log(`   Form Data:`, JSON.stringify(patient.formData, null, 2));
  });

  // Sample patients without height/weight (from the end of the batch)
  const withoutHeightWeight = await prisma.medicalSubmission.findMany({
    where: {
      examType: 'SIX_MONTHLY_FMW',
      id: {
        startsWith: 'patient-0',
      },
    },
    skip: 650,
    take: 3,
  });

  console.log('\n📋 Sample patients WITHOUT height/weight:');
  withoutHeightWeight.forEach((patient, idx) => {
    console.log(`\n${idx + 1}. ${patient.patientName} (${patient.patientNric})`);
    console.log(`   DOB: ${patient.patientDob?.toISOString().split('T')[0]}`);
    console.log(`   Form Data:`, JSON.stringify(patient.formData, null, 2));
  });

  // Count patients with/without height and weight
  const allPatients = await prisma.medicalSubmission.findMany({
    where: {
      examType: 'SIX_MONTHLY_FMW',
      id: {
        startsWith: 'patient-',
      },
    },
    select: {
      formData: true,
      patientNric: true,
    },
  });

  let withHeight = 0;
  let withoutHeight = 0;
  let hivRequired = 0;
  let tbRequired = 0;
  let pregnancyPositive = 0;
  let syphilisPositive = 0;
  let hivPositive = 0;
  let tbPositive = 0;
  let validNrics = 0;
  let invalidNrics = 0;
  const invalidNricExamples: string[] = [];

  allPatients.forEach((p: any) => {
    const data = p.formData as any;
    
    // Validate NRIC/FIN
    if (isValidNRIC(p.patientNric)) {
      validNrics++;
    } else {
      invalidNrics++;
      if (invalidNricExamples.length < 5) {
        invalidNricExamples.push(p.patientNric);
      }
    }
    
    if (data.height) {
      withHeight++;
    } else {
      withoutHeight++;
    }
    if (data.hivTestRequired === 'true') {
      hivRequired++;
      if (data.hivTestPositive === 'true') hivPositive++;
    }
    if (data.chestXrayRequired === 'true') {
      tbRequired++;
      if (data.chestXrayPositive === 'true') tbPositive++;
    }
    if (data.pregnancyTestPositive === 'true') pregnancyPositive++;
    if (data.syphilisTestPositive === 'true') syphilisPositive++;
  });

  console.log('\n📊 Statistics:');
  console.log(`   Total patients: ${allPatients.length}`);
  console.log(`   With height/weight: ${withHeight}`);
  console.log(`   Without height/weight: ${withoutHeight}`);
  console.log(`   HIV test required: ${hivRequired}`);
  console.log(`   TB test required: ${tbRequired}`);
  console.log(`   Pregnancy positive: ${pregnancyPositive}`);
  console.log(`   Syphilis positive: ${syphilisPositive}`);
  console.log(`   HIV positive: ${hivPositive}`);
  console.log(`   TB positive: ${tbPositive}`);
  
  console.log('\n🔐 NRIC/FIN Validation:');
  console.log(`   Valid NRICs/FINs: ${validNrics} ✓`);
  console.log(`   Invalid NRICs/FINs: ${invalidNrics} ${invalidNrics > 0 ? '✗' : ''}`);
  
  if (invalidNrics > 0) {
    console.log('\n⚠️  Invalid NRIC/FIN Examples:');
    invalidNricExamples.forEach(nric => {
      console.log(`   - ${nric}`);
    });
  } else {
    console.log('   ✅ All NRICs/FINs are valid!');
  }
}

verify()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
