# MockPass / CorpPass Test IDs (Seeded Users)

This file lists the test NRICs (Singapore NRIC format) and roles used by the project for development and testing with MockPass / CorpPass.

Use these NRICs when testing the CorpPass login via MockPass (ensure `SHOW_LOGIN_PAGE=true` so you can select or enter NRIC when MockPass shows the login page).

## Seeded Users (Authoritative)
These users are created by the seeding script: `backend/prisma/seed.ts`.

- S1234567D — Dr. Sarah Tan — role: doctor — email: `doctor@clinic.sg`
- S2345678H — Nurse Mary Lim — role: nurse — email: `nurse@clinic.sg`
- S3456789A — Admin John Wong — role: admin — email: `admin@clinic.sg`
- S4567890C — Dr. James Lee — role: doctor — email: `doctor2@clinic.sg`
- S5678901D — Dr. Emily Chen — role: doctor — email: `doctor3@clinic.sg`
- S6789012D — Dr. Michael Tan — role: doctor — email: `doctor4@clinic.sg`
- S7890123C — Nurse Linda Koh — role: nurse — email: `nurse2@clinic.sg`

## MockPass Default IDs
MockPass provides a default NRIC for quick testing. The default in our docs is:

- S8979373D — default MockPass NRIC (used by MockPass when `MOCKPASS_NRIC` is set)

When running MockPass with `SHOW_LOGIN_PAGE=true`, you can pick any NRIC above or enter a custom one.

## How to Use
1. Start backend (make sure DB is seeded):

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

2. Start MockPass (show login page):

```bash
cd backend
npm run mockpass
# Ensure startup script sets SHOW_LOGIN_PAGE=true
```

3. Start frontend and test login via UI:

```bash
cd frontend
npm run dev
# In browser, click "Login with CorpPass" and select or enter NRIC
```

## Notes
- For authentication tests, prefer the seeded NRICs from `backend/prisma/seed.ts` so user matching succeeds.
- Cypress tests in `frontend/cypress/e2e/*.cy.ts` use a broader set of synthetic NRICs for form validation; those are not necessarily seeded.
- If you need more seeded test accounts, update `backend/prisma/seed.ts` and re-run the seed script.

## Where else to look
- MockPass setup guide: `docs/guides/MOCKPASS_SETUP_GUIDE.md`
- CorpPass quick reference: `docs/guides/CORPPASS_QUICK_REFERENCE.md`
- Seed file: `backend/prisma/seed.ts` (authoritative list)

---

Last updated: October 24, 2025
