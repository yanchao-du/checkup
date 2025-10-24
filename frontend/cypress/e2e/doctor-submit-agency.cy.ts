describe('Doctor Submit to Agency', () => {
  beforeEach(() => {
    cy.clearAppData()
    cy.login('doctor@clinic.sg', 'password')
  })

  describe('Create New Submission and Submit', () => {
    it('should submit new medical exam directly to agency', () => {
      cy.contains('New Submission').click()
      
      // Fill complete form
      cy.get('input[name="patientName"]').type('Direct Submit Patient')
      cy.get('input[name="nric"]').type('S1234567A')
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Fill vital signs
      cy.get('input[name="height"]').type('170')
      cy.get('input[name="weight"]').type('70')
      
      // Submit to agency
      cy.contains('button', 'Submit to Agency').click()
      
      // Confirm submission
      cy.contains('This will submit the medical exam results to the relevant government agency').should('be.visible')
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Should show success message
      cy.contains('Medical exam submitted successfully', { timeout: 10000 }).should('be.visible')
      
      // Should navigate to submissions
      cy.url().should('include', '/submissions')
    })

    it('should NOT appear in drafts after submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Not In Drafts Patient')
      cy.get('input[name="nric"]').type('S2222222B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Wait for navigation
      cy.url().should('include', '/submissions')
      
      // Check drafts - should not be there
      cy.contains('Drafts').click()
      cy.contains('Not In Drafts Patient').should('not.exist')
    })

    it('should appear in submissions list with Submitted status', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Check Status Patient')
      cy.get('input[name="nric"]').type('S3333333C')
      cy.get('input[name="dateOfBirth"]').type('1992-08-20')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      
      // Should see the submission
      cy.contains('Check Status Patient').should('be.visible')
      
      // Should have Submitted status badge
      cy.contains('Check Status Patient').parents('tr').within(() => {
        cy.contains('Submitted').should('be.visible')
      })
    })

    it('should validate required fields before submission', () => {
      cy.contains('New Submission').click()
      
      // Try to submit without filling required fields
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      // Fill only some fields
      cy.get('input[name="patientName"]').type('Incomplete Patient')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      // Fill all required fields
      cy.get('input[name="nric"]').type('S4444444D')
      cy.get('input[name="dateOfBirth"]').type('1988-03-10')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      
      // Now should be enabled
      cy.contains('button', 'Submit to Agency').should('not.be.disabled')
    })
  })

  describe('Edit Draft and Submit', () => {
    beforeEach(() => {
      // Create a draft first
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Draft To Submit')
      cy.get('input[name="nric"]').type('S5555555E')
      cy.get('input[name="dateOfBirth"]').type('1993-07-22')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      
      // Save as draft (without examination date)
      cy.contains('button', 'Save as Draft').click()
      cy.url().should('include', '/drafts')
    })

    it('should move draft to submissions when submitted', () => {
      // Verify draft exists
      cy.contains('Draft To Submit').should('be.visible')
      
      // Open the draft
      cy.contains('Draft To Submit').click()
      cy.url().should('include', '/new-submission')
      
      // Complete the form
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.get('input[name="height"]').type('175')
      cy.get('input[name="weight"]').type('75')
      
      // Submit to agency
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Should navigate to submissions
      cy.url().should('include', '/submissions')
      
      // Check that it's in submissions
      cy.contains('Draft To Submit').should('be.visible')
      
      // Check that it's NOT in drafts
      cy.contains('Drafts').click()
      cy.contains('Draft To Submit').should('not.exist')
    })

    it('should change status from draft to submitted', () => {
      cy.contains('Draft To Submit').click()
      
      // Complete and submit
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      
      // Should have Submitted status
      cy.contains('Draft To Submit').parents('tr').within(() => {
        cy.contains('Submitted').should('be.visible')
      })
    })

    it('should preserve data when editing draft before submission', () => {
      cy.contains('Draft To Submit').click()
      
      // Verify data is loaded
      cy.get('input[name="patientName"]').should('have.value', 'Draft To Submit')
      cy.get('input[name="nric"]').should('have.value', 'S5555555E')
      cy.get('input[name="dateOfBirth"]').should('have.value', '1993-07-22')
      
      // Add examination date
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Submit
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Verify in submissions
      cy.url().should('include', '/submissions')
      cy.contains('Draft To Submit').should('be.visible')
    })

    it('should show "Edit Submission" title when editing draft', () => {
      cy.contains('Draft To Submit').click()
      cy.contains('h1', 'Edit Submission').should('be.visible')
    })

    it('should allow multiple edits before final submission', () => {
      // Edit 1: Add exam date
      cy.contains('Draft To Submit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      cy.contains('button', 'Save as Draft').click()
      
      // Edit 2: Add height/weight
      cy.contains('Draft To Submit').click()
      cy.get('input[name="height"]').type('180')
      cy.get('input[name="weight"]').type('80')
      cy.contains('button', 'Save as Draft').click()
      
      // Edit 3: Final submission
      cy.contains('Draft To Submit').click()
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Should be submitted
      cy.url().should('include', '/submissions')
      cy.contains('Draft To Submit').should('be.visible')
    })
  })

  describe('Doctor vs Nurse Workflows', () => {
    it('doctor should have "Submit to Agency" button', () => {
      cy.contains('New Submission').click()
      cy.contains('button', 'Submit to Agency').should('be.visible')
      cy.contains('button', 'Submit for Approval').should('not.exist')
    })

    it('doctor submission should not require approval', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('No Approval Needed')
      cy.get('input[name="nric"]').type('S6666666F')
      cy.get('input[name="dateOfBirth"]').type('1987-09-14')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      
      // Should have Submitted status, not Pending Approval
      cy.contains('No Approval Needed').parents('tr').within(() => {
        cy.contains('Submitted').should('be.visible')
        cy.contains('Pending').should('not.exist')
      })
    })

    it('doctor should see their own submissions', () => {
      // Create and submit
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Doctor Own Submission')
      cy.get('input[name="nric"]').type('S7777777G')
      cy.get('input[name="dateOfBirth"]').type('1989-12-05')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Navigate to submissions
      cy.contains('Submissions').click()
      
      // Should see own submission
      cy.contains('Doctor Own Submission').should('be.visible')
    })
  })

  describe('Submission Confirmation Dialog', () => {
    it('should show confirmation dialog before submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Confirm Dialog Test')
      cy.get('input[name="nric"]').type('S8888888H')
      cy.get('input[name="dateOfBirth"]').type('1991-04-18')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      
      // Should show dialog
      cy.contains('Submit Medical Exam?').should('be.visible')
      cy.contains('This will submit the medical exam results to the relevant government agency').should('be.visible')
      cy.contains('This action cannot be undone').should('be.visible')
    })

    it('should allow canceling submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Cancel Submit Test')
      cy.get('input[name="nric"]').type('S9999999I')
      cy.get('input[name="dateOfBirth"]').type('1994-11-30')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      
      // Cancel
      cy.contains('button', 'Cancel').click()
      
      // Should stay on new submission page
      cy.url().should('include', '/new-submission')
      cy.get('input[name="patientName"]').should('have.value', 'Cancel Submit Test')
    })

    it('should proceed with submission when confirmed', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Confirm Submit Test')
      cy.get('input[name="nric"]').type('S0000000J')
      cy.get('input[name="dateOfBirth"]').type('1986-02-14')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      
      // Confirm
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      // Should navigate to submissions
      cy.url().should('include', '/submissions')
      cy.contains('Confirm Submit Test').should('be.visible')
    })
  })

  describe('Form Validation', () => {
    it('should require examination date for submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Need Exam Date')
      cy.get('input[name="nric"]').type('S1111111K')
      cy.get('input[name="dateOfBirth"]').type('1995-08-25')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      
      // Don't fill examination date
      
      // Submit button should be disabled
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      // Fill examination date
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Now should be enabled
      cy.contains('button', 'Submit to Agency').should('not.be.disabled')
    })

    it('should require all mandatory patient fields', () => {
      cy.contains('New Submission').click()
      
      // Submit should be disabled initially
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      // Fill fields one by one
      cy.get('input[name="patientName"]').type('Validation Test')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('input[name="nric"]').type('S2222222L')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('input[name="dateOfBirth"]').type('1990-06-10')
      cy.contains('button', 'Submit to Agency').should('be.disabled')
      
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      
      // Should be enabled now
      cy.contains('button', 'Submit to Agency').should('not.be.disabled')
    })
  })

  describe('Post-Submission State', () => {
    it('should clear unsaved changes flag after submission', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Clear Flag Test')
      cy.get('input[name="nric"]').type('S3333333M')
      cy.get('input[name="dateOfBirth"]').type('1992-03-18')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Aged Drivers').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      
      // Navigate away - should not show unsaved changes dialog
      cy.contains('Dashboard').click()
      cy.contains('Unsaved Changes').should('not.exist')
    })

    it('should not allow editing submitted submission', () => {
      // Create and submit
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('No Edit After Submit')
      cy.get('input[name="nric"]').type('S4444444N')
      cy.get('input[name="dateOfBirth"]').type('1987-07-07')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Submit to Agency').click()
      cy.get('[data-testid="confirm-submit-button"]').click()
      
      cy.url().should('include', '/submissions')
      
      // Try to click on submission (if clickable)
      cy.get('body').then($body => {
        if ($body.find('td:contains("No Edit After Submit")').length > 0) {
          // Should not navigate to edit page
          // Most likely opens view-only page
          cy.contains('No Edit After Submit').click()
          cy.url().should('not.include', '/new-submission')
        }
      })
    })
  })
})
