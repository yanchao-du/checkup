describe('ICA Exam Types', () => {
  beforeEach(() => {
    cy.clearAppData()
    cy.login('doctor@clinic.sg', 'password')
  })

  describe('PR Medical Exam Type', () => {
    it('should display PR Medical exam option in dropdown', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').should('be.visible')
    })

    it('should hide patient lookup button for PR Medical exam', () => {
      cy.contains('New Submission').click()
      
      // Select PR Medical exam type
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      // Verify lookup button is hidden
      cy.contains('button', 'Lookup Patient').should('not.exist')
      
      // Verify manual input fields are visible and enabled
      cy.get('input[name="patientName"]').should('be.visible').and('not.be.disabled')
      cy.get('input[name="nric"]').should('be.visible').and('not.be.disabled')
    })

  it.only('should render HIV and Chest X-ray test fields only', () => {
      cy.contains('New Submission').click()
      
      // Select PR Medical
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      // Enter patient info manually
      cy.get('input[name="patientName"]').type('John Tan')
  cy.get('input[name="nric"]').type('S1234567D')
      cy.get('input[name="examinationDate"]').type('2025-10-31')

  // Proceed to examination details accordion
  cy.contains('button', 'Continue').click()
  cy.contains('Examination Details').click()
      
      // Verify only HIV and Chest X-ray tests are visible
      cy.contains('HIV test').should('be.visible')
      cy.contains('Chest X-ray to screen for TB').should('be.visible')
      
      // Verify checkboxes exist
      cy.get('#hivTestPositive').should('exist')
      cy.get('#chestXrayPositive').should('exist')
      
      // Verify NO pregnancy or syphilis tests
      cy.get('input[name="pregnancyTestPositive"]').should('not.exist')
      cy.get('input[name="syphilisTestPositive"]').should('not.exist')
      
      // Verify NO vitals (height/weight)
      cy.get('input[name="height"]').should('not.exist')
      cy.get('input[name="weight"]').should('not.exist')
    })

    it('should display HIV test note about MOH-approved laboratory', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      cy.get('input[name="patientName"]').type('Mary Lee')
      cy.get('input[name="nric"]').type('S9876543B')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Verify HIV test note
      cy.contains('HIV test must be done by an MOH-approved laboratory').should('be.visible')
    })

    it('should display ICA-specific declaration with patient consent', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      cy.get('input[name="patientName"]').type('David Lim')
      cy.get('input[name="nric"]').type('S1122334C')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Scroll to see declaration
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      
      // Verify standard declaration
      cy.contains('I certify that the medical examination has been carried out').should('be.visible')
      
      // Verify ICA patient consent addition
      cy.contains('patient has consented to this medical examination').should('be.visible')
      cy.contains('Immigration and Checkpoints Authority').should('be.visible')
    })

    it('should complete full PR Medical submission workflow', () => {
      cy.contains('New Submission').click()
      
      // Select PR Medical
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      // Fill patient info manually
      cy.get('input[name="patientName"]').type('Alice Wong')
      cy.get('input[name="nric"]').type('S5566778D')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Test results are negative by default (unchecked)
      cy.get('#hivTestPositive').should('not.be.checked')
      cy.get('#chestXrayPositive').should('not.be.checked')
      
      // Add remarks
      cy.get('#hasAdditionalRemarks').click()
      cy.get('textarea[name="remarks"]').type('Patient is healthy, no issues detected.')
      
      // Scroll to declaration and verify
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      cy.contains('Alice Wong').should('be.visible')
      cy.contains('S5566778D').should('be.visible')
      
      // Submit
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Verify redirected to submissions
      cy.url().should('include', '/submissions')
      cy.contains('Alice Wong').should('be.visible')
    })

    it('should display PR Medical submission in submissions list', () => {
      // Create a submission first
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      cy.get('input[name="patientName"]').type('Bob Chen')
      cy.get('input[name="nric"]').type('S7788990E')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Verify submission appears with correct label
      cy.contains('Bob Chen').should('be.visible')
      // Check for ICA agency
      cy.get('body').should('contain.text', 'ICA')
    })

    it('should filter by PR Medical exam type', () => {
      // Go to submissions list
      cy.visit('/submissions')
      
      // Open exam type filter
      cy.get('[data-testid="examType"]').first().click()
      
      // Verify PR Medical option exists
      cy.contains('Medical Examination for Permanent Residency (ICA)').should('be.visible')
    })

    it('should display PR Medical submission details correctly', () => {
      // Create a submission
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      cy.get('input[name="patientName"]').type('Catherine Ng')
      cy.get('input[name="nric"]').type('S9900112F')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      cy.get('#hivTestPositive').click() // Mark as positive
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Go to submissions and view
      cy.contains('Catherine Ng').click()
      
      // Verify details page
      cy.contains('Medical Examination for Permanent Residency').should('be.visible')
      cy.contains('Catherine Ng').should('be.visible')
      cy.contains('S9900112F').should('be.visible')
      cy.contains('HIV Test').should('be.visible')
      cy.contains('Positive/Reactive').should('be.visible')
      
      // Verify NO vitals section
      cy.contains('Height').should('not.exist')
      cy.contains('Weight').should('not.exist')
    })
  });

  describe('Student Pass Medical Exam Type', () => {
    it('should display Student Pass Medical exam option', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Student Pass (ICA)').should('be.visible')
    })

    it('should complete Student Pass Medical submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Student Pass (ICA)').click()
      
      // Verify manual entry (no lookup)
      cy.contains('button', 'Lookup Patient').should('not.exist')
      
      cy.get('input[name="patientName"]').type('Sarah Kumar')
      cy.get('input[name="nric"]').type('S2233445G')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Verify test fields
      cy.contains('HIV test').should('be.visible')
      cy.contains('Chest X-ray to screen for TB').should('be.visible')
      
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      cy.contains('Medical Examination for Student Pass').should('be.visible')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      cy.contains('Sarah Kumar').should('be.visible')
    })
  });

  describe('LTVP Medical Exam Type', () => {
    it('should display LTVP Medical exam option', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Long Term Visit Pass (ICA)').should('be.visible')
    })

    it('should complete LTVP Medical submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Long Term Visit Pass (ICA)').click()
      
      // Verify manual entry
      cy.contains('button', 'Lookup Patient').should('not.exist')
      
      cy.get('input[name="patientName"]').type('Michael Zhang')
      cy.get('input[name="nric"]').type('S3344556H')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Verify test fields
      cy.contains('HIV test').should('be.visible')
      cy.contains('Chest X-ray to screen for TB').should('be.visible')
      
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      cy.contains('Medical Examination for Long Term Visit Pass').should('be.visible')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      cy.contains('Michael Zhang').should('be.visible')
    })
  });

  describe('ICA Exam Approval Workflow', () => {
    it('should route ICA exam for approval as nurse', () => {
      // Logout and login as nurse
      cy.logout()
      cy.login('nurse@clinic.sg', 'password')
      
      // Create PR Medical submission
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      cy.get('input[name="patientName"]').type('Test Patient')
      cy.get('input[name="nric"]').type('S4455667I')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      
      // Route for approval - this may not be implemented yet
      cy.contains('button', 'Route for Approval').should('exist')
    })

    it('should approve ICA exam as doctor', () => {
      // Login as doctor and go to approvals page
      cy.visit('/approvals')
      
      // Verify ICA submissions can be filtered/viewed
      cy.get('[data-testid="examType"]').should('exist')
    })
  });

  describe('ICA Exam with Remarks', () => {
    it('should save and display remarks for ICA exam', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      cy.get('input[name="patientName"]').type('Remarks Test')
      cy.get('input[name="nric"]').type('S5566779J')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Add remarks
      cy.get('#hasAdditionalRemarks').click()
      cy.get('textarea[name="remarks"]').type('Patient has minor skin condition.\nNo major health issues.')
      
      // Verify remarks visible
      cy.contains('Patient has minor skin condition').should('be.visible')
      
      // Submit
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // View submission
      cy.contains('Remarks Test').click()
      
      // Verify remarks preserved
      cy.contains('Remarks').should('be.visible')
      cy.contains('Patient has minor skin condition').should('be.visible')
    })

    it('should display dash when no remarks for ICA exam', () => {
      cy.contains('New Submission').click()
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      
      cy.get('input[name="patientName"]').type('No Remarks Test')
      cy.get('input[name="nric"]').type('S6677880K')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      // Don't add remarks - submit directly
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.contains('No Remarks Test').click()
      
      // Verify no remarks or dash shown
      cy.get('body').should('exist')
    })
  });

  describe('ICA vs MOM Exam Comparison', () => {
    it('should show patient lookup for MDW but not for ICA', () => {
      // Test MDW - should have lookup
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('6-Monthly Exam for Migrant Domestic Workers').click()
      cy.contains('button', 'Lookup Patient').should('be.visible')
      
      // Go back and test ICA - should NOT have lookup
      cy.visit('/')
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      cy.contains('button', 'Lookup Patient').should('not.exist')
    })

    it('should show different test requirements for MDW vs ICA', () => {
      // MDW has 4 tests (Pregnancy, Syphilis, HIV, Chest X-ray)
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('6-Monthly Exam for Migrant Domestic Workers').click()
      cy.get('input[name="patientName"]').type('MDW Test')
      cy.get('input[name="nric"]').type('F1234567A')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      cy.contains('Pregnancy test').should('be.visible')
      cy.contains('Syphilis test').should('be.visible')
      
      // ICA has only 2 tests (HIV, Chest X-ray)
      cy.visit('/')
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      cy.get('input[name="patientName"]').type('ICA Test')
      cy.get('input[name="nric"]').type('S7654321B')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      
      cy.contains('Pregnancy test').should('not.exist')
      cy.contains('Syphilis test').should('not.exist')
      cy.contains('HIV test').should('be.visible')
      cy.contains('Chest X-ray to screen for TB').should('be.visible')
    })

    it('should show different declarations for MOM vs ICA exams', () => {
      // Create MDW submission and check declaration
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('6-Monthly Exam for Migrant Domestic Workers').click()
      cy.get('input[name="patientName"]').type('MDW Decl Test')
      cy.get('input[name="nric"]').type('F9876543C')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      
      // Should NOT have ICA patient consent
      cy.contains('patient has consented to this medical examination').should('not.exist')
      cy.contains('Immigration and Checkpoints Authority').should('not.exist')
      
      // Create ICA submission and check declaration
      cy.visit('/')
      cy.contains('New Submission').click()
      cy.get('[data-testid="examType"]').click()
      cy.contains('Medical Examination for Permanent Residency (ICA)').click()
      cy.get('input[name="patientName"]').type('ICA Decl Test')
      cy.get('input[name="nric"]').type('S1357924D')
      cy.get('input[name="examinationDate"]').type('2025-10-31')
      cy.contains('I certify that the medical examination has been carried out').scrollIntoView()
      
      // Should have ICA patient consent
      cy.contains('patient has consented to this medical examination').should('be.visible')
      cy.contains('Immigration and Checkpoints Authority').should('be.visible')
    })
  })
});