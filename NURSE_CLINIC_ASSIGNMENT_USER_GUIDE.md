# Nurse-Clinic Assignment User Guide

## Overview

Administrators can now assign nurses to work at multiple clinics, just like doctors. Each nurse can have a primary clinic designation.

## Accessing Nurse Assignments

1. **Login** as an administrator
2. Navigate to **Settings** (gear icon in navigation)
3. Click the **"Nurse Assignments"** tab

You'll see four tabs:
- User Management
- Clinic Management
- Doctor Assignments
- **Nurse Assignments** ← Click here

## Understanding the Interface

### Statistics Cards

At the top, you'll see three metric cards:

1. **Total Nurses** - Count of all active nurses
2. **Total Clinics** - Count of all clinic locations
3. **Multi-Clinic Nurses** - Nurses working at 2+ clinics

### Two-Panel Layout

#### Left Panel: Nurses List
- Shows all nurses in the system
- Displays each nurse's name, email
- Shows clinic count (e.g., "2 clinics")
- Click a nurse to view their assignments

#### Right Panel: Clinic Assignments
- Shows selected nurse's assigned clinics
- Each clinic card displays:
  - Clinic name
  - HCI code
  - Address
  - Primary badge (star icon)
  - Action buttons (set primary, remove)

## Common Tasks

### Assigning a Nurse to a Clinic

1. **Select the nurse** from the left panel
2. Click **"Assign"** button (top right of right panel)
3. In the dialog:
   - Select a clinic from the dropdown
   - Optionally check "Set as primary clinic"
   - Click **"Assign Clinic"**

**Result**: Nurse is now assigned to that clinic and can access its data.

### Setting a Primary Clinic

Each nurse must have exactly one primary clinic.

**Method 1: During Assignment**
- Check "Set as primary clinic" when assigning

**Method 2: After Assignment**
- Click the **hollow star icon** next to a clinic
- The star fills in yellow, indicating it's now primary
- Previous primary clinic automatically becomes non-primary

**Visual Indicator**: Primary clinic has a blue badge with filled yellow star icon.

### Removing a Nurse from a Clinic

1. **Select the nurse** from the left panel
2. Find the clinic you want to remove
3. Click the **red X button** on the right
4. Confirm the removal in the dialog

**Important Validations**:
- ❌ Cannot remove the last clinic (nurse must have at least one)
- ✅ Can remove non-primary clinics freely
- ⚠️ Removing a clinic with submissions may affect data visibility

### Viewing a Nurse's Clinics

1. Click on any nurse in the left panel
2. Their clinics appear in the right panel
3. Primary clinic is listed first (marked with star badge)
4. Other clinics follow in alphabetical order

## Use Cases

### Scenario 1: New Nurse Joins
**Task**: Assign a new nurse to their clinic

When a nurse is created, they're automatically assigned to the admin's clinic as their primary clinic. No additional action needed unless they should work at multiple locations.

### Scenario 2: Nurse Transfers
**Task**: Change a nurse's primary clinic

1. Select the nurse
2. Find their new primary clinic in the list
3. Click the star icon to set it as primary
4. Optionally remove them from their old clinic

### Scenario 3: Float Nurse
**Task**: Allow a nurse to work at multiple clinics

1. Select the nurse
2. Click "Assign" for each additional clinic
3. Set one clinic as primary
4. Nurse can now access and create submissions at any assigned clinic

### Scenario 4: Nurse Leaves a Clinic
**Task**: Remove nurse from one clinic location

1. Select the nurse
2. Click the X button next to the clinic
3. Confirm removal
4. Ensure they still have at least one clinic assigned

## Business Rules

### Assignment Rules
- ✅ Nurses can be assigned to multiple clinics
- ✅ Each nurse must have exactly one primary clinic
- ✅ Primary clinic is automatically set when nurse is created
- ✅ Cannot assign a nurse to the same clinic twice
- ✅ Can assign nurses to all available clinics

### Removal Rules
- ❌ Cannot remove a nurse's last clinic
- ✅ Can remove any non-primary clinic
- ⚠️ System will warn if removing the last clinic
- ℹ️ If you need to change primary clinic, set new one first, then remove old one

### Data Access Rules
- Nurses can see submissions from **any** of their assigned clinics
- Primary clinic is the default for new submissions
- Submissions are always tied to the clinic where they were created
- Removing a nurse from a clinic doesn't delete their submissions

## Tips & Best Practices

### For Administrators

1. **Set Primary Thoughtfully**
   - Primary clinic should be where the nurse works most
   - Used as default for new submissions
   - Consider geographic proximity

2. **Multi-Clinic Assignments**
   - Only assign nurses to clinics where they actively work
   - Too many assignments can be confusing
   - Review assignments quarterly

3. **Bulk Changes**
   - If reassigning many nurses, do one at a time
   - Verify each change before moving to next
   - Toast notifications confirm each action

4. **Data Integrity**
   - Before removing a nurse from a clinic, check their submission history
   - Consider if they need continued access to past submissions
   - Communicate changes to the nurse beforehand

### Visual Cues

- 🟦 **Blue highlight** = Selected nurse
- ⭐ **Yellow star** = Primary clinic
- 🟢 **Badge with star** = Primary clinic indicator
- **Clinic count** = "X clinics" next to nurse name
- **Gray empty state** = No clinics assigned yet

## Error Messages

| Message | Meaning | Solution |
|---------|---------|----------|
| "Nurse is already assigned to this clinic" | Duplicate assignment | Choose a different clinic |
| "Cannot remove the last clinic" | Trying to remove only clinic | Assign to another clinic first |
| "Failed to assign clinic" | Server error | Try again or contact support |
| "No available clinics" | Already assigned to all | No action needed |

## Keyboard Navigation

- **Click** nurse to select
- **Click** star to set primary
- **Click** X to remove
- **Esc** to close dialogs

## Comparison: Doctors vs Nurses

Both doctors and nurses now work the same way:

| Feature | Doctors | Nurses |
|---------|---------|--------|
| Multiple clinics | ✅ Yes | ✅ Yes |
| Primary clinic | ✅ Yes | ✅ Yes |
| Minimum clinics | 1 | 1 |
| Assignment UI | Doctor Assignments tab | Nurse Assignments tab |
| Auto-assigned on creation | ✅ Yes | ✅ Yes |

## Troubleshooting

**Q: I don't see the Nurse Assignments tab**
- A: Ensure you're logged in as an admin. Only admins can manage assignments.

**Q: The clinic count doesn't update**
- A: Refresh the page or click another nurse and back to refresh the count.

**Q: Can't assign nurse to any clinic**
- A: They might already be assigned to all clinics. Check the "already assigned to all" message.

**Q: Changes don't save**
- A: Check your internet connection and ensure you have admin permissions.

## Support

For issues or questions:
1. Check this guide first
2. Review the error message
3. Try refreshing the page
4. Contact system administrator
