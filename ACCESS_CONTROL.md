# Access Control List (ACL)

This document outlines the role-based access control (RBAC) system for the CheckUp Medical Portal.

## User Roles

The system supports three user roles:
- **Doctor** - Medical practitioners who can create, approve, and submit medical exams
- **Nurse** - Medical staff who can create exams and route them for doctor approval
- **Admin** - System administrators who manage users and have read access to all submissions

---

## Role Permissions Matrix

### Authentication Endpoints

| Endpoint | Doctor | Nurse | Admin | Notes |
|----------|--------|-------|-------|-------|
| `POST /auth/login` | ✅ | ✅ | ✅ | Public endpoint |
| `GET /auth/profile` | ✅ | ✅ | ✅ | Authenticated users only |

---

### Submissions Endpoints

| Endpoint | Doctor | Nurse | Admin | Notes |
|----------|--------|-------|-------|-------|
| `GET /submissions` | ✅ | ✅ | ✅ | Scoped by role (see below) |
| `POST /submissions` | ✅ | ✅ | ❌ | Create new submission |
| `GET /submissions/:id` | ✅ | ✅ | ✅ | View details (see access rules) |
| `PUT /submissions/:id` | ✅ | ✅ | ✅ | Only creator or admin can edit |
| `POST /submissions/:id/submit` | ❌ | ✅ | ❌ | Route draft for approval (nurse only) |
| `GET /submissions/:id/history` | ✅ | ✅ | ✅ | View audit trail |

#### Submission List Access Scope
- **Doctor**: Sees submissions they created OR approved
- **Nurse**: Sees submissions they created OR approved
- **Admin**: Sees all submissions in their clinic

#### Individual Submission Access Rules
Access is granted if **ANY** of the following is true:
- User is **Admin**
- User is the **creator** (`createdById` matches user ID)
- User is the **approver** (`approvedById` matches user ID)
- User is from the **same clinic** (`clinicId` matches)

---

### Drafts Endpoints

| Endpoint | Doctor | Nurse | Admin | Notes |
|----------|--------|-------|-------|-------|
| `GET /drafts` | ✅ | ✅ | ✅ | Only sees own drafts + clinic drafts |
| `GET /drafts/:id` | ✅ | ✅ | ✅ | Same access rules as submissions |

**Drafts Scope:**
- Users can only see drafts they created OR drafts from their clinic

---

### Approvals Endpoints

| Endpoint | Doctor | Nurse | Admin | Notes |
|----------|--------|-------|-------|-------|
| `GET /approvals/pending` | ✅ | ❌ | ✅ | Doctors and admins only |
| `POST /approvals/:id/approve` | ✅ | ❌ | ❌ | Doctors only |
| `POST /approvals/:id/reject` | ✅ | ❌ | ❌ | Doctors only |

**Approvals Access:**
- Only **doctors** can approve or reject submissions
- **Admins** can view pending approvals but cannot approve/reject

---

### Users Management Endpoints

| Endpoint | Doctor | Nurse | Admin | Notes |
|----------|--------|-------|-------|-------|
| `GET /users` | ❌ | ❌ | ✅ | List all users in clinic |
| `GET /users/:id` | ❌ | ❌ | ✅ | View user details |
| `POST /users` | ❌ | ❌ | ✅ | Create new user |
| `PUT /users/:id` | ❌ | ❌ | ✅ | Update user |
| `DELETE /users/:id` | ❌ | ❌ | ✅ | Delete user |

**Users Management:**
- **Admins only** - No access for doctors or nurses
- All operations are scoped to the admin's clinic

---

## Frontend Route Protection

### Navigation Menu Access

| Menu Item | Doctor | Nurse | Admin |
|-----------|--------|-------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| New Submission | ✅ | ✅ | ❌ |
| Submissions | ✅ | ✅ | ✅ |
| Drafts | ✅ | ✅ | ✅ |
| Pending Approvals | ✅ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ |

### Route Guards

Routes are protected by role-based guards:

```typescript
// Example: Pending Approvals route
<Route 
  path="/approvals" 
  element={
    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
      <PendingApprovals />
    </ProtectedRoute>
  } 
/>

// Example: User Management route
<Route 
  path="/user-management" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <UserManagement />
    </ProtectedRoute>
  } 
/>
```

---

## Submission Workflow & Status Transitions

### Status Flow

```
draft → pending_approval → submitted
  ↓            ↓
  ✗         rejected
```

### Status Transition Rules

