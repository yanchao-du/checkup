#!/usr/bin/env node

/**
 * Test script for patient lookup API endpoints
 * Make sure the backend is running before executing this script
 */

const baseUrl = 'http://localhost:3344/v1';

// You'll need to get a valid JWT token first
// For now, this is just a template to show how to test the endpoints

async function testPatientLookup() {
  console.log('🔍 Testing Patient Lookup API\n');
  
  // First, you need to login to get a token
  console.log('1. Login to get authentication token...');
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'nurse@clinic.sg',
      password: 'password',
    }),
  });
  
  if (!loginResponse.ok) {
    console.error('❌ Login failed');
    return;
  }
  
  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✅ Login successful\n');
  
  // Test 1: Get a random test FIN
  console.log('2. Getting random test FIN...');
  const randomFinResponse = await fetch(`${baseUrl}/patients/random-test-fin`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!randomFinResponse.ok) {
    const errorText = await randomFinResponse.text();
    console.error('❌ Failed to get random test FIN:', randomFinResponse.status, errorText);
    return;
  }
  
  const randomFin = await randomFinResponse.json();
  console.log('✅ Random test FIN:', randomFin);
  console.log();
  
  // Test 2: Lookup patient by the random FIN
  console.log('3. Looking up patient by FIN:', randomFin.fin);
  const lookupResponse = await fetch(
    `${baseUrl}/patients/lookup?nric=${encodeURIComponent(randomFin.fin)}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  if (!lookupResponse.ok) {
    console.error('❌ Failed to lookup patient');
    return;
  }
  
  const patientInfo = await lookupResponse.json();
  console.log('✅ Patient information:');
  console.log(JSON.stringify(patientInfo, null, 2));
  console.log();
  
  console.log('🎉 All tests passed!');
}

testPatientLookup().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
