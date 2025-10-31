import { PrismaClient } from '@prisma/client';
import { generateValidNRIC } from '../src/common/utils/nric-validator';

const prisma = new PrismaClient();

// Female names from Indonesia, Myanmar, and Philippines
const indonesianNames = [
  'Siti Nurhaliza', 'Dewi Lestari', 'Rina Susanti', 'Putri Amelia', 'Maya Kartika',
  'Sri Wulandari', 'Indah Permatasari', 'Ratna Sari', 'Ayu Lestari', 'Wati Susilowati',
  'Lina Marlina', 'Eka Rahayu', 'Fitri Handayani', 'Nur Azizah', 'Lia Wijaya',
  'Rini Kusuma', 'Dian Sastrowardoyo', 'Mega Mustika', 'Yuni Shara', 'Ani Yudhoyono',
  'Tri Utami', 'Dwi Saputri', 'Eni Sagita', 'Fifi Lety', 'Gita Gutawa',
  'Hana Madness', 'Ika Putri', 'Juwita Maritsa', 'Kartika Sary', 'Lala Karmela',
  'Mita Hujan', 'Nafa Urbach', 'Olla Ramlan', 'Prilly Latuconsina', 'Rahma Azhari',
  'Santi Dewi', 'Titi Kamal', 'Ussy Sulistiawaty', 'Venna Melinda', 'Wulan Guritno',
  'Agnes Monica', 'Bunga Citra', 'Chelsea Islan', 'Dinda Kirana', 'Estelle Linden',
  'Febby Rastanty', 'Gracia Indri', 'Hesti Purwadinata', 'Intan Nuraini', 'Julie Estelle',
];

const myanmarNames = [
  'Aye Aye', 'Khin Khin', 'Mya Mya', 'Phyu Phyu', 'San San',
  'Thin Thin', 'Yi Yi', 'Zin Zin', 'Htwe Htwe', 'Kyaw Kyaw',
  'Nwe Nwe', 'Cho Cho', 'Ei Ei', 'Hla Hla', 'Kay Kay',
  'May May', 'Ni Ni', 'Su Su', 'Win Win', 'Yin Yin',
  'Aye Chan', 'Khin Saw', 'Mya Nandar', 'Phyu Sin', 'San Yati',
  'Thin Zar', 'Yi Mon', 'Zin Mar', 'Htwe Yin', 'Kyaw Sein',
  'Nwe Oo', 'Cho Zin', 'Ei Shwe', 'Hla Myint', 'Kay Thi',
  'May Sabei', 'Ni Lar', 'Su Myat', 'Win Theingi', 'Yin Htwe',
  'Aye Myat', 'Khin Thiri', 'Mya Thazin', 'Phyu Hnin', 'San Thida',
  'Thin Nandar', 'Yi Su', 'Zin Shwe', 'Htwe Thazin', 'Kyaw Zin',
];

const philippineNames = [
  'Maria Santos', 'Ana Reyes', 'Rosa Cruz', 'Elena Garcia', 'Carmen Ramos',
  'Luz Mendoza', 'Gloria Torres', 'Sofia Flores', 'Victoria Castro', 'Isabel Gonzales',
  'Josefina Rivera', 'Teresa Diaz', 'Angelica Alvarez', 'Patricia Gomez', 'Cristina Morales',
  'Margarita Aquino', 'Catalina Bautista', 'Rosario Villanueva', 'Beatriz Fernandez', 'Dolores Santiago',
  'Mercedes Navarro', 'Guadalupe Pascual', 'Remedios Mercado', 'Esperanza Del Rosario', 'Pilar Valdez',
  'Concepcion Santos', 'Paz Martinez', 'Felicidad Lopez', 'Soledad Hernandez', 'Consolacion Perez',
  'Milagros Dela Cruz', 'Asuncion Rodriguez', 'Encarnacion Abad', 'Presentacion Ocampo', 'Purificacion Lim',
  'Trinidad Tan', 'Natividad Chan', 'Visitacion Chua', 'Rosalinda Sy', 'Teresita Wong',
  'Corazon Aquino', 'Aurora De Leon', 'Leonora Jimenez', 'Norma Velasco', 'Lourdes Castillo',
  'Violeta Aguilar', 'Juanita Salazar', 'Estrella Vargas', 'Perla Romero', 'Ruby Magno',
];

