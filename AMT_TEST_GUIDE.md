# AMT Recalculation Testing Guide

## Quick Test Steps

### Test 1: Age Change Triggers AMT
1. Start new DRIVING_LICENCE_TP submission
2. Patient Info:
   - NRIC: S6501234A (age ~60)
   - DOB: 1965-01-01
   - Exam Date: 2025-11-03
   - License Class: 4
3. Fill required fields, navigate to AMT
4. Should show "AMT not required" ✓
5. **Edit Patient Info**: Change DOB to 1953-01-01 (age 72)
6. Navigate back to AMT section
7. Click "Continue to Summary"
8. **VERIFY**: 
   - ❌ Should NOT navigate to summary
   - ⚠️ Should show toast: "AMT is now required. Please complete the AMT questions."
   - 📋 AMT questions should be visible
   - 🔒 Accordion stays on AMT

### Test 2: AMT Required But Not Answered
1. Start new submission with age 72, class 4
2. Navigate to AMT (questions visible)
3. **Don't check any questions**
4. Click "Continue to Summary"
5. **VERIFY**:
   - ❌ Should NOT navigate
   - ⚠️ Toast: "Please complete the AMT questions before continuing."
   - 🔒 Stays on AMT

### Test 3: AMT Completed Successfully
1. Same as Test 2
2. **Check 7+ questions** (passing score)
3. Click "Continue to Summary"
4. **VERIFY**:
   - ✅ Navigates to summary
   - 📊 Shows "Pass 7/10" or higher

### Test 4: Cognitive Impairment
1. Age 65 (normally no AMT), class 4
2. Abnormality Checklist → Check "Cognitive Impairment"
3. Go to AMT section (questions should appear)
4. Try continuing without answering
5. **VERIFY**: Blocked with warning

### Test 5: License Class Change
1. Age 72, License class 3 (no AMT required)
2. Navigate to AMT → "AMT not required"
3. **Edit**: Change class to 4
4. Back to AMT, try to continue
5. **VERIFY**: Must complete questions

### Test 6: Private Driving Instructor
1. Age 72, class 3
2. Check "Private Driving Instructor" = Yes
3. AMT should become required
4. Test navigation with/without answers

### Test 7: Edit From Summary
1. Create complete submission (age 65, no AMT)
2. From Summary, click Edit on Patient Info
3. Change DOB to age 72
4. Click Edit on AMT section
5. Try to continue
6. **VERIFY**: Must complete AMT questions

## Expected Toast Messages

| Scenario | Message |
|----------|---------|
| AMT becomes newly required | "AMT is now required. Please complete the AMT questions." |
| AMT already required but not answered | "Please complete the AMT questions before continuing." |

## Browser Console Checks

Open DevTools → Console, check for:
- No errors
- Form data updates correctly
- `formData.amtRequired` boolean value
- `formData.amt` object with question answers

## Exam Types to Test

- ✅ DRIVING_LICENCE_TP
- ✅ DRIVING_VOCATIONAL_TP_LTA

Both should have identical AMT recalculation behavior.