| From Status | To Status | Allowed Roles | Action |
|-------------|-----------|---------------|--------|
| `draft` | `pending_approval` | Nurse | Route for approval |
| `draft` | `submitted` | Doctor | Direct submission |
| `pending_approval` | `submitted` | Doctor | Approve |
| `pending_approval` | `rejected` | Doctor | Reject |
| `rejected` | `pending_approval` | Nurse, Doctor | Re-submit after fixes |
| `submitted` | N/A | None | Final state (immutable) |

### Creation Logic

**When creating a submission:**

| Role | `routeForApproval` | Resulting Status |
|------|-------------------|------------------|
| Doctor | `false` (draft) | `draft` |
| Doctor | `true` or not set | `submitted` |
| Nurse | `false` (draft) | `draft` |
| Nurse | `true` | `pending_approval` |

---

## Data Scoping Rules

### Clinic Isolation

All data is scoped to the user's clinic (`clinicId`):
- Users can only see/edit submissions from their clinic
- Admins can only manage users in their clinic
- Cross-clinic access is **not permitted**

### Creator/Approver Access

- Users can always access submissions they **created**
- Doctors can access submissions they **approved**
- This applies even if the submission is from another user in the same clinic

---

## Security Implementation

### Backend Guards

**JWT Authentication:**
```typescript
@UseGuards(JwtAuthGuard)
```
- Applied to all protected endpoints
- Validates JWT token and extracts user info

**Role-Based Authorization:**
```typescript
@Roles('admin')
@UseGuards(RolesGuard)
```
- Checks user role against allowed roles
- Returns 403 Forbidden if role is not permitted

### Access Check Example

```typescript
// In submission service
async findOne(id: string, userId: string, userRole: string, clinicId: string) {
  const submission = await this.prisma.medicalSubmission.findUnique({ where: { id } });
  
  if (!submission) {
    throw new NotFoundException('Submission not found');
  }

  // Access granted if ANY of these are true:
  if (userRole !== 'admin' && 
      submission.createdById !== userId && 
      submission.approvedById !== userId &&
      submission.clinicId !== clinicId) {
    throw new ForbiddenException('Access denied');
  }

  return submission;
}
```

---

## Error Codes

| Status Code | Meaning | When it occurs |
|-------------|---------|----------------|
| `401 Unauthorized` | Not authenticated | Missing or invalid JWT token |
| `403 Forbidden` | Not authorized | User lacks required role/permission |
| `404 Not Found` | Resource not found | Invalid ID or not in user's scope |
| `409 Conflict` | Data conflict | Duplicate email, invalid status transition |

---

## Audit Logging

All significant actions are logged in the audit trail:

| Event Type | Triggered By | Logged Data |
|------------|--------------|-------------|
| `created` | Submission creation | User ID, exam type, status |
| `updated` | Submission update | User ID, changed fields |
| `submitted` | Route for approval / Direct submit | User ID, status change |
| `approved` | Doctor approves | Doctor ID, approval timestamp |
| `rejected` | Doctor rejects | Doctor ID, rejection reason |
| `deleted` | User deletion (admin) | Admin ID, deleted user info |

### Accessing Audit Logs

```http
GET /submissions/{id}/history
```

Returns chronological list of all events for a submission.

---

## Best Practices

### For Frontend Developers

1. **Always check user role** before showing role-specific UI elements
2. **Use `ProtectedRoute`** wrapper for role-based route protection
3. **Handle 403 errors gracefully** - redirect to dashboard or show appropriate message
4. **Don't rely solely on frontend checks** - backend enforces all permissions

### For Backend Developers

1. **Always validate user role** in controller/service methods
2. **Use guards consistently** - combine `JwtAuthGuard` + `RolesGuard`
3. **Scope data by clinic** - never allow cross-clinic access
4. **Log security events** - create audit trail for sensitive operations
5. **Return appropriate HTTP codes** - 401 vs 403 vs 404

---

## Testing ACL

### Test Scenarios

**Role-based access:**
- ✅ Admin can access user management
- ✅ Doctor/Nurse cannot access user management
- ✅ Nurse cannot approve submissions
- ✅ Doctor can approve submissions

**Data scoping:**
- ✅ User can view own submissions
- ✅ User can view submissions from same clinic
- ✅ User cannot view submissions from other clinics
- ✅ Admin can view all submissions in their clinic

**Status transitions:**
- ✅ Nurse can route draft to pending_approval
- ✅ Doctor can directly submit (skip approval)
- ✅ Cannot edit submitted submissions
- ✅ Doctor can approve pending submissions

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-23 | 1.0.0 | Initial ACL documentation |

---

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [OpenAPI Specification](./openapi.yaml)
