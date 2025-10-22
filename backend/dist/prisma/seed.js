"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
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
    const passwordHash = await bcrypt.hash('password', 10);
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
    const submission1 = await prisma.medicalSubmission.create({
        data: {
            examType: 'SIX_MONTHLY_MDW',
            patientName: 'Maria Santos',
            patientNric: 'S1234567A',
            patientDob: new Date('1990-05-15'),
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
    const draft1 = await prisma.medicalSubmission.create({
        data: {
            examType: 'WORK_PERMIT',
            patientName: 'Wang Wei',
            patientNric: 'S5678901E',
            patientDob: new Date('1988-07-14'),
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
//# sourceMappingURL=seed.js.map