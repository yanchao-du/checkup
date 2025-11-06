import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NRIC/FIN generation utility
const NRIC_WEIGHTS = [2, 7, 6, 5, 4, 3, 2];
const FG_CHECKSUMS = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
const M_CHECKSUMS = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'];

function generateValidFIN(prefix: 'F' | 'G' | 'M', digits?: string): string {
  const numDigits = digits || String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(numDigits.charAt(i)) * NRIC_WEIGHTS[i];
  }
  
  if (prefix === 'G') {
    sum += 4;
  } else if (prefix === 'M') {
    sum += 3;
  }
  
  const remainder = sum % 11;
  
  const checksum = (prefix === 'F' || prefix === 'G') 
    ? FG_CHECKSUMS[remainder]
    : M_CHECKSUMS[remainder];
  
  return `${prefix}${numDigits}${checksum}`;
}

// 250 Male names from various Asian countries
const maleNames = [
  // India (42 names)
  'Rajesh Kumar', 'Amit Singh', 'Suresh Patel', 'Vijay Sharma', 'Ravi Reddy',
  'Manoj Gupta', 'Sanjay Joshi', 'Anil Verma', 'Ashok Rao', 'Ramesh Nair',
  'Kiran Shah', 'Deepak Mehta', 'Prakash Iyer', 'Mohit Agarwal', 'Rahul Desai',
  'Sandeep Kulkarni', 'Nitin Chauhan', 'Rakesh Pandey', 'Vikas Mishra', 'Ajay Trivedi',
  'Dinesh Pillai', 'Mukesh Saxena', 'Naveen Menon', 'Pankaj Kapoor', 'Sachin Dubey',
  'Sunil Bhatt', 'Tarun Chopra', 'Vinod Sinha', 'Yash Malhotra', 'Abhishek Tiwari',
  'Arjun Bose', 'Bharat Ghosh', 'Chetan Bansal', 'Devendra Roy', 'Gaurav Sethi',
  'Harsh Jain', 'Jatin Dhawan', 'Karthik Pillai', 'Lalit Sood', 'Manish Dutta',
  'Naresh Yadav', 'Pradeep Jha',
  
  // Bangladesh (42 names)
  'Abdul Rahman', 'Bashir Ahmed', 'Farhan Ali', 'Habib Khan', 'Imran Hossain',
  'Jahangir Alam', 'Kamal Uddin', 'Liton Miah', 'Mahbub Islam', 'Nasir Chowdhury',
  'Omar Faruq', 'Parvez Rahman', 'Rafiq Hussain', 'Salim Ullah', 'Tariq Aziz',
  'Zia Rahman', 'Anwar Hossain', 'Babul Akter', 'Delwar Hossain', 'Enamul Haque',
  'Faisal Ahmed', 'Golam Rabbani', 'Hannan Mia', 'Ibrahim Khalil', 'Jalal Uddin',
  'Kamrul Hassan', 'Lutfur Rahman', 'Mosharraf Hossain', 'Nizam Uddin', 'Obaidul Islam',
  'Parvez Alam', 'Qadir Mollah', 'Rahim Uddin', 'Shahjahan Ali', 'Towhid Rahman',
  'Ubaidullah Khan', 'Wazed Ali', 'Yakub Mia', 'Zahed Hossain', 'Abdul Latif',
  'Badal Ahmed', 'Shahid Ullah',
  
  // China (42 names)
  'Wei Chen', 'Ming Li', 'Jun Wang', 'Jian Zhang', 'Lei Liu',
  'Feng Yang', 'Tao Huang', 'Qiang Wu', 'Yong Zhou', 'Gang Xu',
  'Bin Sun', 'Chao Ma', 'Hai Zhu', 'Peng Lin', 'Hui Guo',
  'Long He', 'Bo Zhao', 'Kai Zheng', 'Dong Qian', 'Xin Jin',
  'Rui Tang', 'Hao Song', 'Yu Jiang', 'Jie Liang', 'Xiang Shi',
  'Yang Xie', 'Cheng Pan', 'Kun Ren', 'Hong Luo', 'Xi Fan',
  'An Cao', 'Zhen Xiao', 'Bing Deng', 'Shuai Cheng', 'Tian Ding',
  'Wen Ye', 'Guo Tan', 'Han Fu', 'Jing Zhong', 'Lin Jiang',
  'Nan Shen', 'Ping Wan',
  
  // Malaysia (42 names)
  'Ahmad Abdullah', 'Azman Ali', 'Haris Hassan', 'Ismail Ibrahim', 'Kamal Mohamad',
  'Mohd Yusof', 'Noor Aziz', 'Rahman Salleh', 'Saiful Bakar', 'Zahir Omar',
  'Farid Hashim', 'Hafiz Hamid', 'Jamsari Ahmad', 'Khalid Rahman', 'Munir Hassan',
  'Nazri Abdullah', 'Rashid Ismail', 'Shukor Ali', 'Wan Aziz', 'Zaki Yusof',
  'Chan Wei Ming', 'Lim Choon Hock', 'Tan Ah Kow', 'Wong Chee Kong', 'Lee Seng Huat',
  'Ng Boon Seng', 'Ong Jin Wei', 'Teh Kai Soon', 'Yap Kian Meng', 'Koh Wei Jie',
  'Kumar Sathish', 'Raju Krishnan', 'Subramaniam Murthy', 'Velan Raman', 'Arul Kumar',
  'Bala Krishnan', 'Ganesh Kumar', 'Mohan Das', 'Prakash Raj', 'Siva Kumar',
  'Muthu Kumar', 'Ravi Chandran',
  
  // Indonesia (42 names)
  'Adi Wijaya', 'Budi Santoso', 'Dedi Kurniawan', 'Eko Prabowo', 'Fajar Nugroho',
  'Gunawan Setiawan', 'Hadi Susanto', 'Irfan Hakim', 'Joko Widodo', 'Kusuma Wardana',
  'Lukman Hakim', 'Mulyadi Rahmat', 'Nurdin Suharto', 'Oki Prasetyo', 'Putra Pratama',
  'Reza Permana', 'Slamet Riyadi', 'Tono Sugiarto', 'Usman Ibrahim', 'Wawan Hidayat',
  'Yudi Setiawan', 'Zainal Abidin', 'Agus Salim', 'Bambang Sutrisno', 'Candra Wijaya',
  'Dwi Hartono', 'Eddy Firmansyah', 'Firman Syahputra', 'Gani Rahman', 'Hendra Gunawan',
  'Indra Kurnia', 'Jaya Kusuma', 'Khairul Anwar', 'Luki Setiawan', 'Mardi Santoso',
  'Nanda Permana', 'Oka Pratama', 'Prima Wijaya', 'Ridwan Hakim', 'Surya Darma',
  'Taufik Hidayat', 'Wahyu Setiawan',
  
  // Thailand (40 names)
  'Somchai Thongdee', 'Somsak Boonmee', 'Surasak Chaiwong', 'Sompong Jaidee', 'Suthep Panya',
  'Chaiwat Khamphong', 'Nattawut Prasert', 'Prayut Saelim', 'Anuwat Chaiyaphum', 'Somphob Bunnak',
  'Wichai Sanitchai', 'Manop Sutthitham', 'Prasit Wongchai', 'Suwan Thammarat', 'Thawat Chaisri',
  'Amnuay Chanthaburi', 'Boonlert Prachuap', 'Chartchai Nakhon', 'Damrong Pattani', 'Ekkachai Songkhla',
  'Somkid Thepsiri', 'Prasert Nongbua', 'Wirat Loei', 'Anucha Sakon', 'Praphan Udon',
  'Chatchai Khon', 'Sombat Ubon', 'Wasan Nakhon', 'Narong Roi', 'Sakda Buriram',
  'Thongchai Surin', 'Bancha Sisaket', 'Kraisak Yasothon', 'Somphong Amnat', 'Chavalit Mukdahan',
  'Banharn Nongkhai', 'Chuan Kalasin', 'Sanan Maha', 'Sanya Saraburi', 'Chuan Lopburi',
];

