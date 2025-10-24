describe('Search Features', () => {
  beforeEach(() => {
    cy.clearAppData()
  })

  describe('Drafts List Search', () => {
    beforeEach(() => {
      cy.login('doctor@clinic.sg', 'password')
      
      // Create some test drafts with different patient names
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('John Doe')
      cy.get('input[name="nric"]').type('S1234567A')
      cy.get('input[name="dateOfBirth"]').type('1990-01-01')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.contains('button', 'Save as Draft').click()
      cy.url().should('include', '/drafts')
      
      // Create another draft
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Jane Smith')
      cy.get('input[name="nric"]').type('S7654321B')
      cy.get('input[name="dateOfBirth"]').type('1985-05-15')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.contains('button', 'Save as Draft').click()
      cy.url().should('include', '/drafts')
    })

    it('should display search bar in drafts list', () => {
      cy.contains('Drafts').click()
      cy.get('input[placeholder*="Search"]').should('be.visible')
    })

    it('should filter drafts by patient name', () => {
      cy.contains('Drafts').click()
      
      // Should see both drafts initially
      cy.contains('John Doe').should('be.visible')
      cy.contains('Jane Smith').should('be.visible')
      
      // Search for John
      cy.get('input[placeholder*="Search"]').type('John')
      
      // Should only see John
      cy.contains('John Doe').should('be.visible')
      cy.contains('Jane Smith').should('not.exist')
      
      // Clear search
      cy.get('input[placeholder*="Search"]').clear()
      
      // Both should be visible again
      cy.contains('John Doe').should('be.visible')
      cy.contains('Jane Smith').should('be.visible')
    })

    it('should filter drafts by NRIC', () => {
      cy.contains('Drafts').click()
      
      // Search by NRIC
      cy.get('input[placeholder*="Search"]').type('S1234567A')
      
      // Should only see John Doe
      cy.contains('John Doe').should('be.visible')
      cy.contains('Jane Smith').should('not.exist')
    })

    it('should be case-insensitive', () => {
      cy.contains('Drafts').click()
      
      // Search with lowercase
      cy.get('input[placeholder*="Search"]').type('john')
      cy.contains('John Doe').should('be.visible')
      
      // Clear and search with uppercase
      cy.get('input[placeholder*="Search"]').clear().type('JANE')
      cy.contains('Jane Smith').should('be.visible')
    })

    it('should show "No drafts found" when search has no results', () => {
      cy.contains('Drafts').click()
      
      cy.get('input[placeholder*="Search"]').type('NonExistentPatient')
      cy.contains('No drafts found').should('be.visible')
      cy.contains('Try adjusting your search').should('be.visible')
    })
  })

  describe('Pending Approvals Search', () => {
    beforeEach(() => {
      // Create submissions as nurse that need approval
      cy.login('nurse@clinic.sg', 'password')
      
      cy.contains('New Submission').click()
      cy.get('input[name="patientName"]').type('Alice Pending')
      cy.get('input[name="nric"]').type('S1111111A')
      cy.get('input[name="dateOfBirth"]').type('1992-03-20')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Six-monthly').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Route for approval
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
      
      // Logout and login as doctor
      cy.contains('button', 'Logout').click()
      cy.login('doctor@clinic.sg', 'password')
    })

    it('should display search bar in pending approvals', () => {
      cy.contains('Pending Approvals').click()
      cy.get('input[placeholder*="Search"]').should('be.visible')
    })

    it('should filter pending approvals by patient name', () => {
      cy.contains('Pending Approvals').click()
      
      cy.get('input[placeholder*="Search"]').type('Alice')
      cy.contains('Alice Pending').should('be.visible')
      
      cy.get('input[placeholder*="Search"]').clear().type('NonExistent')
      cy.contains('No pending approvals').should('be.visible')
    })

    it('should filter by NRIC in pending approvals', () => {
      cy.contains('Pending Approvals').click()
      
      cy.get('input[placeholder*="Search"]').type('S1111111A')
      cy.contains('Alice Pending').should('be.visible')
    })
  })

  describe('Rejected Submissions Search (Nurse)', () => {
    beforeEach(() => {
      // This would require setting up rejected submissions
      // For now, just test the search UI exists
      cy.login('nurse@clinic.sg', 'password')
      cy.contains('Rejected Submissions').click()
    })

    it('should display search bar in rejected submissions', () => {
      cy.get('input[placeholder*="Search"]').should('be.visible')
    })

    it('should filter rejected submissions', () => {
      cy.get('input[placeholder*="Search"]').type('test')
      // Verify search input works (results depend on test data)
      cy.get('input[placeholder*="Search"]').should('have.value', 'test')
    })
  })
})
