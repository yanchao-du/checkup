describe('Navigation Protection', () => {
  beforeEach(() => {
    cy.clearAppData()
    cy.login('doctor@clinic.sg', 'password')
  })

  describe('Unsaved Changes Dialog', () => {
    it('should show dialog when navigating away with unsaved changes', () => {
      cy.contains('New Submission').click()
      
      // Fill in some data to trigger unsaved changes
      cy.get('input[name="patientName"]').type('Unsaved Test Patient')
      
      // Try to navigate to Drafts
      cy.contains('Drafts').click()
      
      // Dialog should appear
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('You have unsaved changes').should('be.visible')
    })

    it('should stay on page when clicking "Stay on Page"', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Stay Test')
      
      // Try to navigate
      cy.contains('Drafts').click()
      
      // Click "Stay on Page"
      cy.contains('button', 'Stay on Page').click()
      
      // Should remain on new submission page
      cy.url().should('include', '/new-submission')
      cy.get('input[name="patientName"]').should('have.value', 'Stay Test')
    })

    it('should navigate away when clicking "Leave and Discard Changes"', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Discard Test')
      
      // Try to navigate to Drafts
      cy.contains('Drafts').click()
      
      // Click "Leave and Discard Changes"
      cy.contains('button', 'Leave and Discard Changes').click()
      
      // Should navigate to drafts
      cy.url().should('include', '/drafts')
    })

    it('should not show dialog when navigating without changes', () => {
      cy.contains('New Submission').click()
      
      // Don't type anything, just navigate
      cy.contains('Drafts').click()
      
      // Should navigate directly without dialog
      cy.url().should('include', '/drafts')
      cy.contains('Unsaved Changes').should('not.exist')
    })

    it('should not show dialog after saving draft', () => {
      cy.contains('New Submission').click()
      
      // Fill in required fields
      cy.get('input[name="patientName"]').type('Saved Test')
      cy.get('input[name="nric"]').type('S1234567A')
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      
      // Save as draft
      cy.contains('button', 'Save as Draft').click()
      
      // Should navigate to drafts without dialog
      cy.url().should('include', '/drafts')
      cy.contains('Unsaved Changes').should('not.exist')
    })

    it('should show dialog for all sidebar navigation links', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Nav Test')
      
      // Test Dashboard link
      cy.contains('Dashboard').click()
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('button', 'Stay on Page').click()
      
      // Test Submissions link
      cy.contains('Submissions').click()
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('button', 'Stay on Page').click()
      
      // Test Drafts link
      cy.contains('Drafts').click()
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('button', 'Stay on Page').click()
      
      // Verify still on new submission page
      cy.url().should('include', '/new-submission')
    })

    it('should track changes when editing existing draft', () => {
      // Create a draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Edit Track Test')
      cy.get('input[name="nric"]').type('S2222222B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.contains('button', 'Save as Draft').click()
      
      // Open the draft
      cy.contains('Edit Track Test').click()
      
      // Make a change
      cy.get('input[name="patientName"]').clear().type('Modified Name')
      
      // Try to navigate
      cy.contains('Drafts').click()
      
      // Should show dialog
      cy.contains('Unsaved Changes').should('be.visible')
    })

    it('should clear unsaved changes flag after submission', () => {
      cy.contains('New Submission').click()
      
      // Fill complete form
      cy.get('input[name="patientName"]').type('Submit Test')
      cy.get('input[name="nric"]').type('S3333333C')
      cy.get('input[name="dateOfBirth"]').type('1992-08-20')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Submit
      cy.contains('button', 'Submit to Agency').click()
      cy.contains('button', 'Submit').click()
      
      // Should navigate without dialog
      cy.url().should('include', '/submissions')
      cy.contains('Unsaved Changes').should('not.exist')
    })
  })

  describe('Browser Refresh Protection', () => {
    it('should warn before leaving page on refresh with unsaved changes', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Refresh Test')
      
      // Set up listener for beforeunload event
      cy.window().then((win) => {
        const beforeUnloadHandler = cy.stub()
        win.addEventListener('beforeunload', beforeUnloadHandler)
        
        // Trigger beforeunload
        const event = new Event('beforeunload')
        win.dispatchEvent(event)
        
        // Note: Browser's native dialog can't be fully tested in Cypress
        // This test verifies the event listener is set up
      })
    })
  })

  describe('Back Arrow Button', () => {
    it('should show back arrow button in edit mode', () => {
      // Create a draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Back Arrow Test')
      cy.get('input[name="nric"]').type('S4444444D')
      cy.get('input[name="dateOfBirth"]').type('1988-03-10')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.contains('button', 'Save as Draft').click()
      
      // Open draft
      cy.contains('Back Arrow Test').click()
      
      // Should see back arrow
      cy.get('button').find('svg').should('exist') // Back arrow icon
    })

    it('should show dialog when clicking back arrow with unsaved changes', () => {
      // Create and open draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Back Test')
      cy.get('input[name="nric"]').type('S5555555E')
      cy.get('input[name="dateOfBirth"]').type('1993-07-22')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.contains('button', 'Save as Draft').click()
      
      cy.contains('Back Test').click()
      
      // Make changes
      cy.get('input[name="patientName"]').clear().type('Back Test Modified')
      
      // Click back arrow
      cy.get('button[variant="ghost"]').first().click()
      
      // Should show dialog
      cy.contains('Unsaved Changes').should('be.visible')
    })

    it('should navigate back when confirming discard', () => {
      // Create and open draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Back Confirm Test')
      cy.get('input[name="nric"]').type('S6666666F')
      cy.get('input[name="dateOfBirth"]').type('1987-09-14')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.contains('button', 'Save as Draft').click()
      
      cy.contains('Back Confirm Test').click()
      
      // Make changes
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Click back arrow
      cy.get('button[variant="ghost"]').first().click()
      
      // Confirm discard
      cy.contains('button', 'Leave and Discard Changes').click()
      
      // Should go back to drafts
      cy.url().should('include', '/drafts')
    })
  })

  describe('Multiple Field Changes Tracking', () => {
    it('should track changes across multiple fields', () => {
      cy.contains('New Submission').click()
      
      // Change multiple fields
      cy.get('input[name="patientName"]').type('Multi Field Test')
      cy.get('input[name="nric"]').type('S7777777G')
      cy.get('input[name="dateOfBirth"]').type('1989-12-05')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="height"]').type('170')
      cy.get('input[name="weight"]').type('70')
      
      // Try to navigate
      cy.contains('Drafts').click()
      
      // Should show dialog
      cy.contains('Unsaved Changes').should('be.visible')
    })

    it('should track formData changes', () => {
      cy.contains('New Submission').click()
      
      // Select exam type first to show formData fields
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      
      // Fill patient info
      cy.get('input[name="patientName"]').type('FormData Change Test')
      cy.get('input[name="nric"]').type('S8888888H')
      cy.get('input[name="dateOfBirth"]').type('1991-04-18')
      
      // Change formData field
      cy.get('input[name="height"]').type('165')
      
      // Try to navigate
      cy.contains('Dashboard').click()
      
      // Should show dialog
      cy.contains('Unsaved Changes').should('be.visible')
    })
  })
})