// 250 Female names from various Asian countries
const femaleNames = [
  // India (42 names)
  'Priya Sharma', 'Neha Singh', 'Anjali Patel', 'Pooja Reddy', 'Kavita Gupta',
  'Sunita Joshi', 'Rekha Verma', 'Meena Rao', 'Deepa Nair', 'Seema Shah',
  'Asha Mehta', 'Radha Iyer', 'Sapna Agarwal', 'Nisha Desai', 'Geeta Kulkarni',
  'Komal Chauhan', 'Preeti Pandey', 'Ritu Mishra', 'Swati Trivedi', 'Usha Pillai',
  'Vandana Saxena', 'Divya Menon', 'Jyoti Kapoor', 'Kalpana Dubey', 'Lakshmi Bhatt',
  'Madhuri Chopra', 'Namita Sinha', 'Pallavi Malhotra', 'Renu Tiwari', 'Sarita Bose',
  'Tanvi Ghosh', 'Uma Bansal', 'Veena Roy', 'Anita Sethi', 'Bharti Jain',
  'Chhaya Dhawan', 'Dipika Pillai', 'Gauri Sood', 'Heena Dutta', 'Indira Yadav',
  'Jaya Jha', 'Kamla Nambiar',
  
  // Bangladesh (42 names)
  'Ayesha Begum', 'Fatima Khatun', 'Nasrin Sultana', 'Rehana Akter', 'Shahnaz Parvin',
  'Roksana Rahman', 'Taslima Hossain', 'Zakia Chowdhury', 'Amina Begum', 'Bilkis Akter',
  'Delwar Begum', 'Hasina Khatun', 'Jahanara Parvin', 'Khaleda Sultana', 'Mahfuza Rahman',
  'Nasima Hossain', 'Parveen Akter', 'Rabeya Begum', 'Salma Khatun', 'Tahera Sultana',
  'Yasmin Chowdhury', 'Anwara Begum', 'Farida Akter', 'Halima Khatun', 'Jamila Parvin',
  'Kulsum Sultana', 'Lutfa Rahman', 'Monira Hossain', 'Nurjahan Akter', 'Rahima Begum',
  'Sabina Khatun', 'Tahmina Sultana', 'Shirina Chowdhury', 'Farhana Begum', 'Gulshan Akter',
  'Hasna Khatun', 'Ismat Parvin', 'Jannatul Sultana', 'Kamrun Rahman', 'Laila Hossain',
  'Mosammat Akter', 'Nargis Begum',
  
  // China (42 names)
  'Li Wei', 'Wang Mei', 'Zhang Yan', 'Liu Jing', 'Chen Xiu',
  'Yang Na', 'Huang Fang', 'Wu Juan', 'Zhou Ying', 'Xu Hui',
  'Sun Min', 'Ma Li', 'Zhu Xia', 'Lin Hong', 'Guo Ling',
  'He Yue', 'Zhao Rong', 'Zheng Qing', 'Qian Ping', 'Jin Xin',
  'Tang Hua', 'Song Lan', 'Jiang Xuan', 'Liang Yu', 'Shi Lei',
  'Xie Jie', 'Pan Qian', 'Ren Ning', 'Luo Shan', 'Fan Yun',
  'Cao Yao', 'Xiao Shu', 'Deng Bei', 'Cheng Dan', 'Ding Rui',
  'Ye Wen', 'Tan Xin', 'Fu Han', 'Zhong Jing', 'Jiang Lin',
  'Shen Nan', 'Wan Ping',
  
  // Malaysia (42 names)
  'Siti Aminah', 'Nor Azizah', 'Fatimah Hassan', 'Zainab Ibrahim', 'Aishah Mohamad',
  'Halimah Ali', 'Khadijah Abdullah', 'Maryam Yusof', 'Noraini Salleh', 'Rahmah Bakar',
  'Salimah Omar', 'Sharifah Ahmad', 'Hasnah Hashim', 'Rokiah Hamid', 'Latifah Rahman',
  'Saadiah Hassan', 'Mariam Ismail', 'Zaleha Ali', 'Aminah Aziz', 'Normah Yusof',
  'Lim Mei Ling', 'Tan Swee Lian', 'Chan Siew Peng', 'Wong Ai Lin', 'Lee Hui Min',
  'Ng Bee Leng', 'Ong Li Ying', 'Teh Mei Fong', 'Yap Siew Chin', 'Koh Mei Li',
  'Kavitha Devi', 'Prema Kumari', 'Shamala Raman', 'Valli Krishna', 'Anitha Kumar',
  'Bhavani Raj', 'Geetha Suresh', 'Lakshmi Murthy', 'Padma Das', 'Shanti Kumar',
  'Vasantha Devi', 'Rajeshwari Nair',
  
  // Indonesia (42 names)
  'Siti Nurhaliza', 'Dewi Lestari', 'Ratna Sari', 'Sri Wahyuni', 'Wulan Guritno',
  'Fitri Handayani', 'Indah Permatasari', 'Maya Puspita', 'Rina Susanti', 'Yuni Astuti',
  'Ani Yudhoyono', 'Diah Pratiwi', 'Eka Wijayanti', 'Heni Purwanti', 'Lia Wahdini',
  'Nina Rahayu', 'Putri Maharani', 'Sari Dewi', 'Tuti Indrawati', 'Vita Anggraini',
  'Ayu Kartika', 'Bunga Citra', 'Citra Kirana', 'Dian Sastro', 'Eva Arnaz',
  'Fanny Fabriana', 'Gita Gutawa', 'Hesti Purwadinata', 'Inul Daratista', 'Julia Perez',
  'Kristina Asih', 'Lilis Suryani', 'Mira Lesmana', 'Nani Widjaja', 'Oni Wijaya',
  'Poppy Mercury', 'Ria Irawan', 'Siska Nursanti', 'Tina Toon', 'Ucie Sucita',
  'Vina Panduwinata', 'Wulan Sari',
  
  // Thailand (40 names)
  'Siriporn Somchai', 'Suda Somsak', 'Nok Surasak', 'Lek Sompong', 'Mai Suthep',
  'Porn Chaiwat', 'Nong Nattawut', 'Ying Prayut', 'Dao Anuwat', 'Nim Somphob',
  'Noi Wichai', 'Orn Manop', 'Ploy Prasit', 'Rat Suwan', 'Som Thawat',
  'Wan Amnuay', 'Yui Boonlert', 'Aom Chartchai', 'Bee Damrong', 'Chom Ekkachai',
  'Fon Somkid', 'Joy Prasert', 'Mint Wirat', 'Nam Anucha', 'Pim Praphan',
  'Pui Chatchai', 'Pear Sombat', 'View Wasan', 'Bow Narong', 'Mind Sakda',
  'Mo Thongchai', 'Noey Bancha', 'Aum Kraisak', 'Benz Somphong', 'Cream Chavalit',
  'Film Banharn', 'Gina Chuan', 'Ice Sanan', 'Jane Sanya', 'Kate Chuan',
];

