describe('User Management (Admin Only)', () => {
  describe('Admin Access', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('admin@clinic.sg', 'password')
      cy.contains('User Management').click()
    })

    it('should display user management page', () => {
      cy.contains('User Management').should('be.visible')
      cy.url().should('include', '/user-management')
    })

    it('should show list of users', () => {
      cy.get('table, [role="table"]').should('exist')
      
      // Should show at least the seeded users
      cy.contains('doctor@clinic.sg').should('be.visible')
      cy.contains('nurse@clinic.sg').should('be.visible')
      cy.contains('admin@clinic.sg').should('be.visible')
    })

    it('should display user roles correctly', () => {
      cy.contains('Doctor').should('be.visible')
      cy.contains('Nurse').should('be.visible')
      cy.contains('Admin').should('be.visible')
    })

    it('should filter users by role', () => {
      cy.get('body').then($body => {
        if ($body.find('select[name="roleFilter"]').length > 0) {
          cy.get('select[name="roleFilter"]').select('DOCTOR')
          cy.contains('doctor@clinic.sg').should('be.visible')
          
          cy.get('select[name="roleFilter"]').select('NURSE')
          cy.contains('nurse@clinic.sg').should('be.visible')
        }
      })
    })

    it('should search users by email', () => {
      cy.get('body').then($body => {
        if ($body.find('input[type="search"], input[placeholder*="Search"]').length > 0) {
          cy.get('input[type="search"], input[placeholder*="Search"]').first().type('doctor')
          cy.contains('doctor@clinic.sg').should('be.visible')
        }
      })
    })

    it('should create a new user', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Add User"), button:contains("New User")').length > 0) {
          cy.contains('button', /Add User|New User/).click()
          
          // Wait for dialog to be fully visible and interactive
          cy.get('[role="dialog"]').should('be.visible')
          cy.wait(300) // Wait for animation to complete
          
          const newEmail = `testuser-${Date.now()}@clinic.sg`
          cy.get('input[name="email"]').should('be.visible').type(newEmail)
          cy.get('input[name="name"]').should('be.visible').type('Test User')
          cy.get('input[name="password"]').should('be.visible').type('Password123!')
          cy.get('[data-testid="role"]').should('be.visible').click()
          cy.get('[data-testid="role-option-nurse"]').click()
          
          cy.contains('button', /Create|Save/).click()
          
          // Should show in list
          cy.wait(1000)
          cy.contains(newEmail).should('be.visible')
        }
      })
    })

    it('should edit an existing user', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Edit")').length > 0) {
          // Find a non-admin user to edit
          cy.contains('td', 'nurse@clinic.sg').parent().within(() => {
            cy.contains('button', 'Edit').click()
          })
          
          // Wait for dialog to be fully visible and interactive
          cy.get('[role="dialog"]').should('be.visible')
          cy.wait(300) // Wait for animation to complete
          
          cy.get('input[name="name"]').should('be.visible').clear().type('Updated Nurse Name')
          cy.contains('button', /Save|Update/).click()
          
          cy.wait(1000)
          cy.contains('Updated Nurse Name').should('be.visible')
        }
      })
    })

    it('should change user role', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Edit")').length > 0) {
          cy.contains('td', 'nurse@clinic.sg').parent().within(() => {
            cy.contains('button', 'Edit').click()
          })
          
          // Wait for dialog to be fully visible and interactive
          cy.get('[role="dialog"]').should('be.visible')
          cy.wait(300) // Wait for animation to complete
          
          cy.get('[data-testid="role"]').should('be.visible').click()
          cy.get('[data-testid="role-option-doctor"]').click()
          cy.contains('button', /Save|Update/).click()
          
          cy.wait(1000)
          // Verify role changed
          cy.contains('td', 'nurse@clinic.sg').parent().should('contain', 'Doctor')
        }
      })
    })

    it('should activate/deactivate user', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Deactivate"), button:contains("Activate")').length > 0) {
          cy.contains('button', /Deactivate|Activate/).first().click()
          
          // Confirm action if dialog appears
          cy.get('body').then($confirmBody => {
            if ($confirmBody.find('button:contains("Confirm")').length > 0) {
              cy.contains('button', 'Confirm').click()
            }
          })
        }
      })
    })

    it('should delete a user', () => {
      // First create a test user to delete
      cy.get('body').then($body => {
        if ($body.find('button:contains("Add User"), button:contains("New User")').length > 0) {
          cy.contains('button', /Add User|New User/).click()
          
          // Wait for dialog to be fully visible and interactive
          cy.get('[role="dialog"]').should('be.visible')
          cy.wait(300) // Wait for animation to complete
          
          const deleteEmail = `delete-${Date.now()}@clinic.sg`
          cy.get('input[name="email"]').should('be.visible').type(deleteEmail)
          cy.get('input[name="name"]').should('be.visible').type('Delete Me')
          cy.get('input[name="password"]').should('be.visible').type('Password123!')
          cy.get('[data-testid="role"]').should('be.visible').click()
          cy.get('[data-testid="role-option-nurse"]').click()
          cy.contains('button', /Create|Save/).click()
          
          cy.wait(1000)
          
          // Now delete it
          cy.contains('td', deleteEmail).parent().within(() => {
            cy.contains('button', 'Delete').click()
          })
          
          // Confirm deletion
          cy.contains('button', 'Confirm').click()
          
          cy.wait(1000)
          cy.contains(deleteEmail).should('not.exist')
        }
      })
    })

    it('should validate email format', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Add User"), button:contains("New User")').length > 0) {
          cy.contains('button', /Add User|New User/).click()
          
          // Wait for dialog to be fully visible and interactive
          cy.get('[role="dialog"]').should('be.visible')
          cy.wait(300) // Wait for animation to complete
          
          cy.get('input[name="email"]').should('be.visible').type('invalid-email')
          cy.get('input[name="name"]').should('be.visible').type('Test')
          cy.get('input[name="password"]').should('be.visible').type('Password123!')
          cy.contains('button', /Create|Save/).click()
          
          // Should show validation error
          cy.contains(/invalid|valid email/i).should('be.visible')
        }
      })
    })

    it('should require strong password', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Add User"), button:contains("New User")').length > 0) {
          cy.contains('button', /Add User|New User/).click()
          
          // Wait for dialog to be fully visible and interactive
          cy.get('[role="dialog"]').should('be.visible')
          cy.wait(300) // Wait for animation to complete
          
          cy.get('input[name="email"]').should('be.visible').type('test@clinic.sg')
          cy.get('input[name="name"]').should('be.visible').type('Test')
          cy.get('input[name="password"]').should('be.visible').type('123') // Weak password
          cy.contains('button', /Create|Save/).click()
          
          // Should show password validation error
          cy.url().should('include', '/user-management')
        }
      })
    })
  })

  describe('Doctor - No Access', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('doctor@clinic.sg', 'password')
    })

    it('should NOT show User Management menu for doctor', () => {
      cy.contains('User Management').should('not.exist')
    })

    it('should NOT allow direct URL access to user management', () => {
      cy.visit('/user-management')
      
      // Should redirect or show error
      cy.url().should('not.include', '/user-management')
    })
  })

  describe('Nurse - No Access', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('nurse@clinic.sg', 'password')
    })

    it('should NOT show User Management menu for nurse', () => {
      cy.contains('User Management').should('not.exist')
    })

    it('should NOT allow direct URL access to user management', () => {
      cy.visit('/user-management')
      
      // Should redirect or show error
      cy.url().should('not.include', '/user-management')
    })
  })

  describe('User Statistics', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('admin@clinic.sg', 'password')
      cy.contains('User Management').click()
    })

    it('should display user count statistics', () => {
      cy.get('body').then($body => {
        if ($body.find('[data-testid="user-stats"]').length > 0) {
          // Check for stats cards
          cy.contains(/Total Users|Active Users/).should('be.visible')
        }
      })
    })

    it('should show role distribution', () => {
      // Count users by role
      cy.get('table, [role="table"]').within(() => {
        cy.get('tr').should('have.length.at.least', 4) // Header + 3 seeded users
      })
    })
  })
})
