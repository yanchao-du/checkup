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
      registrationNumber: 'RC001234',
      address: '123 Orchard Road, #01-01, Singapore 238858',
      phone: '+65 6123 4567',
      email: 'info@healthfirst.sg',
    },
  });

  console.log('✅ Created clinic:', clinic.name);

  // Hash password
  const passwordHash = await bcrypt.hash('password', 10);

  // Create users
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      clinicId: clinic.id,
      email: 'doctor@clinic.sg',
      passwordHash,
      name: 'Dr. Sarah Tan',
      role: 'doctor',
      status: 'active',
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: 'nurse@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      clinicId: clinic.id,
      email: 'nurse@clinic.sg',
      passwordHash,
      name: 'Nurse Mary Lim',
      role: 'nurse',
      status: 'active',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      clinicId: clinic.id,
      email: 'admin@clinic.sg',
      passwordHash,
      name: 'Admin John Wong',
      role: 'admin',
      status: 'active',
    },
  });

  console.log('✅ Created users: Doctor, Nurse, Admin');

  // Create additional test users for comprehensive testing
  const doctor2 = await prisma.user.upsert({
    where: { email: 'doctor2@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440011',
      clinicId: clinic.id,
      email: 'doctor2@clinic.sg',
      passwordHash,
      name: 'Dr. James Lee',
      role: 'doctor',
      status: 'active',
    },
  });

  const doctor3 = await prisma.user.upsert({
    where: { email: 'doctor3@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440012',
      clinicId: clinic.id,
      email: 'doctor3@clinic.sg',
      passwordHash,
      name: 'Dr. Emily Chen',
      role: 'doctor',
      status: 'active',
    },
  });

  const doctor4 = await prisma.user.upsert({
    where: { email: 'doctor4@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440013',
      clinicId: clinic.id,
      email: 'doctor4@clinic.sg',
      passwordHash,
      name: 'Dr. Michael Tan',
      role: 'doctor',
      status: 'active',
    },
  });

  const nurse2 = await prisma.user.upsert({
    where: { email: 'nurse2@clinic.sg' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440014',
      clinicId: clinic.id,
      email: 'nurse2@clinic.sg',
      passwordHash,
      name: 'Nurse Linda Koh',
      role: 'nurse',
      status: 'active',
    },
  });

  console.log('✅ Created additional test users (4 doctors total, 2 nurses total)');

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
    },
  });

  const submission2 = await prisma.medicalSubmission.create({
    data: {
      examType: 'WORK_PERMIT',
      patientName: 'John Tan',
      patientNric: 'S2345678B',
      patientDob: new Date('1985-08-22'),
      examinationDate: new Date('2025-10-18'),
      status: 'submitted',
      formData: {
        height: '175',
        weight: '70',
        bloodPressure: '118/75',
        hivTest: 'Negative',
        tbTest: 'Negative',
      },
      clinicId: clinic.id,
      createdById: doctor.id,
      approvedById: doctor.id,
      createdDate: new Date('2025-10-18T09:15:00'),
      submittedDate: new Date('2025-10-18T09:15:00'),
      approvedDate: new Date('2025-10-18T09:15:00'),
    },
  });

  const submission3 = await prisma.medicalSubmission.create({
    data: {
      examType: 'AGED_DRIVERS',
      patientName: 'Lim Ah Kow',
      patientNric: 'S3456789C',
      patientDob: new Date('1955-03-10'),
      examinationDate: new Date('2025-10-20'),
      status: 'pending_approval',
      formData: {
        visualAcuity: '6/6',
        hearingTest: 'Normal',
        bloodPressure: '130/85',
        diabetes: 'No',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: new Date('2025-10-20T11:00:00'),
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
    },
  });

  const submission5 = await prisma.medicalSubmission.create({
    data: {
      examType: 'WORK_PERMIT',
      patientName: 'Kumar Ravi',
      patientNric: 'S6789012F',
      patientDob: new Date('1987-04-18'),
      examinationDate: new Date('2025-10-22'),
      status: 'pending_approval',
      formData: {
        height: '172',
        weight: '75',
        bloodPressure: '122/78',
        hivTest: 'Negative',
        tbTest: 'Negative',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: new Date('2025-10-22T14:15:00'),
    },
  });

  const draft1 = await prisma.medicalSubmission.create({
    data: {
      examType: 'WORK_PERMIT',
      patientName: 'Wang Wei',
      patientNric: 'S5678901E',
      patientDob: new Date('1988-07-14'),
      examinationDate: new Date('2025-10-23'),
      status: 'draft',
      formData: {
        height: '170',
        weight: '68',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: new Date('2025-10-22T08:30:00'),
    },
  });

  console.log('✅ Created sample submissions and drafts');

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
