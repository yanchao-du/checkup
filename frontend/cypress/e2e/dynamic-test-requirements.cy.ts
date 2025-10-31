describe('Dynamic Test Requirements', () => {
  beforeEach(() => {
    // Reset database and login as doctor
    cy.task('db:reset');
    cy.task('db:seed');
    cy.visit('/');
    
    // Login as doctor
    cy.get('[data-testid="email-input"]').type('doctor@clinic1.sg');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
  });

  it('should display all 4 tests for patient requiring HIV and TB tests', () => {
    // Start new submission
    cy.get('[data-testid="new-submission-button"]').click();
    
    // Select exam type
    cy.get('[data-testid="exam-type-select"]').click();
    cy.contains('6-Monthly Exam for Migrant Domestic Workers').click();
    
    // Get a test patient NRIC that requires HIV and TB
    cy.task('db:getPatientByTests', { hiv: true, chestXray: true }).then((patient: any) => {
      // Enter patient NRIC
      cy.get('[data-testid="patient-nric-input"]').type(patient.nric);
      
      // Wait for patient name to populate
      cy.get('[data-testid="patient-name-input"]').should('have.value', patient.name);
      
      // Enter examination date
      cy.get('[data-testid="examination-date-input"]').type('2025-10-31');
      
      // Go to Test Results section
      cy.get('[data-value="exam-specific"]').click();
      
      // Verify all 4 tests are visible
      cy.contains('Pregnancy test').should('be.visible');
      cy.contains('Syphilis test').should('be.visible');
      cy.contains('HIV test').should('be.visible');
      cy.contains('Chest X-ray to screen for TB').should('be.visible');
      
      // Fill in required vitals
      cy.get('[data-testid="height-input"]').type('165');
      cy.get('[data-testid="weight-input"]').type('58');
      
      // Fill in all test results (all negative)
      cy.get('[data-testid="pregnancy-test-checkbox"]').should('not.be.checked');
      cy.get('[data-testid="syphilis-test-checkbox"]').should('not.be.checked');
      cy.get('[data-testid="hiv-test-checkbox"]').should('not.be.checked');
      cy.get('[data-testid="chest-xray-checkbox"]').should('not.be.checked');
      
      // Go to summary
      cy.get('[data-value="summary"]').click();
      
      // Verify all 4 tests show in summary
      cy.contains('Test Results').should('be.visible');
      cy.contains('Pregnancy test').should('be.visible');
      cy.contains('Syphilis test').should('be.visible');
      cy.contains('HIV test').should('be.visible');
      cy.contains('Chest X-ray to screen for TB').should('be.visible');
      
      // Verify all show negative
      cy.get('.text-slate-500').contains('Negative/Non-reactive').should('have.length', 4);
      
      // Submit
      cy.get('[data-testid="declaration-checkbox"]').click();
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="confirm-submit-button"]').click();
      
      // Verify acknowledgement
      cy.url().should('include', '/acknowledgement');
      
      // Go to submissions and view the submitted record
      cy.visit('/submissions');
      cy.contains(patient.name).click();
      
      // Verify all 4 tests are displayed in view
      cy.contains('Test Results').should('be.visible');
      cy.contains('Pregnancy Test').should('be.visible');
      cy.contains('Syphilis Test').should('be.visible');
      cy.contains('HIV Test').should('be.visible');
      cy.contains('Chest X-Ray').should('be.visible');
    });
  });

  it('should display only 2 tests for patient not requiring HIV and TB tests', () => {
    // Start new submission
    cy.get('[data-testid="new-submission-button"]').click();
    
    // Select exam type
    cy.get('[data-testid="exam-type-select"]').click();
    cy.contains('6-Monthly Exam for Migrant Domestic Workers').click();
    
    // Get a test patient NRIC that doesn't require HIV or TB
    cy.task('db:getPatientByTests', { hiv: false, chestXray: false }).then((patient: any) => {
      // Enter patient NRIC
      cy.get('[data-testid="patient-nric-input"]').type(patient.nric);
      
      // Wait for patient name to populate
      cy.get('[data-testid="patient-name-input"]').should('have.value', patient.name);
      
      // Enter examination date
      cy.get('[data-testid="examination-date-input"]').type('2025-10-31');
      
      // Go to Test Results section
      cy.get('[data-value="exam-specific"]').click();
      
      // Verify only pregnancy and syphilis tests are visible
      cy.contains('Pregnancy test').should('be.visible');
      cy.contains('Syphilis test').should('be.visible');
      cy.contains('HIV test').should('not.exist');
      cy.contains('Chest X-ray to screen for TB').should('not.exist');
      
      // Fill in required vitals
      cy.get('[data-testid="height-input"]').type('165');
      cy.get('[data-testid="weight-input"]').type('58');
      
      // Go to summary
      cy.get('[data-value="summary"]').click();
      
      // Verify only 2 tests show in summary
      cy.contains('Test Results').should('be.visible');
      cy.contains('Pregnancy test').should('be.visible');
      cy.contains('Syphilis test').should('be.visible');
      cy.contains('HIV test').should('not.exist');
      cy.contains('Chest X-ray to screen for TB').should('not.exist');
      
      // Submit
      cy.get('[data-testid="declaration-checkbox"]').click();
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="confirm-submit-button"]').click();
      
      // Verify acknowledgement
      cy.url().should('include', '/acknowledgement');
      
      // Go to submissions and view the submitted record
      cy.visit('/submissions');
      cy.contains(patient.name).click();
      
      // Verify only 2 tests are displayed in view
      cy.contains('Test Results').should('be.visible');
      cy.contains('Pregnancy Test').should('be.visible');
      cy.contains('Syphilis Test').should('be.visible');
      cy.contains('HIV Test').should('not.exist');
      cy.contains('Chest X-Ray').should('not.exist');
    });
  });

  it('should display HIV test with negative result when required but unchecked', () => {
    // Start new submission
    cy.get('[data-testid="new-submission-button"]').click();
    
    // Select exam type
    cy.get('[data-testid="exam-type-select"]').click();
    cy.contains('6-Monthly Exam for Migrant Domestic Workers').click();
    
    // Get a test patient NRIC that requires only HIV
    cy.task('db:getPatientByTests', { hiv: true, chestXray: false }).then((patient: any) => {
      // Enter patient NRIC
      cy.get('[data-testid="patient-nric-input"]').type(patient.nric);
      
      // Wait for patient name to populate
      cy.get('[data-testid="patient-name-input"]').should('have.value', patient.name);
      
      // Enter examination date
      cy.get('[data-testid="examination-date-input"]').type('2025-10-31');
      
      // Go to Test Results section
      cy.get('[data-value="exam-specific"]').click();
      
      // Verify pregnancy, syphilis, and HIV are visible, but not chest x-ray
      cy.contains('Pregnancy test').should('be.visible');
      cy.contains('Syphilis test').should('be.visible');
      cy.contains('HIV test').should('be.visible');
      cy.contains('Chest X-ray to screen for TB').should('not.exist');
      
      // Fill in required vitals
      cy.get('[data-testid="height-input"]').type('165');
      cy.get('[data-testid="weight-input"]').type('58');
      
      // Leave all tests unchecked (negative results)
      
      // Go to summary
      cy.get('[data-value="summary"]').click();
      
      // Verify HIV test shows as negative in summary
      cy.contains('HIV test').should('be.visible');
      cy.contains('HIV test').parent().should('contain', 'Negative/Non-reactive');
      
      // Submit
      cy.get('[data-testid="declaration-checkbox"]').click();
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="confirm-submit-button"]').click();
      
      // Go to submissions and view
      cy.visit('/submissions');
      cy.contains(patient.name).click();
      
      // Verify HIV test is displayed with negative result in view
      cy.contains('HIV Test').should('be.visible');
      cy.contains('HIV Test').parent().should('contain', 'Negative/Non-reactive');
    });
  });
});