// Combine all names
const allNames = [...indonesianNames, ...myanmarNames, ...philippineNames];

// Function to generate random date of birth (ages 21-45)
function generateRandomDOB(): Date {
  const today = new Date();
  const minAge = 21;
  const maxAge = 45;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Safe for all months
  return new Date(birthYear, month, day);
}

// Function to generate random height (145-175 cm)
function generateRandomHeight(): number {
  return Math.floor(Math.random() * 31) + 145;
}

// Function to generate random weight (40-75 kg)
function generateRandomWeight(): number {
  return Math.floor(Math.random() * 36) + 40;
}

// Function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function main() {
  console.log('🌱 Seeding 1000 female patients...');

  // Get the default clinic (assuming it exists from the main seed)
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    throw new Error('No clinic found. Please run the main seed first.');
  }

  // Get a nurse user to be the creator (assuming it exists)
  const nurse = await prisma.user.findFirst({
    where: { role: 'nurse' },
  });
  if (!nurse) {
    throw new Error('No nurse user found. Please run the main seed first.');
  }

  const usedFINs = new Set<string>();
  const patients: any[] = [];

  // Generate 1000 unique patient records
  for (let i = 0; i < 1000; i++) {
    let fin: string;
    let digits: string;
    
    // Generate unique FIN (using F prefix for foreign workers)
    do {
      // Generate 7 random digits
      digits = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
      fin = generateValidNRIC('F', digits);
    } while (usedFINs.has(fin));
    
    usedFINs.add(fin);

    // Randomly select a name (ensure we have enough variety by cycling and randomizing)
    const nameIndex = i % allNames.length;
    const shuffledIndex = (nameIndex * 7 + Math.floor(Math.random() * 3)) % allNames.length;
    const patientName = allNames[shuffledIndex];

    // Determine if this patient should have height/weight (600 yes, 400 no)
    const hasHeightWeight = i < 600;

    // Generate random values for HIV and TB requirements
    const hivRequired = Math.random() < 0.5;
    const tbRequired = Math.random() < 0.5;

    const patient = {
      id: `patient-${String(i + 1).padStart(4, '0')}`,
      examType: 'SIX_MONTHLY_FMW' as const,
      patientName,
      patientNric: fin,
      patientDob: generateRandomDOB(),
      examinationDate: new Date('2025-10-30'),
      status: 'submitted' as const,
      formData: {
        // Always required
        pregnancyTestPositive: Math.random() < 0.05 ? 'true' : 'false', // 5% positive
        syphilisTestPositive: Math.random() < 0.03 ? 'true' : 'false', // 3% positive
        
        // Conditionally required based on random assignment
        ...(hivRequired && {
          hivTestRequired: 'true',
          hivTestPositive: Math.random() < 0.02 ? 'true' : 'false', // 2% positive
        }),
        ...(tbRequired && {
          chestXrayRequired: 'true',
          chestXrayPositive: Math.random() < 0.04 ? 'true' : 'false', // 4% positive
        }),
        
        // Height and weight for 600 patients
        ...(hasHeightWeight && {
          height: generateRandomHeight(),
          weight: generateRandomWeight(),
        }),
        
        hasAdditionalRemarks: 'false',
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: new Date('2025-10-30T09:00:00'),
      submittedDate: new Date('2025-10-30T10:00:00'),
      updatedAt: new Date('2025-10-30T10:00:00'),
    };

    patients.push(patient);
  }

  // Insert patients in batches for better performance
  const batchSize = 100;
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    await prisma.medicalSubmission.createMany({
      data: batch,
    });
    console.log(`✅ Inserted patients ${i + 1} to ${Math.min(i + batchSize, patients.length)}`);
  }

  console.log('✅ Successfully seeded 1000 female patients!');
  console.log(`📊 Summary:`);
  console.log(`   - 600 patients with height and weight`);
  console.log(`   - 400 patients without height and weight`);
  console.log(`   - All patients have Pregnancy and Syphilis tests (always required)`);
  console.log(`   - HIV and TB tests randomly assigned as required/not required`);
  console.log(`   - Names from Indonesia, Myanmar, and Philippines`);
  console.log(`   - All have valid FINs (Foreign Identification Numbers)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding patients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
