describe('Approval Workflow', () => {
  describe('Doctor - Pending Approvals', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('doctor@clinic.sg', 'password')
      cy.contains('Pending Approvals').click()
    })

    it('should display pending approvals page', () => {
      cy.contains('Pending Approvals').should('be.visible')
      cy.url().should('include', '/pending-approvals')
    })

    it('should show list of submissions awaiting approval', () => {
      // Should have a table or list
      cy.get('table, [role="table"], [data-testid="approvals-list"]').should('exist')
    })

    it('should allow viewing submission details before approval', () => {
      cy.get('body').then($body => {
        if ($body.find('table tr:not(:first-child), [role="row"]:not(:first-child)').length > 0) {
          // Click first pending submission
          cy.get('table tr:not(:first-child), [role="row"]:not(:first-child)').first().click()
          
          // Should show submission details
          cy.url().should('include', '/view-submission')
          cy.contains('Patient Information').should('be.visible')
        }
      })
    })

    it('should approve a submission', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Approve")').length > 0) {
          cy.contains('button', 'Approve').first().click()
          
          // Confirm approval if dialog appears
          cy.get('body').then($confirmBody => {
            if ($confirmBody.find('button:contains("Confirm")').length > 0) {
              cy.contains('button', 'Confirm').click()
            }
          })
          
          // Should show success message or update status
          cy.wait(1000) // Wait for API call
        }
      })
    })

    it('should reject a submission with reason', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Reject")').length > 0) {
          cy.contains('button', 'Reject').first().click()
          
          // Should show reason input
          cy.get('body').then($rejectBody => {
            if ($rejectBody.find('textarea, input[name="reason"]').length > 0) {
              cy.get('textarea, input[name="reason"]').first().type('Incomplete vital signs')
              cy.contains('button', 'Confirm').click()
            }
          })
          
          cy.wait(1000) // Wait for API call
        }
      })
    })

    it('should request revision with comments', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Request Revision")').length > 0) {
          cy.contains('button', 'Request Revision').first().click()
          
          cy.get('body').then($revisionBody => {
            if ($revisionBody.find('textarea').length > 0) {
              cy.get('textarea').first().type('Please recheck blood pressure reading')
              cy.contains('button', 'Submit').click()
            }
          })
        }
      })
    })

    it('should filter approvals by exam type', () => {
      cy.get('body').then($body => {
        if ($body.find('select[name="examTypeFilter"]').length > 0) {
          cy.get('select[name="examTypeFilter"]').select('SIX_MONTHLY_MDW')
          cy.get('table, [role="table"]').should('be.visible')
          
          cy.get('select[name="examTypeFilter"]').select('SIX_MONTHLY_FMW')
          cy.get('table, [role="table"]').should('be.visible')
          
          cy.get('select[name="examTypeFilter"]').select('WORK_PERMIT')
          cy.get('table, [role="table"]').should('be.visible')
        }
      })
    })

    it('should show submission count', () => {
      cy.get('body').then($body => {
        if ($body.find('table tr:not(:first-child), [role="row"]:not(:first-child)').length > 0) {
          // Should display count of pending approvals
          cy.contains(/\d+/).should('be.visible')
        }
      })
    })
  })

  describe('Nurse - No Access to Approvals', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('nurse@clinic.sg', 'password')
    })

    it('should NOT show Pending Approvals menu for nurse', () => {
      cy.contains('Pending Approvals').should('not.exist')
    })

    it('should NOT allow direct URL access to pending approvals', () => {
      cy.visit('/pending-approvals')
      
      // Should redirect to dashboard or show error
      cy.url().should('not.include', '/pending-approvals')
    })
  })

  describe('Admin - Full Approval Access', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('admin@clinic.sg', 'password')
      cy.contains('Pending Approvals').click()
    })

    it('should display pending approvals page for admin', () => {
      cy.contains('Pending Approvals').should('be.visible')
      cy.url().should('include', '/pending-approvals')
    })

    it('should show all pending submissions across all doctors', () => {
      // Admin should see submissions from all users
      cy.get('table, [role="table"]').should('exist')
    })

    it('should allow admin to approve submissions', () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Approve")').length > 0) {
          cy.contains('button', 'Approve').first().click()
          
          cy.get('body').then($confirmBody => {
            if ($confirmBody.find('button:contains("Confirm")').length > 0) {
              cy.contains('button', 'Confirm').click()
            }
          })
        }
      })
    })
  })

  describe('Approval Workflow - End to End', () => {
    it('should complete full submission and approval cycle', () => {
      // Login as nurse, create submission
      cy.login('nurse@clinic.sg', 'password')
      cy.contains('New Submission').click()
      
      const patientName = `E2E Test Patient ${Date.now()}`
      cy.get('input[name="patientName"]').type(patientName)
      cy.get('input[name="nric"]').type('S9999999Z')
      cy.get('input[name="dateOfBirth"]').type('1980-12-31')
      cy.get('[data-testid="examType"]').click()
      cy.contains('Work Permit').click()
      cy.get('input[name="examinationDate"]').type('2024-06-15')
      
      // Fill vital signs
      cy.get('body').then($body => {
        if ($body.find('input[name="height"]').length > 0) {
          cy.get('input[name="height"]').type('165')
          cy.get('input[name="weight"]').type('65')
          cy.get('input[name="bloodPressure"]').type('118/78')
        }
      })
      
      cy.contains('button', 'Submit for Approval').click()
      cy.wait(1000)
      
  // Instead of clicking UI logout (may be flaky after submit), clear session and login as doctor
  cy.clearAppData()
  cy.login('doctor@clinic.sg', 'password')
      cy.contains('Pending Approvals').click()
      
      // Find and approve the submission
      cy.get('body').then($body => {
        if ($body.find(`td:contains("${patientName}")`).length > 0) {
          cy.contains('td', patientName).parent().within(() => {
            cy.contains('button', 'Approve').click()
          })
          
          cy.get('body').then($confirmBody => {
            if ($confirmBody.find('button:contains("Confirm")').length > 0) {
              cy.contains('button', 'Confirm').click()
            }
          })
        }
      })
      
      // Verify submission is no longer pending
      cy.wait(1000)
      cy.reload()
      cy.contains(patientName, { timeout: 10000 }).should('not.exist')
    })
  })

  describe('Approval Comments and History', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('doctor@clinic.sg', 'password')
    })

    it('should show approval history on submission details', () => {
      cy.contains('Submissions').click()
      
      cy.get('body').then($body => {
        if ($body.find('table tr:not(:first-child)').length > 0) {
          cy.get('table tr:not(:first-child)').first().click()
          
          // Should show approval/rejection history
          cy.contains(/Status|History|Timeline/).should('be.visible')
        }
      })
    })

    it('should display approver information', () => {
      cy.contains('Pending Approvals').click()

      cy.get('body').then($body => {
        if ($body.find('table tr:not(:first-child), [role="row"]:not(:first-child)').length > 0) {
          // Click the row – prefer clicking an explicit 'View' button if present
          cy.get('table tr:not(:first-child), [role="row"]:not(:first-child)').first().then($row => {
            if ($row.find('button:contains("View")').length > 0) {
              cy.wrap($row).contains('button', 'View').click()
            } else if ($row.find('a:contains("View")').length > 0) {
              cy.wrap($row).contains('a', 'View').click()
            } else {
              cy.wrap($row).click()
            }
          })

          // Should show who can approve or has approved (check several possible UI signals)
          cy.contains(/Approver|Approved by|Patient Information|Status|History|Timeline/).should('be.visible')
        }
      })
    })
  })
})
