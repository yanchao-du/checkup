# Nurse User Guide - Medical Examination Portal

## Table of Contents
1. [Getting Started](#getting-started)
2. [Creating Medical Submissions](#creating-medical-submissions)
3. [Managing Submissions](#managing-submissions)
4. [Viewing Submission Details](#viewing-submission-details)
5. [Working with Rejected Submissions](#working-with-rejected-submissions)
6. [Common Workflows](#common-workflows)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In
1. Navigate to the portal URL
2. Click **"Login with Singpass"** or **"Login with CorpPass"** (for corporate users)
3. Complete the authentication process
4. You'll be directed to your dashboard

### Your Dashboard
After logging in, you'll see:
- **Navigation Bar** - Access to Submissions and Profile
- **Submissions List** - All medical examination submissions you've created
- **Filter Options** - Filter by status, exam type, or date range
- **Quick Actions** - Create new submission, search, and export

---

## Creating Medical Submissions

### Step 1: Start a New Submission

1. Click the **"New Submission"** button (top right)
2. You'll see the submission creation wizard

### Step 2: Select Exam Type

Choose the appropriate examination type:
- **6-Monthly MDW** - Domestic Worker Medical Examination
- **6-Monthly FMW** - Foreign Worker Medical Examination
- **Work Permit** - Work Permit Medical
- **PR Medical** - Permanent Residence Application
- **Student Pass Medical** - Student Visa Medical
- **LTVP Medical** - Long Term Visit Pass Medical
- **Driving Licence (TP)** - Taxi/Private Hire Driver
- **Driving Vocational (TP/LTA)** - Vocational License Renewal
- **Vocational Licence (LTA)** - LTA Vocational License
- **Aged Drivers** - Elderly Driver Assessment

### Step 3: Enter Patient Information

**Required Fields:**
- **NRIC/FIN** - Patient's identification number
- **Full Name** - As per NRIC/FIN
- **Date of Birth** - Select from calendar
- **Gender** - Male/Female
- **Email** - For notifications
- **Mobile Number** - Contact number
- **Examination Date** - Date of medical exam

**Tips:**
- NRIC/FIN will be validated automatically
- Name must match official documents
- All fields marked with * are required

### Step 4: Complete Exam-Specific Forms

Each exam type has different requirements:

#### For MDW/FMW Exams:
1. **Test Results**
   - Pregnancy Test (required)
   - Syphilis Test (required)
   - HIV Test (if required)
   - Chest X-Ray (if required)

2. **Physical Examination**
   - Signs of suspicious injuries
   - Unintentional weight loss
   - Police report status (if applicable)

3. **Remarks** (optional but recommended)

#### For ICA Exams (PR/Student/LTVP):
1. **Medical History**
   - Past medical conditions
   - Current medications
   - Allergies

2. **Physical Examination**
   - Height, Weight, BMI
   - Blood Pressure
   - Visual acuity

3. **Test Results**
   - As required by ICA guidelines

4. **Declaration**
   - Patient certification
   - Doctor verification

#### For Driving Exams (TP/TP_LTA/LTA):
1. **Medical Declaration by Patient**
   - Medical conditions in past 6 months
   - Patient certification

2. **Medical History of Patient**
   - Relevant medical conditions
   - Patient certification

3. **General Medical Examination**
   - Blood pressure, pulse
   - Vision assessment
   - Physical examination

4. **AMT (Abbreviated Mental Test)** (for TP/TP_LTA)
   - 10-question assessment
   - Automatic scoring
   - Pass/Fail result (≥7 to pass)

5. **Overall Assessment**
   - Fit to drive determination
   - Conditions/restrictions
   - Doctor declaration

### Step 5: Assign to Doctor

1. **Select Doctor** from dropdown
   - Only doctors at your clinic(s) will be shown
   - If no doctors appear, contact your administrator

2. **Add Internal Notes** (optional)
   - Notes for the reviewing doctor
   - Not included in final report

### Step 6: Review Summary

1. Review all entered information
2. Check for completeness and accuracy
3. Use the **"Previous"** button to go back and edit if needed

### Step 7: Submit

1. Click **"Create Submission"**
2. You'll see a success message with the Submission ID
3. The submission is now in "Pending" status

---

## Managing Submissions

### Viewing Your Submissions

**All Submissions Tab:**
- Shows all submissions you've created
- Default view when you log in

**Columns Displayed:**
- **Submission ID** - Unique identifier (e.g., SUB-20241105-001)
- **Patient Name** - Masked for privacy (e.g., John D***)
- **NRIC/FIN** - Partially masked (e.g., S1234***A)
- **Exam Type** - Type of medical examination
- **Status** - Current status (see below)
- **Assigned To** - Doctor reviewing the submission
- **Created** - Date created
- **Actions** - View/Edit buttons

### Understanding Status

**Pending** 🟡
- Submitted and waiting for doctor review
- Doctor can approve or reject
- You cannot edit while pending

**Approved** ✅
- Doctor has approved the submission
- Report is generated and submitted to authority
- Cannot be edited

**Rejected** ❌
- Doctor has rejected with a reason
- You can view the rejection reason
- You can reopen and edit the submission

**Draft** 📝
- Submission started but not completed
- Only visible if you saved as draft
- Can be edited and submitted

### Filtering Submissions

Use the filter options to find submissions:

1. **By Status**
   - Click status filter dropdown
   - Select: All, Pending, Approved, Rejected

2. **By Exam Type**
   - Select from exam type dropdown
   - Filter by specific examination category

3. **By Date Range**
   - Click date range selector
   - Choose preset ranges or custom dates

4. **By Search**
   - Enter patient name, NRIC, or Submission ID
   - Results update automatically

### Sorting Submissions

Click on column headers to sort:
- **Submission ID** - Ascending/Descending
- **Created Date** - Newest/Oldest first
- **Status** - Alphabetical

---

## Viewing Submission Details

### Accessing Submission Details

1. Find the submission in your list
2. Click the **"View"** button (eye icon)
3. The submission details page opens

### Details Page Layout

**Left Panel - Examination Details:**
- Patient information
- Exam-specific data
- Test results
- Medical findings
- Remarks

**Right Panel - Submission Info:**
- Status badge
- Submission metadata
- Assigned doctor
- Creation/submission dates

**Bottom Section:**
- Declaration (for approved submissions)
- Doctor and clinic information
- Approval signature

### What You Can See

**For All Submissions:**
- Complete patient information
- All examination data you entered
- Current status and assigned doctor

**For Approved Submissions:**
- Doctor's approval signature
- Submission date to authority
- Final report details
- Declaration confirmation

**For Rejected Submissions:**
- Rejection reason from doctor
- Reopen button to edit and resubmit
- Original submission data

---

## Working with Rejected Submissions

### Understanding Rejections

When a doctor rejects a submission, it means:
- Something needs to be corrected or clarified
- The submission cannot be sent to the authority as-is
- You can view the reason and fix the issues

### Viewing Rejection Reason

1. Go to your submissions list
2. Find the rejected submission (❌ status)
3. Click **"View"**
4. Scroll to the bottom to see the **Rejection Reason** box

### Reopening a Rejected Submission

1. On the submission details page
2. Click the **"Reopen Submission"** button
3. Confirm in the dialog
4. The submission returns to "Pending" status

### Editing After Reopen

After reopening:
1. The submission is editable again
2. Make necessary corrections based on rejection reason
3. Review all information
4. Click **"Update Submission"** to save changes
5. The doctor will review again

**Important Notes:**
- Only you (the creator) can reopen your own submissions
- Doctors cannot reopen submissions
- Once reopened, the rejection reason is cleared

---

## Common Workflows

### Workflow 1: Standard Submission Process

```
1. Create New Submission
   ↓
2. Select Exam Type
   ↓
3. Enter Patient Information
   ↓
4. Complete Exam Forms
   ↓
5. Assign to Doctor
   ↓
6. Review & Submit
   ↓
7. Wait for Doctor Review
   ↓
8. Approved ✓ → Report Submitted
```

### Workflow 2: Handling Rejections

```
1. Receive Rejection Notification
   ↓
2. View Submission Details
   ↓
3. Read Rejection Reason
   ↓
4. Click "Reopen Submission"
   ↓
5. Edit/Correct Information
   ↓
6. Update Submission
   ↓
7. Wait for Re-review
   ↓
8. Approved ✓ → Report Submitted
```

### Workflow 3: Bulk Processing MDW Exams

For efficient processing of multiple MDW exams:

1. **Prepare Patient Data**
   - Have all NRIC/FIN numbers ready
   - Collect test results
   - Note any special findings

2. **Create Submissions in Batch**
   - Create first submission completely
   - Note the pattern and required fields
   - Create subsequent submissions quickly

3. **Assign to Same Doctor** (if appropriate)
   - Select same doctor for consistency
   - Add batch notes if needed

4. **Track Progress**
   - Use filters to view all pending MDW exams
   - Monitor approval status
   - Follow up on rejections promptly

### Workflow 4: Driver Medical Examinations

For TP/TP_LTA/LTA driving exams:

1. **Verify Patient Eligibility**
   - Confirm driver license type
   - Check examination requirements

2. **Complete Medical Declaration**
   - Patient must answer all questions
   - Get patient certification

3. **Complete Medical History**
   - Document all relevant conditions
   - Get patient certification

4. **Perform Physical Exam**
   - Record vital signs
   - Test vision (with/without aids)
   - Document all findings

5. **Administer AMT** (if required)
   - Ask all 10 questions
   - Record answers accurately
   - System calculates score automatically

6. **Doctor Assessment**
   - Assign to qualified doctor
   - Doctor determines fitness to drive
   - Doctor completes declaration

---

## Tips & Best Practices

### Data Entry Tips

✅ **DO:**
- Double-check NRIC/FIN before submitting
- Ensure patient name matches ID exactly
- Use clear, professional language in remarks
- Complete all required fields
- Review summary before submitting

❌ **DON'T:**
- Use abbreviations that might be unclear
- Leave required fields empty
- Rush through the AMT questions
- Submit without reviewing
- Ignore validation warnings

### Accuracy Best Practices

1. **Patient Identification**
   - Always verify NRIC/FIN from physical card
   - Match name exactly as on NRIC (including spacing)
   - Confirm date of birth

2. **Test Results**
   - Record results exactly as shown on lab reports
   - Note any positive/reactive results clearly
   - Attach supporting documents if available

3. **Physical Examination**
   - Record measurements accurately (BP, height, weight)
   - Note any abnormal findings
   - Document any patient complaints

4. **AMT Testing**
   - Read questions exactly as written
   - Do not prompt or help the patient
   - Record actual responses, not intended responses
   - Score objectively

### Efficiency Tips

1. **Use Templates** (Mental)
   - Develop a consistent order for data entry
   - Keep reference materials handy
   - Prepare patient information in advance

2. **Batch Similar Exams**
   - Group MDW exams together
   - Process same exam types consecutively
   - Use same doctor assignment when appropriate

3. **Quick Navigation**
   - Use browser back button to return to list
   - Bookmark frequently used pages
   - Use filters to find submissions quickly

4. **Monitor Status**
   - Check pending submissions daily
   - Address rejections promptly
   - Follow up on long-pending items

### Communication

**With Doctors:**
- Use internal notes for questions
- Provide context for unusual findings
- Flag urgent submissions

**With Patients:**
- Explain the process and timeline
- Inform about status updates
- Notify when approved

**With Administrators:**
- Report system issues promptly
- Request access to additional doctors
- Suggest workflow improvements

### Privacy & Security

1. **Protect Patient Information**
   - Do not share NRIC/FIN unnecessarily
   - Log out when leaving workstation
   - Do not photograph or screenshot patient data

2. **Secure Access**
   - Never share your login credentials
   - Use secure devices only
   - Report suspicious activity

3. **Data Handling**
   - Follow clinic policies on data retention
   - Dispose of printed materials securely
   - Use encrypted channels for communication

---

## Troubleshooting

### Common Issues

**Problem: Cannot see any doctors in dropdown**
- **Solution:** Contact administrator to assign doctors to your clinic

**Problem: NRIC validation fails**
- **Solution:** Verify NRIC format (e.g., S1234567A)
- Check for typos or extra spaces

**Problem: Cannot submit form**
- **Solution:** Check for validation errors (red text)
- Ensure all required fields are filled
- Try refreshing the page

**Problem: Submission disappeared**
- **Solution:** Check filters - may be filtered out
- Search by submission ID or patient name
- Contact support if still missing

**Problem: AMT score seems wrong**
- **Solution:** Review each answer carefully
- Verify scoring guidelines
- Contact doctor if discrepancy remains

### Getting Help

**Technical Issues:**
- Contact IT support
- Check system status page
- Report bugs through proper channels

**Clinical Questions:**
- Consult with reviewing doctor
- Refer to examination guidelines
- Contact medical director

**Training Needs:**
- Request refresher training
- Review this guide
- Ask experienced colleagues

---

## Quick Reference

### Key Shortcuts & Features

- **New Submission:** Top right button
- **Search:** Type in search box, auto-filters
- **View Details:** Click eye icon
- **Reopen Rejected:** Button at bottom of rejected submission
- **Export Data:** Use export button in submissions list

### Status Quick Reference

| Status | Meaning | Your Action |
|--------|---------|-------------|
| Draft | Not submitted | Complete & submit |
| Pending | Awaiting doctor | Wait for review |
| Approved | Accepted | No action needed |
| Rejected | Needs correction | Reopen & fix |

### Required Fields by Exam Type

**All Exams:**
- Patient NRIC/FIN, Name, DOB, Gender
- Email, Mobile, Exam Date

**MDW/FMW:**
- Pregnancy test, Syphilis test
- Physical examination findings

**ICA:**
- Medical history
- Physical exam (height, weight, BP)
- Required tests per ICA guidelines

**Driving:**
- Medical declaration (patient)
- Medical history (patient)
- Physical exam (BP, pulse, vision)
- AMT (for TP/TP_LTA, if applicable)
- Overall assessment

---

## Updates & Changes

This guide is current as of November 2025.

For the latest updates and changes:
- Check announcement notifications
- Attend training sessions
- Review release notes

---

## Contact & Support

**For Help:**
- Technical Support: [Contact IT]
- Training: [Contact Training Team]
- Clinical Questions: [Contact Medical Director]

**Feedback:**
We welcome your suggestions to improve this guide and the portal.
Please submit feedback through your supervisor or administrator.

---

*Last Updated: November 5, 2025*
