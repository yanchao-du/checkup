# auth Specification

## Purpose
Provides authentication and authorization for CheckUp users, supporting both traditional email/password login and Singapore CorpPass OpenID Connect integration. Enables secure access control with JWT tokens, role-based permissions, and account linking for business users.

## Requirements
### Requirement: CorpPass OAuth Authentication
The system SHALL support CorpPass OpenID Connect (OIDC) authentication as an alternative login method alongside email/password authentication.

#### Scenario: User initiates CorpPass login
- **GIVEN** a user on the login page
- **WHEN** user clicks "Login with CorpPass" button
- **THEN** system redirects to CorpPass authorization endpoint
- **AND** redirect includes client_id, redirect_uri, scope, and state parameters
- **AND** user sees CorpPass login page

#### Scenario: User completes CorpPass authentication
- **GIVEN** user has authenticated with CorpPass
- **WHEN** CorpPass redirects back with authorization code
- **THEN** system exchanges code for ID token and access token at CorpPass token endpoint
- **AND** system validates ID token signature using JWKS
- **AND** system extracts user information from ID token
- **AND** system creates or links user account
- **AND** system issues CheckUp JWT token
- **AND** user is redirected to dashboard

#### Scenario: CorpPass user with existing email
- **GIVEN** a CorpPass user with email "nurse@clinic.sg"
- **AND** user with email "nurse@clinic.sg" already exists in system
- **WHEN** CorpPass authentication completes
- **THEN** system links CorpPass account to existing user
- **AND** user can subsequently log in with either email/password or CorpPass
- **AND** user maintains same role and permissions

#### Scenario: CorpPass user with new email
- **GIVEN** a CorpPass user with email "newhire@clinic.sg"
- **AND** no user with this email exists in system
- **WHEN** CorpPass authentication completes
- **THEN** system creates new user account with status "pending"
- **AND** system sets role to "nurse" (default)
- **AND** system sends notification to administrators
- **AND** user sees message "Account pending approval"
- **AND** user cannot access system until admin approves

#### Scenario: CorpPass authentication failure
- **GIVEN** user attempts CorpPass login
- **WHEN** CorpPass authentication fails (user cancels, network error, etc.)
- **THEN** system redirects back to login page
- **AND** system displays error message "CorpPass login failed. Please try again or use email/password."
- **AND** user can retry CorpPass or use email/password login

#### Scenario: Invalid CorpPass token
- **GIVEN** system receives CorpPass callback
- **WHEN** ID token signature validation fails
- **THEN** system rejects authentication
- **AND** system logs security event
- **AND** system displays error message "Authentication failed. Please try again."
- **AND** user is returned to login page

### Requirement: CorpPass Token Validation
The system SHALL validate all CorpPass ID tokens using JSON Web Key Set (JWKS) before accepting authentication.

#### Scenario: Valid token validation
- **GIVEN** system receives ID token from CorpPass
- **WHEN** validating the token
- **THEN** system fetches signing key from CorpPass JWKS endpoint
- **AND** system verifies token signature matches signing key
- **AND** system verifies issuer matches expected CorpPass issuer
- **AND** system verifies audience matches client_id
- **AND** system verifies token has not expired
- **AND** system accepts token as valid

#### Scenario: Token with invalid signature
- **GIVEN** system receives ID token with tampered signature
- **WHEN** validating the token
- **THEN** system detects signature mismatch
- **AND** system rejects authentication
- **AND** system logs security warning
- **AND** user cannot proceed

### Requirement: CorpPass Account Association
The system SHALL store CorpPass user associations in dedicated table with user_id, corppass_sub, UEN, and NRIC.

#### Scenario: First CorpPass login
- **GIVEN** user authenticates via CorpPass for first time
- **WHEN** authentication succeeds
- **THEN** system creates record in corppass_users table
- **AND** record contains userId (link to users table)
- **AND** record contains corpPassSub (CorpPass unique identifier)
- **AND** record contains UEN (business entity number) if provided
- **AND** record contains NRIC (national ID) if provided
- **AND** record has timestamp of creation

#### Scenario: Subsequent CorpPass login
- **GIVEN** user has previously linked CorpPass account
- **WHEN** user logs in via CorpPass again
- **THEN** system finds existing corppass_users record by corpPassSub
- **AND** system loads associated user account
- **AND** system issues new JWT token
- **AND** no new corppass_users record is created

### Requirement: Dual Authentication Support
The system SHALL maintain support for both email/password and CorpPass authentication methods simultaneously.

