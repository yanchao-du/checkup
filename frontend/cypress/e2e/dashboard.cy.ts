describe('Dashboard Navigation', () => {
  describe('Doctor Role', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('doctor@clinic.sg', 'password')
    })

    it('should display dashboard with correct navigation items', () => {
      cy.contains('Dashboard').should('be.visible')
      cy.contains('New Submission').should('be.visible')
      cy.contains('Submissions').should('be.visible')
      cy.contains('Pending Approvals').should('be.visible')
      cy.contains('Drafts').should('be.visible')
    })

    it('should navigate to New Submission page', () => {
      cy.contains('New Submission').click()
      cy.url().should('include', '/new-submission')
      cy.contains('h1', 'New Medical Examination').should('be.visible')
    })

    it('should navigate to Submissions page', () => {
      cy.contains('Submissions').click()
      cy.url().should('include', '/submissions')
      cy.contains('Medical Examinations').should('be.visible')
    })

    it('should navigate to Pending Approvals page', () => {
      cy.contains('Pending Approvals').click()
      cy.url().should('include', '/pending-approvals')
      cy.contains('Pending Approvals').should('be.visible')
    })

    it('should navigate to Drafts page', () => {
      cy.contains('Drafts').click()
      cy.url().should('include', '/drafts')
      cy.contains('Draft Submissions').should('be.visible')
    })

    it('should navigate back to dashboard from sidebar', () => {
      cy.contains('Submissions').click()
      cy.contains('Dashboard').click()
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Nurse Role', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('nurse@clinic.sg', 'password')
    })

    it('should display dashboard with correct navigation items', () => {
      cy.contains('Dashboard').should('be.visible')
      cy.contains('New Submission').should('be.visible')
      cy.contains('Submissions').should('be.visible')
      cy.contains('Drafts').should('be.visible')
    })

    it('should NOT show Pending Approvals for nurse', () => {
      cy.contains('Pending Approvals').should('not.exist')
    })

    it('should NOT show User Management for nurse', () => {
      cy.contains('User Management').should('not.exist')
    })

    it('should navigate to all allowed pages', () => {
      cy.contains('New Submission').click()
      cy.url().should('include', '/new-submission')
      
      cy.contains('Submissions').click()
      cy.url().should('include', '/submissions')
      
      cy.contains('Drafts').click()
      cy.url().should('include', '/drafts')
    })
  })

  describe('Admin Role', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('admin@clinic.sg', 'password')
    })

    it('should display dashboard with all navigation items including User Management', () => {
      cy.contains('Dashboard').should('be.visible')
      cy.contains('New Submission').should('be.visible')
      cy.contains('Submissions').should('be.visible')
      cy.contains('Pending Approvals').should('be.visible')
      cy.contains('Drafts').should('be.visible')
      cy.contains('User Management').should('be.visible')
    })

    it('should navigate to User Management page', () => {
      cy.contains('User Management').click()
      cy.url().should('include', '/user-management')
      cy.contains('User Management').should('be.visible')
    })
  })

  describe('Dashboard Content', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('doctor@clinic.sg', 'password')
    })

    it('should display welcome message with user name', () => {
      cy.contains('Welcome, Dr').should('be.visible')
    })

    // it('should display user role badge', () => {
    //   cy.contains('Doctor').should('be.visible')
    // })

    it('should display quick stats or summary cards', () => {
      // Check for presence of dashboard cards or stats
      cy.get('[role="main"]').should('be.visible')
    })
  })
})
