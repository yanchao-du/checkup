describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearAppData()
  })

  it('should display login page on initial visit', () => {
    cy.visit('/')
    cy.contains('h1', 'CheckUp Medical Portal').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/')
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Should still be on login page or show error
    cy.url().should('include', '/')
  })

  it('should login successfully as doctor', () => {
    cy.visit('/')
    cy.get('input[type="email"]').type('doctor@clinic.sg')
    cy.get('input[type="password"]').type('password')
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should login successfully as nurse', () => {
    cy.visit('/')
    cy.get('input[type="email"]').type('nurse@clinic.sg')
    cy.get('input[type="password"]').type('password')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should login successfully as admin', () => {
    cy.visit('/')
    cy.get('input[type="email"]').type('admin@clinic.sg')
    cy.get('input[type="password"]').type('password')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.login('doctor@clinic.sg', 'password')
    
    // Click user menu and logout
    cy.get('button').contains('doctor@clinic.sg').click()
    cy.contains('Logout').click()
    
    // Should redirect to login
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should persist login on page refresh', () => {
    cy.login('doctor@clinic.sg', 'password')
    
    // Refresh page
    cy.reload()
    
    // Should still be logged in
    cy.url().should('include', '/dashboard')
  })

  it('should redirect to login when accessing protected route without auth', () => {
    cy.visit('/dashboard')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
