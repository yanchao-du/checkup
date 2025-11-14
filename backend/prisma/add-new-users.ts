import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding new test users to existing database...');

  // Get the existing clinic
  const clinic = await prisma.clinic.findFirst({
    where: { hciCode: 'HCI0001' }
  });

  if (!clinic) {
    console.error('❌ HealthFirst clinic not found!');
    return;
  }

  console.log('✅ Found clinic:', clinic.name);

  // Hash password
  const passwordHash = await bcrypt.hash('password', 10);

  // Create 10 new doctors (doctor5-14)
  const newDoctors = [
    { id: '550e8400-e29b-41d4-a716-446655440015', email: 'doctor5@clinic.sg', name: 'Dr. David Ng', nric: 'S8901234E', mcrNumber: 'M56789E' },
    { id: '550e8400-e29b-41d4-a716-446655440016', email: 'doctor6@clinic.sg', name: 'Dr. Rachel Wong', nric: 'S9012345F', mcrNumber: 'M67890F' },
    { id: '550e8400-e29b-41d4-a716-446655440017', email: 'doctor7@clinic.sg', name: 'Dr. Benjamin Teo', nric: 'S0123456G', mcrNumber: 'M78901G' },
    { id: '550e8400-e29b-41d4-a716-446655440018', email: 'doctor8@clinic.sg', name: 'Dr. Priya Sharma', nric: 'S1234567H', mcrNumber: 'M89012H' },
    { id: '550e8400-e29b-41d4-a716-446655440019', email: 'doctor9@clinic.sg', name: 'Dr. Kevin Lim', nric: 'S2345678I', mcrNumber: 'M90123I' },
    { id: '550e8400-e29b-41d4-a716-446655440020', email: 'doctor10@clinic.sg', name: 'Dr. Michelle Goh', nric: 'S3456789J', mcrNumber: 'M01234J' },
    { id: '550e8400-e29b-41d4-a716-446655440021', email: 'doctor11@clinic.sg', name: 'Dr. Ryan Chan', nric: 'S4567890K', mcrNumber: 'M12345K' },
    { id: '550e8400-e29b-41d4-a716-446655440022', email: 'doctor12@clinic.sg', name: 'Dr. Amanda Tay', nric: 'S5678901L', mcrNumber: 'M23456L' },
    { id: '550e8400-e29b-41d4-a716-446655440023', email: 'doctor13@clinic.sg', name: 'Dr. Samuel Yeo', nric: 'S6789012M', mcrNumber: 'M34567M' },
    { id: '550e8400-e29b-41d4-a716-446655440024', email: 'doctor14@clinic.sg', name: 'Dr. Grace Liu', nric: 'S7890123N', mcrNumber: 'M45678N' },
  ];

  let doctorsCreated = 0;
  for (const doc of newDoctors) {
    const existing = await prisma.user.findUnique({ where: { email: doc.email } });
    if (existing) {
      console.log(`   ⏭️  ${doc.email} already exists, skipping`);
      continue;
    }

    await prisma.user.create({
      data: {
        id: doc.id,
        clinicId: clinic.id,
        email: doc.email,
        passwordHash,
        name: doc.name,
        nric: doc.nric,
        role: 'doctor',
        mcrNumber: doc.mcrNumber,
        status: 'active',
      },
    });

    // Create doctor-clinic relationship
    await prisma.doctorClinic.create({
      data: {
        doctorId: doc.id,
        clinicId: clinic.id,
        isPrimary: true,
      },
    });

    console.log(`   ✅ Created ${doc.email}`);
    doctorsCreated++;
  }

  // Create 10 new nurses (nurse3-12)
  const newNurses = [
    { id: '550e8400-e29b-41d4-a716-446655440025', email: 'nurse3@clinic.sg', name: 'Nurse Sarah Ong', nric: 'S8901234O' },
    { id: '550e8400-e29b-41d4-a716-446655440026', email: 'nurse4@clinic.sg', name: 'Nurse Jennifer Tan', nric: 'S9012345P' },
    { id: '550e8400-e29b-41d4-a716-446655440027', email: 'nurse5@clinic.sg', name: 'Nurse Lisa Chua', nric: 'S0123456Q' },
    { id: '550e8400-e29b-41d4-a716-446655440028', email: 'nurse6@clinic.sg', name: 'Nurse Michelle Koh', nric: 'S1234567R' },
    { id: '550e8400-e29b-41d4-a716-446655440029', email: 'nurse7@clinic.sg', name: 'Nurse Rachel Ng', nric: 'S2345678S' },
    { id: '550e8400-e29b-41d4-a716-446655440030', email: 'nurse8@clinic.sg', name: 'Nurse Emily Lim', nric: 'S3456789T' },
    { id: '550e8400-e29b-41d4-a716-446655440031', email: 'nurse9@clinic.sg', name: 'Nurse Angela Wong', nric: 'S4567890U' },
    { id: '550e8400-e29b-41d4-a716-446655440032', email: 'nurse10@clinic.sg', name: 'Nurse Christine Teo', nric: 'S5678901V' },
    { id: '550e8400-e29b-41d4-a716-446655440033', email: 'nurse11@clinic.sg', name: 'Nurse Amy Chen', nric: 'S6789012W' },
    { id: '550e8400-e29b-41d4-a716-446655440034', email: 'nurse12@clinic.sg', name: 'Nurse Stephanie Yap', nric: 'S7890123X' },
  ];

  let nursesCreated = 0;
  for (const nurse of newNurses) {
    const existing = await prisma.user.findUnique({ where: { email: nurse.email } });
    if (existing) {
      console.log(`   ⏭️  ${nurse.email} already exists, skipping`);
      continue;
    }

    await prisma.user.create({
      data: {
        id: nurse.id,
        clinicId: clinic.id,
        email: nurse.email,
        passwordHash,
        name: nurse.name,
        nric: nurse.nric,
        role: 'nurse',
        status: 'active',
      },
    });

    // Create nurse-clinic relationship
    await prisma.nurseClinic.create({
      data: {
        nurseId: nurse.id,
        clinicId: clinic.id,
        isPrimary: true,
      },
    });

    console.log(`   ✅ Created ${nurse.email}`);
    nursesCreated++;
  }

  console.log('\n🎉 Migration completed!');
  console.log(`   📊 Doctors created: ${doctorsCreated}/10`);
  console.log(`   📊 Nurses created: ${nursesCreated}/10`);
  console.log('\n📧 All new accounts use password: password');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
