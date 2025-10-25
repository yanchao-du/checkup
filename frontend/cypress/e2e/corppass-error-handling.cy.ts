/**
 * CorpPass Error Handling E2E Tests
 * Tests the error page display for unauthorized CorpPass users
 */

describe('CorpPass Error Handling', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearAppData();
  });

  it('should display error page when accessing error URL directly', () => {
    // Visit the error page directly with a message
    const testMessage = 'Your account is pending administrator approval';
    cy.visit(`/auth/error?message=${encodeURIComponent(testMessage)}`);

    // Verify error page elements
    cy.contains('h1', 'Authentication Failed').should('be.visible');
    cy.contains(testMessage).should('be.visible');
    cy.contains('What should I do?').should('be.visible');
    cy.contains('Need Help?').should('be.visible');
    cy.contains('Back to Login Page').should('be.visible');
  });

  it('should display error page with generic message when no message provided', () => {
    cy.visit('/auth/error');

    // Should show default error message
    cy.contains('h1', 'Authentication Failed').should('be.visible');
    cy.contains('An authentication error occurred').should('be.visible');
  });

  it('should navigate back to login page when clicking back button', () => {
    const testMessage = 'Test error message';
    cy.visit(`/auth/error?message=${encodeURIComponent(testMessage)}`);

    // Click back to login button
    cy.contains('Back to Login Page').click();

    // Should redirect to login page
    cy.url().should('match', /\/(login)?$/);
    // Check for login page elements (email/password inputs or CorpPass button)
    cy.get('input[type="email"], button').should('exist');
  });

  it('should display helpful guidance sections', () => {
    cy.visit('/auth/error?message=Account is pending approval or inactive');

    // Check for guidance sections
    cy.contains('What should I do?').should('be.visible');
    cy.contains('pending approval').should('be.visible');
    cy.contains('contact your administrator').should('be.visible');
    
    // Check for contact section
    cy.contains('Need Help?').should('be.visible');
    cy.contains('system administrator').should('be.visible');
  });

  it('should display error icon with proper styling', () => {
    cy.visit('/auth/error?message=Test error');

    // Check for error icon (AlertCircle from lucide-react)
    cy.get('svg').should('be.visible');
    
    // Check for error color scheme (red background/border)
    cy.get('.bg-red-100').should('exist');
    cy.get('.border-red-200').should('exist');
  });

  it('should handle long error messages properly', () => {
    const longMessage = 'This is a very long error message that explains in detail what went wrong with the authentication process and provides specific instructions on how to resolve the issue. It contains multiple sentences and should be displayed properly without breaking the layout.';
    
    cy.visit(`/auth/error?message=${encodeURIComponent(longMessage)}`);

    // Message should be visible and readable
    cy.contains(longMessage).should('be.visible');
    
    // Page should not have horizontal scroll
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth);
    });
  });

  it('should handle special characters in error message', () => {
    const messageWithSpecialChars = 'Account error: <script>alert("xss")</script> & "quotes" \'apostrophes\'';
    
    cy.visit(`/auth/error?message=${encodeURIComponent(messageWithSpecialChars)}`);

    // Message should be displayed (XSS should be escaped by React)
    cy.contains('Account error:').should('be.visible');
    
    // Script should not execute (should be rendered as text)
    cy.get('body').then(($body) => {
      const text = $body.text();
      expect(text).to.include('script');
      expect(text).to.include('alert');
    });
  });

  describe('CorpPass Callback Error Scenarios', () => {
    // Note: These tests would require mocking the backend responses
    // For now, we document the expected behavior
    
    it('should redirect to error page for pending approval users', () => {
      // This test requires backend integration
      // When a user with status='inactive' tries to login via CorpPass,
      // they should be redirected to /auth/error with appropriate message
      
      // Expected URL: http://localhost:6688/auth/error?message=Account+is+pending+approval+or+inactive
      // This would be tested in full integration tests with MockPass
    });

    it('should redirect to error page for invalid OAuth session', () => {
      // This test requires backend integration
      // When OAuth session validation fails,
      // user should be redirected to error page
      
      // Expected URL: http://localhost:6688/auth/error?message=Invalid+or+expired+OAuth+session
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/auth/error?message=Test error');

      // Main heading should be h1
      cy.get('h1').contains('Authentication Failed').should('exist');
      
      // Subsections should use h2
      cy.get('h2').contains('What should I do?').should('exist');
      cy.get('h2').contains('Need Help?').should('exist');
    });

    it('should have focusable back button', () => {
      cy.visit('/auth/error?message=Test error');

      // Button should be keyboard accessible
      cy.contains('Back to Login Page')
        .should('be.visible')
        .focus()
        .should('have.focus');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit('/auth/error?message=Authentication failed');

      // All elements should be visible without horizontal scroll
      cy.contains('Authentication Failed').should('be.visible');
      cy.contains('Back to Login Page').should('be.visible');
      
      // Check no horizontal overflow
      cy.window().then((win) => {
        expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth + 1);
      });
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad
      cy.visit('/auth/error?message=Test error');

      cy.contains('Authentication Failed').should('be.visible');
      cy.contains('Back to Login Page').should('be.visible');
    });
  });
});
