# CheckUp Documentation

Welcome to the CheckUp project documentation! This directory contains all technical documentation, guides, feature specifications, bug fixes, and testing documentation.

## 📁 Directory Structure

```
docs/
├── guides/              # User and developer guides
├── architecture/        # System architecture and design docs
├── features/            # Feature specifications and implementations
├── testing/             # Test documentation and coverage reports
├── fixes/               # Bug fixes and issue resolutions
└── updates/             # Project updates and summaries
```

## 📚 Quick Navigation

### 🎯 Getting Started

- **[Quick Reference](guides/QUICK_REFERENCE.md)** - Essential commands and workflows
- **[Tests Quick Reference](guides/TESTS_QUICK_REFERENCE.md)** - Testing commands and patterns
- **[Database Schema](architecture/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[API Documentation](architecture/API_DOCUMENTATION.md)** - REST API endpoints

### 🏗️ Architecture

Located in [`architecture/`](architecture/)

- [Database Schema](architecture/DATABASE_SCHEMA.md) - PostgreSQL schema with Prisma
- [API Documentation](architecture/API_DOCUMENTATION.md) - RESTful API reference
- [Access Control](architecture/ACCESS_CONTROL.md) - Authorization and permissions
- [UI Design System](architecture/UI_DESIGN_SYSTEM.md) - Frontend component library
- [Port Configuration](architecture/PORT_CONFIGURATION.md) - Service port assignments
- [Backend Setup](architecture/BACKEND_SETUP_COMPLETE.md) - Backend configuration

### ✨ Features

Located in [`features/`](features/)

#### Nurse-Clinic Management ([`features/nurse-clinic/`](features/nurse-clinic/))
- [Many-to-Many Implementation](features/nurse-clinic/NURSE_CLINIC_MANY_TO_MANY.md) - Technical spec
- [Frontend Implementation](features/nurse-clinic/FRONTEND_NURSE_CLINIC_IMPLEMENTATION.md)
- [Backend Implementation](features/nurse-clinic/BACKEND_MANY_TO_MANY_COMPLETE.md)
- [Frontend Complete](features/nurse-clinic/FRONTEND_MANY_TO_MANY_COMPLETE.md)
- [Testing Guide](features/nurse-clinic/NURSE_CLINIC_TESTING.md)

#### Doctor-Clinic Management ([`features/doctor-clinic/`](features/doctor-clinic/))
- [Many-to-Many Implementation](features/doctor-clinic/DOCTOR_CLINIC_MANY_TO_MANY.md)

#### Submissions ([`features/submissions/`](features/submissions/))
- [Rejected Submissions](features/submissions/REJECTED_SUBMISSIONS_FEATURE.md)
- [Reopen Functionality](features/submissions/REOPEN_REJECTED_SUBMISSIONS.md)
- [Search Bars](features/submissions/SEARCH_BARS_FEATURE.md)

#### Navigation ([`features/navigation/`](features/navigation/))
- [Unsaved Changes Prompt](features/navigation/UNSAVED_CHANGES_PROMPT.md)
- [Navigation Protection](features/navigation/NAVIGATION_PROTECTION_COMPLETE.md)
- [Browser Back Button](features/navigation/BROWSER_BACK_BUTTON_DIALOG.md)

#### Other Features
- [Settings Page](features/SETTINGS_PAGE_FEATURE.md)
- [Default Doctor Selection](features/DEFAULT_DOCTOR_FEATURE.md)
- [Doctor Approval Actions](features/DOCTOR_APPROVAL_ACTIONS.md)
- [Enhanced Error Logging](features/ENHANCED_ERROR_LOGGING.md)

### 🧪 Testing

Located in [`testing/`](testing/)

- [Cypress Test Coverage](testing/CYPRESS_TEST_COVERAGE.md) - E2E test overview
- [Nurse-Clinic Cypress Tests](testing/CYPRESS_NURSE_CLINIC_TESTS.md)
- [Frontend Cypress Tests Complete](testing/FRONTEND_CYPRESS_TESTS_COMPLETE.md)
- [Backend Tests Complete](testing/BACKEND_TESTS_COMPLETE.md)
- [Backend Nurse-Clinic Tests](testing/BACKEND_NURSE_CLINIC_TESTS_COMPLETE.md)
- [Test Fixes Summary](testing/TEST_FIXES_SUMMARY.md)

### 🐛 Bug Fixes

Located in [`fixes/`](fixes/)

#### Navigation Fixes ([`fixes/navigation/`](fixes/navigation/))
- [Navigation Fix](fixes/navigation/NAVIGATION_FIX.md)
- [Navigation Confirmation](fixes/navigation/NAVIGATION_CONFIRMATION_FIX.md)
- [Back Navigation](fixes/navigation/BACK_NAVIGATION_FIX.md)
- [useBlocker Error](fixes/navigation/USEBLOCKER_ERROR_FIX.md)

#### Submission Fixes ([`fixes/submissions/`](fixes/submissions/))
- [Approved Submissions](fixes/submissions/APPROVED_SUBMISSIONS_FIX.md)
- [Rejected Submissions](fixes/submissions/REJECTED_SUBMISSIONS_FIX.md)
- [Visibility Issues](fixes/submissions/REJECTED_SUBMISSIONS_VISIBILITY_FIX.md)
- [ApprovedBy Field](fixes/submissions/REJECTED_SUBMISSIONS_APPROVEDBY_FIX.md)
- [Nurse Dashboard](fixes/submissions/NURSE_REJECTED_SUBMISSIONS.md)
- [Draft Save](fixes/submissions/DRAFT_SAVE_FIX.md)
- [Reopened Draft Save](fixes/submissions/REOPENED_DRAFT_SAVE_FIX.md)
- [New Submission Reset](fixes/submissions/NEW_SUBMISSION_RESET_FIX.md)
- [Draft List Order](fixes/submissions/DRAFT_LIST_ORDER_FIX.md)
- [Doctor Submit to Agency](fixes/submissions/DOCTOR_SUBMIT_TO_AGENCY_FIX.md)

#### Timeline Fixes ([`fixes/timeline/`](fixes/timeline/))
- [Timeline Enhancement](fixes/timeline/TIMELINE_ENHANCEMENT.md)
- [Reopen Enhancement](fixes/timeline/TIMELINE_REOPEN_ENHANCEMENT.md)
- [Duplicate Fix](fixes/timeline/TIMELINE_DUPLICATE_FIX.md)
- [Event Ordering](fixes/timeline/TIMELINE_EVENT_ORDERING_FIX.md)
- [Routed for Approval](fixes/timeline/ROUTED_FOR_APPROVAL_TIMELINE_FIX.md)
- [Agency Submission Timeline](fixes/timeline/AGENCY_SUBMISSION_TIMELINE.md)

#### Dashboard Fixes ([`fixes/dashboard/`](fixes/dashboard/))
- [Dashboard Link](fixes/dashboard/DASHBOARD_LINK_FIX.md)
- [Reopen Enhancement](fixes/dashboard/DASHBOARD_REOPEN_FIX_ENHANCEMENT.md)

#### Validation Fixes ([`fixes/validation/`](fixes/validation/))
- [MCR/HCI Validation](fixes/validation/MCR_HCI_VALIDATION.md)
- [MCR and Last Login](fixes/validation/MCR_AND_LASTLOGIN_FIX.md)
- [Examination Date](fixes/validation/EXAMINATION_DATE_VALIDATION_FIX.md)

#### Other Fixes
- [Unsaved Changes Cleanup](fixes/UNSAVED_CHANGES_CLEANUP_FIX.md)
- [Default Doctor API](fixes/DEFAULT_DOCTOR_API_FIX.md)
- [Doctor Selection Assertion](fixes/DOCTOR_SELECTION_ASSERTION_FIX.md)
- [Test Modal Button](fixes/TEST_MODAL_BUTTON_FIX.md)
- [Backend Port Change](fixes/BACKEND_PORT_CHANGE.md)

### 📋 Project Updates

Located in [`updates/`](updates/)

- [Backend Update Summary](updates/BACKEND_UPDATE_SUMMARY.md)
- [Frontend Update Summary](updates/FRONTEND_UPDATE_SUMMARY.md)
- [Project Reorganization](updates/PROJECT_REORGANIZATION.md)
- [Reorganization Complete](updates/REORGANIZATION_COMPLETE.md)

### 📖 User Guides

Located in [`guides/`](guides/)

- [Quick Reference](guides/QUICK_REFERENCE.md) - Commands and workflows
- [Tests Quick Reference](guides/TESTS_QUICK_REFERENCE.md) - Testing guide
- [Nurse-Clinic Assignment User Guide](guides/NURSE_CLINIC_ASSIGNMENT_USER_GUIDE.md)
- [Integration Testing Guide](guides/INTEGRATION_TESTING_GUIDE.md)
- [Toast Notifications Guide](guides/TOAST_NOTIFICATIONS_GUIDE.md)
- [.gitignore Best Practices](guides/GITIGNORE_BEST_PRACTICES.md)

## 🔍 Finding Documentation

### By Topic

| Topic | Location |
|-------|----------|
| **Database** | [architecture/DATABASE_SCHEMA.md](architecture/DATABASE_SCHEMA.md) |
| **API Endpoints** | [architecture/API_DOCUMENTATION.md](architecture/API_DOCUMENTATION.md) |
| **Testing** | [testing/](testing/) |
| **User Permissions** | [architecture/ACCESS_CONTROL.md](architecture/ACCESS_CONTROL.md) |
| **UI Components** | [architecture/UI_DESIGN_SYSTEM.md](architecture/UI_DESIGN_SYSTEM.md) |
| **Nurse-Clinic Feature** | [features/nurse-clinic/](features/nurse-clinic/) |
| **Doctor-Clinic Feature** | [features/doctor-clinic/](features/doctor-clinic/) |

### By Role

#### Developers
- Start with [Quick Reference](guides/QUICK_REFERENCE.md)
- Review [Database Schema](architecture/DATABASE_SCHEMA.md)
- Check [API Documentation](architecture/API_DOCUMENTATION.md)
- Read [Backend Setup](architecture/BACKEND_SETUP_COMPLETE.md)

#### Testers
- [Tests Quick Reference](guides/TESTS_QUICK_REFERENCE.md)
- [Cypress Test Coverage](testing/CYPRESS_TEST_COVERAGE.md)
- [Integration Testing Guide](guides/INTEGRATION_TESTING_GUIDE.md)

#### End Users
- [Nurse-Clinic Assignment User Guide](guides/NURSE_CLINIC_ASSIGNMENT_USER_GUIDE.md)
- Feature-specific documentation in [features/](features/)

#### Project Managers
- [Project Reorganization](updates/PROJECT_REORGANIZATION.md)
- [Backend Update Summary](updates/BACKEND_UPDATE_SUMMARY.md)
- [Frontend Update Summary](updates/FRONTEND_UPDATE_SUMMARY.md)

## 📊 Documentation Statistics

- **Total Documents**: 67 files
- **Guides**: 6 files
- **Architecture Docs**: 6 files
- **Feature Specs**: 13 files (nurse-clinic: 5, doctor-clinic: 1, submissions: 3, navigation: 3, other: 4)
- **Testing Docs**: 6 files
- **Bug Fixes**: 32 files
- **Update Summaries**: 4 files

## 🔄 Maintenance

### Adding New Documentation

1. Determine the appropriate category
2. Place the file in the correct subdirectory
3. Update this README with a link
4. Follow the naming convention: `FEATURE_NAME_[TYPE].md`

### Categories

- **Features**: New functionality or major enhancements
- **Fixes**: Bug fixes and issue resolutions
- **Testing**: Test documentation and coverage
- **Architecture**: System design and structure
- **Guides**: How-to guides and references
- **Updates**: Project summaries and release notes

## 📝 Documentation Standards

All documentation should include:

1. **Title and Date** - Clear title and creation/update date
2. **Summary** - Brief overview of the content
3. **Context** - Background and motivation
4. **Details** - Technical implementation details
5. **Related Files** - List of affected files
6. **Status** - Current state (Complete, In Progress, etc.)

## 🚀 Quick Commands

```bash
# Find documentation by keyword
grep -r "keyword" docs/

# List all feature docs
ls docs/features/**/*.md

# List all fix docs
ls docs/fixes/**/*.md

# Count total documentation files
find docs/ -name "*.md" | wc -l
```

---

**Last Updated**: October 24, 2025  
**Maintained By**: CheckUp Development Team
