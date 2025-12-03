describe('Mobile Responsiveness', () => {
    beforeEach(() => {
        cy.clearAppData()
        cy.viewport('iphone-x')
    })

    describe('Nurse View', () => {
        beforeEach(() => {
            cy.login('nurse@clinic.sg', 'password')
        })

        describe('Submissions List', () => {
            it('should show shortened search placeholder', () => {
                cy.visit('/submissions')
                cy.get('input[placeholder="Search name, NRIC/FIN, or passport..."]').should('be.visible')
            })

            it('should display mobile-friendly layout', () => {
                cy.visit('/submissions')
                // Table should be hidden on mobile
                cy.get('table').should('not.be.visible')
                // Mobile view container should be visible
                cy.get('.md\\:hidden').should('be.visible')
            })

            it('should display responsive pagination if data exists', () => {
                cy.visit('/submissions')
                // Check if pagination exists (conditional based on data)
                cy.get('body').then($body => {
                    if ($body.find('.flex.flex-col.sm\\:flex-row').length > 0) {
                        cy.get('.flex.flex-col.sm\\:flex-row').should('be.visible')
                    }
                })
            })
        })

        describe('Drafts List', () => {
            it('should show shortened search placeholder', () => {
                cy.visit('/drafts')
                cy.get('input[placeholder="Search name, NRIC/FIN, or passport..."]').should('be.visible')
            })

            it('should display mobile-friendly layout', () => {
                cy.visit('/drafts')
                // Table should be hidden on mobile
                cy.get('table').should('not.be.visible')
                // Mobile view container should be visible
                cy.get('.md\\:hidden').should('be.visible')
            })
        })
    })

    describe('Doctor View', () => {
        beforeEach(() => {
            cy.login('doctor@clinic.sg', 'password')
        })

        describe('Pending Approvals', () => {
            it('should show shortened search placeholder', () => {
                cy.visit('/pending-approvals')
                cy.get('input[placeholder="Search name, NRIC/FIN, or passport..."]').should('be.visible')
            })

            it('should display mobile-friendly layout', () => {
                cy.visit('/pending-approvals')
                // Table should be hidden on mobile
                cy.get('table').should('not.be.visible')
                // Mobile view container should be visible
                cy.get('.md\\:hidden').should('be.visible')
            })
        })

        describe('Submissions List', () => {
            it('should show shortened search placeholder', () => {
                cy.visit('/submissions')
                cy.get('input[placeholder="Search name, NRIC/FIN, or passport..."]').should('be.visible')
            })
        })
    })

    describe('Desktop View Verification', () => {
        beforeEach(() => {
            cy.clearAppData()
            cy.viewport(1280, 720) // Desktop viewport
            cy.login('nurse@clinic.sg', 'password')
        })

        it('should display table view on desktop', () => {
            cy.visit('/submissions')
            // Table should be visible on desktop
            cy.get('table').should('be.visible')
            // Mobile cards should be hidden
            cy.get('.md\\:hidden').should('not.be.visible')
        })
    })
})
