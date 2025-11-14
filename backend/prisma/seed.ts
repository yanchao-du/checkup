import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'HealthFirst Medical Clinic',
      hciCode: 'HCI0001',  // Healthcare Institution Code (7 alphanumeric)
      registrationNumber: 'RC001234',
      address: '123 Orchard Road, #01-01, Singapore 238858',
      phone: '+65 6123 4567',
      email: 'info@healthfirst.sg',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created clinic:', clinic.name);

  // Hash password
  const passwordHash = await bcrypt.hash('password', 10);

  // Create users
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@clinic.sg' },
    update: {
      nric: 'S1234567D',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      clinicId: clinic.id,
      email: 'doctor@clinic.sg',
      passwordHash,
      name: 'Dr. Sarah Tan',
      nric: 'S1234567D',  // Valid Singapore NRIC
      role: 'doctor',
      mcrNumber: 'M12345A',  // MCR format: 1 letter + 5 numbers + 1 letter
      status: 'active',
      updatedAt: new Date(),
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: 'nurse@clinic.sg' },
    update: {
      nric: 'S2345678H',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      clinicId: clinic.id,
      email: 'nurse@clinic.sg',
      passwordHash,
      name: 'Nurse Mary Lim',
      nric: 'S2345678H',  // Valid Singapore NRIC
      role: 'nurse',
      status: 'active',
      updatedAt: new Date(),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinic.sg' },
    update: {
      nric: 'S3456789A',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      clinicId: clinic.id,
      email: 'admin@clinic.sg',
      passwordHash,
      name: 'Admin John Wong',
      nric: 'S3456789A',  // Valid Singapore NRIC
      role: 'admin',
      status: 'active',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created users: Doctor, Nurse, Admin');

  // Create additional test users for comprehensive testing
  const doctor2 = await prisma.user.upsert({
    where: { email: 'doctor2@clinic.sg' },
    update: {
      nric: 'S4567890C',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440011',
      clinicId: clinic.id,
      email: 'doctor2@clinic.sg',
      passwordHash,
      name: 'Dr. James Lee',
      nric: 'S4567890C',  // Valid Singapore NRIC
      role: 'doctor',
      mcrNumber: 'M23456B',  // MCR format: 1 letter + 5 numbers + 1 letter
      status: 'active',
      updatedAt: new Date(),
    },
  });

  const doctor3 = await prisma.user.upsert({
    where: { email: 'doctor3@clinic.sg' },
    update: {
      nric: 'S5678901D',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440012',
      clinicId: clinic.id,
      email: 'doctor3@clinic.sg',
      passwordHash,
      name: 'Dr. Emily Chen',
      nric: 'S5678901D',  // Valid Singapore NRIC
      role: 'doctor',
      mcrNumber: 'M34567C',  // MCR format: 1 letter + 5 numbers + 1 letter
      status: 'active',
      updatedAt: new Date(),
    },
  });

  const doctor4 = await prisma.user.upsert({
    where: { email: 'doctor4@clinic.sg' },
    update: {
      nric: 'S6789012D',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440013',
      clinicId: clinic.id,
      email: 'doctor4@clinic.sg',
      passwordHash,
      name: 'Dr. Michael Tan',
      nric: 'S6789012D',  // Valid Singapore NRIC
      role: 'doctor',
      mcrNumber: 'M45678D',  // MCR format: 1 letter + 5 numbers + 1 letter
      status: 'active',
      updatedAt: new Date(),
    },
  });

  const nurse2 = await prisma.user.upsert({
    where: { email: 'nurse2@clinic.sg' },
    update: {
      nric: 'S7890123C',  // Valid Singapore NRIC - update existing user
      updatedAt: new Date(),
    },
    create: {
      id: '550e8400-e29b-41d4-a716-446655440014',
      clinicId: clinic.id,
      email: 'nurse2@clinic.sg',
      passwordHash,
      name: 'Nurse Linda Koh',
      nric: 'S7890123C',  // Valid Singapore NRIC
      role: 'nurse',
      status: 'active',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created additional test users (4 doctors total, 2 nurses total)');

  // Create a second clinic to demonstrate many-to-many relationship
  const clinic2 = await prisma.clinic.upsert({
    where: { hciCode: 'HCI0002' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440100',
      name: 'CareWell Medical Centre',
      hciCode: 'HCI0002',  // HCI format: 7 alphanumeric characters
      registrationNumber: 'RC002345',
      address: '456 Thomson Road, #02-03, Singapore 307591',
      phone: '+65 6789 0123',
      email: 'info@carewell.sg',
    },
  });

  console.log('✅ Created second clinic:', clinic2.name);

  // Create doctor-clinic relationships (many-to-many)
  // Dr. Sarah Tan - works at both clinics (primary at HealthFirst)
  await prisma.doctorClinic.upsert({
    where: { 
      doctorId_clinicId: {
        doctorId: doctor.id,
        clinicId: clinic.id,
      }
    },
    update: {},
    create: {
      doctorId: doctor.id,
      clinicId: clinic.id,
      isPrimary: true,  // Primary clinic
    },
  });

  await prisma.doctorClinic.upsert({
    where: { 
      doctorId_clinicId: {
        doctorId: doctor.id,
        clinicId: clinic2.id,
      }
    },
    update: {},
    create: {
      doctorId: doctor.id,
      clinicId: clinic2.id,
      isPrimary: false,  // Secondary clinic
    },
  });

  // Dr. James Lee - works only at HealthFirst
  await prisma.doctorClinic.upsert({
    where: { 
      doctorId_clinicId: {
        doctorId: doctor2.id,
        clinicId: clinic.id,
      }
    },
    update: {},
    create: {
      doctorId: doctor2.id,
      clinicId: clinic.id,
      isPrimary: true,
    },
  });

  // Dr. Emily Chen - works at both clinics (primary at CareWell)
  await prisma.doctorClinic.upsert({
    where: { 
      doctorId_clinicId: {
        doctorId: doctor3.id,
        clinicId: clinic.id,
      }
    },
    update: {},
    create: {
      doctorId: doctor3.id,
      clinicId: clinic.id,
      isPrimary: false,
    },
  });

  await prisma.doctorClinic.upsert({
    where: { 
      doctorId_clinicId: {
        doctorId: doctor3.id,
        clinicId: clinic2.id,
      }
    },
    update: {},
    create: {
      doctorId: doctor3.id,
      clinicId: clinic2.id,
      isPrimary: true,  // Primary clinic
    },
  });

  // Dr. Michael Tan - works only at CareWell
  await prisma.doctorClinic.upsert({
    where: { 
      doctorId_clinicId: {
        doctorId: doctor4.id,
        clinicId: clinic2.id,
      }
    },
    update: {},
    create: {
      doctorId: doctor4.id,
      clinicId: clinic2.id,
      isPrimary: true,
    },
  });

  console.log('✅ Created doctor-clinic relationships');
  console.log('   - Dr. Sarah Tan: HealthFirst (primary) + CareWell');
  console.log('   - Dr. James Lee: HealthFirst only');
  console.log('   - Dr. Emily Chen: HealthFirst + CareWell (primary)');
  console.log('   - Dr. Michael Tan: CareWell only');

  // Create nurse-clinic relationships (many-to-many)
  // Nurse Mary Lim - works at HealthFirst (primary)
  await prisma.nurseClinic.upsert({
    where: { 
      nurseId_clinicId: {
        nurseId: nurse.id,
        clinicId: clinic.id,
      }
    },
    update: {},
    create: {
      nurseId: nurse.id,
      clinicId: clinic.id,
      isPrimary: true,
    },
  });

  // Nurse Linda Koh - works at HealthFirst (primary)
  await prisma.nurseClinic.upsert({
    where: { 
      nurseId_clinicId: {
        nurseId: nurse2.id,
        clinicId: clinic.id,
      }
    },
    update: {},
    create: {
      nurseId: nurse2.id,
      clinicId: clinic.id,
      isPrimary: true,
    },
  });

  console.log('✅ Created nurse-clinic relationships');
  console.log('   - Nurse Mary Lim: HealthFirst (primary)');
  console.log('   - Nurse Linda Koh: HealthFirst (primary)');

  // Check if sample submissions already exist (by checking for specific sample patient NRICs)
  const sampleNrics = ['S1234567A', 'S2345678B', 'S3456789C', 'S9988776D'];
  const existingSampleSubmissions = await prisma.medicalSubmission.findMany({
    where: {
      patientNric: {
        in: sampleNrics,
      },
    },
  });
  
  if (existingSampleSubmissions.length > 0) {
    console.log(`ℹ️  Found ${existingSampleSubmissions.length} existing sample submissions - skipping sample submission creation`);
  } else {
    console.log('📝 Creating sample submissions...');
    
    // Create sample submissions
    const submission1 = await prisma.medicalSubmission.create({
    data: {
      examType: 'SIX_MONTHLY_MDW',
      patientName: 'Maria Santos',
      patientNric: 'S1234567A',
      patientDob: new Date('1990-05-15'),
      examinationDate: new Date('2025-10-15'),
      status: 'submitted',
      formData: {
        height: '160',
        weight: '55',
        bloodPressure: '120/80',
        pregnancyTest: 'Negative',
        chestXray: 'Normal',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      approvedById: doctor.id,
      createdDate: new Date('2025-10-15T10:30:00'),
      submittedDate: new Date('2025-10-15T14:20:00'),
      approvedDate: new Date('2025-10-15T14:00:00'),
      updatedAt: new Date('2025-10-15T14:20:00'),
    },
  });

  // Add more pending approvals for testing
  const submission4 = await prisma.medicalSubmission.create({
    data: {
      examType: 'SIX_MONTHLY_MDW',
      patientName: 'Chen Li Hua',
      patientNric: 'S4567890D',
      patientDob: new Date('1992-11-20'),
      examinationDate: new Date('2025-10-21'),
      status: 'pending_approval',
      formData: {
        height: '158',
        weight: '52',
        bloodPressure: '115/75',
        pregnancyTest: 'Negative',
        chestXray: 'Normal',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: new Date('2025-10-21T09:30:00'),
      updatedAt: new Date('2025-10-21T09:30:00'),
    },
  });

  // Add FMW submission
  const submissionFmw = await prisma.medicalSubmission.create({
    data: {
      examType: 'SIX_MONTHLY_FMW',
      patientName: 'Nguyen Thi Mai',
      patientNric: 'S8877665C',
      patientDob: new Date('1995-07-12'),
      examinationDate: new Date('2025-10-25'),
      status: 'submitted',
      formData: {
        pregnancyTestPositive: 'false',
        syphilisTestPositive: 'false',
        hivTestPositive: 'false',
        chestXrayPositive: 'false',
        hasAdditionalRemarks: 'true',
        remarks: 'Patient in good health. All test results negative.',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      approvedById: doctor.id,
      createdDate: new Date('2025-10-25T10:00:00'),
      submittedDate: new Date('2025-10-25T11:30:00'),
      approvedDate: new Date('2025-10-25T11:00:00'),
      updatedAt: new Date('2025-10-25T11:30:00'),
    },
  });

  // Add FMW submission pending approval
  const submissionFmwPending = await prisma.medicalSubmission.create({
    data: {
      examType: 'SIX_MONTHLY_FMW',
      patientName: 'Lim Siew Hong',
      patientNric: 'S9988776D',
      patientDob: new Date('1993-09-25'),
      examinationDate: new Date('2025-10-28'),
      status: 'pending_approval',
      formData: {
        pregnancyTestPositive: 'false',
        syphilisTestPositive: 'false',
        hivTestPositive: 'false',
        chestXrayPositive: 'false',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: new Date('2025-10-28T13:45:00'),
      updatedAt: new Date('2025-10-28T13:45:00'),
    },
  });

    console.log('✅ Created sample submissions and drafts');
    console.log('   - Maria Santos (SIX_MONTHLY_MDW): submitted');
    console.log('   - Chen Li Hua (SIX_MONTHLY_MDW): pending_approval');
    console.log('   - Nguyen Thi Mai (SIX_MONTHLY_FMW): submitted');
    console.log('   - Lim Siew Hong (SIX_MONTHLY_FMW): pending_approval');

    // Create audit logs
    await prisma.auditLog.create({
      data: {
        submissionId: submission1.id,
        userId: nurse.id,
        eventType: 'created',
        changes: { status: 'draft' },
        timestamp: new Date('2025-10-15T10:30:00'),
      },
    });

    await prisma.auditLog.create({
      data: {
        submissionId: submission1.id,
        userId: doctor.id,
        eventType: 'approved',
        changes: { status: 'submitted' },
        timestamp: new Date('2025-10-15T14:00:00'),
      },
    });

    console.log('✅ Created audit logs');
  }

  // Create CorpPass user associations
  // Link doctor@clinic.sg to CorpPass account
  await prisma.corpPassUser.upsert({
    where: { corpPassSub: 'S1234567A' },
    update: {},
    create: {
      userId: doctor.id,
      corpPassSub: 'S1234567A',  // CorpPass subject (unique identifier)
      uen: '201912345A',  // Unique Entity Number (business)
      nric: 'S1234567A',  // National Registration ID
    },
  });

  // Link nurse@clinic.sg to CorpPass account
  await prisma.corpPassUser.upsert({
    where: { corpPassSub: 'S2345678B' },
    update: {},
    create: {
      userId: nurse.id,
      corpPassSub: 'S2345678B',
      uen: '201912345A',  // Same UEN (same business)
      nric: 'S2345678B',
    },
  });

  console.log('✅ Created CorpPass user associations (doctor and nurse linked)');

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📧 Demo accounts:');
  console.log('   Doctor: doctor@clinic.sg / password');
  console.log('   Nurse: nurse@clinic.sg / password');
  console.log('   Admin: admin@clinic.sg / password\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
