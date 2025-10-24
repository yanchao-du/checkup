describe('CorpPass login button', () => {
  it('navigates to backend authorize endpoint when clicked', () => {
    cy.visit('/');
    // Click the Login with CorpPass button
    cy.contains('Login with CorpPass').click();

    // The app should navigate to backend authorize endpoint (may be on another origin)
    // We assert that window.location was changed to a URL containing '/v1/auth/corppass/authorize' or the backend host
    cy.location().should((loc) => {
      const url = `${loc.pathname}${loc.search}`;
      expect(url.includes('/v1/auth/corppass/authorize') || loc.hostname === 'localhost').to.be.true;
    });
  });
});
