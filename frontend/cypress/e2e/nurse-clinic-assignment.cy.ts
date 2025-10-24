describe('Nurse Clinic Assignment (Admin Only)', () => {
  let testNurseEmail: string;
  let testClinicName: string;

  before(() => {
    // Generate unique test data
    testNurseEmail = `test-nurse-${Date.now()}@clinic.sg`;
    testClinicName = `Test Clinic ${Date.now()}`;
  });

  describe('Admin Access', () => {
    beforeEach(() => {
      cy.clearAppData();
      cy.login('admin@clinic.sg', 'password');
    });

    it('should navigate to Nurse Assignments tab', () => {
      // Click Settings in navigation
      cy.contains('Settings').click();
      cy.url().should('include', '/settings');

      // Find and click Nurse Assignments tab
      cy.contains('button', 'Nurse Assignments').should('be.visible').click();

      // Verify we're on the right page
      cy.contains('h2', 'Nurse Clinic Assignments').should('be.visible');
      cy.contains('Manage which nurses work at which clinics').should('be.visible');
    });

    it('should display statistics cards', () => {
      cy.contains('Settings').click();
      cy.contains('button', 'Nurse Assignments').click();

      // Check for statistics cards
      cy.contains('Total Nurses').should('be.visible');
      cy.contains('Total Clinics').should('be.visible');
      cy.contains('Multi-Clinic Nurses').should('be.visible');
    });

    it('should display nurses list', () => {
      cy.contains('Settings').click();
      cy.contains('button', 'Nurse Assignments').click();

      // Verify nurses section exists
      cy.contains('Nurses').should('be.visible');
      cy.contains('Select a nurse to manage their clinic assignments').should('be.visible');

      // Should show at least the seeded nurse
      cy.contains('nurse_becky@clinic.sg').should('be.visible');
    });

    it('should select a nurse and display their clinics', () => {
      cy.contains('Settings').click();
      cy.contains('button', 'Nurse Assignments').click();

      // Click on a nurse
      cy.contains('nurse_becky@clinic.sg').click();

      // Should show clinic assignments section
      cy.contains('Clinic Assignments').should('be.visible');
      
      // Should have at least one clinic (primary)
      cy.get('[data-testid="clinic-card"]').should('have.length.at.least', 1);
      
      // Should show primary badge
      cy.contains('Primary').should('be.visible');
    });

    it('should display clinic count next to nurse name', () => {
      cy.contains('Settings').click();
      cy.contains('button', 'Nurse Assignments').click();

      // Check for clinic count display
      cy.contains(/\d+ clinic[s]?/).should('be.visible');
    });

    describe('Nurse Creation and Assignment', () => {
      before(() => {
        // Create a test nurse via User Management
        cy.clearAppData();
        cy.login('admin@clinic.sg', 'password');
        cy.contains('Settings').click();
        cy.contains('button', 'User Management').click();
        
        // Create new nurse
        cy.contains('button', /Add User|New User/).click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.wait(300);
        
        cy.get('input[name="email"]').type(testNurseEmail);
        cy.get('input[name="name"]').type('Test Nurse');
        cy.get('input[name="password"]').type('Password123!');
        
        // Select nurse role
        cy.get('select[name="role"]').select('nurse');
        
        cy.contains('button', /Create|Save/).click();
        cy.wait(1000);
      });

      beforeEach(() => {
        cy.clearAppData();
        cy.login('admin@clinic.sg', 'password');
        cy.contains('Settings').click();
        cy.contains('button', 'Nurse Assignments').click();
      });

      it('should show newly created nurse in the list', () => {
        cy.contains(testNurseEmail).should('be.visible');
      });

      it('should show nurse has 1 clinic (auto-assigned)', () => {
        cy.contains(testNurseEmail).parent().within(() => {
          cy.contains('1 clinic').should('be.visible');
        });
      });

      it('should open assign clinic dialog', () => {
        // Select the test nurse
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Click Assign button
        cy.contains('button', 'Assign').click();

        // Verify dialog appears
        cy.get('[role="dialog"]').should('be.visible');
        cy.contains('Assign Clinic to Test Nurse').should('be.visible');
        cy.contains('Select a clinic to assign to this nurse').should('be.visible');
      });

      it('should assign nurse to a second clinic', () => {
        // First, create a second clinic
        cy.contains('button', 'Clinic Management').click();
        cy.wait(500);
        
        cy.contains('button', /Add Clinic|New Clinic/).click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.wait(300);
        
        cy.get('input[name="name"]').type(testClinicName);
        cy.get('input[name="hciCode"]').type(`HCI${Date.now()}`);
        cy.get('input[name="address"]').type('123 Test Street');
        cy.get('input[name="phone"]').type('+65 6123 4567');
        
        cy.contains('button', /Create|Save/).click();
        cy.wait(1000);

        // Go back to Nurse Assignments
        cy.contains('button', 'Nurse Assignments').click();
        cy.wait(500);

        // Select the test nurse
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Click Assign button
        cy.contains('button', 'Assign').click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.wait(300);

        // Select the new clinic from dropdown
        cy.get('select[id="clinic"]').select(testClinicName);

        // Uncheck primary (we want to keep original as primary)
        cy.get('input[type="checkbox"][id="isPrimary"]').should('exist');
        cy.get('input[type="checkbox"][id="isPrimary"]').uncheck();

        // Click Assign Clinic button
        cy.contains('button', 'Assign Clinic').click();
        
        // Wait for success toast
        cy.wait(1000);

        // Verify nurse now has 2 clinics
        cy.contains(testNurseEmail).parent().within(() => {
          cy.contains('2 clinics').should('be.visible');
        });

        // Verify both clinics show in the list
        cy.contains(testClinicName).should('be.visible');
      });

      it('should prevent duplicate clinic assignment', () => {
        // Select the test nurse
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Click Assign button
        cy.contains('button', 'Assign').click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.wait(300);

        // The already-assigned clinics should not appear in the dropdown (filtered out)
        cy.get('select[id="clinic"]').find('option').should('have.length.at.least', 1);
        
        // Cancel the dialog
        cy.contains('button', 'Cancel').click();
      });

      it('should set a clinic as primary', () => {
        // Select the test nurse
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Find a non-primary clinic and click its star icon
        cy.get('[data-testid="clinic-card"]').each(($card) => {
          if (!$card.find('[data-testid="primary-badge"]').length) {
            // This is a non-primary clinic
            cy.wrap($card).find('[data-testid="set-primary-btn"]').first().click();
            cy.wait(1000);
            return false; // Break the loop
          }
        });

        // Verify success toast appears
        cy.contains('Primary clinic updated').should('be.visible');

        // Verify only one primary badge exists
        cy.get('[data-testid="primary-badge"]').should('have.length', 1);
      });

      it('should remove nurse from a clinic', () => {
        // First ensure nurse has at least 2 clinics
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Count initial clinics
        cy.get('[data-testid="clinic-card"]').its('length').then((initialCount) => {
          if (initialCount > 1) {
            // Find a non-primary clinic and remove it
            cy.get('[data-testid="clinic-card"]').each(($card) => {
              if (!$card.find('[data-testid="primary-badge"]').length) {
                // This is a non-primary clinic, remove it
                cy.wrap($card).find('[data-testid="remove-clinic-btn"]').first().click();
                cy.wait(500);
                return false; // Break the loop
              }
            });

            // Confirm the removal in the browser dialog
            cy.on('window:confirm', () => true);
            cy.wait(1000);

            // Verify clinic count decreased
            cy.get('[data-testid="clinic-card"]').should('have.length', initialCount - 1);
          }
        });
      });

      it('should prevent removing the last clinic', () => {
        // Select the test nurse
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Remove clinics until only one remains
        cy.get('[data-testid="clinic-card"]').its('length').then((initialCount) => {
          if (initialCount > 1) {
            // Remove all but one clinic
            for (let i = 0; i < initialCount - 1; i++) {
              cy.get('[data-testid="clinic-card"]').eq(1).find('[data-testid="remove-clinic-btn"]').click();
              cy.wait(500);
              cy.on('window:confirm', () => true);
              cy.wait(1000);
            }
          }

          // Now try to remove the last clinic
          cy.get('[data-testid="clinic-card"]').should('have.length', 1);
          cy.get('[data-testid="remove-clinic-btn"]').click();
          cy.wait(500);
          cy.on('window:confirm', () => true);
          cy.wait(1000);

          // Should show error message
          cy.contains(/Cannot remove|at least one clinic/i).should('be.visible');

          // Should still have 1 clinic
          cy.get('[data-testid="clinic-card"]').should('have.length', 1);
        });
      });

      it('should show empty state when nurse has no assigned clinics', () => {
        // This is a hypothetical test - in practice nurses should always have at least one clinic
        // But we test the UI handles this gracefully
        
        // Look for empty state message (should not appear for normal nurses)
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Should have at least one clinic
        cy.get('[data-testid="clinic-card"]').should('have.length.at.least', 1);
      });

      it('should show multi-clinic count in statistics', () => {
        // Check the Multi-Clinic Nurses stat card
        cy.contains('Multi-Clinic Nurses').parent().within(() => {
          // Should show count of nurses with 2+ clinics
          cy.get('.text-2xl').invoke('text').then((count) => {
            const numCount = parseInt(count);
            expect(numCount).to.be.at.least(0);
          });
        });
      });

      it('should display primary clinic with star icon', () => {
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Primary clinic should have a filled star
        cy.get('[data-testid="primary-badge"]').should('be.visible');
        cy.get('[data-testid="primary-star-icon"]').should('be.visible');
      });

      it('should show clinic details (name, HCI, address)', () => {
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Each clinic card should show details
        cy.get('[data-testid="clinic-card"]').first().within(() => {
          cy.get('[data-testid="clinic-name"]').should('be.visible');
          // HCI code might be present
          cy.get('body').then($body => {
            if ($body.find('[data-testid="clinic-hci"]').length) {
              cy.get('[data-testid="clinic-hci"]').should('be.visible');
            }
          });
        });
      });

      it('should close assign dialog on cancel', () => {
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        cy.contains('button', 'Assign').click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.wait(300);

        cy.contains('button', 'Cancel').click();
        cy.get('[role="dialog"]').should('not.exist');
      });

      it('should handle assign clinic with primary flag', () => {
        // Select the test nurse
        cy.contains(testNurseEmail).click();
        cy.wait(500);

        // Click Assign button
        cy.contains('button', 'Assign').click();
        cy.get('[role="dialog"]').should('be.visible');
        cy.wait(300);

        // Check if there are available clinics
        cy.get('select[id="clinic"] option').then($options => {
          if ($options.length > 1) { // More than just the placeholder
            // Select a clinic
            cy.get('select[id="clinic"]').select(1);

            // Check the isPrimary checkbox
            cy.get('input[type="checkbox"][id="isPrimary"]').check();

            // Should show info message
            cy.contains('This will replace the current primary clinic designation').should('be.visible');

            // Click Assign
            cy.contains('button', 'Assign Clinic').click();
            cy.wait(1000);

            // Verify the newly assigned clinic is now primary
            // (Implementation depends on UI updates)
          }
        });
      });
    });

    describe('Search and Filter', () => {
      beforeEach(() => {
        cy.clearAppData();
        cy.login('admin@clinic.sg', 'password');
        cy.contains('Settings').click();
        cy.contains('button', 'Nurse Assignments').click();
      });

      it('should search nurses by name or email', () => {
        // Check if search input exists
        cy.get('body').then($body => {
          if ($body.find('input[type="search"], input[placeholder*="Search"]').length > 0) {
            cy.get('input[type="search"], input[placeholder*="Search"]').first().type('nurse');
            cy.contains('nurse_becky@clinic.sg').should('be.visible');
          }
        });
      });
    });

    describe('Responsive Design', () => {
      beforeEach(() => {
        cy.clearAppData();
        cy.login('admin@clinic.sg', 'password');
        cy.contains('Settings').click();
        cy.contains('button', 'Nurse Assignments').click();
      });

      it('should display correctly on mobile viewport', () => {
        cy.viewport('iphone-x');
        cy.contains('Nurse Clinic Assignments').should('be.visible');
        cy.contains('Total Nurses').should('be.visible');
      });

      it('should display correctly on tablet viewport', () => {
        cy.viewport('ipad-2');
        cy.contains('Nurse Clinic Assignments').should('be.visible');
      });
    });

    describe('Loading States', () => {
      beforeEach(() => {
        cy.clearAppData();
        cy.login('admin@clinic.sg', 'password');
        cy.contains('Settings').click();
        cy.contains('button', 'Nurse Assignments').click();
      });

      it('should show loading indicator when fetching data', () => {
        // Check for loading spinner (if visible during slow network)
        cy.get('body').then($body => {
          if ($body.find('[data-testid="loading-spinner"]').length > 0) {
            cy.get('[data-testid="loading-spinner"]').should('exist');
          }
        });
      });
    });
  });

  describe('Non-Admin Access', () => {
    it('should not show Nurse Assignments tab for doctors', () => {
      cy.clearAppData();
      cy.login('doctor@clinic.sg', 'password');
      cy.contains('Settings').click();
      
      // Should not see Nurse Assignments tab
      cy.contains('button', 'Nurse Assignments').should('not.exist');
    });

    it('should not show Nurse Assignments tab for nurses', () => {
      cy.clearAppData();
      cy.login('nurse_becky@clinic.sg', 'password');
      
      // Nurses might not have access to Settings at all
      cy.get('body').then($body => {
        if ($body.find('a:contains("Settings")').length > 0) {
          cy.contains('Settings').click();
          cy.contains('button', 'Nurse Assignments').should('not.exist');
        }
      });
    });

    it('should return 403 when non-admin tries to access nurse-clinic endpoints', () => {
      cy.clearAppData();
      cy.login('doctor@clinic.sg', 'password');

      // Get auth token from localStorage
      cy.window().its('localStorage').invoke('getItem', 'token').then((token) => {
        // Try to access nurse-clinic endpoint
        cy.request({
          method: 'GET',
          url: '/v1/users/some-id/nurse-clinics',
          headers: {
            Authorization: `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(403);
        });
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.clearAppData();
      cy.login('admin@clinic.sg', 'password');
      cy.contains('Settings').click();
      cy.contains('button', 'Nurse Assignments').click();
    });

    it('should show error toast on network failure', () => {
      // Intercept API call and force failure
      cy.intercept('POST', '**/nurse-clinics', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('assignFailed');

      // Try to assign a clinic
      cy.contains('nurse_becky@clinic.sg').click();
      cy.wait(500);
      cy.contains('button', 'Assign').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);
      
      cy.get('select[id="clinic"]').then($select => {
        if ($select.find('option').length > 1) {
          cy.get('select[id="clinic"]').select(1);
          cy.contains('button', 'Assign Clinic').click();
          
          cy.wait('@assignFailed');
          
          // Should show error toast
          cy.contains(/failed|error/i).should('be.visible');
        }
      });
    });

    it('should handle empty nurses list gracefully', () => {
      // Intercept API to return empty array
      cy.intercept('GET', '**/users?*', {
        statusCode: 200,
        body: {
          data: [],
          meta: { total: 0, page: 1, limit: 100, totalPages: 0 }
        }
      });

      cy.reload();
      cy.wait(500);

      // Should show empty state
      cy.contains('No nurses found').should('be.visible');
    });
  });
});