// Function to generate random date of birth (ages 21-55)
function generateRandomDOB(): Date {
  const today = new Date();
  const minAge = 21;
  const maxAge = 55;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, month, day);
}

// Function to generate examination date (within last 3 months)
function generateExamDate(): Date {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 90); // 0-90 days ago
  const examDate = new Date(today);
  examDate.setDate(today.getDate() - daysAgo);
  return examDate;
}

async function main() {
  console.log('🌱 Seeding 500 FME patients (250 male + 250 female)...');

  // Get the default clinic
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    throw new Error('No clinic found. Please run the main seed first.');
  }

  // Get a nurse user to be the creator
  const nurse = await prisma.user.findFirst({
    where: { role: 'nurse' },
  });
  if (!nurse) {
    throw new Error('No nurse user found. Please run the main seed first.');
  }

  const usedFINs = new Set<string>();
  const patients: any[] = [];

  // Generate 250 male patients
  for (let i = 0; i < 250; i++) {
    let fin: string;
    do {
      const digits = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
      fin = generateValidFIN('M', digits);
    } while (usedFINs.has(fin));
    
    usedFINs.add(fin);

    const examDate = generateExamDate();
    const createdDate = new Date(examDate);
    createdDate.setHours(9, 0, 0, 0);
    const submittedDate = new Date(examDate);
    submittedDate.setHours(10, 0, 0, 0);

    const patient = {
      id: `fme-male-${String(i + 1).padStart(4, '0')}`,
      examType: 'FULL_MEDICAL_EXAM' as const,
      patientName: maleNames[i],
      patientNric: fin,
      patientDob: generateRandomDOB(),
      examinationDate: examDate,
      status: 'submitted' as const,
      formData: {
        gender: 'M',
        // Empty formData - no pre-filled test results
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: createdDate,
      submittedDate: submittedDate,
      updatedAt: submittedDate,
    };

    patients.push(patient);
  }

  console.log('✅ Prepared 250 male patients');

  // Generate 250 female patients
  for (let i = 0; i < 250; i++) {
    let fin: string;
    do {
      const digits = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
      fin = generateValidFIN('F', digits);
    } while (usedFINs.has(fin));
    
    usedFINs.add(fin);

    const examDate = generateExamDate();
    const createdDate = new Date(examDate);
    createdDate.setHours(9, 0, 0, 0);
    const submittedDate = new Date(examDate);
    submittedDate.setHours(10, 0, 0, 0);

    const patient = {
      id: `fme-female-${String(i + 1).padStart(4, '0')}`,
      examType: 'FULL_MEDICAL_EXAM' as const,
      patientName: femaleNames[i],
      patientNric: fin,
      patientDob: generateRandomDOB(),
      examinationDate: examDate,
      status: 'submitted' as const,
      formData: {
        gender: 'F',
        // Empty formData - no pre-filled test results
      },
      clinicId: clinic.id,
      createdById: nurse.id,
      createdDate: createdDate,
      submittedDate: submittedDate,
      updatedAt: submittedDate,
    };

    patients.push(patient);
  }

  console.log('✅ Prepared 250 female patients');

  // Insert patients in batches
  const batchSize = 100;
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    await prisma.medicalSubmission.createMany({
      data: batch,
    });
    console.log(`✅ Inserted patients ${i + 1} to ${Math.min(i + batchSize, patients.length)}`);
  }

  console.log('✅ Successfully seeded 500 FME patients!');
  console.log(`📊 Summary:`);
  console.log(`   - 250 male patients (M-prefixed FINs)`);
  console.log(`   - 250 female patients (F-prefixed FINs)`);
  console.log(`   - Names from India, Bangladesh, China, Malaysia, Indonesia, Thailand`);
  console.log(`   - Gender stored in formData for API retrieval`);
  console.log(`   - No pre-filled test results`);
  console.log(`   - Examination dates: within last 3 months`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding FME patients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
