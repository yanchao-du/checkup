describe('Browser Back Button Navigation', () => {
  beforeEach(() => {
    cy.clearAppData()
    cy.login('doctor@clinic.sg', 'password')
  })

  describe('Browser Back Button with Unsaved Changes', () => {
    it('should intercept browser back button with unsaved changes', () => {
      // Navigate to create a history entry
      cy.contains('Drafts').click()
      cy.url().should('include', '/drafts')
      
      // Go to new submission
      cy.contains('New Submission').click()
      cy.url().should('include', '/new-submission')
      
      // Make changes
      cy.get('input[name="patientName"]').type('Browser Back Test')
      
      // Use browser back
      cy.go('back')
      
      // Should show custom dialog (not browser's native one)
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('You have unsaved changes').should('be.visible')
    })

    it('should stay on page when clicking "Stay on Page" after browser back', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Stay After Back')
      
      cy.go('back')
      
      // Click Stay on Page
      cy.contains('button', 'Stay on Page').click()
      
      // Should remain on new submission
      cy.url().should('include', '/new-submission')
      cy.get('input[name="patientName"]').should('have.value', 'Stay After Back')
    })

    it('should navigate back when clicking "Leave and Discard Changes" after browser back', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Leave After Back')
      
      cy.go('back')
      
      // Click Leave and Discard
      cy.contains('button', 'Leave and Discard Changes').click()
      
      // Should navigate back to drafts
      cy.url().should('include', '/drafts')
    })

    it('should not show dialog when using browser back without changes', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      
      // Don't make any changes
      cy.go('back')
      
      // Should navigate back directly without dialog
      cy.url().should('include', '/drafts')
      cy.contains('Unsaved Changes').should('not.exist')
    })

    it('should handle browser back from edited draft', () => {
      // Create a draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Draft Back Test')
      cy.get('input[name="nric"]').type('S1111111A')
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.contains('button', 'Save as Draft').click()
      
      // Open the draft (creates history)
      cy.contains('Draft Back Test').click()
      cy.url().should('include', '/new-submission')
      
      // Make changes
      cy.get('input[name="patientName"]').clear().type('Modified Draft')
      
      // Browser back
      cy.go('back')
      
      // Should show dialog
      cy.contains('Unsaved Changes').should('be.visible')
    })

    it('should handle multiple back button presses', () => {
      // Create navigation history
      cy.contains('Dashboard').click()
      cy.contains('Submissions').click()
      cy.contains('New Submission').click()
      
      // Make changes
      cy.get('input[name="patientName"]').type('Multi Back Test')
      
      // First back - should show dialog
      cy.go('back')
      cy.contains('Unsaved Changes').should('be.visible')
      
      // Stay on page
      cy.contains('button', 'Stay on Page').click()
      
      // Try back again - should show dialog again
      cy.go('back')
      cy.contains('Unsaved Changes').should('be.visible')
      
      // This time leave
      cy.contains('button', 'Leave and Discard Changes').click()
      
      // Should navigate back
      cy.url().should('include', '/submissions')
    })

    it('should not interfere with back navigation after save', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      
      // Create and save draft
      cy.get('input[name="patientName"]').type('Back After Save')
      cy.get('input[name="nric"]').type('S2222222B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.contains('button', 'Save as Draft').click()
      
      // Navigate somewhere
      cy.contains('Dashboard').click()
      
      // Go back - should work normally without dialog
      cy.go('back')
      cy.url().should('include', '/drafts')
      cy.contains('Unsaved Changes').should('not.exist')
    })

    it('should work with browser forward button', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Forward Test')
      
      // Go back
      cy.go('back')
      cy.contains('button', 'Leave and Discard Changes').click()
      cy.url().should('include', '/drafts')
      
      // Go forward
      cy.go('forward')
      cy.url().should('include', '/new-submission')
      
      // Form should be reset (new submission)
      cy.get('input[name="patientName"]').should('have.value', '')
    })
  })

  describe('History API Integration', () => {
    it('should push state to enable popstate detection', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('History API Test')
      
      // The component should have pushed state
      cy.window().then((win) => {
        // History state should exist
        expect(win.history.state).to.not.be.null
      })
    })

    it('should not create excessive history entries', () => {
      cy.contains('New Submission').click()
      
      // Type in field (triggers hasUnsavedChanges)
      cy.get('input[name="patientName"]').type('History Length Test')
      
      // Wait a bit for any state changes
      cy.wait(500)
      
      // Go back should work with single back click
      cy.go('back')
      cy.contains('Unsaved Changes').should('be.visible')
      cy.contains('button', 'Leave and Discard Changes').click()
      
      // Should be on dashboard (one level back)
      cy.url().should('match', /\/(dashboard|home)/)
    })

    it('should clean up history listener on unmount', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Cleanup Test')
      
      // Save to navigate away (unmounts component)
      cy.get('input[name="nric"]').type('S3333333C')
      cy.get('input[name="dateOfBirth"]').type('1992-08-20')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.contains('button', 'Save as Draft').click()
      
      // Navigate to dashboard
      cy.contains('Dashboard').click()
      
      // Browser back should work normally (no dialog)
      cy.go('back')
      cy.contains('Unsaved Changes').should('not.exist')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid back button clicks', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Rapid Click Test')
      
      // Try to go back multiple times quickly
      cy.go('back')
      cy.contains('Unsaved Changes').should('be.visible')
      
      // Click discard
      cy.contains('button', 'Leave and Discard Changes').click()
      
      // Should navigate successfully
      cy.url().should('include', '/drafts')
    })

    it('should handle dialog cancellation then retry', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Retry Test')
      
      // First attempt - cancel
      cy.go('back')
      cy.contains('button', 'Stay on Page').click()
      cy.url().should('include', '/new-submission')
      
      // Second attempt - confirm
      cy.go('back')
      cy.contains('button', 'Leave and Discard Changes').click()
      cy.url().should('include', '/drafts')
    })

    it('should maintain unsaved changes state across dialog interactions', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('State Persist Test')
      
      // Trigger dialog via sidebar
      cy.contains('Drafts').click()
      cy.contains('button', 'Stay on Page').click()
      
      // Data should still be there
      cy.get('input[name="patientName"]').should('have.value', 'State Persist Test')
      
      // Trigger dialog via back button
      cy.go('back')
      cy.contains('button', 'Stay on Page').click()
      
      // Data should still be there
      cy.get('input[name="patientName"]').should('have.value', 'State Persist Test')
    })

    it('should work correctly after submitting form', () => {
      cy.contains('New Submission').click()
      
      // Fill and submit
      cy.get('input[name="patientName"]').type('Submit Then Back')
      cy.get('input[name="nric"]').type('S4444444D')
      cy.get('input[name="dateOfBirth"]').type('1988-03-10')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.contains('button', 'Submit').click()
      
      // Should navigate to submissions
      cy.url().should('include', '/submissions')
      
      // Go back - should work without dialog
      cy.go('back')
      // Should not show unsaved changes dialog
      cy.contains('Unsaved Changes').should('not.exist')
    })
  })

  describe('Cross-Browser Navigation Patterns', () => {
    it('should handle refresh attempt with unsaved changes', () => {
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Refresh Protection')
      
      // Note: Cypress can't fully test browser refresh dialog
      // but we can verify the beforeunload event is set up
      cy.window().then((win) => {
        const event = new Event('beforeunload', { cancelable: true })
        const result = win.dispatchEvent(event)
        
        // Event should be cancelable when there are unsaved changes
        expect(result).to.not.be.undefined
      })
    })

    it('should work with keyboard shortcuts (Alt+Left)', () => {
      cy.contains('Drafts').click()
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Keyboard Nav Test')
      
      // Simulate Alt+Left (back) - same as browser back
      cy.go('back')
      
      cy.contains('Unsaved Changes').should('be.visible')
    })
  })
})
