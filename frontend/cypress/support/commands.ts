// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login to the application
       * @example cy.login('doctor@clinic.sg', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to clear localStorage
       * @example cy.clearLocalStorage()
       */
      clearAppData(): Chainable<void>
    }
  }
}

// Login command - uses backend API to get token and set it in localStorage
Cypress.Commands.add('login', (email: string, password: string) => {
  // Call backend login endpoint directly to get token
  cy.request({
    method: 'POST',
    url: 'http://localhost:3344/v1/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    // Store the token in localStorage
    window.localStorage.setItem('token', response.body.token)
    window.localStorage.setItem('user', JSON.stringify(response.body.user))
  })
  
  // Visit dashboard
  cy.visit('/dashboard')
  cy.url().should('include', '/dashboard')
})

// Logout command
Cypress.Commands.add('logout', () => {
  // Wait for the user menu to appear (app can be slow after API calls)
  cy.get('[data-testid="user-menu"]').should('be.visible').click()
  cy.contains('Logout').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

// Clear app data command
Cypress.Commands.add('clearAppData', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

export {}