#### Scenario: User chooses authentication method
- **GIVEN** user navigates to login page
- **WHEN** page loads
- **THEN** user sees "Login with CorpPass" button
- **AND** user sees email/password form
- **AND** user can choose either method
- **AND** both methods are clearly labeled

#### Scenario: Email/password login unchanged
- **GIVEN** CorpPass authentication is available
- **WHEN** user logs in with email and password
- **THEN** authentication flow proceeds exactly as before
- **AND** JWT token is issued
- **AND** user accesses dashboard
- **AND** no CorpPass integration affects email/password flow

#### Scenario: User has both authentication methods linked
- **GIVEN** user has both email/password and CorpPass linked to account
- **WHEN** user logs in via email/password
- **THEN** authentication succeeds
- **WHEN** user logs in via CorpPass
- **THEN** authentication succeeds
- **AND** both methods access same user account
- **AND** user sees same data and permissions

### Requirement: Development Environment Support
The system SHALL support MockPass for CorpPass simulation in development environments.

#### Scenario: Development with MockPass
- **GIVEN** application running in development mode
- **WHEN** environment variables point to MockPass endpoints
- **THEN** system uses MockPass URLs (http://localhost:5156/corppass/v2/*)
- **AND** CorpPass authentication flow works with MockPass
- **AND** developers can test without real CorpPass credentials
- **AND** MockPass provides test user profiles

#### Scenario: Production with real CorpPass
- **GIVEN** application running in production mode
- **WHEN** environment variables point to CorpPass production endpoints
- **THEN** system uses CorpPass production URLs (https://corppass.gov.sg/*)
- **AND** CorpPass authentication flow works with real CorpPass service
- **AND** users authenticate with actual CorpPass credentials

### Requirement: CSRF Protection
The system SHALL implement CSRF protection for CorpPass OAuth flow using state parameter.

#### Scenario: State parameter validation
- **GIVEN** system initiates CorpPass authorization
- **WHEN** redirecting to CorpPass
- **THEN** system generates random state value
- **AND** system stores state in session/cookie
- **AND** state is included in authorization URL
- **WHEN** CorpPass redirects back
- **THEN** system validates state matches stored value
- **AND** system rejects callback if state mismatch
- **AND** system logs security warning for state mismatch

### Requirement: Admin Approval for New CorpPass Users
The system SHALL require administrator approval for new users created via CorpPass authentication.

#### Scenario: New CorpPass user pending approval
- **GIVEN** new CorpPass user completes authentication
- **WHEN** user account is created
- **THEN** user status is set to "pending"
- **AND** user role is set to "nurse" (default)
- **AND** system sends notification to administrators
- **AND** user sees message "Your account is pending approval"
- **AND** user cannot access protected resources

#### Scenario: Admin approves CorpPass user
- **GIVEN** new CorpPass user with status "pending"
- **WHEN** administrator approves user
- **THEN** user status changes to "active"
- **AND** administrator can assign appropriate role
- **AND** user can log in and access system
- **AND** user receives approval notification

#### Scenario: Admin rejects CorpPass user
- **GIVEN** new CorpPass user with status "pending"
- **WHEN** administrator rejects user
- **THEN** user account is marked inactive or deleted
- **AND** user cannot log in
- **AND** user receives rejection notification

### Requirement: Login Response
The system SHALL return authentication method information in login response.

#### Scenario: Login response includes auth method
- **GIVEN** user successfully authenticates
- **WHEN** login completes
- **THEN** response includes `authMethod: "email"` for email/password login
- **OR** response includes `authMethod: "corppass"` for CorpPass login
- **AND** frontend can display authentication method in user profile

### Requirement: User Model
The User model SHALL support optional CorpPass account linkage via foreign key relationship.

#### Scenario: User with CorpPass association
- **GIVEN** a user account exists in the system
- **WHEN** user links CorpPass account via first CorpPass login
- **THEN** user record gains corpPassUsers relation
- **AND** relation contains CorpPass subject ID
- **AND** user can be queried by corpPassUsers.corpPassSub
- **AND** user can authenticate with both email/password and CorpPass

#### Scenario: User without CorpPass association
- **GIVEN** a user account created via email/password
- **WHEN** user has never logged in with CorpPass
- **THEN** user record has empty corpPassUsers relation
- **AND** user can only authenticate with email/password
- **AND** user can optionally link CorpPass later

### Requirement: Email/Password Authentication
The system SHALL support traditional email and password authentication.

#### Scenario: Email/password login
- **GIVEN** CorpPass authentication is available
- **WHEN** user logs in with email and password
- **THEN** authentication flow proceeds as expected
- **AND** JWT token is issued
- **AND** user accesses dashboard

