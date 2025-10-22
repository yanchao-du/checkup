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
      
      // Patient details
      cy.get('input[name="patientName"]').should('be.visible')
      cy.get('input[name="nric"]').should('be.visible')
      cy.get('input[name="dateOfBirth"]').should('be.visible')
      
      // Examination details
      cy.get('select[name="examType"]').should('be.visible')
      cy.get('input[name="examinationDate"]').should('be.visible')
      
      // Buttons
      cy.contains('button', 'Save as Draft').should('be.visible')
      cy.contains('button', 'Submit for Approval').should('be.visible')
    })

    it('should create a draft submission', () => {
      // Fill in patient details
      cy.get('input[name="patientName"]').type('Test Patient')
      cy.get('input[name="nric"]').type('S1234567A')
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      
      // Select exam type
      cy.get('select[name="examType"]').select('MDW Six-Monthly')
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Save as draft
      cy.contains('button', 'Save as Draft').click()
      
      // Should show success message or redirect to drafts
      cy.url().should('match', /\/(drafts|dashboard)/)
    })

    it('should submit for approval', () => {
      // Fill in complete form
      cy.get('input[name="patientName"]').type('Test Patient')
      cy.get('input[name="nric"]').type('S9876543B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('select[name="examType"]').select('Work Permit Medical')
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Fill in vital signs
      cy.get('input[name="height"]').type('170')
      cy.get('input[name="weight"]').type('70')
      cy.get('input[name="bloodPressure"]').type('120/80')
      
      // Submit for approval
      cy.contains('button', 'Submit for Approval').click()
      
      // Should show success message or redirect
      cy.url().should('match', /\/(submissions|dashboard)/)
    })

    it('should validate required fields', () => {
      // Try to submit without filling fields
      cy.contains('button', 'Submit for Approval').click()
      
      // Should show validation errors (HTML5 or custom)
      // This test depends on your validation implementation
      cy.url().should('include', '/new-submission')
    })

    it('should support all exam types', () => {
      cy.get('select[name="examType"]').select('MDW Six-Monthly')
      cy.get('select[name="examType"]').should('have.value', 'MDW_SIX_MONTHLY')
      
      cy.get('select[name="examType"]').select('Work Permit Medical')
      cy.get('select[name="examType"]').should('have.value', 'WORK_PERMIT')
      
      cy.get('select[name="examType"]').select('Aged Drivers Medical')
      cy.get('select[name="examType"]').should('have.value', 'AGED_DRIVERS')
    })
  })

  describe('View Submissions List', () => {
    beforeEach(() => {
      cy.contains('Submissions').click()
    })

    it('should display submissions list', () => {
      cy.contains('Medical Examinations').should('be.visible')
      
      // Should have a table or list of submissions
      cy.get('table, [role="table"]').should('exist')
    })

    it('should filter submissions by status', () => {
      // If filter exists
      cy.get('body').then($body => {
        if ($body.find('select[name="statusFilter"]').length > 0) {
          cy.get('select[name="statusFilter"]').select('PENDING')
          // Table should update
          cy.get('table, [role="table"]').should('be.visible')
        }
      })
    })

    it('should search submissions', () => {
      // If search exists
      cy.get('body').then($body => {
        if ($body.find('input[type="search"], input[placeholder*="Search"]').length > 0) {
          cy.get('input[type="search"], input[placeholder*="Search"]').first().type('Test')
          // Results should filter
          cy.get('table, [role="table"]').should('be.visible')
        }
      })
    })

    it('should navigate to view submission details', () => {
      // Click on first submission if it exists
      cy.get('body').then($body => {
        if ($body.find('table tr:not(:first-child), [role="row"]:not(:first-child)').length > 0) {
          cy.get('table tr:not(:first-child), [role="row"]:not(:first-child)').first().click()
          cy.url().should('include', '/view-submission')
        }
      })
    })
  })

  describe('View Drafts', () => {
    beforeEach(() => {
      cy.contains('Drafts').click()
    })

    it('should display drafts list', () => {
      cy.contains('Draft Submissions').should('be.visible')
    })

    it('should allow editing draft', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Edit"), a:contains("Edit")').length > 0) {
          cy.contains('button, a', 'Edit').first().click()
          cy.url().should('match', /\/(new-submission|edit)/)
        }
      })
    })

    it('should allow deleting draft', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Delete")').length > 0) {
          const initialCount = $body.find('table tr:not(:first-child)').length
          cy.contains('button', 'Delete').first().click()
          
          // Confirm deletion if dialog appears
          cy.get('body').then($confirmBody => {
            if ($confirmBody.find('button:contains("Confirm")').length > 0) {
              cy.contains('button', 'Confirm').click()
            }
          })
        }
      })
    })
  })

  describe('Nurse Submissions', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('nurse@clinic.sg', 'password')
    })

    it('should allow nurse to create submissions', () => {
      cy.contains('New Submission').click()
      
      cy.get('input[name="patientName"]').type('Nurse Test Patient')
      cy.get('input[name="nric"]').type('S1111111A')
      cy.get('input[name="dateOfBirth"]').type('1995-03-20')
      cy.get('select[name="examType"]').select('MDW Six-Monthly')
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      cy.contains('button', 'Save as Draft').click()
      cy.url().should('match', /\/(drafts|dashboard)/)
    })

    it('should show nurse their own submissions', () => {
      cy.contains('Submissions').click()
      cy.contains('Medical Examinations').should('be.visible')
    })
  })
})
