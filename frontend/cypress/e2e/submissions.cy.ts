describe('Medical Submissions', () => {
  beforeEach(() => {
    cy.clearAppData()
    cy.login('doctor@clinic.sg', 'password')
  })

  describe('Create New Submission', () => {
    beforeEach(() => {
      cy.contains('New Submission').click()
    })

    it('should display new submission form with all required fields', () => {
      cy.contains('h1', 'New Medical Examination').should('be.visible')
      
      cy.get('input[name="patientName"]').should('be.visible')
      cy.get('input[name="nric"]').should('be.visible')
      cy.get('input[name="dateOfBirth"]').should('be.visible')
      cy.get('[data-testid="examType"]').should('be.visible')
      cy.get('input[name="examinationDate"]').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('input[name="patientName"]').type('Test Patient')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('input[name="nric"]').type('S1234567A')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      
      cy.contains('button', 'Submit to Agency').should('not.be.disabled')
    })

    it('should save as draft without examination date', () => {
      cy.get('input[name="patientName"]').type('Draft Patient')
      cy.get('input[name="nric"]').type('S9876543B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      
      cy.contains('button', 'Save as Draft').click()
      
      cy.url().should('include', '/drafts')
      cy.contains('Draft Patient').should('be.visible')
    })

    it('should submit complete medical exam to agency', () => {
      cy.get('input[name="patientName"]').type('Complete Patient')
      cy.get('input[name="nric"]').type('S1111111C')
      cy.get('input[name="dateOfBirth"]').type('1992-08-20')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.get('input[name="height"]').type('170')
      cy.get('input[name="weight"]').type('70')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      cy.contains('Complete Patient').should('be.visible')
    })

    it('should create FMW submission with test results only', () => {
      cy.get('input[name="patientName"]').type('FMW Test Patient')
      cy.get('input[name="nric"]').type('S9988776D')
      cy.get('input[name="dateOfBirth"]').type('1995-03-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('FMW').click()
      cy.get('input[name="examinationDate"]').type('2024-10-30')
      
      // FMW should NOT require height/weight
      cy.get('input[name="height"]').should('not.exist')
      cy.get('input[name="weight"]').should('not.exist')
      
      // Should have test result checkboxes
      cy.get('input[type="checkbox"][name="pregnancyTestPositive"]').should('be.visible')
      cy.get('input[type="checkbox"][name="syphilisTestPositive"]').should('be.visible')
      cy.get('input[type="checkbox"][name="hivTestPositive"]').should('be.visible')
      cy.get('input[type="checkbox"][name="chestXrayPositive"]').should('be.visible')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      cy.contains('FMW Test Patient').should('be.visible')
    })
  })

  describe('Drafts Management', () => {
    beforeEach(() => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Draft Patient')
      cy.get('input[name="nric"]').type('S2222222D')
      cy.get('input[name="dateOfBirth"]').type('1988-03-10')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.contains('button', 'Save as Draft').click()
      cy.url().should('include', '/drafts')
    })

    it('should display drafts list', () => {
      cy.contains('Drafts').should('be.visible')
      cy.contains('Draft Patient').should('be.visible')
    })

    it('should edit existing draft', () => {
      cy.contains('Draft Patient').click()
      
      cy.contains('h1', 'Edit Submission').should('be.visible')
      
      cy.get('input[name="patientName"]').should('have.value', 'Draft Patient')
      cy.get('input[name="nric"]').should('have.value', 'S2222222D')
      cy.get('input[name="dateOfBirth"]').should('have.value', '1988-03-10')
      
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Save as Draft').click()
      
      cy.url().should('include', '/drafts')
    })

    it('should submit draft to agency', () => {
      cy.contains('Draft Patient').click()
      
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.get('input[name="height"]').type('175')
      cy.get('input[name="weight"]').type('75')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      cy.contains('Draft Patient').should('be.visible')
      
      cy.contains('Drafts').click()
      cy.contains('Draft Patient').should('not.exist')
    })
  })

  describe('Submissions List', () => {
    beforeEach(() => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Submitted Patient')
      cy.get('input[name="nric"]').type('S3333333E')
      cy.get('input[name="dateOfBirth"]').type('1990-06-10')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      cy.url().should('include', '/submissions')
    })

    it('should display submissions list', () => {
      cy.contains('Submissions').should('be.visible')
      cy.contains('Submitted Patient').should('be.visible')
    })

    it('should show submitted status for doctor submissions', () => {
      cy.contains('Submitted Patient').parents('tr').within(() => {
        cy.contains('Submitted').should('be.visible')
      })
    })

    it('should display patient details in submissions list', () => {
      cy.contains('Submitted Patient').should('be.visible')
      cy.contains('S3333333E').should('be.visible')
    })
  })

  describe('Nurse Workflow', () => {
    beforeEach(() => {
      cy.contains('button', 'Logout').click()
      cy.login('nurse@clinic.sg', 'password')
    })

    it('should allow nurse to route for approval', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Nurse Submission')
      cy.get('input[name="nric"]').type('S4444444F')
      cy.get('input[name="dateOfBirth"]').type('1987-09-14')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit for Approval').click()
      
      // Wait for modal and select doctor
      cy.contains('Route for Approval?').should('be.visible')
      cy.get('[data-testid="assignedDoctor"]').should('be.visible')
      cy.get('[data-testid="assignedDoctor"]').click()
      
      // Select first doctor from dropdown
      cy.get('[role="option"]').first().click()
      
      // Verify doctor is selected (trigger should show doctor name, not placeholder)
      cy.get('[data-testid="assignedDoctor"]').should('not.contain', 'Select a doctor')
      
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      
      cy.contains('Nurse Submission').parents('tr').within(() => {
        cy.contains('Pending').should('be.visible')
      })
    })

    it('nurse should see "Submit for Approval" button', () => {
      cy.contains('New Submission').click()
      cy.contains('button', 'Submit for Approval').should('be.visible')
      cy.contains('button', 'Submit to Agency').should('not.exist')
    })

    it('should save nurse draft', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Nurse Draft')
      cy.get('input[name="nric"]').type('S5555555G')
      cy.get('input[name="dateOfBirth"]').type('1991-04-18')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      
      cy.contains('button', 'Save as Draft').click()
      
      cy.url().should('include', '/drafts')
      cy.contains('Nurse Draft').should('be.visible')
    })
  })

  describe('Form Reset', () => {
    it('should reset form when navigating from draft to new submission', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Draft To Reset')
      cy.get('input[name="nric"]').type('S6666666H')
      cy.get('input[name="dateOfBirth"]').type('1994-11-30')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.contains('button', 'Save as Draft').click()
      
      cy.contains('Draft To Reset').click()
      cy.get('input[name="patientName"]').should('have.value', 'Draft To Reset')
      
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').should('have.value', '')
      cy.get('input[name="nric"]').should('have.value', '')
      cy.contains('h1', 'New Medical Examination').should('be.visible')
    })
  })

  describe('Unsaved Changes Dialog', () => {
    it('should show dialog when navigating with unsaved changes', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Unsaved Changes Test')
      
      cy.contains('Drafts').click()
      
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('You have unsaved changes').should('be.visible')
    })

    it('should stay on page when choosing "Stay on Page"', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Stay Test')
      
      cy.contains('Drafts').click()
      
      cy.contains('button', 'Stay on Page').click()
      
      cy.url().should('include', '/new-submission')
      cy.get('input[name="patientName"]').should('have.value', 'Stay Test')
    })

    it('should navigate when choosing "Leave and Discard Changes"', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Leave Test')
      
      cy.contains('Drafts').click()
      
      cy.contains('button', 'Leave and Discard Changes').click()
      
      cy.url().should('include', '/drafts')
    })

    it('should not show dialog after saving draft', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Saved Draft')
      cy.get('input[name="nric"]').type('S7777777I')
      cy.get('input[name="dateOfBirth"]').type('1986-02-14')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      
      cy.contains('button', 'Save as Draft').click()
      
      cy.contains('Dashboard').click()
      cy.contains('Unsaved Changes').should('not.exist')
      cy.url().should('include', '/dashboard')
    })

    it('should not show dialog after submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Submitted Test')
      cy.get('input[name="nric"]').type('S8888888J')
      cy.get('input[name="dateOfBirth"]').type('1995-08-25')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.contains('Dashboard').click()
      cy.contains('Unsaved Changes').should('not.exist')
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('John Doe')
      cy.get('input[name="nric"]').type('S1111111A')
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Jane Smith')
      cy.get('input[name="nric"]').type('S2222222B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
    })

    it('should filter submissions by patient name', () => {
      cy.contains('Submissions').click()
      
      cy.contains('John Doe').should('be.visible')
      cy.contains('Jane Smith').should('be.visible')
      
      cy.get('input[placeholder*="Search"]').type('John')
      
      cy.contains('John Doe').should('be.visible')
      cy.contains('Jane Smith').should('not.exist')
    })

    it('should filter submissions by NRIC', () => {
      cy.contains('Submissions').click()
      
      cy.get('input[placeholder*="Search"]').type('S2222222B')
      
      cy.contains('Jane Smith').should('be.visible')
      cy.contains('John Doe').should('not.exist')
    })
  })

  describe('Draft to Submission Movement', () => {
    it('should move draft to submissions when submitted', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Draft Movement Test')
      cy.get('input[name="nric"]').type('S9999999K')
      cy.get('input[name="dateOfBirth"]').type('1993-07-22')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.contains('button', 'Save as Draft').click()
      
      cy.contains('Drafts').click()
      cy.contains('Draft Movement Test').should('be.visible')
      
      cy.contains('Draft Movement Test').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      cy.contains('Draft Movement Test').should('be.visible')
      
      cy.contains('Drafts').click()
      cy.contains('Draft Movement Test').should('not.exist')
    })
  })
})
