describe('Form Reset Features', () => {
  beforeEach(() => {
    cy.clearAppData()
    cy.login('doctor@clinic.sg', 'password')
  })

  describe('New Submission Form Reset', () => {
    it('should show empty form when clicking New Submission', () => {
      cy.contains('New Submission').click()
      
      // Verify all fields are empty
      cy.get('input[name="patientName"]').should('have.value', '')
      cy.get('input[name="nric"]').should('have.value', '')
      cy.get('input[name="dateOfBirth"]').should('have.value', '')
      cy.get('input[name="examinationDate"]').should('have.value', '')
      cy.get('input[name="height"]').should('have.value', '')
      cy.get('input[name="weight"]').should('have.value', '')
      cy.get('[data-testid="examType"]').should('contain', 'Select exam type')
    })

    it('should reset form when navigating from draft to New Submission', () => {
      // First, create and open a draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Draft Patient')
      cy.get('input[name="nric"]').type('S9999999Z')
      cy.get('input[name="dateOfBirth"]').type('1988-08-08')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.get('input[name="height"]').type('175')
      cy.get('input[name="weight"]').type('75')
      
      // Save as draft
      cy.contains('button', 'Save as Draft').click()
      cy.url().should('include', '/drafts')
      
      // Open the draft
      cy.get('table').within(() => {
        cy.contains('Draft Patient').should('be.visible')
        // Click on the row or edit button
        cy.contains('Draft Patient').click()
      })
      
      // Verify draft data is loaded
      cy.url().should('include', '/new-submission')
      cy.contains('h1', 'Edit Submission').should('be.visible')
      cy.get('input[name="patientName"]').should('have.value', 'Draft Patient')
      cy.get('input[name="nric"]').should('have.value', 'S9999999Z')
      cy.get('input[name="height"]').should('have.value', '175')
      
      // Now click "New Submission" in sidebar
      cy.contains('New Submission').click()
      
      // Form should be completely reset
      cy.contains('h1', 'New Medical Examination').should('be.visible')
      cy.get('input[name="patientName"]').should('have.value', '')
      cy.get('input[name="nric"]').should('have.value', '')
      cy.get('input[name="dateOfBirth"]').should('have.value', '')
      cy.get('input[name="examinationDate"]').should('have.value', '')
      cy.get('input[name="height"]').should('have.value', '')
      cy.get('input[name="weight"]').should('have.value', '')
      cy.get('[data-testid="examType"]').should('contain', 'Select exam type')
    })

    it('should show "New Medical Examination" title for new submission', () => {
      cy.contains('New Submission').click()
      cy.contains('h1', 'New Medical Examination').should('be.visible')
    })

    it('should show "Edit Submission" title when editing draft', () => {
      // Create a draft first
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Edit Test Patient')
      cy.get('input[name="nric"]').type('S8888888Y')
      cy.get('input[name="dateOfBirth"]').type('1995-12-25')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.contains('button', 'Save as Draft').click()
      
      // Open the draft
      cy.contains('Drafts').click()
      cy.contains('Edit Test Patient').click()
      
      // Should show Edit title
      cy.contains('h1', 'Edit Submission').should('be.visible')
    })

    it('should maintain exam type selection when switching exam types', () => {
      cy.contains('New Submission').click()
      
      // Select first exam type
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('[data-testid="examType"]').should('contain', 'Six-monthly')
      
      // Switch to different exam type
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('[data-testid="examType"]').should('contain', 'Work Permit')
      
      // Previous selection should be replaced
      cy.get('[data-testid="examType"]').should('not.contain', 'Six-monthly')
    })

    it('should reset form data object when creating new submission', () => {
      // Create draft with form data
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('FormData Test')
      cy.get('input[name="nric"]').type('S7777777X')
      cy.get('input[name="dateOfBirth"]').type('1991-11-11')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Fill additional fields
      cy.get('input[name="height"]').type('180')
      cy.get('input[name="weight"]').type('80')
      cy.get('input[name="bloodPressure"]').type('130/85')
      
      cy.contains('button', 'Save as Draft').click()
      
      // Open draft
      cy.contains('Drafts').click()
      cy.contains('FormData Test').click()
      
      // Verify data loaded
      cy.get('input[name="bloodPressure"]').should('have.value', '130/85')
      
      // Click New Submission
      cy.contains('New Submission').click()
      
      // All form data should be reset
      cy.get('input[name="height"]').should('have.value', '')
      cy.get('input[name="weight"]').should('have.value', '')
      cy.get('input[name="bloodPressure"]').should('have.value', '')
    })
  })
})
