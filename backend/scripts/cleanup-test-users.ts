#!/usr/bin/env ts-node
/**
 * Cleanup script to remove test users created by E2E tests
 * 
 * This script deletes:
 * - Users with email starting with 'test-e2e-'
 * - Users with email starting with 'pwd-test-'
 * - Inactive CorpPass test users
 * - All related data (submissions, clinic associations, etc.)
 * 
 * Usage: npx ts-node scripts/cleanup-test-users.ts
 */

import { PrismaClient } from '@prisma/client';

async function cleanup() {
  const prisma = new PrismaClient();
  
  try {
    // Find test users
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { startsWith: 'test-e2e-' } },
          { email: { startsWith: 'pwd-test-' } },
          { AND: [{ email: { contains: '@corppass.gov.sg' } }, { status: 'inactive' }] }
        ]
      },
      select: { id: true, email: true, role: true }
    });
    
    console.log(`Found ${testUsers.length} test users to delete\n`);
    
    let deletedCount = 0;
    for (const user of testUsers) {
      console.log(`Deleting: ${user.email}`);
      
      // Delete submissions created by or approved by this user
      await prisma.medicalSubmission.deleteMany({ 
        where: { 
          OR: [
            { createdById: user.id },
            { approvedById: user.id },
            { assignedDoctorId: user.id },
            { assignedToId: user.id },
            { assignedById: user.id }
          ]
        } 
      });
      
      // Delete nurse clinic associations
      if (user.role === 'nurse') {
        await prisma.nurseClinic.deleteMany({ where: { nurseId: user.id } });
      }
      
      // Delete doctor clinic associations
      if (user.role === 'doctor') {
        await prisma.doctorClinic.deleteMany({ where: { doctorId: user.id } });
      }
      
      // Delete CorpPass associations
      await prisma.corpPassUser.deleteMany({ where: { userId: user.id } });
      
      // Delete audit logs
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
      
      // Delete the user
      await prisma.user.delete({ where: { id: user.id } });
      deletedCount++;
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} test users\n`);
    
    // Show remaining nurses for verification
    const nurses = await prisma.user.findMany({
      where: { role: 'nurse' },
      select: { email: true, name: true },
      orderBy: { email: 'asc' }
    });
    
    console.log(`Remaining nurses: ${nurses.length}`);
    nurses.forEach(n => console.log(`  - ${n.email} | ${n.name}`));
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
